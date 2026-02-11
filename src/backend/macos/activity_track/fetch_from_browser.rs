use chrono::{DateTime, Utc};
use std::{thread::sleep, time::Duration};

pub fn fetch_browser_history() -> Result<()> {
    let browsers = [
        ("Chrome", get_browser_path("Chrome")),
        ("Brave", get_browser_path("Brave")),
        ("Firefox", get_browser_path("Firefox")),
        ("Edge", get_browser_path("Edge")),
        ("Safari", get_browser_path("Safari")),
    ];

    for (browser, path) in browsers.iter() {
        if let Some(history_path) = path {
            if let Err(e) = fetch_history_for_browser(browser, history_path) {
                eprintln!("Error fetching {} history: {:?}", browser, e);
            }
        }
    }
    Ok(())
}

fn get_browser_path(browser: &str) -> Option<String> {
    let home = std::env::var("HOME")
        .ok()
        .or_else(|| std::env::var("USERPROFILE").ok())?;
    match browser {
        "Chrome" => {
            #[cfg(target_os = "macos")]
            return Some(format!(
                "{}/Library/Application Support/Google/Chrome/Default/History",
                home
            ));
        }
        "Brave" => {
            #[cfg(target_os = "macos")]
            return Some(format!(
                "{}/Library/Application Support/BraveSoftware/Brave-Browser/Default/History",
                home
            ));
        }
        "Firefox" => {
            #[cfg(target_os = "macos")]
            return Some(format!(
                "{}/Library/Application Support/Firefox/Profiles",
                home
            ));
        }
        "Edge" => {
            #[cfg(target_os = "macos")]
            return Some(format!(
                "{}/Library/Application Support/Microsoft Edge/Default/History",
                home
            ));
        }
        "Safari" => {
            #[cfg(target_os = "macos")]
            return Some(format!("{}/Library/Safari/History.db", home));
        }
        _ => None,
    }
}

fn fetch_history_for_browser(browser: &str, path: &str) -> Result<(), Error> {
    let path = if browser == "Firefox" {
        let profiles = std::fs::read_dir(path).unwrap();
        let profile_path = profiles
            .filter_map(|entry| entry.ok())
            .find(|entry| {
                entry
                    .file_name()
                    .to_string_lossy()
                    .ends_with(".default-release")
            })
            .map(|entry| entry.path().join("places.sqlite"));
        profile_path
            .map(|p| p.to_string_lossy().to_string())
            .ok_or_else(|| rusqlite::Error::InvalidPath(path.into()))?
    } else {
        path.to_string()
    };

    let history_conn =
        Connection::open_with_flags(&path, rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY)?;
    let query = if browser == "Safari" {
        "SELECT url, visit_time FROM history_items"
    } else if browser == "Firefox" {
        "SELECT url, last_visit_date/1000000 AS visit_time FROM moz_places WHERE last_visit_date IS NOT NULL"
    } else {
        "SELECT url, CAST(visit_time/1000000 - 11644473600 AS INTEGER) AS visit_time FROM urls WHERE visit_time IS NOT NULL"
    };

    let mut stmt = history_conn.prepare(query)?;
    let rows = stmt.query_map([], |row| {
        let url: String = row.get(0)?;
        let visit_time: i64 = row.get(1)?;
        Ok((url, visit_time))
    })?;

    let conn = connectdb_blog();
    for row in rows {
        let (url, visit_time) = row?;
        let timestamp = DateTime::<Utc>::from_timestamp(visit_time, 0)
            .map(|dt| dt.to_rfc3339())
            .unwrap_or_default();
        conn.insert_browser(&url, browser, &timestamp)?;
        sleep(Duration::from_secs(1));
    }
    Ok(())
}
