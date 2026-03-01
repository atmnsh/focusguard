use rusqlite::Connection;
use std::fs;
use std::sync::Mutex;
use tauri::Manager;

pub struct DbState {
    pub db: Mutex<Connection>,
}

pub fn init_db(app_handle: &tauri::AppHandle) -> Result<Connection, rusqlite::Error> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");

    fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
    let db_path = app_dir.join("focusguard.db");

    let conn = Connection::open(db_path)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS browser_history (
            id INTEGER PRIMARY KEY,
            url TEXT NOT NULL,
            browser TEXT NOT NULL,
            visit_time TEXT NOT NULL
        )",
        [],
    )?;

    Ok(conn)
}
