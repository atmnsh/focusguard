extends Node2D

func _ready() -> void:
	var window = get_window()
	get_viewport().transparent_bg = true
	window.transparent = true
	window.borderless = true
	window.always_on_top = true
	window.unresizable = false
	
