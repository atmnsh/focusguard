extends SceneTree

func _init():
    var timer = Timer.new()
    var root = root
    
    # We can't really simulate it easily without instantiating the scene.
    # The default scene is probably main_dude.tscn
    
    # Just run Godot and collect logs directly
    quit()
