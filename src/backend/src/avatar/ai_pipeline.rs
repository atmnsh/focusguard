use serde_json::json;
use reqwest::Client;
use tauri::Emitter;

const DEEPSEEK_URL: &str = "https://api.deepseek.com/chat/completions";
const ELEVENLABS_STT_URL: &str = "https://api.elevenlabs.io/v1/speech-to-text";
const ELEVENLABS_TTS_URL: &str = "https://api.elevenlabs.io/v1/text-to-speech/CsGB1DArtcqfpLG77Gxy";

pub struct AiPipeline {
    http_client: Client,
}

impl AiPipeline {
    pub fn new() -> Self {
        Self {
            http_client: Client::new(),
        }
    }

    pub async fn process_audio_to_speech(&self, audio_data: &[f32], emt: &tauri::AppHandle) -> Result<(), String> {
        // 1. STT (ElevenLabs Scribe)
        emt.emit("avatar-state", "[i]...transcribing...[/i]").unwrap_or_default();
        let transcript = self.transcribe_audio(audio_data).await?;

        if transcript.trim().is_empty() {
            emt.emit("avatar-state", "Ready").unwrap_or_default();
            return Ok(());
        }

        println!("ElevenLabs STT: {}", transcript);

        // 2. LLM (DeepSeek)
        emt.emit("avatar-state", "[i]...thinking...[/i]").unwrap_or_default();
        let reply = self.query_deepseek(&transcript).await?;

        // 3. TTS (ElevenLabs)
        emt.emit("avatar-state", "[i]...speaking...[/i]").unwrap_or_default();
        let audio_bytes = self.query_elevenlabs(&reply).await?;

        // 4. Send back to JavaScript to play
        emt.emit("avatar-audio", audio_bytes).unwrap_or_default();

        Ok(())
    }

    async fn transcribe_audio(&self, audio_data: &[f32]) -> Result<String, String> {
        // Encode f32 samples to WAV bytes so ElevenLabs can read them
        let wav_bytes = encode_wav(audio_data, 48000, 1);

        let api_key = std::env::var("ELEVENLABS_API_KEY").unwrap_or_default();

        let form = reqwest::multipart::Form::new()
            .text("model_id", "scribe_v1")
            .text("language_code", "bul") // ISO 639-3 code for Bulgarian
            .part(
                "file",
                reqwest::multipart::Part::bytes(wav_bytes)
                    .file_name("audio.wav")
                    .mime_str("audio/wav")
                    .map_err(|e| e.to_string())?,
            );

        let res = self.http_client
            .post(ELEVENLABS_STT_URL)
            .header("xi-api-key", api_key)
            .multipart(form)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !res.status().is_success() {
            let err = res.text().await.unwrap_or_default();
            eprintln!("ElevenLabs STT Error: {}", err);
            return Err(format!("ElevenLabs STT Error: {}", err));
        }

        let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
        let text = json["text"].as_str().unwrap_or("").to_string();
        Ok(text)
    }

    async fn query_deepseek(&self, transcript: &str) -> Result<String, String> {
        let payload = json!({
            "model": "deepseek-chat",
            "messages": [
                {
                    "role": "system",
                    "content": "Ти си мил и насърчаващ фокус помощник. Кажи им едно кратко, подкрепящо и мотивиращо изречение."
                },
                {
                    "role": "user",
                    "content": transcript
                }
            ]
        });

        let api_key = std::env::var("DEEPSEEK_API_KEY").unwrap_or_default();
        let res = self.http_client
            .post(DEEPSEEK_URL)
            .header("Authorization", format!("Bearer {}", api_key))
            .json(&payload)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let json_res: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;

        let response_text = json_res["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("Продължавай напред, вярвам в теб!");

        println!("DeepSeek Reply: {}", response_text);
        Ok(response_text.to_string())
    }

    async fn query_elevenlabs(&self, text: &str) -> Result<Vec<u8>, String> {
        let api_key = std::env::var("ELEVENLABS_API_KEY").unwrap_or_default();
        let payload = json!({
            "model_id": "eleven_multilingual_v2",
            "text": text,
        });

        let res = self.http_client
            .post(ELEVENLABS_TTS_URL)
            .header("xi-api-key", api_key)
            .json(&payload)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !res.status().is_success() {
            let error_text = res.text().await.unwrap_or_default();
            eprintln!("ElevenLabs TTS Error: {}", error_text);
            return Err(format!("ElevenLabs TTS Error: {}", error_text));
        }

        let bytes = res.bytes().await.map_err(|e| e.to_string())?;
        Ok(bytes.to_vec())
    }
}

/// Encode raw f32 PCM samples into a WAV file in memory.
fn encode_wav(samples: &[f32], sample_rate: u32, channels: u16) -> Vec<u8> {
    let bits_per_sample: u16 = 16;
    let byte_rate = sample_rate * channels as u32 * bits_per_sample as u32 / 8;
    let block_align = channels * bits_per_sample / 8;
    let data_len = (samples.len() * 2) as u32; // 2 bytes per i16 sample

    let mut wav = Vec::with_capacity(44 + data_len as usize);

    // RIFF header
    wav.extend_from_slice(b"RIFF");
    wav.extend_from_slice(&(36 + data_len).to_le_bytes());
    wav.extend_from_slice(b"WAVE");

    // fmt chunk
    wav.extend_from_slice(b"fmt ");
    wav.extend_from_slice(&16u32.to_le_bytes()); // chunk size
    wav.extend_from_slice(&1u16.to_le_bytes());  // PCM format
    wav.extend_from_slice(&channels.to_le_bytes());
    wav.extend_from_slice(&sample_rate.to_le_bytes());
    wav.extend_from_slice(&byte_rate.to_le_bytes());
    wav.extend_from_slice(&block_align.to_le_bytes());
    wav.extend_from_slice(&bits_per_sample.to_le_bytes());

    // data chunk
    wav.extend_from_slice(b"data");
    wav.extend_from_slice(&data_len.to_le_bytes());
    for &s in samples {
        let clamped = s.clamp(-1.0, 1.0);
        let i16_sample = (clamped * i16::MAX as f32) as i16;
        wav.extend_from_slice(&i16_sample.to_le_bytes());
    }

    wav
}
