pub mod ai_pipeline;
pub mod microphone;

use std::sync::Mutex;
use tauri::{AppHandle, State, Emitter};
use tauri::Manager;

pub struct AvatarState {
    pub recorder: Mutex<microphone::MicrophoneRecorder>,
    pub pipeline: Mutex<ai_pipeline::AiPipeline>,
}

// Global init function for the avatar state
pub fn init_avatar_state(app: &AppHandle) {
    app.manage(AvatarState {
        recorder: Mutex::new(microphone::MicrophoneRecorder::new()),
        pipeline: Mutex::new(ai_pipeline::AiPipeline::new()),
    });
}

#[tauri::command]
pub async fn start_avatar_recording(state: State<'_, AvatarState>) -> Result<(), String> {
    let mut recorder = state.recorder.lock().unwrap();
    recorder.start_recording()
}

#[tauri::command]
pub async fn stop_avatar_recording(app: AppHandle, state: State<'_, AvatarState>) -> Result<(), String> {
    let audio_data = {
        let mut recorder = state.recorder.lock().unwrap();
        recorder.stop_recording()
    };

    println!("Passing {} raw samples to ElevenLabs STT...", audio_data.len());

    let pipeline = ai_pipeline::AiPipeline::new();

    tauri::async_runtime::spawn(async move {
        if let Err(e) = pipeline.process_audio_to_speech(&audio_data, &app).await {
            app.emit("avatar-state", format!("Error: {}", e)).unwrap_or_default();
        }
    });

    Ok(())
}
