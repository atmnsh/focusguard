use reqwest::Client;
use serde_json::json;

const DEEPSEEK_URL: &str = "https://api.deepseek.com/chat/completions";

#[derive(serde::Deserialize)]
pub struct DayData {
    pub day: String,
    pub productive: i32,
    pub distracted: i32,
}

#[tauri::command]
pub async fn generate_dashboard_summary(data: Vec<DayData>) -> Result<String, String> {
    // Build a readable table for the prompt
    let table = data
        .iter()
        .map(|d| format!("  {}: {} мин. продуктивност, {} мин. разсейване", d.day, d.productive, d.distracted))
        .collect::<Vec<_>>()
        .join("\n");

    let total_productive: i32 = data.iter().map(|d| d.productive).sum();
    let total_distracted: i32 = data.iter().map(|d| d.distracted).sum();
    let total = total_productive + total_distracted;
    let productive_pct = if total > 0 { total_productive * 100 / total } else { 0 };

    let prompt = format!(
        "Данни за последната седмица:\n{}\n\nОбщо: {} мин. продуктивно, {} мин. разсейване ({}% продуктивност).\n\nНапиши кратко обобщение (2-3 изречения) на български за потребителя — колко добре е прекарал времето си, кой ден е бил най-продуктивен и кой — най-разсеян, и дали трябва да подобри навиците си. Бъди конкретен и аналитичен.",
        table, total_productive, total_distracted, productive_pct
    );

    let api_key = std::env::var("DEEPSEEK_API_KEY").unwrap_or_default();
    let client = Client::new();

    let payload = json!({
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "system",
                "content": "Ти си аналитичен асистент за продуктивност. Отговаряй само на български език."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    });

    let res = client
        .post(DEEPSEEK_URL)
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        let err = res.text().await.unwrap_or_default();
        return Err(format!("DeepSeek error: {}", err));
    }

    let json_res: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    let text = json_res["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("Не успях да генерирам обобщение.")
        .replace('*', "")
        .to_string();

    Ok(text)
}
