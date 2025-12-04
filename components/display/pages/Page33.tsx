'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { usePresentationStore } from '@/stores/presentationStore';
import { usePageControl } from '@/hooks/usePageControl';

export default function Page33() {
  const playerRef = useRef<ReactPlayer>(null);
  const { isPlaying, setState } = usePresentationStore((state) => ({
    isPlaying: state.isPlaying,
    setState: state.setState,
  }));
  const [volume, setVolume] = useState(100); // 0-100，100表示最大音量，有声音

  // 响应播放状态变化（但不自动播放）
  useEffect(() => {
    if (playerRef.current) {
      const internalPlayer = (playerRef.current as any).getInternalPlayer();
      if (internalPlayer) {
        if (isPlaying) {
          // 播放
          if (internalPlayer.paused) {
            // 根据音量设置静音状态
            if (internalPlayer.muted !== undefined) {
              internalPlayer.muted = volume === 0;
            }
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
  usePageControl(33, handlePageControl);

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
          url="/assets/videos/完整带伴奏.mp4"
          playing={isPlaying}
          loop={true}
          muted={volume === 0}
          controls={false}
          width="100%"
          height="100%"
          playsinline={true}
          config={{
            file: {
              attributes: {
                autoPlay: false, // 不自动播放
                muted: volume === 0,
                loop: true,
                playsInline: true,
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

