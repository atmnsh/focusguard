import { useEffect, useRef } from "react";
import dudeMonsterWalk from "@/assets/Dude_Monster_Walk_6.png";
import owletMonsterIdle from "@/assets/Owlet_Monster_Idle_4.png";
import pinkMonsterJump from "@/assets/Pink_Monster_Jump_8.png";

const DEFAULT_FPS = 8;

interface AnimationConfig {
  name: string;
  src: string;
  frames: number;
  fps?: number;
}

export const availableAnimations: AnimationConfig[] = [
  { name: "Момче", src: dudeMonsterWalk, frames: 6, fps: 8 },
  { name: "Бухал", src: owletMonsterIdle, frames: 4, fps: 8 },
  { name: "Зайче", src: pinkMonsterJump, frames: 8, fps: 8 },
];

interface SpriteAnimatorProps {
  animationIndex: number;
}

export default function SpriteAnimator({
  animationIndex,
}: SpriteAnimatorProps) {
  const spriteRef = useRef<HTMLDivElement>(null);

  const animation =
    availableAnimations[animationIndex] ?? availableAnimations[0];
  const fps = animation.fps ?? DEFAULT_FPS;

  // Calculate duration
  const duration = animation.frames / fps;

  // Create unique keyframes for this specific animation
  const keyframesName = `sprite-anim-${animationIndex}`;

  useEffect(() => {
    // Inject dynamic keyframes for this specific animation
    const styleId = `dynamic-anim-${animationIndex}`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes ${keyframesName} {
          from { background-position-x: 0px; }
          to { background-position-x: -${animation.frames * 32}px; }
        }
      `;
      document.head.appendChild(style);
    }
  }, [animationIndex, animation.frames]);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={spriteRef}
        style={{
          width: "32px",
          height: "32px",
          scale: "5",
          position: "relative",
          backgroundImage: `url("${animation.src}")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "auto 100%",
          imageRendering: "pixelated",
          animationName: keyframesName,
          animationTimingFunction: `steps(${animation.frames})`,
          animationIterationCount: "infinite",
          animationDuration: `${duration}s`,
          marginBottom: "100px",
          marginTop: "50px",
        }}
      />
      {/* <div className="text-lg font-bold text-gray-800 flex place-self-end mb-0 ">
        {animation.name}
      </div> */}
    </div>
  );
}
