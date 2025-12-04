'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { usePresentationStore } from '@/stores/presentationStore';
import { usePageControl } from '@/hooks/usePageControl';

export default function Page11() {
  const playerRef = useRef<ReactPlayer>(null);
  const audioPlayerRef = useRef<ReactPlayer>(null); // 伴奏音频播放器
  const { isPlaying, setState } = usePresentationStore((state) => ({
    isPlaying: state.isPlaying,
    setState: state.setState,
  }));
  const [volume, setVolume] = useState(0); // 0-100，0表示静音
  const [audioVolume, setAudioVolume] = useState(100); // 伴奏音量 0-100
  const [isAudioPlaying, setIsAudioPlaying] = useState(false); // 伴奏独立播放状态
  const hasInitialized = useRef(false);
  const audioPlayerReadyRef = useRef(false);

  // 第十一页加载时，确保为暂停状态（不自动播放）- 只运行一次
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
    // 同步伴奏音频播放状态（独立控制，不受视频播放状态影响）
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
        if (!audioPlayerReadyRef.current && !isAudioPlaying) {
          if (!audioInternalPlayer.paused) {
            audioInternalPlayer.pause();
          }
        }
        audioPlayerReadyRef.current = true;
      }
    }
  };

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
        // 设置伴奏音量
        setAudioVolume(command.value as number);
        break;

      case 'play-audio':
        // 播放伴奏音频（只控制伴奏，不影响视频）
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
              console.log('伴奏播放失败:', error);
            });
          }
        }
        break;

      default:
        break;
    }
  }, [setState]);

  // 监听页面控制命令
  usePageControl(11, handlePageControl);

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

  // 更新伴奏音量
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
          url="/assets/videos/河边走呀呦啰啰转场.mp4"
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
      {/* 伴奏音频播放器 */}
      <div style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}>
        <ReactPlayer
          ref={audioPlayerRef}
          url="/assets/audios/2.河边走剪.MP3"
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
