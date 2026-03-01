extends AnimatedSprite2D
class_name DesktopAvatar

var speech_panel: Panel
var speech_label: RichTextLabel
var speech_timer: Timer

func initialize() -> void:
	create_speech_bubble()
	play("idle_jump")

func create_speech_bubble() -> void:
	speech_panel = Panel.new()
	speech_panel.custom_minimum_size = Vector2(400, 100)
	speech_panel.position = Vector2(-200, -200) # positioned relative to the sprite
	speech_panel.size = Vector2(400, 100)
	add_child(speech_panel)
	
	speech_label = RichTextLabel.new()
	speech_label.bbcode_enabled = true
	speech_label.fit_content = true
	speech_label.custom_minimum_size = Vector2(380, 80)
	speech_label.position = Vector2(10, 10)
	speech_label.text = "[center]Ready for a chat![/center]"
	speech_panel.add_child(speech_label)
	
	speech_timer = Timer.new()
	speech_timer.one_shot = true
	speech_timer.timeout.connect(_on_speech_timeout)
	add_child(speech_timer)

func say(text: String, duration: float = 0.0) -> void:
	speech_label.text = "[center]" + text + "[/center]"
	speech_panel.show()
	if duration > 0.0:
		speech_timer.start(duration)

func set_state(text: String) -> void:
	speech_label.text = "[center]" + text + "[/center]"
	speech_panel.show()
	speech_timer.stop()

func hide_speech() -> void:
	speech_panel.hide()

func _on_speech_timeout() -> void:
	hide_speech()
