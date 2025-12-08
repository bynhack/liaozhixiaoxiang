'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { usePresentationStore } from '@/stores/presentationStore';
import { usePageControl } from '@/hooks/usePageControl';

export default function Page36() {
  const playerRef = useRef<ReactPlayer>(null);
  const { isPlaying, setState } = usePresentationStore((state) => ({
    isPlaying: state.isPlaying,
    setState: state.setState,
  }));
  const [volume, setVolume] = useState(100); // 0-100，100表示最大音量
  const segmentEndTimeRef = useRef<number | null>(null); // 当前片段的结束时间

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

  // 当播放器准备好时设置音量
  const handleReady = () => {
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
      }
    }
  };

  // 处理播放进度，在到达片段结束时间时暂停
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

      case 'play-segment-1':
        // 播放片段1：从0秒播放到15秒
        if (playerRef.current) {
          const internalPlayer = (playerRef.current as any).getInternalPlayer();
          if (internalPlayer) {
            segmentEndTimeRef.current = 15;
            if (internalPlayer.currentTime !== undefined) {
              internalPlayer.currentTime = 0;
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
        // 播放片段2：从15秒播放到最后
        if (playerRef.current) {
          const internalPlayer = (playerRef.current as any).getInternalPlayer();
          if (internalPlayer) {
            segmentEndTimeRef.current = null; // null 表示播放到最后
            if (internalPlayer.currentTime !== undefined) {
              internalPlayer.currentTime = 15;
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

      default:
        break;
    }
  }, [setState]);

  // 监听页面控制命令
  usePageControl(36, handlePageControl);

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
          url="/assets/videos/文生图第二段.mp4"
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
    </div>
  );
}
