'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { usePresentationStore } from '@/stores/presentationStore';
import { usePageControl } from '@/hooks/usePageControl';

export default function Page7() {
  const playerRef = useRef<ReactPlayer>(null);
  const audioPlayerRef = useRef<ReactPlayer>(null); // 完整歌曲音频播放器
  const { isPlaying, setState } = usePresentationStore((state) => ({
    isPlaying: state.isPlaying,
    setState: state.setState,
  }));
  const [volume, setVolume] = useState(0); // 0-100，0表示静音
  const [audioVolume, setAudioVolume] = useState(100); // 音频音量 0-100
  const [isAudioPlaying, setIsAudioPlaying] = useState(false); // 音频独立播放状态
  const segmentEndTimeRef = useRef<number | null>(null); // 当前片段的结束时间
  const hasInitialized = useRef(false);
  const audioPlayerReadyRef = useRef(false);

  // 第七页加载时，确保为暂停状态（不自动播放）- 只运行一次
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
    // 同步音频播放状态（独立控制，不受视频播放状态影响）
    if (audioPlayerRef.current) {
      const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
      if (audioInternalPlayer) {
        if (audioInternalPlayer.volume !== undefined) {
          audioInternalPlayer.volume = audioVolume / 100;
        }
        if (audioInternalPlayer.muted !== undefined) {
          audioInternalPlayer.muted = audioVolume === 0;
        }
        if (isAudioPlaying) {
          if (audioInternalPlayer.paused) {
            audioInternalPlayer.play().catch((error: any) => {
              console.log('音频播放失败:', error);
            });
          }
        } else {
          if (!audioInternalPlayer.paused) {
            audioInternalPlayer.pause();
          }
        }
      }
    }
  }, [isPlaying, volume, audioVolume, isAudioPlaying]);

  const playerReadyRef = useRef(false);

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

  // 音频播放器准备就绪
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
        if (!audioPlayerReadyRef.current && !isAudioPlaying) {
          if (!audioInternalPlayer.paused) {
            audioInternalPlayer.pause();
          }
        }
        audioPlayerReadyRef.current = true;
      }
    }
  };

  // 监听视频播放进度，检查是否到达片段结束时间
  const handleProgress = useCallback((progress: { playedSeconds: number }) => {
    if (segmentEndTimeRef.current !== null && progress.playedSeconds >= segmentEndTimeRef.current) {
      // 到达片段结束时间，暂停播放
      if (playerRef.current) {
        const internalPlayer = (playerRef.current as any).getInternalPlayer();
        if (internalPlayer && !internalPlayer.paused) {
          internalPlayer.pause();
          segmentEndTimeRef.current = null;
          // 同步播放状态
          const currentState = usePresentationStore.getState();
          if (currentState.isPlaying) {
            setState({
              ...currentState,
              isPlaying: false,
            });
          }
        }
      }
    }
  }, [setState]);

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

      case 'audio-volume':
        // 设置音频音量
        setAudioVolume(command.value as number);
        break;

      case 'play-segment-1':
        // 播放片段1：从第3秒播放到第5秒
        if (playerRef.current) {
          const internalPlayer = (playerRef.current as any).getInternalPlayer();
          if (internalPlayer) {
            segmentEndTimeRef.current = 5;
            if (internalPlayer.currentTime !== undefined) {
              internalPlayer.currentTime = 3;
            }
            internalPlayer.play().catch((error: any) => {
              console.log('播放失败:', error);
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

      case 'play-segment-2':
        // 播放片段2：从第10秒播放到第12秒
        if (playerRef.current) {
          const internalPlayer = (playerRef.current as any).getInternalPlayer();
          if (internalPlayer) {
            segmentEndTimeRef.current = 12;
            if (internalPlayer.currentTime !== undefined) {
              internalPlayer.currentTime = 10;
            }
            internalPlayer.play().catch((error: any) => {
              console.log('播放失败:', error);
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

      case 'play-segment-3':
        // 播放片段3：从第16秒播放到最后
        if (playerRef.current) {
          const internalPlayer = (playerRef.current as any).getInternalPlayer();
          if (internalPlayer) {
            segmentEndTimeRef.current = null; // null 表示播放到最后
            if (internalPlayer.currentTime !== undefined) {
              internalPlayer.currentTime = 16;
            }
            internalPlayer.play().catch((error: any) => {
              console.log('播放失败:', error);
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

      case 'play-full-song':
        // 播放/暂停完整歌曲带伴奏（切换）
        if (audioPlayerRef.current) {
          const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
          if (audioInternalPlayer) {
            // 根据当前播放状态切换
            if (isAudioPlaying) {
              // 如果正在播放，则暂停
              setIsAudioPlaying(false);
              if (!audioInternalPlayer.paused) {
                audioInternalPlayer.pause();
              }
            } else {
              // 如果暂停，则播放
              setIsAudioPlaying(true);
              // 如果播放器在开始位置，重置到开始
              if (audioInternalPlayer.currentTime === 0 || audioInternalPlayer.ended) {
                if (audioInternalPlayer.currentTime !== undefined) {
                  audioInternalPlayer.currentTime = 0;
                }
              }
              audioInternalPlayer.play().catch((error: any) => {
                console.log('音频播放失败:', error);
              });
            }
          } else {
            // 如果播放器还没准备好，先设置状态
            setIsAudioPlaying(true);
          }
        } else {
          setIsAudioPlaying(true);
        }
        break;

      case 'pause-full-song':
        // 暂停完整歌曲带伴奏
        setIsAudioPlaying(false);
        if (audioPlayerRef.current) {
          const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
          if (audioInternalPlayer && !audioInternalPlayer.paused) {
            audioInternalPlayer.pause();
          }
        }
        break;

      default:
        break;
    }
  }, [setState]);

  // 监听页面控制命令
  usePageControl(7, handlePageControl);

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

  // 更新音频音量
  useEffect(() => {
    if (audioPlayerRef.current) {
      const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
      if (audioInternalPlayer) {
        if (audioInternalPlayer.volume !== undefined) {
          audioInternalPlayer.volume = audioVolume / 100;
        }
        if (audioInternalPlayer.muted !== undefined) {
          audioInternalPlayer.muted = audioVolume === 0;
        }
      }
    }
  }, [audioVolume]);

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
          url="/assets/videos/曲谱.mp4"
          playing={isPlaying}
          loop={false}
          muted={volume === 0}
          controls={false}
          width="100%"
          height="100%"
          playsinline={true}
          onReady={handleReady}
          onProgress={handleProgress}
          onEnded={() => {
            // 视频播放完成后自动停止
            segmentEndTimeRef.current = null;
            const currentState = usePresentationStore.getState();
            setState({
              ...currentState,
              isPlaying: false,
            });
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          config={{
            file: {
              attributes: {
                muted: volume === 0,
                loop: false,
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
      {/* 完整歌曲音频播放器 */}
      <div style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}>
        <ReactPlayer
          ref={audioPlayerRef}
          url="/assets/audios/完整歌曲带伴奏.mp3"
          playing={isAudioPlaying}
          loop={false}
          muted={audioVolume === 0}
          controls={false}
          width="1px"
          height="1px"
          onReady={handleAudioReady}
        />
      </div>
    </div>
  );
}
