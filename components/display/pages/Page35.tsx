'use client';

import { useEffect, useRef, useState } from 'react';

interface Note {
  x: number;
  y: number;
  freq: number;
  beat: number;
  dur: number;
}

interface UserPathPoint {
  x: number;
  y: number;
  correct: boolean;
}

interface Phrase {
  desc: string;
  data: Array<{
    note: string;
    beat: number;
    dur: number;
  }>;
}

export default function Page35() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPhraseIdx, setCurrentPhraseIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const audioDataArrayRef = useRef<Float32Array | null>(null);
  const notesRef = useRef<Note[]>([]);
  const userPathRef = useRef<UserPathPoint[]>([]);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const playbackTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const widthRef = useRef(0);
  const heightRef = useRef(0);
  const targetPlayheadRef = useRef<HTMLDivElement>(null);
  const userPlayheadRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(false);
  const isMicActiveRef = useRef(false);

  // Scale Mapping (C Major, 1=C4)
  const scaleMap: Record<string, { freq: number; vIdx: number }> = {
    'G3': { freq: 196.00, vIdx: 0 }, // Low 5 (5.)
    'A3': { freq: 220.00, vIdx: 2 }, // Low 6 (6.)
    'B3': { freq: 246.94, vIdx: 4 }, // Low 7 (7.)
    'C4': { freq: 261.63, vIdx: 5 }, // Middle 1
    'D4': { freq: 293.66, vIdx: 7 }, // Middle 2
    'E4': { freq: 329.63, vIdx: 9 }, // Middle 3
    'F4': { freq: 349.23, vIdx: 10 },// Middle 4
    'G4': { freq: 392.00, vIdx: 12 },// Middle 5
    'A4': { freq: 440.00, vIdx: 14 },// Middle 6
    'C5': { freq: 523.25, vIdx: 17 } // High 1
  };

  // 🎵 MUSIC DATA
  const phrases: Phrase[] = [
    {
      // Phrase 1: 两只小象 哟啰啰 (1 3 5. 1)
      desc: "1. 两只小象 (1 3 5. 1)",
      data: [
        { note: 'C4', beat: 0, dur: 0.5 },
        { note: 'E4', beat: 0.5, dur: 0.5 },
        { note: 'G3', beat: 1.0, dur: 1.0 },
        { note: 'C4', beat: 2.0, dur: 1.0 },
        // Bar 2
        { note: 'E4', beat: 3.0, dur: 0.5 },
        { note: 'E4', beat: 3.5, dur: 0.5 },
        { note: 'E4', beat: 4.0, dur: 1.0 }
      ]
    },
    {
      // Phrase 2: 河边走呀 哟啰啰
      desc: "2. 河边走呀 (1 5. 5. 6.)",
      data: [
        { note: 'C4', beat: 0, dur: 0.5 },
        { note: 'G3', beat: 0.5, dur: 0.5 },
        { note: 'G3', beat: 1.0, dur: 1.0 },
        { note: 'A3', beat: 2.0, dur: 1.0 },
        // Bar 2
        { note: 'D4', beat: 3.0, dur: 0.5 },
        { note: 'D4', beat: 3.5, dur: 0.5 },
        { note: 'D4', beat: 4.0, dur: 1.0 }
      ]
    },
    {
      // Phrase 3: 扬起鼻子 哟啰啰
      desc: "3. 扬起鼻子 (3 1 3 1)",
      data: [
        { note: 'E4', beat: 0, dur: 0.5 },
        { note: 'C4', beat: 0.5, dur: 0.5 },
        { note: 'E4', beat: 1.0, dur: 1.0 },
        { note: 'C4', beat: 2.0, dur: 1.0 },
        // Bar 2
        { note: 'A3', beat: 3.0, dur: 0.5 },
        { note: 'A3', beat: 3.5, dur: 0.5 },
        { note: 'A3', beat: 4.0, dur: 1.0 }
      ]
    },
    {
      // Phrase 4: 勾一勾呀 哟啰啰
      desc: "4. 勾一勾呀 (2 5. 2)",
      data: [
        { note: 'D4', beat: 0, dur: 0.5 },
        { note: 'G3', beat: 0.5, dur: 0.5 },
        { note: 'D4', beat: 1.0, dur: 1.0 },
        { note: 'E4', beat: 2.0, dur: 0.75 },
        { note: 'D4', beat: 2.75, dur: 0.25 },
        // Bar 2
        { note: 'C4', beat: 3.0, dur: 0.5 },
        { note: 'C4', beat: 3.5, dur: 0.5 },
        { note: 'C4', beat: 4.0, dur: 1.0 }
      ]
    }
  ];

  const resize = () => {
    if (!containerRef.current || !canvasRef.current) return;
    
    const container = containerRef.current;
    widthRef.current = container.clientWidth;
    heightRef.current = container.clientHeight;
    
    const canvas = canvasRef.current;
    canvas.width = widthRef.current;
    canvas.height = heightRef.current;
    
    calculateNotes();
    drawFrame();
  };

  const setPhrase = (idx: number) => {
    setCurrentPhraseIdx(idx);
    stopPlayback();
    userPathRef.current = [];
    setStatusText(phrases[idx].desc);
    calculateNotes();
    drawFrame();
  };

  const calculateNotes = () => {
    const phrase = phrases[currentPhraseIdx];
    const maxBeat = 6;
    const pixelsPerBeat = widthRef.current / maxBeat;
    const maxVIdx = 18;
    const minVIdx = -2;
    const vRange = maxVIdx - minVIdx;
    const paddingY = 60;
    const drawHeight = heightRef.current - (paddingY * 2);

    notesRef.current = phrase.data.map(d => {
      const info = scaleMap[d.note];
      const normalizedY = 1 - ((info.vIdx - minVIdx) / vRange);
      return {
        x: (d.beat * pixelsPerBeat) + (pixelsPerBeat * 0.5),
        y: paddingY + (normalizedY * drawHeight),
        freq: info.freq,
        beat: d.beat,
        dur: d.dur
      };
    });
  };

  const getYFromFreq = (freq: number): number => {
    if (freq <= 0) return heightRef.current + 50;
    const midi = 69 + 12 * Math.log2(freq / 440);
    const vIdx = midi - 55;
    const maxVIdx = 18;
    const minVIdx = -2;
    const vRange = maxVIdx - minVIdx;
    const paddingY = 60;
    const drawHeight = heightRef.current - (paddingY * 2);
    const normalizedY = 1 - ((vIdx - minVIdx) / vRange);
    return paddingY + (normalizedY * drawHeight);
  };

  const drawFrame = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, widthRef.current, heightRef.current);
    drawGuideMelody(ctx);
    if (userPathRef.current.length > 1) {
      drawUserCurve(ctx);
    }
  };

  const drawGuideMelody = (ctx: CanvasRenderingContext2D) => {
    const notes = notesRef.current;
    if (notes.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(notes[0].x, notes[0].y);

    for (let i = 0; i < notes.length - 1; i++) {
      const p0 = notes[Math.max(0, i - 1)];
      const p1 = notes[i];
      const p2 = notes[i + 1];
      const p3 = notes[Math.min(notes.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }

    const gradient = ctx.createLinearGradient(0, 0, widthRef.current, 0);
    gradient.addColorStop(0, "#fb923c");
    gradient.addColorStop(1, "#f472b6");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    notes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    });
  };

  const drawUserCurve = (ctx: CanvasRenderingContext2D) => {
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 0; i < userPathRef.current.length - 1; i++) {
      const p1 = userPathRef.current[i];
      const p2 = userPathRef.current[i + 1];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = p1.correct ? "#4ade80" : "#cbd5e1";
      ctx.stroke();
    }
  };

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const autoCorrelate = (buf: Float32Array, sampleRate: number): number => {
    let SIZE = buf.length;
    let MAX_SAMPLES = Math.floor(SIZE / 2);
    let best_offset = -1;
    let best_correlation = 0;
    let rms = 0;
    let foundGoodCorrelation = false;
    let correlations = new Array(MAX_SAMPLES);
    
    for (let i = 0; i < SIZE; i++) {
      let val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    let lastCorrelation = 1;
    for (let offset = 0; offset < MAX_SAMPLES; offset++) {
      let correlation = 0;
      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs((buf[i]) - (buf[i + offset]));
      }
      correlation = 1 - (correlation / MAX_SAMPLES);
      correlations[offset] = correlation;
      if ((correlation > 0.9) && (correlation > lastCorrelation)) {
        foundGoodCorrelation = true;
        if (correlation > best_correlation) {
          best_correlation = correlation;
          best_offset = offset;
        }
      } else if (foundGoodCorrelation) {
        let shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset];
        return sampleRate / (best_offset + (8 * shift));
      }
      lastCorrelation = correlation;
    }
    if (best_correlation > 0.01) return sampleRate / best_offset;
    return -1;
  };

  const playTone = (freq: number, duration: number, startTime: number) => {
    if (!audioContextRef.current) return;
    const osc = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
    playbackTimeoutsRef.current.forEach(t => clearTimeout(t));
    playbackTimeoutsRef.current = [];
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  };

  const playWithCountdown = (muteGuide = false) => {
    if (isPlayingRef.current) stopPlayback();

    initAudio();

    let count = 3;
    setCountdown(count);

    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else if (count === 0) {
        setCountdown(-1); // Show "唱!"
      } else {
        clearInterval(countdownInterval);
        countdownTimerRef.current = null;
        setCountdown(null);
        startPlayback(muteGuide);
      }
    }, 800);

    countdownTimerRef.current = countdownInterval;
  };

  const startPlayback = (muteGuide = false) => {
    setIsPlaying(true);
    isPlayingRef.current = true;
    userPathRef.current = [];

    if (!audioContextRef.current) return;
    const now = audioContextRef.current.currentTime;
    const beatDur = 0.6;

    if (!muteGuide) {
      notesRef.current.forEach(note => {
        playTone(note.freq, note.dur * beatDur * 0.9, now + (note.beat * beatDur));
      });
    }

    setStatusText(muteGuide ? "🎤 正在录音..." : "🎵 正在示范...");

    const startTime = performance.now();
    const totalDuration = (6 * beatDur) + 1.0;

    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const currentBeat = elapsed / beatDur;

      let targetX = notesRef.current[0].x;
      let targetY = notesRef.current[0].y;

      if (currentBeat > notesRef.current[notesRef.current.length - 1].beat + 2) {
        // End
      } else {
        for (let i = 0; i < notesRef.current.length - 1; i++) {
          if (currentBeat >= notesRef.current[i].beat && currentBeat <= notesRef.current[i + 1].beat) {
            const segmentProgress = (currentBeat - notesRef.current[i].beat) / (notesRef.current[i + 1].beat - notesRef.current[i].beat);
            targetX = notesRef.current[i].x + (notesRef.current[i + 1].x - notesRef.current[i].x) * segmentProgress;
            targetY = notesRef.current[i].y + (notesRef.current[i + 1].y - notesRef.current[i].y) * segmentProgress;
            break;
          }
        }
        if (currentBeat > notesRef.current[notesRef.current.length - 1].beat) {
          const lastNote = notesRef.current[notesRef.current.length - 1];
          targetX = lastNote.x + (currentBeat - lastNote.beat) * (widthRef.current / 6);
          targetY = lastNote.y;
        }
      }

      // Update playhead positions
      if (targetPlayheadRef.current) {
        targetPlayheadRef.current.style.left = targetX + 'px';
        targetPlayheadRef.current.style.top = targetY + 'px';
      }

      if (isMicActiveRef.current && analyserRef.current && audioDataArrayRef.current) {
        analyserRef.current.getFloatTimeDomainData(audioDataArrayRef.current);
        let pitch = autoCorrelate(audioDataArrayRef.current, audioContextRef.current!.sampleRate);

        if (pitch > 0) {
          while (pitch < 190) pitch *= 2;
          while (pitch > 600) pitch /= 2;

          let userY = getYFromFreq(pitch);

          if (userPlayheadRef.current) {
            let currentTop = parseFloat(userPlayheadRef.current.style.top) || targetY;
            let smoothY = currentTop + (userY - currentTop) * 0.2;
            userPlayheadRef.current.style.left = targetX + 'px';
            userPlayheadRef.current.style.top = smoothY + 'px';
            const diff = Math.abs(smoothY - targetY);
            const isCorrect = diff < 45;

            if (isCorrect) {
              userPlayheadRef.current.style.backgroundColor = '#4ade80';
              userPlayheadRef.current.style.borderColor = '#ffffff';
            } else {
              userPlayheadRef.current.style.backgroundColor = '#cbd5e1';
              userPlayheadRef.current.style.borderColor = '#94a3b8';
            }

            if (userPathRef.current.length === 0 || targetX - userPathRef.current[userPathRef.current.length - 1].x > 2) {
              userPathRef.current.push({ x: targetX, y: smoothY, correct: isCorrect });
            }
          }
        }
      }

      drawFrame();

      if (elapsed < totalDuration && isPlayingRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
      } else if (elapsed > totalDuration) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        if (!isMicActiveRef.current) stopPlayback();
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);
  };

  const toggleMicrophone = async () => {
    if (isMicActiveRef.current) {
      setIsMicActive(false);
      isMicActiveRef.current = false;
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setStatusText("跟唱已关闭");
      stopPlayback();
    } else {
      try {
        initAudio();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphoneStreamRef.current = stream;

        if (!audioContextRef.current) return;
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 2048;
        const audioBufferLength = analyser.fftSize;
        const audioDataArray = new Float32Array(audioBufferLength);
        source.connect(analyser);
        analyserRef.current = analyser;
        audioDataArrayRef.current = audioDataArray;

        setIsMicActive(true);
        isMicActiveRef.current = true;
        setStatusText("🎤 准备开始...");
        userPathRef.current = [];

        if (!isPlayingRef.current) {
          playWithCountdown(true);
        }
      } catch (err) {
        console.error("Microphone Error:", err);
        alert("无法访问麦克风，请检查权限设置。");
      }
    }
  };

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      stopPlayback();
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    calculateNotes();
    drawFrame();
  }, [currentPhraseIdx]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFE4E1 50%, #FFB6C1 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        fontFamily: "'Fredoka', 'ZCOOL KuaiLe', 'Segoe UI', cursive, sans-serif",
        userSelect: 'none',
      }}
    >
      <style jsx global>{`
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(255, 99, 71, 0.7); }
          70% { box-shadow: 0 0 0 12px rgba(255, 99, 71, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 99, 71, 0); }
        }
        .recording { animation: pulse-red 1.5s infinite; background-color: #fff0f0 !important; border-color: #ff6347 !important; color: #ff6347 !important; }
        @keyframes pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .count-anim { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .phrase-btn.active {
          background-color: #ff7e5f;
          color: white;
          border-color: #ff7e5f;
          box-shadow: 0 4px 6px -1px rgba(255, 126, 95, 0.3);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '16px' }}>
        <h1 style={{ fontSize: '2.25rem', color: '#db2777', marginBottom: '8px', fontFamily: "'ZCOOL KuaiLe', cursive" }}>
          🐘 两只小象
        </h1>
        <p style={{ color: '#475569', fontWeight: '500', background: 'rgba(255, 255, 255, 0.6)', padding: '4px 16px', borderRadius: '9999px', display: 'inline-block' }}>
          乐谱修正版：1 3 5. 1 (低音5)
        </p>
      </div>

      {/* Main Workspace */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '4px solid #fff',
          padding: '24px',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '896px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decor */}
        <div style={{ position: 'absolute', top: 0, right: 0, marginTop: '-16px', marginRight: '-16px', width: '96px', height: '96px', background: '#fde047', borderRadius: '50%', opacity: 0.2, filter: 'blur(40px)' }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, marginBottom: '-16px', marginLeft: '-16px', width: '128px', height: '128px', background: '#f9a8d4', borderRadius: '50%', opacity: 0.2, filter: 'blur(40px)' }}></div>

        {/* Phrase Selection Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
          {phrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => setPhrase(idx)}
              className={`phrase-btn ${currentPhraseIdx === idx ? 'active' : ''}`}
              style={{
                border: '2px solid #fed7aa',
                background: currentPhraseIdx === idx ? '#ff7e5f' : 'white',
                color: currentPhraseIdx === idx ? 'white' : '#475569',
                fontWeight: 'bold',
                padding: '12px 8px',
                borderRadius: '12px',
                fontSize: '18px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {phrase.desc}
            </button>
          ))}
        </div>

        {/* Canvas Container */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '288px',
            background: '#fffbeb',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2px solid #fed7aa',
            marginBottom: '24px',
            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Background Staff Lines */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '32px', pointerEvents: 'none', opacity: 0.1, padding: '32px 16px', zIndex: 0 }}>
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} style={{ width: '100%', height: '2px', background: '#1e293b' }}></div>
            ))}
          </div>

          {/* Labels */}
          <div style={{ position: 'absolute', left: '12px', top: '16px', fontSize: '12px', fontWeight: 'bold', color: '#fb923c' }}>High (1)</div>
          <div style={{ position: 'absolute', left: '12px', bottom: '16px', fontSize: '12px', fontWeight: 'bold', color: '#fb923c' }}>Low (5.)</div>

          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, touchAction: 'none' }}
          />

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
                background: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(4px)',
                pointerEvents: 'none',
              }}
            >
              <span
                className={countdown !== null ? 'count-anim' : ''}
                style={{
                  fontSize: '9rem',
                  fontWeight: 'bold',
                  color: '#f97316',
                  textShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontFamily: "'ZCOOL KuaiLe', cursive",
                }}
              >
                {countdown === -1 ? '唱!' : countdown}
              </span>
            </div>
          )}

          {/* Guide Playhead */}
          {isPlaying && (
            <div
              ref={targetPlayheadRef}
              id="targetPlayhead"
              style={{
                position: 'absolute',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#fb923c',
                border: '4px solid white',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                zIndex: 20,
                marginLeft: '-16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 75ms',
                top: '50%',
                left: '0px',
              }}
            >
              <span style={{ fontSize: '12px', color: 'white' }}>🐘</span>
            </div>
          )}

          {/* User Voice Playhead */}
          {isMicActive && (
            <div
              ref={userPlayheadRef}
              id="userPlayhead"
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#cbd5e1',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                zIndex: 30,
                marginLeft: '-20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)',
                transition: 'all 100ms',
                top: '50%',
                left: '0px',
              }}
            >
              <span style={{ fontSize: '14px' }}>🎤</span>
            </div>
          )}
        </div>

        {/* Status Text */}
        <div style={{ marginBottom: '24px', textAlign: 'center', color: '#f97316', fontWeight: 'bold', fontSize: '20px', height: '32px', letterSpacing: '0.05em' }}>
          {statusText || phrases[currentPhraseIdx].desc}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', flexWrap: 'wrap', position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => playWithCountdown(false)}
            style={{
              background: '#fb923c',
              color: 'white',
              fontSize: '20px',
              padding: '16px 40px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontWeight: 'bold',
              border: 'none',
              borderBottom: '4px solid #ea580c',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.borderBottom = '0';
              e.currentTarget.style.transform = 'translateY(4px)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.borderBottom = '4px solid #ea580c';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '28px', height: '28px' }} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            示范
          </button>

          <button
            onClick={toggleMicrophone}
            id="micBtn"
            className={isMicActive ? 'recording' : ''}
            style={{
              background: 'white',
              border: '2px solid #e2e8f0',
              color: '#475569',
              fontSize: '20px',
              padding: '16px 40px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontWeight: 'bold',
              borderBottom: '4px solid #cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.borderBottom = '0';
              e.currentTarget.style.transform = 'translateY(4px)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.borderBottom = '4px solid #cbd5e1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '28px', height: '28px' }} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            <span>{isMicActive ? '停止' : '跟唱'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

