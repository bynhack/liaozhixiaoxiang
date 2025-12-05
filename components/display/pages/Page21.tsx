'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { usePresentationStore } from '@/stores/presentationStore';
import { usePageControl } from '@/hooks/usePageControl';

export default function Page21() {
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
  const hasInitialized = useRef(false);
  const playerReadyRef = useRef(false);
  const videoPlayerReadyRef = useRef(false);
  const audioPlayerReadyRef = useRef(false);

  // 音频波形相关
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRecordingRef = useRef(false); // 是否正在记录
  const recordedWaveformDataRef = useRef<Uint8Array[]>([]); // 存储记录的波形数据
  const referenceWaveformDataRef = useRef<number[]>([]); // 存储基准波形数据（从视频音频提取）
  const isShowingRecordedRef = useRef(false); // 是否正在显示记录的波形
  const [showVideo, setShowVideo] = useState(false); // 控制是否显示视频（用于触发重新渲染）

  // KTV歌词数据 - 每句歌词对应的时间点（秒）
  const lyrics = [
    { text: '河边走呀呦啰啰', startTime: 0, endTime: 999 }, // 只有一句歌词，设置一个很长的时间范围
  ];


  // 从视频音频提取基准波形数据
  const extractReferenceWaveform = useCallback(async () => {
    const draw = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 如果正在录音或显示录音结果，不绘制基准波形
      if (isRecordingRef.current || isShowingRecordedRef.current) {
        return;
      }

      // 清空画布并填充纯色背景
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制基准波形
      if (referenceWaveformDataRef.current.length > 0) {
        const refData = referenceWaveformDataRef.current;
        const maxFrames = Math.min(refData.length, canvas.width);
        const stepX = canvas.width / maxFrames;
        const maxBarHeight = canvas.height;

        ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)'; // 半透明蓝色
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < maxFrames; i++) {
          const refIndex = i;
          if (refIndex >= refData.length) break;

          const refValue = refData[refIndex];
          const y = canvas.height - (refValue / 255) * maxBarHeight;
          const x = i * stepX;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // 使用二次贝塞尔曲线让线条更平滑
            const prevX = (i - 1) * stepX;
            const prevY = canvas.height - (refData[i - 1] / 255) * maxBarHeight;
            const cpX = (prevX + x) / 2;
            ctx.quadraticCurveTo(cpX, prevY, x, y);
          }
        }
        ctx.stroke();
      }
    };

    try {
      const response = await fetch('/assets/videos/河边走呀呦啰啰.mp4');
      const arrayBuffer = await response.arrayBuffer();

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0); // Get first channel
      const sampleRate = audioBuffer.sampleRate;
      const samplesPerFrame = Math.floor(sampleRate / 60); // Approx 60 FPS
      const totalFrames = Math.ceil(rawData.length / samplesPerFrame);

      const referenceData: number[] = [];

      for (let i = 0; i < totalFrames; i++) {
        const start = i * samplesPerFrame;
        const end = Math.min(start + samplesPerFrame, rawData.length);
        let max = 0;
        for (let j = start; j < end; j++) {
          const abs = Math.abs(rawData[j]);
          if (abs > max) max = abs;
        }
        // Scale to 0-255
        referenceData.push(Math.min(255, Math.floor(max * 255)));
      }

      referenceWaveformDataRef.current = referenceData;
      console.log('基准波形数据提取完成，共', referenceData.length, '帧');

      draw();

      audioContext.close();
    } catch (error) {
      console.error('提取基准波形失败:', error);
    }
  }, []);



  // 第二十一页加载时，确保为暂停状态（不自动播放）并提取基准波形 - 只运行一次
  useEffect(() => {
    if (hasInitialized.current) return;

    const currentState = usePresentationStore.getState();
    if (currentState.isPlaying) {
      setState({
        ...currentState,
        isPlaying: false,
      });
    }

    // 等待一小段时间确保 video 元素已挂载并设置了 src
    setTimeout(() => {
      // 提取基准波形数据
      extractReferenceWaveform();
    }, 200);

    hasInitialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组，只在组件挂载时运行一次

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

  // 绘制基准波形（仅在页面加载后显示）
  const drawReferenceWaveform = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 如果正在录音或显示录音结果，不绘制基准波形
    if (isRecordingRef.current || isShowingRecordedRef.current) {
      return;
    }

    // 清空画布并填充纯色背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制基准波形
    if (referenceWaveformDataRef.current.length > 0) {
      const refData = referenceWaveformDataRef.current;
      const maxFrames = Math.min(refData.length, canvas.width);
      const stepX = canvas.width / maxFrames;
      const maxBarHeight = canvas.height;

      ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)'; // 半透明蓝色
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < maxFrames; i++) {
        const refIndex = i;
        if (refIndex >= refData.length) break;

        const refValue = refData[refIndex];
        const y = canvas.height - (refValue / 255) * maxBarHeight;
        const x = i * stepX;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // 使用二次贝塞尔曲线让线条更平滑
          const prevX = (i - 1) * stepX;
          const prevY = canvas.height - (refData[i - 1] / 255) * maxBarHeight;
          const cpX = (prevX + x) / 2;
          ctx.quadraticCurveTo(cpX, prevY, x, y);
        }
      }
      ctx.stroke();
    }
  }, []);

  // 绘制波形函数
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      // 如果正在显示记录的波形，绘制记录的波形和基准波形（趋势曲线）
      if (isShowingRecordedRef.current && recordedWaveformDataRef.current.length > 0) {
        // 清空画布并填充纯色背景
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const recordedData = recordedWaveformDataRef.current;
        const maxBarHeight = canvas.height;

        // 先绘制基准波形（从视频音频提取）- 使用半透明蓝色曲线
        // 基准波形始终显示完整曲线，位置固定不变
        if (referenceWaveformDataRef.current.length > 0) {
          ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)'; // 半透明蓝色
          ctx.lineWidth = 2;
          ctx.beginPath();

          const refData = referenceWaveformDataRef.current;
          // 基准波形始终显示完整曲线，使用固定的缩放比例
          const refMaxFrames = Math.min(refData.length, canvas.width);
          const refStepX = canvas.width / refMaxFrames;

          for (let i = 0; i < refMaxFrames; i++) {
            if (i >= refData.length) break;

            const refValue = refData[i];
            const y = canvas.height - (refValue / 255) * maxBarHeight;
            const x = i * refStepX;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              // 使用二次贝塞尔曲线让线条更平滑
              const prevX = (i - 1) * refStepX;
              const prevY = canvas.height - (refData[i - 1] / 255) * maxBarHeight;
              const cpX = (prevX + x) / 2;
              ctx.quadraticCurveTo(cpX, prevY, x, y);
            }
          }
          ctx.stroke();
        }

        // 再绘制实际记录的波形 - 使用绿色曲线
        // 记录波形使用与基准波形相同的缩放比例，确保时间轴对齐
        ctx.strokeStyle = '#00ff00'; // 绿色波形
        ctx.lineWidth = 2;
        ctx.beginPath();

        const refData = referenceWaveformDataRef.current;
        const refMaxFrames = Math.min(refData.length, canvas.width);
        const refStepX = canvas.width / refMaxFrames;

        // 只绘制已记录的部分
        for (let i = 0; i < recordedData.length && i < refMaxFrames; i++) {
          const frameData = recordedData[i];
          // 使用最大值来显示波形，更明显
          const maxValue = Math.max(...Array.from(frameData));
          const y = canvas.height - (maxValue / 255) * maxBarHeight;
          const x = i * refStepX;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // 使用二次贝塞尔曲线让线条更平滑
            if (i - 1 >= 0 && i - 1 < recordedData.length) {
              const prevFrameData = recordedData[i - 1];
              const prevMaxValue = Math.max(...Array.from(prevFrameData));
              const prevY = canvas.height - (prevMaxValue / 255) * maxBarHeight;
              const prevX = (i - 1) * refStepX;
              const cpX = (prevX + x) / 2;
              ctx.quadraticCurveTo(cpX, prevY, x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        }
        ctx.stroke();
      } else if (analyserRef.current) {
        // 实时绘制波形
        analyser.getByteFrequencyData(dataArray);

        // 如果正在记录，保存当前帧数据
        if (isRecordingRef.current) {
          // 创建数据副本并保存
          const frameData = new Uint8Array(dataArray);
          recordedWaveformDataRef.current.push(frameData);
        }

        // 清空画布并填充纯色背景
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 如果正在录音，绘制趋势曲线（实时收音曲线 + 基准曲线）
        if (isRecordingRef.current && recordedWaveformDataRef.current.length > 0) {
          const recordedData = recordedWaveformDataRef.current;
          const maxBarHeight = canvas.height;

          // 先绘制基准波形（从视频音频提取）- 使用半透明蓝色曲线
          // 基准波形始终显示完整曲线，位置固定不变
          if (referenceWaveformDataRef.current.length > 0) {
            ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)'; // 半透明蓝色
            ctx.lineWidth = 2;
            ctx.beginPath();

            const refData = referenceWaveformDataRef.current;
            // 基准波形始终显示完整曲线，使用固定的缩放比例
            const refMaxFrames = Math.min(refData.length, canvas.width);
            const refStepX = canvas.width / refMaxFrames;

            for (let i = 0; i < refMaxFrames; i++) {
              if (i >= refData.length) break;

              const refValue = refData[i];
              const y = canvas.height - (refValue / 255) * maxBarHeight;
              const x = i * refStepX;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                // 使用二次贝塞尔曲线让线条更平滑
                const prevX = (i - 1) * refStepX;
                const prevY = canvas.height - (refData[i - 1] / 255) * maxBarHeight;
                const cpX = (prevX + x) / 2;
                ctx.quadraticCurveTo(cpX, prevY, x, y);
              }
            }
            ctx.stroke();
          }

          // 再绘制实时收音的波形曲线 - 使用红色（录音中）
          // 实时波形从左侧开始，随着录音进度向右延伸
          ctx.strokeStyle = '#ff0000'; // 红色波形（录音中）
          ctx.lineWidth = 2;
          ctx.beginPath();

          const currentRecordedFrames = recordedData.length;
          // 实时波形使用与基准波形相同的缩放比例，确保时间轴对齐
          const refData = referenceWaveformDataRef.current;
          const refMaxFrames = Math.min(refData.length, canvas.width);
          const refStepX = canvas.width / refMaxFrames;

          // 只绘制已记录的部分
          for (let i = 0; i < currentRecordedFrames && i < refMaxFrames; i++) {
            const frameData = recordedData[i];
            // 使用最大值来显示波形
            const maxValue = Math.max(...Array.from(frameData));
            const y = canvas.height - (maxValue / 255) * maxBarHeight;
            const x = i * refStepX;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              // 使用二次贝塞尔曲线让线条更平滑
              if (i - 1 >= 0 && i - 1 < recordedData.length) {
                const prevFrameData = recordedData[i - 1];
                const prevMaxValue = Math.max(...Array.from(prevFrameData));
                const prevY = canvas.height - (prevMaxValue / 255) * maxBarHeight;
                const prevX = (i - 1) * refStepX;
                const cpX = (prevX + x) / 2;
                ctx.quadraticCurveTo(cpX, prevY, x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
          }
          ctx.stroke();
        } else {
          // 如果没有录音，绘制实时柱状图（原来的逻辑）
          const barWidth = (canvas.width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;

          ctx.fillStyle = '#00ff00'; // 绿色

          for (let i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] / 255) * canvas.height;

            // 从底部绘制
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
          }
        }
      } else {
        // 如果没有分析器，只清空画布并填充纯色背景
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    draw();
  }, []);

  // 初始化麦克风和波形绘制
  const initMicrophoneAndDraw = useCallback(async () => {
    // 如果已经初始化，直接开始绘制
    if (analyserRef.current && streamRef.current) {
      drawWaveform();
      return;
    }

    try {
      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 创建音频上下文
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // 创建分析器节点
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048; // 增加 FFT 大小以获得更详细的频率数据
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // 连接麦克风输入到分析器
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // 开始绘制波形
      drawWaveform();
    } catch (error) {
      console.error('无法访问麦克风:', error);
    }
  }, [drawWaveform]);

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
        recordedWaveformDataRef.current = []; // 清空之前的记录
        isShowingRecordedRef.current = false;
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
        // 开始播放背景视频和伴奏
        const currentState = usePresentationStore.getState();
        if (!currentState.isPlaying) {
          setState({
            ...currentState,
            isPlaying: true,
          });
        }
        // 初始化麦克风并开始绘制
        initMicrophoneAndDraw();
        break;

      case 'stop-recording':
        isRecordingRef.current = false;
        isShowingRecordedRef.current = true; // 标记为显示记录的波形
        // 不自动显示视频，等待"正确"按钮触发

        // 暂停背景视频和伴奏
        const currentState2 = usePresentationStore.getState();
        if (currentState2.isPlaying) {
          setState({
            ...currentState2,
            isPlaying: false,
          });
        }
        // 不自动播放替换图片的视频，等待"正确"按钮触发
        // 停止绘制动画（但保留数据）
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        // 重新绘制以显示记录的波形和基准波形（趋势曲线）
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const recordedData = recordedWaveformDataRef.current;
          if (ctx && recordedData.length > 0) {
            // 清空画布并填充纯色背景
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const maxBarHeight = canvas.height;

            // 先绘制基准波形（从视频音频提取）- 使用半透明蓝色曲线
            // 基准波形始终显示完整曲线，位置固定不变
            if (referenceWaveformDataRef.current.length > 0) {
              ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)'; // 半透明蓝色
              ctx.lineWidth = 2;
              ctx.beginPath();

              const refData = referenceWaveformDataRef.current;
              // 基准波形始终显示完整曲线，使用固定的缩放比例
              const refMaxFrames = Math.min(refData.length, canvas.width);
              const refStepX = canvas.width / refMaxFrames;

              for (let i = 0; i < refMaxFrames; i++) {
                if (i >= refData.length) break;

                const refValue = refData[i];
                const y = canvas.height - (refValue / 255) * maxBarHeight;
                const x = i * refStepX;

                if (i === 0) {
                  ctx.moveTo(x, y);
                } else {
                  // 使用二次贝塞尔曲线让线条更平滑
                  const prevX = (i - 1) * refStepX;
                  const prevY = canvas.height - (refData[i - 1] / 255) * maxBarHeight;
                  const cpX = (prevX + x) / 2;
                  ctx.quadraticCurveTo(cpX, prevY, x, y);
                }
              }
              ctx.stroke();
            }

            // 再绘制实际记录的波形 - 使用绿色曲线
            // 记录波形使用与基准波形相同的缩放比例，确保时间轴对齐
            ctx.strokeStyle = '#00ff00'; // 绿色波形
            ctx.lineWidth = 2;
            ctx.beginPath();

            const refData = referenceWaveformDataRef.current;
            const refMaxFrames = Math.min(refData.length, canvas.width);
            const refStepX = canvas.width / refMaxFrames;

            // 只绘制已记录的部分
            for (let i = 0; i < recordedData.length && i < refMaxFrames; i++) {
              const frameData = recordedData[i];
              const maxValue = Math.max(...Array.from(frameData));
              const y = canvas.height - (maxValue / 255) * maxBarHeight;
              const x = i * refStepX;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                // 使用二次贝塞尔曲线让线条更平滑
                if (i - 1 >= 0 && i - 1 < recordedData.length) {
                  const prevFrameData = recordedData[i - 1];
                  const prevMaxValue = Math.max(...Array.from(prevFrameData));
                  const prevY = canvas.height - (prevMaxValue / 255) * maxBarHeight;
                  const prevX = (i - 1) * refStepX;
                  const cpX = (prevX + x) / 2;
                  ctx.quadraticCurveTo(cpX, prevY, x, y);
                } else {
                  ctx.lineTo(x, y);
                }
              }
            }
            ctx.stroke();
          }
        }
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
        // 播放伴奏音频
        if (audioPlayerRef.current) {
          const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
          if (audioInternalPlayer) {
            // 重置到开始位置
            if (audioInternalPlayer.currentTime !== undefined) {
              audioInternalPlayer.currentTime = 0;
            }
            // 播放
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
        break;

      default:
        break;
    }
  }, [initMicrophoneAndDraw]);

  // 监听页面控制命令
  usePageControl(21, handlePageControl);

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
          url="/assets/videos/page-21.mp4"
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
            url="/assets/videos/河边走呀呦啰啰.mp4"
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
            src="/assets/images/page-21.png"
            alt="Page 21"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        )}
      </div>

      {/* 波形显示容器 */}
      <div
        style={{
          position: 'absolute',
          top: '77%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60%', // 初始大小，可调整
          height: '20%', // 初始大小，可调整
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
      </div>

      {/* KTV歌词显示区域 */}
      <div
        style={{
          position: 'absolute',
          bottom: '35%',
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
            const isActive = index === currentLyricIndex;
            const isPast = currentLyricIndex > index;
            const isFuture = currentLyricIndex < index && currentLyricIndex !== -1;

            return (
              <div
                key={index}
                style={{
                  fontSize: isActive ? 'clamp(28px, 4vw, 48px)' : 'clamp(20px, 3vw, 36px)',
                  fontWeight: isActive ? 'bold' : 'normal',
                  color: isActive
                    ? '#FFD700' // 当前歌词：金色
                    : isPast
                      ? 'rgba(255, 255, 255, 0.5)' // 已唱过的歌词：半透明白色
                      : 'rgba(255, 255, 255, 0.8)', // 未唱的歌词：白色
                  textShadow: isActive
                    ? '0 0 10px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.8)'
                    : '2px 2px 4px rgba(0, 0, 0, 0.5)',
                  transition: 'all 0.3s ease',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  whiteSpace: 'nowrap',
                  padding: '4px 12px',
                  textAlign: 'center',
                }}
              >
                {lyric.text}
              </div>
            );
          })}
        </div>
      </div>

      {/* 伴奏音频播放器（隐藏） */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: 0 }}>
        <ReactPlayer
          ref={audioPlayerRef}
          url="/assets/audios/2.河边走呀伴奏.mp3"
          playing={isPlaying}
          loop={false}
          muted={audioVolume === 0}
          controls={false}
          width="1px"
          height="1px"
          onReady={handleAudioReady}
          onProgress={(progress) => {
            setCurrentTime(progress.playedSeconds);
            // 根据当前时间找到对应的歌词索引
            let newIndex = -1;
            for (let i = 0; i < lyrics.length; i++) {
              if (progress.playedSeconds >= lyrics[i].startTime && progress.playedSeconds < lyrics[i].endTime) {
                newIndex = i;
                break;
              }
            }
            // 如果时间超过所有歌词，显示最后一句
            if (newIndex === -1 && progress.playedSeconds >= lyrics[lyrics.length - 1].startTime) {
              newIndex = lyrics.length - 1;
            }
            setCurrentLyricIndex(newIndex);
          }}
          onEnded={() => {
            // 音频播放结束后重置
            setCurrentLyricIndex(-1);
            setCurrentTime(0);
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

