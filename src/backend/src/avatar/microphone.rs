use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::Stream;
use std::sync::{Arc, Mutex};

pub struct MicrophoneRecorder {
    pub audio_data: Arc<Mutex<Vec<f32>>>,
    stream: Option<Stream>,
}

impl MicrophoneRecorder {
    pub fn new() -> Self {
        Self {
            audio_data: Arc::new(Mutex::new(Vec::new())),
            stream: None,
        }
    }

    pub fn start_recording(&mut self) -> Result<(), String> {
        let host = cpal::default_host();
        let device = host
            .default_input_device()
            .ok_or("Failed to get default input device")?;

        let config = device
            .default_input_config()
            .map_err(|e| format!("Failed to get input config: {}", e))?;

        let sample_rate = config.sample_rate();
        let channels = config.channels();

        println!(
            "Microphone details: Sample rate: {}, Channels: {}, Format: {:?}",
            sample_rate,
            channels,
            config.sample_format()
        );

        let audio_data_clone = self.audio_data.clone();
        audio_data_clone.lock().unwrap().clear();

        let err_fn = move |err| {
            eprintln!("an error occurred on stream: {}", err);
        };

        // We need 16000 hz Mono for Whisper. We will handle crude resampling/downmixing on the fly if needed.
        let stream = match config.sample_format() {
            cpal::SampleFormat::F32 => device.build_input_stream(
                &config.into(),
                move |data: &[f32], _: &_| {
                    let mut lock = audio_data_clone.lock().unwrap();
                    for chunk in data.chunks(channels as usize) {
                        lock.push(chunk[0]); // Take only the first channel (mono)
                    }
                },
                err_fn,
                None, // default timeout
            ),
            cpal::SampleFormat::I16 => device.build_input_stream(
                &config.into(),
                move |data: &[i16], _: &_| {
                    let mut lock = audio_data_clone.lock().unwrap();
                    for chunk in data.chunks(channels as usize) {
                        // Convert i16 to f32 (-1.0 to 1.0 range)
                        lock.push(chunk[0] as f32 / i16::MAX as f32);
                    }
                },
                err_fn,
                None,
            ),
            _ => return Err("Unsupported sample format".to_string()),
        }
        .map_err(|e| format!("Failed to build input stream: {}", e))?;

        stream
            .play()
            .map_err(|e| format!("Failed to play stream: {}", e))?;

        println!("Started recording audio...");
        self.stream = Some(stream);
        Ok(())
    }

    pub fn stop_recording(&mut self) -> Vec<f32> {
        self.stream = None; // Drop stream to stop
        println!("Stopped recording audio.");

        let mut extracted_data = Vec::new();
        let mut lock = self.audio_data.lock().unwrap();
        std::mem::swap(&mut extracted_data, &mut lock);
        extracted_data
    }
}
