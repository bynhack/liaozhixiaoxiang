'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { usePresentationStore } from '@/stores/presentationStore';
import { usePageControl } from '@/hooks/usePageControl';

export default function Page24() {
  const playerRef = useRef<ReactPlayer>(null);
  const videoPlayerRef = useRef<ReactPlayer>(null); // 用于替换图片的视频播放器
  const audioPlayerRef = useRef<ReactPlayer>(null); // 伴奏音频播放器
  const { isPlaying, setState } = usePresentationStore((state) => ({
    isPlaying: state.isPlaying,
    setState: state.setState,
  }));
  const [volume, setVolume] = useState(0); // 0-100，0表示静音
  const [audioVolume, setAudioVolume] = useState(100); // 伴奏音量 0-100
  const [currentTime, setCurrentTime] = useState(0); // 当前播放时间
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1); // 当前歌词索引
  const [currentCharIndex, setCurrentCharIndex] = useState(-1); // 当前字符索引（用于逐字高亮）
  const melodyStartTimeRef = useRef<number | null>(null); // 旋律开始播放的时间
  const hasInitialized = useRef(false);
  const playerReadyRef = useRef(false);
  const videoPlayerReadyRef = useRef(false);
  const audioPlayerReadyRef = useRef(false);

  // 旋律曲线相关（替换示波器）
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRecordingRef = useRef(false); // 是否正在记录
  const isShowingRecordedRef = useRef(false); // 是否正在显示记录的波形
  const [showVideo, setShowVideo] = useState(false); // 控制是否显示视频（用于触发重新渲染）
  
  // 旋律曲线相关状态和引用
  const notesRef = useRef<Array<{ x: number; y: number; freq: number; beat: number; dur: number }>>([]);
  const userPathRef = useRef<Array<{ x: number; y: number; correct: boolean }>>([]);
  const audioDataArrayRef = useRef<Float32Array | null>(null);
  const widthRef = useRef(0);
  const heightRef = useRef(0);
  const targetPlayheadRef = useRef<HTMLDivElement>(null);
  const userPlayheadRef = useRef<HTMLDivElement>(null);
  const isPlayingMelodyRef = useRef(false);
  const isMicActiveRef = useRef(false);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPlayingMelody, setIsPlayingMelody] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  
  // 第一段乐谱数据：就像一对 (1 3 5. 1) - 与Page20相同曲谱
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
  
  const phraseData = [
    { note: 'C4', beat: 0, dur: 0.5 },
    { note: 'E4', beat: 0.5, dur: 0.5 },
    { note: 'G3', beat: 1.0, dur: 1.0 },
    { note: 'C4', beat: 2.0, dur: 1.0 },
    { note: 'E4', beat: 3.0, dur: 0.5 },
    { note: 'E4', beat: 3.5, dur: 0.5 },
    { note: 'E4', beat: 4.0, dur: 1.0 }
  ];

  // KTV歌词数据 - 每句歌词对应的时间点（秒）
  const lyrics = [
    { text: '就像一对呦啰啰', startTime: 0, endTime: 999 }, // 只有一句歌词，设置一个很长的时间范围
  ];
  
  // 获取当前歌词的字符数组
  const getCurrentLyricChars = () => {
    if (currentLyricIndex >= 0 && currentLyricIndex < lyrics.length) {
      return lyrics[currentLyricIndex].text.split('');
    }
    return [];
  };


  // 计算音符位置
  const calculateNotes = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const maxBeat = 6;
    const pixelsPerBeat = canvas.width / maxBeat;
    const maxVIdx = 18;
    const minVIdx = -2;
    const vRange = maxVIdx - minVIdx;
    const paddingY = 30;
    const drawHeight = canvas.height - (paddingY * 2);

    notesRef.current = phraseData.map(d => {
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
  }, []);

  // 从频率获取Y坐标
  const getYFromFreq = useCallback((freq: number): number => {
    if (!canvasRef.current || freq <= 0) return canvasRef.current?.height || 0;
    const canvas = canvasRef.current;
    const midi = 69 + 12 * Math.log2(freq / 440);
    const vIdx = midi - 55;
    const maxVIdx = 18;
    const minVIdx = -2;
    const vRange = maxVIdx - minVIdx;
    const paddingY = 30;
    const drawHeight = canvas.height - (paddingY * 2);
    const normalizedY = 1 - ((vIdx - minVIdx) / vRange);
    return paddingY + (normalizedY * drawHeight);
  }, []);

  // 绘制旋律曲线
  const drawMelodyCurve = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布并填充背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制五线谱背景线
    const paddingY = 30;
    const drawHeight = canvas.height - (paddingY * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = paddingY + (i * drawHeight / 4);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 绘制目标旋律曲线
    const notes = notesRef.current;
    if (notes.length >= 2) {
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

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#fb923c");
      gradient.addColorStop(1, "#f472b6");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // 绘制音符点
      notes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      });
    }

    // 绘制用户演唱曲线
    if (userPathRef.current.length > 1) {
      ctx.lineWidth = 4;
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
    }
  }, []);

  // 初始化音频上下文
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  // 自相关算法检测音高
  const autoCorrelate = useCallback((buf: Float32Array | ArrayLike<number> | any, sampleRate: number): number => {
    const buffer = buf instanceof Float32Array ? buf : new Float32Array(buf);
    let SIZE = buffer.length;
    let MAX_SAMPLES = Math.floor(SIZE / 2);
    let best_offset = -1;
    let best_correlation = 0;
    let rms = 0;
    let foundGoodCorrelation = false;
    let correlations = new Array(MAX_SAMPLES);
    
    for (let i = 0; i < SIZE; i++) {
      let val = buffer[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    let lastCorrelation = 1;
    for (let offset = 0; offset < MAX_SAMPLES; offset++) {
      let correlation = 0;
      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs((buffer[i]) - (buffer[i + offset]));
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
  }, []);

  // 播放音符
  const playTone = useCallback((freq: number, duration: number, startTime: number) => {
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
  }, []);

  // 停止播放
  const stopMelodyPlayback = useCallback(() => {
    setIsPlayingMelody(false);
    isPlayingMelodyRef.current = false;
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // 带倒计时的播放
  const playMelodyWithCountdown = useCallback((muteGuide = false) => {
    if (isPlayingMelodyRef.current) stopMelodyPlayback();

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
        startMelodyPlayback(muteGuide);
      }
    }, 800);

    countdownTimerRef.current = countdownInterval;
  }, [initAudio, stopMelodyPlayback]);

  // 开始播放旋律
  const startMelodyPlayback = useCallback((muteGuide = false) => {
    setIsPlayingMelody(true);
    isPlayingMelodyRef.current = true;
    userPathRef.current = [];
    setCurrentCharIndex(-1); // 重置字符索引
    
    // 倒计时结束后，如果是跟唱模式，才激活录音状态
    if (muteGuide) {
      setIsMicActive(true);
      isMicActiveRef.current = true;
    }

    // 无论是示范还是跟唱，都不播放旋律音频，只播放伴奏音频
    // 旋律曲线动画仍然需要，用于显示目标旋律路径
    const startTime = performance.now();
    melodyStartTimeRef.current = startTime; // 记录开始时间
    const beatDur = 0.6;
    const totalDuration = (6 * beatDur) + 1.0;

      const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const currentBeat = elapsed / beatDur;
      
      // 注意：字符索引现在完全由伴奏音频的onProgress回调控制，这里不再计算

      let targetX = notesRef.current[0]?.x || 0;
      let targetY = notesRef.current[0]?.y || 0;

      if (currentBeat <= notesRef.current[notesRef.current.length - 1]?.beat + 2) {
        for (let i = 0; i < notesRef.current.length - 1; i++) {
          if (currentBeat >= notesRef.current[i].beat && currentBeat <= notesRef.current[i + 1].beat) {
            const segmentProgress = (currentBeat - notesRef.current[i].beat) / (notesRef.current[i + 1].beat - notesRef.current[i].beat);
            targetX = notesRef.current[i].x + (notesRef.current[i + 1].x - notesRef.current[i].x) * segmentProgress;
            targetY = notesRef.current[i].y + (notesRef.current[i + 1].y - notesRef.current[i].y) * segmentProgress;
            break;
          }
        }
        if (currentBeat > notesRef.current[notesRef.current.length - 1]?.beat) {
          const lastNote = notesRef.current[notesRef.current.length - 1];
          if (lastNote) {
            targetX = lastNote.x + (currentBeat - lastNote.beat) * (canvasRef.current?.width || 800 / 6);
            targetY = lastNote.y;
          }
        }
      }

      // 更新目标播放头位置
      if (targetPlayheadRef.current) {
        targetPlayheadRef.current.style.left = targetX + 'px';
        targetPlayheadRef.current.style.top = targetY + 'px';
      }

      // 如果正在跟唱，检测音高（只在倒计时结束后才开始）
      if (muteGuide && isMicActiveRef.current && analyserRef.current && audioDataArrayRef.current && audioContextRef.current) {
        analyserRef.current.getFloatTimeDomainData(audioDataArrayRef.current);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let pitch = autoCorrelate(audioDataArrayRef.current as any, audioContextRef.current.sampleRate);

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

      drawMelodyCurve();

      if (elapsed < totalDuration && isPlayingMelodyRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else if (elapsed > totalDuration) {
        setIsPlayingMelody(false);
        isPlayingMelodyRef.current = false;
        setCurrentCharIndex(-1); // 重置字符索引
        melodyStartTimeRef.current = null;
        if (!isMicActiveRef.current) stopMelodyPlayback();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [autoCorrelate, getYFromFreq, drawMelodyCurve, stopMelodyPlayback]);

  // 初始化麦克风（但不激活录音状态，等倒计时结束后再激活）
  const initMicrophone = useCallback(async () => {
    if (analyserRef.current && streamRef.current) {
      return; // 已经初始化
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      initAudio();
      if (!audioContextRef.current) return;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 2048;
      const audioBufferLength = analyser.fftSize;
      const audioDataArray = new Float32Array(audioBufferLength);
      source.connect(analyser);
      analyserRef.current = analyser;
      audioDataArrayRef.current = audioDataArray;

      // 注意：这里不设置 isMicActive，等倒计时结束后在 startMelodyPlayback 中设置
      // 这样在倒计时期间不会显示用户播放头，也不会开始录音
    } catch (error) {
      console.error('无法访问麦克风:', error);
    }
  }, [initAudio]);

  // 停止麦克风
  const stopMicrophone = useCallback(() => {
    setIsMicActive(false);
    isMicActiveRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    audioDataArrayRef.current = null;
  }, []);




  // 第二十页加载时，确保为暂停状态（不自动播放）并初始化旋律曲线 - 只运行一次
  useEffect(() => {
    if (hasInitialized.current) return;

    const currentState = usePresentationStore.getState();
    if (currentState.isPlaying) {
      setState({
        ...currentState,
        isPlaying: false,
      });
    }

    // 等待一小段时间确保 canvas 元素已挂载
    setTimeout(() => {
      calculateNotes();
      drawMelodyCurve();
    }, 200);

    hasInitialized.current = true;
  }, [calculateNotes, drawMelodyCurve, setState]);

  // 响应播放状态变化
  useEffect(() => {
    if (playerRef.current) {
      const internalPlayer = (playerRef.current as any).getInternalPlayer();
      if (internalPlayer) {
        // 设置音量
        if (internalPlayer.volume !== undefined) {
          internalPlayer.volume = volume / 100;
        }
        // 根据音量设置静音状态
        if (internalPlayer.muted !== undefined) {
          internalPlayer.muted = volume === 0;
        }
        if (isPlaying) {
          // 播放
          if (internalPlayer.paused) {
            internalPlayer.play().catch((error: any) => {
              console.log('播放失败:', error);
            });
          }
        } else {
          // 暂停
          if (!internalPlayer.paused) {
            internalPlayer.pause();
          }
        }
      }
    }

    // 同步控制伴奏音频播放
    if (audioPlayerRef.current) {
      const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
      if (audioInternalPlayer) {
        if (audioInternalPlayer.volume !== undefined) {
          audioInternalPlayer.volume = audioVolume / 100;
        }
        if (audioInternalPlayer.muted !== undefined) {
          audioInternalPlayer.muted = audioVolume === 0;
        }
        if (isPlaying) {
          if (audioInternalPlayer.paused) {
            audioInternalPlayer.play().catch((error: any) => {
              console.log('伴奏播放失败:', error);
            });
          }
        } else {
          if (!audioInternalPlayer.paused) {
            audioInternalPlayer.pause();
          }
        }
      }
    }
  }, [isPlaying, volume, audioVolume]);

  // 当播放器准备好时设置音量并停留在第一帧（不自动播放）
  const handleReady = () => {
    if (playerRef.current && !playerReadyRef.current) {
      const internalPlayer = (playerRef.current as any).getInternalPlayer();
      if (internalPlayer) {
        // 设置初始音量
        if (internalPlayer.volume !== undefined) {
          internalPlayer.volume = volume / 100;
        }
        // 根据音量设置静音状态
        if (internalPlayer.muted !== undefined) {
          internalPlayer.muted = volume === 0;
        }
        // 确保停留在第一帧
        if (internalPlayer.currentTime !== undefined) {
          internalPlayer.currentTime = 0;
        }
        // 只在首次加载时确保暂停状态，之后由 isPlaying 状态控制
        if (!playerReadyRef.current && !isPlaying) {
          if (!internalPlayer.paused) {
            internalPlayer.pause();
          }
        }
        playerReadyRef.current = true;
      }
    }
  };

  // 伴奏音频播放器准备就绪
  const handleAudioReady = () => {
    if (audioPlayerRef.current && !audioPlayerReadyRef.current) {
      const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
      if (audioInternalPlayer) {
        // 设置初始音量
        if (audioInternalPlayer.volume !== undefined) {
          audioInternalPlayer.volume = audioVolume / 100;
        }
        if (audioInternalPlayer.muted !== undefined) {
          audioInternalPlayer.muted = audioVolume === 0;
        }
        // 确保停留在开始位置
        if (audioInternalPlayer.currentTime !== undefined) {
          audioInternalPlayer.currentTime = 0;
        }
        // 确保暂停状态
        if (!audioPlayerReadyRef.current && !isPlaying) {
          if (!audioInternalPlayer.paused) {
            audioInternalPlayer.pause();
          }
        }
        audioPlayerReadyRef.current = true;
      }
    }
  };

  // 移除根据时间判断歌词显示的逻辑，歌词始终显示

  // 窗口大小改变时重新计算
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        calculateNotes();
        drawMelodyCurve();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateNotes, drawMelodyCurve]);

  // 处理页面控制命令
  const handlePageControl = useCallback((command: { type: string; value?: any }) => {
    switch (command.type) {
      case 'volume':
        if (playerRef.current) {
          const internalPlayer = (playerRef.current as any).getInternalPlayer();
          if (internalPlayer) {
            const newVolume = command.value as number;
            setVolume(newVolume);
            if (internalPlayer.volume !== undefined) {
              internalPlayer.volume = newVolume / 100;
            }
            if (internalPlayer.muted !== undefined) {
              internalPlayer.muted = newVolume === 0;
            }
          }
        }
        break;

      case 'seek':
        if (playerRef.current) {
          const internalPlayer = (playerRef.current as any).getInternalPlayer();
          if (internalPlayer) {
            const seconds = command.value as number;
            if (internalPlayer.currentTime !== undefined) {
              internalPlayer.currentTime = seconds;
            }
          }
        }
        break;

      case 'start-recording':
        isRecordingRef.current = true;
        isShowingRecordedRef.current = false;
        userPathRef.current = []; // 清空之前的记录
        setShowVideo(false); // 隐藏视频，显示图片
        videoPlayerReadyRef.current = false; // 重置视频播放器状态
        setCurrentLyricIndex(-1); // 重置歌词索引
        setCurrentTime(0); // 重置时间
        // 停止替换图片的视频（如果正在播放）
        if (videoPlayerRef.current) {
          const videoInternalPlayer = (videoPlayerRef.current as any).getInternalPlayer();
          if (videoInternalPlayer && !videoInternalPlayer.paused) {
            videoInternalPlayer.pause();
          }
        }
        // 重置伴奏音频到开始位置
        if (audioPlayerRef.current) {
          const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
          if (audioInternalPlayer && audioInternalPlayer.currentTime !== undefined) {
            audioInternalPlayer.currentTime = 0;
          }
        }
        // 初始化麦克风并开始跟唱
        initMicrophone().then(() => {
          playMelodyWithCountdown(true); // 带倒计时的跟唱
        });
        break;

      case 'stop-recording':
        isRecordingRef.current = false;
        isShowingRecordedRef.current = true; // 标记为显示记录的波形
        stopMelodyPlayback();
        stopMicrophone();

        // 暂停背景视频和伴奏
        const currentState2 = usePresentationStore.getState();
        if (currentState2.isPlaying) {
          setState({
            ...currentState2,
            isPlaying: false,
          });
        }
        // 重新绘制以显示记录的旋律曲线
        drawMelodyCurve();
        break;

      case 'play-demo':
        // 播放示范（已废弃，使用play-audio代替）
        break;

      case 'play-video':
        // 点击"正确"按钮后播放视频
        setShowVideo(true); // 显示视频
        if (videoPlayerRef.current) {
          const videoInternalPlayer = (videoPlayerRef.current as any).getInternalPlayer();
          if (videoInternalPlayer && videoInternalPlayer.paused) {
            videoInternalPlayer.play().catch((error: any) => {
              console.log('视频播放失败:', error);
            });
          }
        }
        break;

      case 'audio-volume':
        // 设置伴奏音量
        setAudioVolume(command.value as number);
        break;

      case 'play-audio':
        // 示范模式：直接播放伴奏音频和示范旋律（不需要倒计时）
        if (audioPlayerRef.current) {
          const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
          if (audioInternalPlayer) {
            // 重置到开始位置
            if (audioInternalPlayer.currentTime !== undefined) {
              audioInternalPlayer.currentTime = 0;
            }
            // 播放伴奏
            audioInternalPlayer.play().catch((error: any) => {
              console.log('伴奏播放失败:', error);
            });
            // 同步播放状态
            const currentState = usePresentationStore.getState();
            if (!currentState.isPlaying) {
              setState({
                ...currentState,
                isPlaying: true,
              });
            }
          }
        }
        // 直接开始播放示范旋律（不需要倒计时）
        setCurrentLyricIndex(0); // 始终显示第一句歌词
        startMelodyPlayback(false); // false表示示范模式
        break;

      default:
        break;
    }
  }, [initMicrophone, playMelodyWithCountdown, stopMelodyPlayback, stopMicrophone, drawMelodyCurve, setState, startMelodyPlayback]);

  // 监听页面控制命令
  usePageControl(24, handlePageControl);

  // 更新视频音量
  useEffect(() => {
    if (playerRef.current) {
      const internalPlayer = (playerRef.current as any).getInternalPlayer();
      if (internalPlayer) {
        if (internalPlayer.volume !== undefined) {
          internalPlayer.volume = volume / 100;
        }
        if (internalPlayer.muted !== undefined) {
          internalPlayer.muted = volume === 0;
        }
      }
    }
  }, [volume]);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 背景视频层 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        <ReactPlayer
          ref={playerRef}
          url="/assets/videos/page-24.mp4"
          playing={isPlaying}
          loop={true}
          muted={volume === 0}
          controls={false}
          width="100%"
          height="100%"
          playsinline={true}
          onReady={handleReady}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          config={{
            file: {
              attributes: {
                muted: volume === 0,
                loop: true,
                playsInline: true,
                preload: 'metadata',
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                },
              },
            },
          }}
        />
      </div>

      {/* 图片/视频容器 */}
      <div
        style={{
          position: 'absolute',
          top: '32%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '33%',
          height: '33%',
          zIndex: 10,
          boxSizing: 'border-box',
        }}
      >
        {showVideo && isShowingRecordedRef.current ? (
          // 停止收音后显示视频
          <ReactPlayer
            ref={videoPlayerRef}
            url="/assets/videos/就像一对呦啰啰.mp4"
            playing={true}
            loop={false}
            muted={false}
            controls={false}
            width="100%"
            height="100%"
            playsinline={true}
            onReady={() => {
              if (videoPlayerRef.current && !videoPlayerReadyRef.current) {
                const internalPlayer = (videoPlayerRef.current as any).getInternalPlayer();
                if (internalPlayer) {
                  internalPlayer.play().catch((error: any) => {
                    console.log('视频播放失败:', error);
                  });
                  videoPlayerReadyRef.current = true;
                }
              }
            }}
            onEnded={() => {
              // 视频播放完成后切换回图片
              setShowVideo(false);
            }}
            style={{
              width: '100%',
              height: '100%',
            }}
            config={{
              file: {
                attributes: {
                  autoPlay: true,
                  muted: false,
                  loop: false,
                  playsInline: true,
                  style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  },
                },
              },
            }}
          />
        ) : (
          // 收音时显示图片
          <img
            src="/assets/images/page-24.png"
            alt="Page 24"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        )}
      </div>

      {/* 旋律曲线显示容器 */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: '77%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60%',
          height: '20%',
          zIndex: 10,
          border: isRecordingRef.current
            ? '2px solid rgba(255, 0, 0, 0.8)' // 记录时红色边框
            : isShowingRecordedRef.current
              ? '2px solid rgba(0, 255, 0, 0.8)' // 显示记录时绿色边框
              : '2px solid rgba(0, 255, 0, 0.5)', // 默认绿色边框
          borderRadius: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
        
        {/* 倒计时覆盖层 */}
        {countdown !== null && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontSize: '6rem',
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

        {/* 目标播放头 */}
        {isPlayingMelody && (
          <div
            ref={targetPlayheadRef}
            style={{
              position: 'absolute',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#fb923c',
              border: '3px solid white',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: 20,
              marginLeft: '-12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 75ms',
              top: '50%',
              left: '0px',
            }}
          >
            <span style={{ fontSize: '10px', color: 'white' }}>🐘</span>
          </div>
        )}

        {/* 用户演唱播放头（只在真正开始录音后显示） */}
        {isMicActive && isPlayingMelody && (
          <div
            ref={userPlayheadRef}
            style={{
              position: 'absolute',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#cbd5e1',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: 30,
              marginLeft: '-16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              transition: 'all 100ms',
              top: '50%',
              left: '0px',
            }}
          >
            <span style={{ fontSize: '12px' }}>🎤</span>
          </div>
        )}
      </div>

      {/* KTV歌词显示区域 */}
      <div
        style={{
          position: 'absolute',
          bottom: '35%', // 从5%调整到15%，往上移动
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          zIndex: 15,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            maxHeight: '150px',
            overflowY: 'auto',
            padding: '10px 20px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          }}
        >
          {lyrics.map((lyric, index) => {
            // 歌词始终显示，只根据播放状态进行逐字高亮
            const chars = lyric.text.split('');
            const shouldHighlight = (isPlayingMelody || isPlaying) && currentCharIndex >= 0;
            
            return (
              <div
                key={index}
                style={{
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  fontWeight: 'bold',
                  textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.8)',
                  transition: 'all 0.3s ease',
                  transform: 'scale(1.1)',
                  whiteSpace: 'nowrap',
                  padding: '4px 12px',
                  textAlign: 'center',
                  display: 'flex',
                  gap: '2px',
                  justifyContent: 'center',
                }}
              >
                {chars.map((char, charIndex) => {
                  const isCharActive = shouldHighlight && charIndex === currentCharIndex;
                  const isCharPast = shouldHighlight && charIndex < currentCharIndex;
                  return (
                    <span
                      key={charIndex}
                      style={{
                        color: isCharActive
                          ? '#FFD700' // 当前字符：金色高亮
                          : isCharPast
                            ? '#FFD700' // 已播放的字符：金色
                            : 'rgba(255, 255, 255, 0.8)', // 未播放的字符：白色
                        transition: 'color 0.2s ease',
                        display: 'inline-block',
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* 伴奏音频播放器（隐藏） */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: 0 }}>
        <ReactPlayer
          ref={audioPlayerRef}
          url="/assets/audios/5.就像一对伴奏.mp3"
          playing={isPlaying}
          loop={false}
          muted={audioVolume === 0}
          controls={false}
          width="1px"
          height="1px"
          onReady={handleAudioReady}
          onProgress={(progress) => {
            setCurrentTime(progress.playedSeconds);
            
            // 移除根据时间判断歌词索引的逻辑，直接计算字符索引
            // 无论是示范模式还是跟唱模式，只要伴奏音频在播放，都根据伴奏音频时间计算字符索引
            if (isPlaying) {
              // 始终显示第一句歌词（因为只有一句）
              setCurrentLyricIndex(0);
              const lyricText = lyrics[0]?.text || '';
              const charCount = lyricText.length;
              
              if (charCount > 0) {
                // 获取伴奏音频总时长（如果可用），否则使用默认值
                // 假设整首歌就是这一句歌词，使用播放进度来估算总时长
                const estimatedDuration = progress.loadedSeconds > 0 ? progress.loadedSeconds : 4.6;
                const lyricDuration = estimatedDuration; // 假设整首歌就是这一句歌词
                const charDuration = lyricDuration / charCount;
                
                // 直接根据播放时间计算字符索引
                const currentCharIdx = Math.min(
                  Math.max(0, Math.floor(progress.playedSeconds / charDuration)),
                  charCount - 1
                );
                setCurrentCharIndex(currentCharIdx);
              }
            } else if (!isPlaying) {
              // 如果音频停止播放，重置字符索引
              setCurrentCharIndex(-1);
            }
          }}
          onEnded={() => {
            // 音频播放结束后重置
            setCurrentLyricIndex(-1);
            setCurrentCharIndex(-1);
            setCurrentTime(0);
            setIsPlayingMelody(false);
            isPlayingMelodyRef.current = false;
            stopMelodyPlayback();
          }}
          config={{
            file: {
              attributes: {
                muted: audioVolume === 0,
                loop: false,
              },
            },
          }}
        />
      </div>
    </div>
  );
}

