'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { usePresentationStore } from '@/stores/presentationStore';
import { usePageControl } from '@/hooks/usePageControl';

export default function Page16() {
  const playerRef = useRef<ReactPlayer>(null);
  const { isPlaying, setState } = usePresentationStore((state) => ({
    isPlaying: state.isPlaying,
    setState: state.setState,
  }));
  const [volume, setVolume] = useState(0); // 0-100，0表示静音
  const hasInitialized = useRef(false);

  // 第十六页加载时，确保为暂停状态（不自动播放）- 只运行一次
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

  // 处理页面控制命令
  const handlePageControl = useCallback((command: { type: string; value?: any }) => {
    if (!playerRef.current) return;

    const internalPlayer = (playerRef.current as any).getInternalPlayer();
    if (!internalPlayer) return;

    switch (command.type) {
      case 'volume':
        const newVolume = command.value as number;
        setVolume(newVolume);
        if (internalPlayer.volume !== undefined) {
          internalPlayer.volume = newVolume / 100;
        }
        if (internalPlayer.muted !== undefined) {
          internalPlayer.muted = newVolume === 0;
        }
        break;

      case 'seek':
        const seconds = command.value as number;
        if (internalPlayer.currentTime !== undefined) {
          internalPlayer.currentTime = seconds;
        }
        break;

      default:
        break;
    }
  }, []);

  // 监听页面控制命令
  usePageControl(16, handlePageControl);

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
          url="/assets/videos/page-16.mp4"
          playing={isPlaying}
          loop={false}
          muted={volume === 0}
          controls={false}
          width="100%"
          height="100%"
          playsinline={true}
          onReady={handleReady}
          onEnded={() => {
            // 视频播放完成后自动停止
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

