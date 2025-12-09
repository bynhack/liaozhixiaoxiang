'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { usePageControl } from '@/hooks/usePageControl';

export default function Page9() {
  const audioPlayerRef = useRef<ReactPlayer>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioPlayerReadyRef = useRef(false);

  // 响应伴奏播放状态变化
  useEffect(() => {
    if (audioPlayerRef.current) {
      const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
      if (audioInternalPlayer) {
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
  }, [isAudioPlaying]);

  // 伴奏音频播放器准备就绪
  const handleAudioReady = () => {
    if (audioPlayerRef.current && !audioPlayerReadyRef.current) {
      const audioInternalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
      if (audioInternalPlayer) {
        // 设置音量
        if (audioInternalPlayer.volume !== undefined) {
          audioInternalPlayer.volume = 1;
        }
        if (audioInternalPlayer.muted !== undefined) {
          audioInternalPlayer.muted = false;
        }
        audioPlayerReadyRef.current = true;
      }
    }
  };

  // 处理页面控制命令
  const handlePageControl = useCallback((command: { type: string; value?: any }) => {
    switch (command.type) {
      case 'play-audio':
        // 播放伴奏
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
              console.log('伴奏播放失败:', error);
            });
          }
        }
        break;

      case 'pause-audio':
        // 暂停伴奏
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
                console.log('伴奏播放失败:', error);
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
  usePageControl(9, handlePageControl);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 背景图片层 */}
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
        <img
          src="/assets/images/page-9.png"
          alt="Page 9"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      {/* 隐藏的伴奏音频播放器 */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: 0 }}>
        <ReactPlayer
          ref={audioPlayerRef}
          url="/assets/audios/一段伴奏.MP3"
          playing={isAudioPlaying}
          loop={false}
          muted={false}
          controls={false}
          width="1px"
          height="1px"
          onReady={handleAudioReady}
          config={{ file: { attributes: { autoPlay: false } } }}
        />
      </div>
    </div>
  );
}

