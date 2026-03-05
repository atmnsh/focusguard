use serde_json::{json, Value};
use std::collections::HashSet;
use std::sync::Mutex;
use sysinfo::{ProcessesToUpdate, System};
use tauri::{AppHandle, Emitter, Manager, State};
use tokio::time::{self, Duration};

const KNOWN_GAMES: &[&str] = &[
    "eldenring",
    "valorant",
    "cyberpunk2077",
    "csgo",
    "fortnite",
    "apexlegends",
    "steam.exe",
    "epicgameslauncher.exe",
    "thunderbird",
];

use std::time::Instant;

pub struct GameMonitorState {
    pub active_games: Mutex<HashSet<String>>,
    pub game_list: Mutex<HashSet<String>>,
    pub active_avatars: Mutex<std::collections::HashMap<String, String>>, // Maps game to Window Label
    pub missing_counts: Mutex<std::collections::HashMap<String, u32>>,

    // Tracking app usage
    pub last_tick: Mutex<Instant>,
    pub distracted_time_sec: Mutex<u64>,
    pub productive_time_sec: Mutex<u64>,
    pub is_timer_running: Mutex<bool>,
}

impl Default for GameMonitorState {
    fn default() -> Self {
        Self {
            active_games: Mutex::new(HashSet::new()),
            game_list: Mutex::new(KNOWN_GAMES.iter().map(|&s| s.to_string()).collect()),
            active_avatars: Mutex::new(std::collections::HashMap::new()),
            missing_counts: Mutex::new(std::collections::HashMap::new()),
            last_tick: Mutex::new(Instant::now()),
            distracted_time_sec: Mutex::new(0),
            productive_time_sec: Mutex::new(0),
            is_timer_running: Mutex::new(false),
        }
    }
}

#[derive(Clone, serde::Serialize)]
pub struct GameEvent {
    pub game_name: String,
    pub action: String,
}

#[tauri::command]
pub async fn add_custom_game(
    state: State<'_, GameMonitorState>,
    game_name: String,
) -> Result<(), String> {
    let mut games = state.game_list.lock().unwrap();
    games.insert(game_name);
    Ok(())
}

#[tauri::command]
pub async fn set_timer_state(
    state: State<'_, GameMonitorState>,
    is_running: bool,
) -> Result<(), String> {
    let mut timer_state = state.is_timer_running.lock().unwrap();
    *timer_state = is_running;
    Ok(())
}

#[tauri::command]
pub async fn get_active_games(state: State<'_, GameMonitorState>) -> Result<Vec<String>, String> {
    let games = state.active_games.lock().unwrap();
    Ok(games.iter().cloned().collect())
}

#[derive(Clone, serde::Serialize)]
pub struct DailyUsage {
    pub productive_sec: u64,
    pub distracted_sec: u64,
}

#[tauri::command]
pub async fn get_daily_usage(state: State<'_, GameMonitorState>) -> Result<DailyUsage, String> {
    let prod = *state.productive_time_sec.lock().unwrap();
    let dist = *state.distracted_time_sec.lock().unwrap();

    // Temporary mocked data for the chart week if prod/dist are 0, allowing testing
    if prod == 0 && dist == 0 {
        return Ok(DailyUsage {
            productive_sec: 235 * 60, // ~4 hours productive
            distracted_sec: 120 * 60, // 2 hours distracted
        });
    }

    Ok(DailyUsage {
        productive_sec: prod,
        distracted_sec: dist,
    })
}

async fn fetch_deepseek_cartesia_audio(game_name: &str) -> Result<(String, Vec<u8>), String> {
    let deepseek_key = std::env::var("DEEPSEEK_API_KEY")
        .map_err(|_| "DEEPSEEK_API_KEY environment variable not set")?;
    let prompt = format!("Току-що отворих играта {}. Кажи ми едно кратко, насърчаващо и много мило изречение защо трябва да я затворя и да се фокусирам обратно върху целите си.", game_name);

    let client = reqwest::Client::new();
    
    // 1. Get Text from DeepSeek
    let payload = json!({
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    });

    let res = client
        .post("https://api.deepseek.com/chat/completions")
        .header("Authorization", format!("Bearer {}", deepseek_key))
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json_res: Value = res.json().await.map_err(|e| e.to_string())?;
    
    let text_response = json_res["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or(&format!("Хей! Моля те, спри да играеш {} и се върни към работата си!", game_name))
        .to_string();

    // 2. Get Audio from ElevenLabs
    let elevenlabs_key = std::env::var("ELEVENLABS_API_KEY").unwrap_or_default();
    let payload = json!({
        "model_id": "eleven_multilingual_v2",
        "text": text_response,
    });

    let res = client
        .post("https://api.elevenlabs.io/v1/text-to-speech/CsGB1DArtcqfpLG77Gxy")
        .header("xi-api-key", elevenlabs_key)
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        let error_text = res.text().await.unwrap_or_default();
        eprintln!("ElevenLabs API Error: {}", error_text);
        return Err(format!("ElevenLabs API Error: {}", error_text));
    }

    let audio_bytes = res.bytes().await.map_err(|e| e.to_string())?.to_vec();

    Ok((text_response, audio_bytes))
}

pub async fn monitor_games(app_handle: AppHandle) {
    let mut interval = time::interval(Duration::from_secs(2)); // Check every 2 seconds
    let mut system = System::new();

    loop {
        interval.tick().await;
        system.refresh_processes(ProcessesToUpdate::All, true);

        let current_processes: HashSet<String> = system
            .processes()
            .iter()
            .filter_map(|(_, process)| Some(process.name().to_string_lossy().to_ascii_lowercase()))
            .collect();

        // Calculate time elapsed since last tick
        let elapsed_sec = {
            let state = app_handle.state::<GameMonitorState>();
            let mut last = state.last_tick.lock().unwrap();
            let now = Instant::now();
            let el = now.duration_since(*last).as_secs();
            *last = now;
            el
        };

        let mut to_start = Vec::new();
        let mut to_stop = Vec::new();
        let mut events = Vec::new();

        {
            let state = app_handle.state::<GameMonitorState>();
            let game_list = state.game_list.lock().unwrap().clone();
            let mut active_games = state.active_games.lock().unwrap();
            let mut missing_counts = state.missing_counts.lock().unwrap();

            for game in &game_list {
                let is_running = current_processes.contains(&game.to_lowercase());
                let was_running = active_games.contains(game);

                if is_running {
                    missing_counts.insert(game.clone(), 0);
                } else if was_running {
                    *missing_counts.entry(game.clone()).or_insert(0) += 1;
                }

                match (is_running, was_running) {
                    (true, false) => {
                        active_games.insert(game.clone());
                        events.push(GameEvent {
                            game_name: game.clone(),
                            action: "started".to_string(),
                        });
                        to_start.push(game.clone());
                    }
                    (false, true) => {
                        let count = *missing_counts.get(game).unwrap_or(&0);
                        if count >= 3 {
                            active_games.remove(game);
                            missing_counts.remove(game);
                            events.push(GameEvent {
                                game_name: game.clone(),
                                action: "stopped".to_string(),
                            });
                            to_stop.push(game.clone());
                        }
                    }
                    _ => {}
                }
            }

            if !active_games.is_empty() {
                let mut dist = state.distracted_time_sec.lock().unwrap();
                *dist += elapsed_sec;
            } else {
                let mut prod = state.productive_time_sec.lock().unwrap();
                *prod += elapsed_sec;
            }
        }

        for game in to_stop {
            let state = app_handle.state::<GameMonitorState>();
            let mut avatars = state.active_avatars.lock().unwrap();
            if let Some(window_label) = avatars.remove(&game) {
                if let Some(window) = app_handle.get_webview_window(&window_label) {
                    if let Err(e) = window.close() {
                        eprintln!("Failed to close Tauri Avatar window for {}: {}", game, e);
                    } else {
                        println!("Successfully closed Tauri Avatar window for {}", game);
                    }
                }
            }
            drop(avatars);
        }

        for game in to_start {
            let is_timer_running = {
                let state = app_handle.state::<GameMonitorState>();
                let val = *state.is_timer_running.lock().unwrap();
                val
            };

            if !is_timer_running {
                println!(
                    "Skipping avatar for {} because focus timer is not active.",
                    game
                );
                continue;
            }

            // Generate Window Label
            let window_label = format!("avatar_{}", game.replace(".exe", ""));
            
            // Check if already exists
            if app_handle.get_webview_window(&window_label).is_some() {
                continue;
            }

            // Spawn the new transparent Avatar Window
            let url = tauri::WebviewUrl::App("avatar.html".into());
            
            match tauri::WebviewWindowBuilder::new(&app_handle, window_label.clone(), url)
                .title("Focus Avatar")
                .inner_size(400.0, 500.0)
                .decorations(false)
                .always_on_top(true)
                .skip_taskbar(true)
                .resizable(false)
                .build() 
            {
                Ok(window) => {
                    println!("Successfully spawned Tauri Avatar natively for {}", game);
                    let state = app_handle.state::<GameMonitorState>();
                    let mut avatars = state.active_avatars.lock().unwrap();
                    avatars.insert(game.clone(), window_label.clone());
                    
                    // Fetch Text and Audio from AI
                    let game_clone = game.clone();
                    let app_clone = app_handle.clone();
                    
                    tauri::async_runtime::spawn(async move {
                        match fetch_deepseek_cartesia_audio(&game_clone).await {
                            Ok((text, audio_bytes)) => {
                                // Important: We use standard emit, but we target the specific window if needed, or emit globally. 
                                // The new avatar script listens globally to `avatar-state` and `avatar-audio`.
                                let _ = app_clone.emit("avatar-state", text);
                                let _ = app_clone.emit("avatar-audio", audio_bytes);
                            },
                            Err(e) => {
                                eprintln!("DeepSeek/Cartesia fetch error: {}", e);
                            }
                        }
                    });
                }
                Err(e) => {
                    eprintln!("Failed to spawn Tauri Avatar natively: {}", e);
                }
            }
        }

        for event in events {
            if let Err(e) = app_handle.emit("game-event", &event) {
                eprintln!("Failed to emit game event: {}", e);
            }
        }
    }
}
