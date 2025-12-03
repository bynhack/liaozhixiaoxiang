'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { usePresentationStore } from '@/stores/presentationStore';
import { usePageControl } from '@/hooks/usePageControl';

export default function Page25() {
  const playerRef = useRef<ReactPlayer>(null);
  const videoPlayerRef = useRef<ReactPlayer>(null); // 用于替换图片的视频播放器
  const { isPlaying, setState } = usePresentationStore((state) => ({
    isPlaying: state.isPlaying,
    setState: state.setState,
  }));
  const [volume, setVolume] = useState(0); // 0-100，0表示静音
  const hasInitialized = useRef(false);
  const playerReadyRef = useRef(false);
  const videoPlayerReadyRef = useRef(false);
  
  // 音频波形相关
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRecordingRef = useRef(false); // 是否正在记录
  const recordedWaveformDataRef = useRef<Uint8Array[]>([]); // 存储记录的波形数据
  const referenceWaveformDataRef = useRef<number[]>([]); // 存储对比波形（基准波形）数据
  const isShowingRecordedRef = useRef(false); // 是否正在显示记录的波形
  const [showVideo, setShowVideo] = useState(false); // 控制是否显示视频（用于触发重新渲染）

  // 第二十五页加载时，确保为暂停状态（不自动播放）- 只运行一次
  useEffect(() => {
    if (hasInitialized.current) return;
    
    const currentState = usePresentationStore.getState();
    if (currentState.isPlaying) {
      setState({
        ...currentState,
        isPlaying: false,
      });
    }
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
  }, [isPlaying, volume]);

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

      // 如果正在显示记录的波形，绘制记录的波形和对比波形
      if (isShowingRecordedRef.current && recordedWaveformDataRef.current.length > 0) {
        // 清空画布
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const recordedData = recordedWaveformDataRef.current;
        const maxFrames = Math.min(recordedData.length, canvas.width); // 限制显示的帧数
        const startIndex = Math.max(0, recordedData.length - maxFrames); // 如果帧数太多，从后面开始显示
        const barWidth = canvas.width / maxFrames;
        const maxBarHeight = canvas.height;

        // 先绘制对比波形（基准波形）- 使用半透明蓝色
        if (referenceWaveformDataRef.current.length > 0) {
          ctx.fillStyle = 'rgba(0, 150, 255, 0.6)'; // 半透明蓝色
          const refData = referenceWaveformDataRef.current;
          const refMaxFrames = Math.min(refData.length, maxFrames);
          const refStartIndex = Math.max(0, refData.length - refMaxFrames);

          for (let i = 0; i < refMaxFrames; i++) {
            const refIndex = refStartIndex + i;
            if (refIndex >= refData.length) break;
            
            const refValue = refData[refIndex];
            const refBarHeight = (refValue / 255) * maxBarHeight;

            // 从底部绘制对比波形
            ctx.fillRect(i * barWidth, canvas.height - refBarHeight, Math.max(1, barWidth), refBarHeight);
          }
        }

        // 再绘制实际记录的波形 - 使用绿色
        ctx.fillStyle = '#00ff00'; // 绿色波形

        for (let i = 0; i < maxFrames; i++) {
          const frameIndex = startIndex + i;
          if (frameIndex >= recordedData.length) break;
          
          const frameData = recordedData[frameIndex];
          // 使用最大值来显示波形，更明显
          const maxValue = Math.max(...Array.from(frameData));
          const barHeight = (maxValue / 255) * maxBarHeight;

          // 从底部绘制实际波形
          ctx.fillRect(i * barWidth, canvas.height - barHeight, Math.max(1, barWidth), barHeight);
        }
      } else if (analyserRef.current) {
        // 实时绘制波形
        analyser.getByteFrequencyData(dataArray);

        // 如果正在记录，保存当前帧数据
        if (isRecordingRef.current) {
          // 创建数据副本并保存
          const frameData = new Uint8Array(dataArray);
          recordedWaveformDataRef.current.push(frameData);
        }

        // 清空画布
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制波形
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        ctx.fillStyle = isRecordingRef.current ? '#ff0000' : '#00ff00'; // 记录时显示红色，否则绿色

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height;

          // 从底部绘制
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }
      } else {
        // 如果没有分析器，只清空画布
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
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
        referenceWaveformDataRef.current = []; // 清空对比波形
        isShowingRecordedRef.current = false;
        setShowVideo(false); // 隐藏视频，显示图片
        videoPlayerReadyRef.current = false; // 重置视频播放器状态
        // 停止替换图片的视频（如果正在播放）
        if (videoPlayerRef.current) {
          const videoInternalPlayer = (videoPlayerRef.current as any).getInternalPlayer();
          if (videoInternalPlayer && !videoInternalPlayer.paused) {
            videoInternalPlayer.pause();
          }
        }
        // 开始播放背景视频
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
        setShowVideo(true); // 显示视频
        
        // 生成对比波形（基准波形）
        const recordedData = recordedWaveformDataRef.current;
        if (recordedData.length > 0) {
          // 基于实际波形生成对比波形，使其看起来更平滑、更标准
          const referenceData: number[] = [];
          const smoothingWindow = 5; // 平滑窗口大小
          
          for (let i = 0; i < recordedData.length; i++) {
            const frameData = recordedData[i];
            const maxValue = Math.max(...Array.from(frameData));
            
            // 使用移动平均来平滑波形
            let sum = 0;
            let count = 0;
            for (let j = Math.max(0, i - smoothingWindow); j <= Math.min(recordedData.length - 1, i + smoothingWindow); j++) {
              const frameData2 = recordedData[j];
              const maxValue2 = Math.max(...Array.from(frameData2));
              sum += maxValue2;
              count++;
            }
            
            // 生成一个稍微调整的基准值，让对比波形看起来更标准
            const smoothedValue = sum / count;
            // 添加一些随机变化，但保持在合理范围内（±15%）
            const variation = (Math.random() - 0.5) * 0.3; // -15% 到 +15%
            const referenceValue = Math.min(255, Math.max(0, smoothedValue * (1 + variation)));
            referenceData.push(referenceValue);
          }
          
          referenceWaveformDataRef.current = referenceData;
        }
        
        // 暂停背景视频
        const currentState2 = usePresentationStore.getState();
        if (currentState2.isPlaying) {
          setState({
            ...currentState2,
            isPlaying: false,
          });
        }
        // 播放替换图片的视频
        if (videoPlayerRef.current) {
          const videoInternalPlayer = (videoPlayerRef.current as any).getInternalPlayer();
          if (videoInternalPlayer && videoInternalPlayer.paused) {
            videoInternalPlayer.play().catch((error: any) => {
              console.log('视频播放失败:', error);
            });
          }
        }
        // 停止绘制动画（但保留数据）
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        // 重新绘制以显示记录的波形和对比波形
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx && recordedWaveformDataRef.current.length > 0) {
            // 清空画布
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const maxFrames = Math.min(recordedData.length, canvas.width);
            const startIndex = Math.max(0, recordedData.length - maxFrames);
            const barWidth = canvas.width / maxFrames;
            const maxBarHeight = canvas.height;

            // 先绘制对比波形
            if (referenceWaveformDataRef.current.length > 0) {
              ctx.fillStyle = 'rgba(0, 150, 255, 0.6)'; // 半透明蓝色
              const refData = referenceWaveformDataRef.current;
              const refMaxFrames = Math.min(refData.length, maxFrames);
              const refStartIndex = Math.max(0, refData.length - refMaxFrames);

              for (let i = 0; i < refMaxFrames; i++) {
                const refIndex = refStartIndex + i;
                if (refIndex >= refData.length) break;
                
                const refValue = refData[refIndex];
                const refBarHeight = (refValue / 255) * maxBarHeight;

                ctx.fillRect(i * barWidth, canvas.height - refBarHeight, Math.max(1, barWidth), refBarHeight);
              }
            }

            // 再绘制实际记录的波形
            ctx.fillStyle = '#00ff00';

            for (let i = 0; i < maxFrames; i++) {
              const frameIndex = startIndex + i;
              if (frameIndex >= recordedData.length) break;
              
              const frameData = recordedData[frameIndex];
              const maxValue = Math.max(...Array.from(frameData));
              const barHeight = (maxValue / 255) * maxBarHeight;

              ctx.fillRect(i * barWidth, canvas.height - barHeight, Math.max(1, barWidth), barHeight);
            }
          }
        }
        break;

      default:
        break;
    }
  }, [initMicrophoneAndDraw]);

  // 监听页面控制命令
  usePageControl(25, handlePageControl);

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
          url="/assets/videos/page-25.mp4"
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
            url="/assets/videos/page-25-video.mp4"
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
            src="/assets/images/page-25.png"
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
    </div>
  );
}

