extends Node2D

var voice_assistant: Node
var avatar: AnimatedSprite2D

var input_field: LineEdit
var send_button: Button

func _ready() -> void:
	# Window setup
	var window = get_window()
	get_viewport().transparent_bg = true
	window.transparent = true
	window.borderless = true
	window.always_on_top = true
	window.size = Vector2i(500, 350)

	# Fetch the existing Sprite from the scene
	var dude_sprite = get_node_or_null("DudeSprite")
	if dude_sprite:
		# Add the Avatar script dynamically
		dude_sprite.set_script(preload("res://scripts/avatar.gd"))
		avatar = dude_sprite
		avatar.initialize()
		# Reset position for new layout relative to window
		avatar.position = Vector2(250, 150)
	
	# Instantiate VoiceAssistant
	voice_assistant = preload("res://scripts/voice_assistant.gd").new()
	add_child(voice_assistant)
	
	setup_signals()
	create_ui()

func setup_signals() -> void:
	voice_assistant.state_changed.connect(_on_assistant_state_changed)
	voice_assistant.response_received.connect(_on_assistant_response_received)
	voice_assistant.message_sent.connect(_on_assistant_message_sent)

func create_ui() -> void:
	# Input area background
	var input_bg = ColorRect.new()
	input_bg.color = Color(0.2, 0.2, 0.2, 0.8)
	input_bg.position = Vector2(0, 300)
	input_bg.size = Vector2(500, 50)
	add_child(input_bg)
	
	# Text input field
	input_field = LineEdit.new()
	input_field.placeholder_text = "Type your message..."
	input_field.position = Vector2(10, 310)
	input_field.size = Vector2(280, 30)
	add_child(input_field)
	input_field.text_submitted.connect(send_message)
	
	# Send button
	send_button = Button.new()
	send_button.text = "Send"
	send_button.position = Vector2(300, 310)
	send_button.size = Vector2(80, 30)
	add_child(send_button)
	send_button.pressed.connect(func(): send_message(input_field.text))

	# Record button
	var record_button = Button.new()
	record_button.text = "Record"
	record_button.position = Vector2(390, 310)
	record_button.size = Vector2(100, 30)
	add_child(record_button)
	
	record_button.button_down.connect(func():
		voice_assistant.start_recording()
		record_button.text = "Recording..."
	)
	record_button.button_up.connect(func():
		voice_assistant.stop_recording_and_send()
		record_button.text = "Record"
	)

func send_message(text: String) -> void:
	if text.strip_edges().is_empty(): return
	input_field.clear()
	voice_assistant.send_text_message(text)

func _on_assistant_state_changed(state: String) -> void:
	if avatar:
		avatar.set_state(state)

func _on_assistant_response_received(response: String) -> void:
	if avatar:
		# Estimate reading time roughly
		var reading_time = max(3.0, len(response) * 0.05)
		avatar.say(response, reading_time)

func _on_assistant_message_sent(prompt: String) -> void:
	pass # Could be used to log or display user questions