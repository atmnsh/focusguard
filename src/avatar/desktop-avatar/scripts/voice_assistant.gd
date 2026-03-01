extends Node
class_name VoiceAssistant

const API_KEY = "AIzaSyDSmoIgckIB1uobsRqew0RIJ-SqNUrEC1Q"
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" + API_KEY
const TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize?key=" + API_KEY

signal state_changed(new_state: String)
signal response_received(response_text: String)
signal message_sent(prompt: String)

var chat_http: HTTPRequest
var tts_http: HTTPRequest

# Audio recording references
var mic_player: AudioStreamPlayer
var record_effect: AudioEffectRecord
var spectrum: AudioEffectSpectrumAnalyzerInstance
var is_recording: bool = false
var is_processing: bool = false
var silence_timer: float = 0.0
const SILENCE_THRESHOLD: float = 0.01
const SILENCE_DURATION: float = 1.5

func _ready() -> void:
	# Setup HTTP Nodes
	chat_http = HTTPRequest.new()
	add_child(chat_http)
	chat_http.request_completed.connect(_on_chat_completed)
	
	tts_http = HTTPRequest.new()
	add_child(tts_http)
	tts_http.request_completed.connect(_on_tts_completed)

	# Setup Microphone setup
	var mic_idx = AudioServer.get_bus_index("Record")
	if mic_idx >= 0:
		record_effect = AudioServer.get_bus_effect(mic_idx, 0)
		spectrum = AudioServer.get_bus_effect_instance(mic_idx, 1) as AudioEffectSpectrumAnalyzerInstance
	
	mic_player = AudioStreamPlayer.new()
	mic_player.stream = AudioStreamMicrophone.new()
	mic_player.bus = "Record"
	add_child(mic_player)
	mic_player.play()

func _process(delta: float) -> void:
	pass

func start_recording() -> void:
	is_recording = true
	if record_effect:
		record_effect.set_recording_active(true)
	emit_signal("state_changed", "[color=red]Listening...[/color]")

func stop_recording_and_send() -> void:
	is_recording = false
	is_processing = true
	if record_effect:
		record_effect.set_recording_active(false)
		var recording = record_effect.get_recording()
		if recording:
			send_audio_message(recording)

func send_audio_message(recording: AudioStreamWAV) -> void:
	emit_signal("state_changed", "[i]...listening to your voice...[/i]")
	
	var temp_path = "user://temp_mic.wav"
	recording.save_to_wav(temp_path)
	
	var file = FileAccess.open(temp_path, FileAccess.READ)
	if not file:
		emit_signal("state_changed", "[color=red]Failed to read mic audio[/color]")
		is_processing = false
		return
	
	var base64_audio = Marshalls.raw_to_base64(file.get_buffer(file.get_length()))
	file.close()

	var system_prompt = "The user is talking to you directly via microphone instead of text. You are a sassy focus pet. Tell them an aggressive, witty 1 sentence response making them feel bad for not working."
	
	var body_dict = {
		"contents": [{
			"parts": [
				{"text": system_prompt},
				{
					"inlineData": {
						"mimeType": "audio/wav",
						"data": base64_audio
					}
				}
			]
		}]
	}
	
	var body = JSON.stringify(body_dict)
	var headers = ["Content-Type: application/json"]
	chat_http.request(GEMINI_URL, headers, HTTPClient.METHOD_POST, body)

func send_text_message(text: String) -> void:
	if text.strip_edges().is_empty(): return
	emit_signal("message_sent", text)
	is_processing = true
	emit_signal("state_changed", "[i]...thinking...[/i]")
	
	var body = JSON.stringify({"contents": [{"parts": [{"text": text}]}]})
	var headers = ["Content-Type: application/json"]
	chat_http.request(GEMINI_URL, headers, HTTPClient.METHOD_POST, body)

func _on_chat_completed(_res, code, _headers, body) -> void:
	is_processing = false
	var response_text = body.get_string_from_utf8()
	
	if code != 200:
		print("DEBUG ERROR: ", response_text)
		emit_signal("state_changed", "[color=red]API Error " + str(code) + "[/color]")
		return
	
	var json = JSON.parse_string(response_text)
	if json and json.has("candidates"):
		var reply = json.candidates[0].content.parts[0].text
		emit_signal("response_received", reply)
		speak_text(reply)

func speak_text(text: String) -> void:
	var regex = RegEx.new()
	regex.compile("\\[.*?\\]")
	var clean_text = regex.sub(text, "", true)
	
	var body = JSON.stringify({
		"input": { "text": clean_text },
		"voice": { "languageCode": "en-US", "name": "en-US-Neural2-F" },
		"audioConfig": { "audioEncoding": "MP3", "speakingRate": 1.0 }
	})
	
	tts_http.request(TTS_URL, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)

func _on_tts_completed(_res, code, _headers, body) -> void:
	if code == 200:
		var json = JSON.parse_string(body.get_string_from_utf8())
		if json and json.has("audioContent"):
			var audio_data = Marshalls.base64_to_raw(json["audioContent"])
			
			var stream = AudioStreamMP3.new()
			stream.data = audio_data
			
			var player = AudioStreamPlayer.new()
			add_child(player)
			player.stream = stream
			player.play()
			player.finished.connect(player.queue_free)
	else:
		print("Voice API Error: ", body.get_string_from_utf8())
