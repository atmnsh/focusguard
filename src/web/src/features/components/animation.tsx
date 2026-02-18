import { useState, useEffect, useRef } from "react";
import dudeMonsterWalk from "@/assets/Dude_Monster_Walk_6.png";
import owletMonsterIdle from "@/assets/Owlet_Monster_Idle_4.png";
import pinkMonsterJump from "@/assets/Pink_Monster_Jump_8.png";

const DEFAULT_FPS = 8;

interface Animation {
  name: string;
  frames: number;
  fps?: number;
}

type AnimationKey = "run" | "roll" | "idle" | "hit" | "die";

const animations: Record<AnimationKey, Animation> = {
  run: { name: "Run", frames: 6 },
  roll: { name: "Roll", frames: 6 },
  idle: { name: "Idle", frames: 2, fps: 2 },
  hit: { name: "Hit", frames: 3 },
  die: { name: "Die", frames: 7 },
};

export default function SpriteAnimator() {
  const [selectedAnimation, setSelectedAnimation] =
    useState<AnimationKey>("run");
  const spriteRef = useRef<HTMLDivElement>(null);

  const animation = animations[selectedAnimation];
  const fps = animation.fps ?? DEFAULT_FPS;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sprite-sheet", `url("${dudeMonsterWalk}")`);
    root.style.setProperty("--frames", String(animation.frames));
    root.style.setProperty("--fps", String(fps));
  }, [animation, fps]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAnimation(event.target.value as AnimationKey);
  };

  const handleAnimationStart = (
    event: React.AnimationEvent<HTMLDivElement>,
  ) => {
    console.log("Animation started:", event.animationName);
  };

  const handleAnimationEnd = (event: React.AnimationEvent<HTMLDivElement>) => {
    console.log("Animation ended:", event.animationName);
  };

  const handleAnimationIteration = (
    event: React.AnimationEvent<HTMLDivElement>,
  ) => {
    console.log("Animation iteration:", event.animationName);
  };

  return (
    <div>
      <select
        id="animation-states"
        value={selectedAnimation}
        onChange={handleChange}
      >
        {(Object.keys(animations) as AnimationKey[]).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      <div
        ref={spriteRef}
        className="animatedSprite"
        onAnimationStart={handleAnimationStart}
        onAnimationEnd={handleAnimationEnd}
        onAnimationIteration={handleAnimationIteration}
      />
    </div>
  );
}
