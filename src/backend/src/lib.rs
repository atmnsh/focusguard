pub mod activity_track;
pub mod auth;
pub mod db;
pub mod avatar;
pub mod summary;

use activity_track::pc_background_activity::{self, GameMonitorState};
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Load .env variables
            dotenvy::dotenv().ok();

            // Initialize local database
            let conn = db::init_db(app.handle()).expect("Failed to initialize database");
            app.manage(db::DbState {
                db: Mutex::new(conn),
            });

            app.manage(GameMonitorState::default());
            avatar::init_avatar_state(&app.handle());

            let app_handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                pc_background_activity::monitor_games(app_handle.clone()).await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            auth::register,
            auth::login,
            pc_background_activity::add_custom_game,
            pc_background_activity::set_timer_state,
            pc_background_activity::get_active_games,
            pc_background_activity::get_daily_usage,
            avatar::start_avatar_recording,
            avatar::stop_avatar_recording,
            summary::generate_dashboard_summary,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
