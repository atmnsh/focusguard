import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import dudeIdle from '@/assets/Dude_Monster_Idle_4.png';
import dudeWalk from '@/assets/Dude_Monster_Walk_6.png';
import dudeJump from '@/assets/Dude_Monster_Jump_8.png';

const SPRITES = {
    idle: { src: dudeIdle, frames: 4, fps: 6 },
    listening: { src: dudeWalk, frames: 6, fps: 10 },
    speaking: { src: dudeJump, frames: 8, fps: 12 },
};

type AvatarMode = 'idle' | 'listening' | 'speaking';

function SpriteAvatar({ mode, onClick }: { mode: AvatarMode; onClick: () => void }) {
    const sprite = SPRITES[mode];
    const animName = `sprite-${mode}`;
    const duration = sprite.frames / sprite.fps;

    useEffect(() => {
        const id = `kf-${mode}`;
        if (!document.getElementById(id)) {
            const el = document.createElement('style');
            el.id = id;
            el.textContent = `
                @keyframes ${animName} {
                    from { background-position-x: 0px; }
                    to   { background-position-x: -${sprite.frames * 48}px; }
                }
            `;
            document.head.appendChild(el);
        }
    }, [mode]);

    const glowColor =
        mode === 'listening' ? 'rgba(255,200,50,0.9)'
            : mode === 'speaking' ? 'rgba(100,200,255,0.9)'
                : undefined;

    return (
        <div
            onClick={onClick}
            title={mode === 'idle' ? 'Click to speak' : 'Click to stop'}
            style={{
                width: '48px',
                height: '48px',
                scale: '4',
                marginBottom: '96px',
                cursor: 'pointer',
                imageRendering: 'pixelated',
                backgroundImage: `url("${sprite.src}")`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'auto 100%',
                animationName: animName,
                animationTimingFunction: `steps(${sprite.frames})`,
                animationIterationCount: 'infinite',
                animationDuration: `${duration}s`,
                filter: glowColor
                    ? `drop-shadow(0 0 8px ${glowColor})`
                    : 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                transition: 'filter 0.3s ease',
            }}
        />
    );
}

export function AvatarApp() {
    const [avatarMode, setAvatarMode] = useState<AvatarMode>('idle');
    const [bubble, setBubble] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const audioContext = useRef<AudioContext | null>(null);

    useEffect(() => {
        const unlistenState = listen<string>('avatar-state', (event) => {
            const s = event.payload;
            if (s === 'Ready') {
                setAvatarMode('idle');
                setBubble(null);
            } else if (s.startsWith('Listening')) {
                setAvatarMode('listening');
                setBubble(s);
            } else if (s.startsWith('Processing') || s.startsWith('Speaking')) {
                setAvatarMode('speaking');
                setBubble(s);
            } else {
                setAvatarMode('idle');
                setBubble(s);
            }
        });

        const unlistenAudio = listen<number[]>('avatar-audio', async (event) => {
            try {
                if (!audioContext.current) {
                    // @ts-ignore
                    const AC = window.AudioContext || window.webkitAudioContext;
                    audioContext.current = new AC();
                }
                if (audioContext.current.state === 'suspended') {
                    await audioContext.current.resume();
                }
                const buffer = new Uint8Array(event.payload).buffer;
                const audioBuffer = await audioContext.current.decodeAudioData(buffer);
                const source = audioContext.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.current.destination);
                setAvatarMode('speaking');
                source.onended = () => {
                    setAvatarMode('idle');
                    setBubble(null);
                };
                source.start(0);
            } catch (err) {
                console.error('Failed to play audio', err);
                setAvatarMode('idle');
                setBubble('Error playing audio');
            }
        });

        return () => {
            unlistenState.then(f => f());
            unlistenAudio.then(f => f());
        };
    }, []);

    const toggleRecording = async () => {
        try {
            if (isRecording) {
                setIsRecording(false);
                setAvatarMode('speaking');
                setBubble('Processing...');
                await invoke('stop_avatar_recording');
            } else {
                setIsRecording(true);
                setAvatarMode('listening');
                setBubble('Listening...');
                await invoke('start_avatar_recording');
            }
        } catch (e) {
            console.error(e);
            setIsRecording(false);
            setAvatarMode('idle');
            setBubble(`Error: ${e}`);
        }
    };

    return (
        <div
            data-tauri-drag-region
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                width: '100%',
                height: '100%',
                padding: '16px',
                userSelect: 'none',
                boxSizing: 'border-box',
            }}
        >
            {bubble && (
                <div style={{
                    position: 'absolute',
                    bottom: '240px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(8px)',
                    padding: '10px 16px',
                    borderRadius: '18px',
                    borderBottomLeftRadius: '4px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    maxWidth: '200px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#333',
                    whiteSpace: 'pre-wrap',
                    animation: 'fadeIn 0.2s ease',
                }}>
                    {bubble}
                </div>
            )}

            <SpriteAvatar mode={avatarMode} onClick={toggleRecording} />

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(6px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </div>
    );
}
