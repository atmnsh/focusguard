use std::collections::HashSet;
use std::sync::Mutex;
use sysinfo::{System, ProcessesToUpdate};
use tauri::{AppHandle, Emitter, Manager, State};
use tokio::time::{self, Duration};
use std::process::{Child, Command};
use serde_json::{json, Value};
use base64::Engine;
use std::path::PathBuf;

const KNOWN_GAMES: &[&str] = &[
    "eldenring",
    "valorant",
    "cyberpunk2077",
    "csgo",
    "fortnite",
    "apexlegends",
    "steam.exe",
    "epicgameslauncher.exe",
    "thunderbird"
];

use std::time::Instant;

pub struct GameMonitorState {
    pub active_games: Mutex<HashSet<String>>,
    pub game_list: Mutex<HashSet<String>>,
    pub active_avatars: Mutex<std::collections::HashMap<String, Child>>,
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

async fn fetch_gemini_audio(game_name: &str, output_path: &PathBuf) -> Result<String, String> {
    let api_key = "AIzaSyBTsmWvZXZwHAt5OAndA2fyGkU0P5AM1O4".to_string();
    
    let prompt = format!("I just opened the computer game {}. Give me a sassy or dramatic 1 sentence quote telling me to close it and get back to work. Keep it very short.", game_name);
    
    let client = reqwest::Client::new();
    let url = format!("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key={}", api_key);
    
    let payload = json!({
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "responseModalities": ["TEXT", "AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": "Puck" 
                    }
                }
            }
        }
    });

    let res = client.post(&url)
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;
        
    let res_json: Value = res.json().await.map_err(|e| e.to_string())?;

    let parts = res_json["candidates"][0]["content"]["parts"]
        .as_array()
        .ok_or("No parts found in Gemini response (maybe invalid key or prompt blocked)")?;
        
    let mut audio_data = None;
    let mut text_response = String::new();

    for part in parts {
        if let Some(inline_data) = part.get("inlineData") {
            if let Some(data) = inline_data.get("data") {
                if let Some(s) = data.as_str() {
                    audio_data = Some(s.to_string());
                }
            }
        }
    }

    // Try to grab the text transcript from the first part if it's there
    if let Some(first_part) = parts.first() {
        if let Some(text) = first_part.get("text") {
            if let Some(s) = text.as_str() {
                text_response = s.to_string();
            }
        }
    }

    if let Some(base64_str) = audio_data {
        let decoded = base64::engine::general_purpose::STANDARD.decode(base64_str).map_err(|e| e.to_string())?;
        std::fs::write(output_path, decoded).map_err(|e| e.to_string())?;
        
        if text_response.is_empty() {
             text_response = format!("Hey! Stop playing {}!", game_name);
        }
        Ok(text_response)
    } else {
        Err("No audio payload returned from Gemini".to_string())
    }
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
            if let Some(mut child) = avatars.remove(&game) {
                if let Err(e) = child.kill() {
                    eprintln!("Failed to kill Godot Avatar sidecar for {}: {}", game, e);
                } else {
                    println!("Successfully killed Godot Avatar sidecar for {}", game);
                }
            }
            drop(avatars);

            // Clean up the temporary motivation.wav file
            let resource_path = app_handle.path().resource_dir().unwrap_or_default().join("bin");
            let audio_path = resource_path.join("motivation.wav");
            if audio_path.exists() {
                if let Err(e) = std::fs::remove_file(&audio_path) {
                    eprintln!("Failed to clean up audio file {:?}: {}", audio_path, e);
                } else {
                    println!("Cleaned up temporal audio file {:?}", audio_path);
                }
            }
        }

        for game in to_start {
            let is_timer_running = {
                let state = app_handle.state::<GameMonitorState>();
                let val = *state.is_timer_running.lock().unwrap();
                val
            };

            if !is_timer_running {
                println!("Skipping avatar for {} because focus timer is not active.", game);
                continue;
            }

            // Spawn the Godot avatar as a standalone bundle resource (skipping sidecars to bypass PCK execution security errors)
            let resource_path = app_handle.path().resource_dir().unwrap_or_default().join("bin");

            let audio_path = resource_path.join("motivation.wav");
            let quote_text = match fetch_gemini_audio(&game, &audio_path).await {
                Ok(t) => t,
                Err(e) => {
                    eprintln!("Gemini fetch error: {}", e);
                    format!("Stop playing {} and go back to work!", game)
                }
            };

            #[cfg(target_os = "macos")]
            let exec_dir = resource_path.join("mac");
            #[cfg(target_os = "macos")]
            let exec_file = exec_dir.join("avatar-companion-mac");

            #[cfg(target_os = "windows")]
            let exec_dir = resource_path.join("win");
            #[cfg(target_os = "windows")]
            let exec_file = exec_dir.join("avatar-companion-win.exe");

            #[cfg(target_os = "macos")]
            let _ = Command::new("chmod").arg("+x").arg(&exec_file).status();

            match Command::new(&exec_file)
                .current_dir(&exec_dir)
                .arg("--quote")
                .arg(quote_text.trim())
                .arg("--audio")
                .arg(audio_path.to_string_lossy().to_string())
                .spawn() {
                Ok(child) => {
                    println!("Successfully spawned Godot Avatar natively for {}", game);
                    let state = app_handle.state::<GameMonitorState>();
                    let mut avatars = state.active_avatars.lock().unwrap();
                    avatars.insert(game.clone(), child);
                }
                Err(e) => {
                    eprintln!("Failed to spawn Godot Avatar natively {:?}: {}", exec_file, e);
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
