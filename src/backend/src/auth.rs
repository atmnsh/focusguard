use crate::db::DbState;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use jsonwebtoken::{encode, EncodingKey, Header};
use rusqlite::OptionalExtension;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;

const JWT_SECRET: &[u8] = b"332807e72cbc41f0b6f3bf0d6795a6bdff75bfd3b45f8f7d060237c5210b3427";

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub username: String,
}

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
}

#[tauri::command]
pub fn register(
    username: String,
    password: String,
    state: State<'_, DbState>,
) -> Result<AuthResponse, String> {
    if username.trim().is_empty() || password.trim().is_empty() {
        return Err("Имейлът и паролата не могат да бъдат празни.".to_string());
    }
    if !username.contains('@') || !username.contains('.') {
        return Err("Невалиден имейл формат.".to_string());
    }

    let allowed_domains = vec!["gmail.com", "yahoo.com"];
    let parts: Vec<&str> = username.split('@').collect();
    if parts.len() != 2 || !allowed_domains.contains(&parts[1].to_lowercase().as_str()) {
        return Err(
            "Моля, използвайте валиден имейл доставчик (напр. gmail.com, yahoo.com).".to_string(),
        );
    }
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hashed_password = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| e.to_string())?
        .to_string();

    let conn = state
        .db
        .lock()
        .map_err(|_| "Failed to lock DB".to_string())?;

    conn.execute(
        "INSERT INTO users (username, hashed_password) VALUES (?1, ?2)",
        rusqlite::params![username, hashed_password],
    )
    .map_err(|e| format!("Username already exists or DB error: {}", e))?;

    let token = generate_token(&username)?;
    Ok(AuthResponse { token, username })
}

#[tauri::command]
pub fn login(
    username: String,
    password: String,
    state: State<'_, DbState>,
) -> Result<AuthResponse, String> {
    if username.trim().is_empty() || password.trim().is_empty() {
        return Err("Имейлът и паролата не могат да бъдат празни.".to_string());
    }
    let conn = state
        .db
        .lock()
        .map_err(|_| "Failed to lock DB".to_string())?;

    let stored_hash: Option<String> = conn
        .query_row(
            "SELECT hashed_password FROM users WHERE username = ?1",
            rusqlite::params![username],
            |row| row.get(0),
        )
        .optional()
        .map_err(|e| e.to_string())?;

    let stored_hash = stored_hash.ok_or_else(|| "Invalid username or password".to_string())?;

    let parsed_hash = PasswordHash::new(&stored_hash).map_err(|e| e.to_string())?;
    let argon2 = Argon2::default();

    if argon2
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok()
    {
        let token = generate_token(&username)?;
        Ok(AuthResponse { token, username })
    } else {
        Err("Invalid username or password".into())
    }
}

fn generate_token(username: &str) -> Result<String, String> {
    let expiration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs() as usize
        + 30 * 60; // 30 minutes

    let claims = Claims {
        sub: username.to_string(),
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(JWT_SECRET),
    )
    .map_err(|e| e.to_string())
}
