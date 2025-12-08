'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { usePageControl } from '@/hooks/usePageControl';

interface Note {
  osc: OscillatorNode;
  gain: GainNode;
  decayEnd: number;
}

export default function Page18() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNotesRef = useRef<Record<string, Note>>({});
  const pressTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioPlayerRef = useRef<ReactPlayer>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // 大二度（全音）的频率比：2^(2/12) = 2^(1/6)
  const majorSecondRatio = Math.pow(2, 2/12);
  
  const noteFrequencies: Record<string, number> = {
    Bb3: 233.08 * majorSecondRatio,  // 升高一个大二度
    C4: 261.63 * majorSecondRatio,   // 升高一个大二度
    D4: 293.66 * majorSecondRatio,   // 升高一个大二度
    Eb4: 311.13 * majorSecondRatio,  // 升高一个大二度
    F4: 349.23 * majorSecondRatio,   // 升高一个大二度
    G4: 392.0 * majorSecondRatio,    // 升高一个大二度
    A4: 440.0 * majorSecondRatio,    // 升高一个大二度
    Bb4: 466.16 * majorSecondRatio,  // 升高一个大二度
  };

  const keys = [
    { note: 'Bb4', syllable: 'Fa', color: '#7AC143' },
    { note: 'A4', syllable: 'Mi', color: '#F8A5C2' },
    { note: 'G4', syllable: 'Re', color: '#9CCF4D' },
    { note: 'F4', syllable: 'Do', color: '#FFDB5C' },
    { note: 'Eb4', syllable: 'Ti', color: '#F99B45' },
    { note: 'D4', syllable: 'La', color: '#B88AE8' },
    { note: 'C4', syllable: 'So', color: '#6FB3D9' },
    { note: 'Bb3', syllable: 'Fa', color: '#5BA3D0' },
  ];

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const playNote = (note: string, isLongPress = false): Note | null => {
    if (!audioContextRef.current) return null;

    const freq = noteFrequencies[note];
    if (!freq) return null;

    const oscMain = audioContextRef.current.createOscillator();
    const real = new Float32Array([0, 1, 0.2, 0.08, 0.03]);
    const imag = new Float32Array(real.length);
    const wave = audioContextRef.current.createPeriodicWave(real, imag);
    oscMain.setPeriodicWave(wave);
    oscMain.frequency.value = freq;

    const gain = audioContextRef.current.createGain();
    gain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioContextRef.current.currentTime + 0.03);
    gain.gain.linearRampToValueAtTime(0.45, audioContextRef.current.currentTime + 0.1);
    const decayEnd = audioContextRef.current.currentTime + (isLongPress ? 8 : 3);
    gain.gain.exponentialRampToValueAtTime(0.001, decayEnd);

    oscMain.connect(gain);
    gain.connect(audioContextRef.current.destination);

    oscMain.start();
    oscMain.stop(decayEnd + 0.1);
    return { osc: oscMain, gain, decayEnd };
  };

  const createFloatingNote = (keyElement: HTMLElement, color: string) => {
    if (!containerRef.current) return;

    const note = document.createElement('div');
    note.style.position = 'absolute';
    note.style.fontSize = '2rem';
    note.style.color = color;
    note.style.pointerEvents = 'none';
    note.style.zIndex = '50';
    note.style.fontWeight = 'bold';
    note.style.textShadow = '1px 1px 2px rgba(255, 255, 255, 0.8)';
    note.style.animation = 'floatUp 1.5s ease-out forwards';
    note.innerText = ['♪', '♫', '♩', '♬'][Math.floor(Math.random() * 4)];

    const rect = keyElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    note.style.left = (rect.left - containerRect.left + rect.width / 2 - 10) + 'px';
    note.style.top = (rect.top - containerRect.top - 20) + 'px';

    containerRef.current.appendChild(note);

    setTimeout(() => {
      note.remove();
    }, 1500);
  };

  const triggerNoteStart = (note: string, keyElement: HTMLElement, color: string) => {
    initAudio();

    if (!activeNotesRef.current[note]) {
      const noteObj = playNote(note, false);
      if (noteObj) {
        activeNotesRef.current[note] = noteObj;
        keyElement.classList.add('active');
        createFloatingNote(keyElement, color);
      }
    }
  };

  const triggerNoteEnd = (note: string, keyElement: HTMLElement) => {
    if (activeNotesRef.current[note]) {
      const { gain, decayEnd } = activeNotesRef.current[note];
      if (gain && audioContextRef.current) {
        gain.gain.cancelScheduledValues(audioContextRef.current.currentTime);
        gain.gain.setValueAtTime(gain.gain.value, audioContextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.3);
      }
      delete activeNotesRef.current[note];
      keyElement.classList.remove('active');
    }
  };


  // 处理页面控制命令
  const handlePageControl = useCallback((command: { type: string; value?: any }) => {
    switch (command.type) {
      case 'play-audio':
        // 播放完整伴奏
        setIsAudioPlaying(true);
        if (audioPlayerRef.current) {
          const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
          if (audioInternalPlayer) {
            // 重置到开始位置
            if (audioInternalPlayer.currentTime !== undefined) {
              audioInternalPlayer.currentTime = 0;
            }
            // 播放
            audioInternalPlayer.play().catch((error: any) => {
              console.log('完整伴奏播放失败:', error);
            });
          }
        }
        break;

      case 'pause-audio':
        // 暂停完整伴奏
        setIsAudioPlaying(false);
        if (audioPlayerRef.current) {
          const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
          if (audioInternalPlayer && !audioInternalPlayer.paused) {
            audioInternalPlayer.pause();
          }
        }
        break;

      case 'toggle-audio':
        // 切换播放/暂停状态
        if (isAudioPlaying) {
          setIsAudioPlaying(false);
          if (audioPlayerRef.current) {
            const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
            if (audioInternalPlayer && !audioInternalPlayer.paused) {
              audioInternalPlayer.pause();
            }
          }
        } else {
          setIsAudioPlaying(true);
          if (audioPlayerRef.current) {
            const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
            if (audioInternalPlayer) {
              // 如果播放器在开始位置或已结束，重置到开始
              if (audioInternalPlayer.currentTime === 0 || audioInternalPlayer.ended) {
                if (audioInternalPlayer.currentTime !== undefined) {
                  audioInternalPlayer.currentTime = 0;
                }
              }
              audioInternalPlayer.play().catch((error: any) => {
                console.log('完整伴奏播放失败:', error);
              });
            }
          }
        }
        break;

      default:
        break;
    }
  }, [isAudioPlaying]);

  // 监听页面控制命令
  usePageControl(18, handlePageControl);

  useEffect(() => {
    return () => {
      Object.values(activeNotesRef.current).forEach((note) => {
        try {
          note.osc.stop();
        } catch (e) {
          // Ignore
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundImage: 'url(/assets/images/page-18.png)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          20% {
            transform: translateY(-20px) scale(1.2) rotate(-10deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(1) rotate(10deg);
            opacity: 0;
          }
        }
        .piano-key {
          flex: 1;
          width: 100%;
          margin: 0;
          background: transparent;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          position: relative;
          transition: all 0.15s ease;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          padding: 0;
          opacity: 0;
          font-size: 1.2rem;
          min-height: 0;
        }
        .piano-key:nth-child(1) { width: 100%; }
        .piano-key:nth-child(2) { width: 100%; }
        .piano-key:nth-child(3) { width: 100%; }
        .piano-key:nth-child(4) { width: 100%; }
        .piano-key:nth-child(5) { width: 100%; }
        .piano-key:nth-child(6) { width: 100%; }
        .piano-key:nth-child(7) { width: 100%; }
        .piano-key:nth-child(8) { width: 100%; }
        .piano-key:hover {
          opacity: 0.25;
          background: rgba(255, 255, 255, 0.35);
        }
        .piano-key:active,
        .piano-key.active {
          opacity: 0.4;
          background: rgba(255, 255, 255, 0.6);
          transform: scale(0.98);
        }
        .syllable {
          position: absolute;
          bottom: 12px;
          right: 8px;
          font-size: 1.4rem;
          font-weight: bold;
          color: #2d3748;
          pointer-events: none;
          text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.9), -1px -1px 2px rgba(255, 255, 255, 0.9);
          line-height: 1;
          z-index: 10;
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}</style>

      {/* 钢琴键盘容器 */}
      <div
        style={{
          position: 'absolute',
          right: '0.1%',
          top: '57%',
          transform: 'translateY(-50%)',
          width: '12%',
          height: '62%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.5%',
          padding: 0,
        }}
      >
        {keys.map((key, index) => (
          <div
            key={key.note}
            style={{ position: 'relative', width: '100%', flex: 1 }}
          >
            <div
            className="piano-key"
            data-note={key.note}
              style={{ width: '100%', height: '100%' }}
            onMouseDown={(e) => {
              e.preventDefault();
              const pressStart = Date.now();
              const timer = setTimeout(() => {
                if (activeNotesRef.current[key.note]) {
                  const { gain, decayEnd } = activeNotesRef.current[key.note];
                  if (gain && audioContextRef.current) {
                    gain.gain.cancelScheduledValues(audioContextRef.current.currentTime);
                    gain.gain.setValueAtTime(gain.gain.value, audioContextRef.current.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 8);
                    activeNotesRef.current[key.note].decayEnd = audioContextRef.current.currentTime + 8;
                  }
                }
              }, 1000);
              pressTimersRef.current[key.note] = timer;
              triggerNoteStart(key.note, e.currentTarget, key.color);
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              if (pressTimersRef.current[key.note]) {
                clearTimeout(pressTimersRef.current[key.note]);
                delete pressTimersRef.current[key.note];
              }
              triggerNoteEnd(key.note, e.currentTarget);
            }}
            onMouseLeave={(e) => {
              e.preventDefault();
              if (pressTimersRef.current[key.note]) {
                clearTimeout(pressTimersRef.current[key.note]);
                delete pressTimersRef.current[key.note];
              }
              triggerNoteEnd(key.note, e.currentTarget);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              const pressStart = Date.now();
              const timer = setTimeout(() => {
                if (activeNotesRef.current[key.note]) {
                  const { gain, decayEnd } = activeNotesRef.current[key.note];
                  if (gain && audioContextRef.current) {
                    gain.gain.cancelScheduledValues(audioContextRef.current.currentTime);
                    gain.gain.setValueAtTime(gain.gain.value, audioContextRef.current.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 8);
                    activeNotesRef.current[key.note].decayEnd = audioContextRef.current.currentTime + 8;
                  }
                }
              }, 1000);
              pressTimersRef.current[key.note] = timer;
              triggerNoteStart(key.note, e.currentTarget, key.color);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              if (pressTimersRef.current[key.note]) {
                clearTimeout(pressTimersRef.current[key.note]);
                delete pressTimersRef.current[key.note];
              }
              triggerNoteEnd(key.note, e.currentTarget);
            }}
            />
            <span className="syllable">{key.syllable}</span>
          </div>
        ))}
      </div>

      {/* 音频播放器（隐藏） */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: 0 }}>
        <ReactPlayer
          ref={audioPlayerRef}
          url="/assets/audios/完整伴奏.mp3"
          playing={isAudioPlaying}
          loop={false}
          controls={false}
          width="1px"
          height="1px"
          config={{
            file: {
              attributes: {
                autoPlay: false,
              },
            },
          }}
        />
      </div>
    </div>
  );
}
