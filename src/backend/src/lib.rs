pub mod activity_track;
pub mod auth;
pub mod db;

use activity_track::pc_background_activity::{self, GameMonitorState};
use std::sync::Mutex;
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Initialize local database
            let conn = db::init_db(app.handle()).expect("Failed to initialize database");
            app.manage(db::DbState {
                db: Mutex::new(conn),
            });

            // Initialize game monitor state
            app.manage(GameMonitorState::default());

            let app_handle = app.handle().clone();
            
            // Spawn background game monitoring
            tauri::async_runtime::spawn(async move {
                pc_background_activity::monitor_games(app_handle.clone()).await;
            });

            // Example of fetching browser history automatically on startup (can be moved to a command if preferred)
            // tauri::async_runtime::spawn(async move {
            //     let _ = activity_track::fetch_from_browser::fetch_browser_history(app_handle);
            // });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            auth::register,
            auth::login,
            pc_background_activity::add_custom_game,
            pc_background_activity::get_active_games,
            pc_background_activity::get_daily_usage,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
