'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import { usePresentationStore } from '@/stores/presentationStore';
import { usePageControl } from '@/hooks/usePageControl';

export default function Page1() {
  const playerRef = useRef<ReactPlayer>(null);
  const { isPlaying, setState } = usePresentationStore((state) => ({
    isPlaying: state.isPlaying,
    setState: state.setState,
  }));
  const [volume, setVolume] = useState(0); // 0-100，0表示静音

  // 第一页加载时，自动设置为播放状态
  useEffect(() => {
    const currentState = usePresentationStore.getState();
    if (!currentState.isPlaying) {
      setState({
        ...currentState,
        isPlaying: true,
      });
    }
  }, [setState]);

  // 响应播放状态变化
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
  }, [isPlaying]);

  // 确保视频初始自动播放
  useEffect(() => {
    const tryPlay = () => {
      if (playerRef.current && isPlaying) {
        const internalPlayer = (playerRef.current as any).getInternalPlayer();
        if (internalPlayer && internalPlayer.paused) {
          // 根据音量设置静音状态
          if (internalPlayer.muted !== undefined) {
            internalPlayer.muted = volume === 0;
          }
          internalPlayer.play().catch((error: any) => {
            console.log('自动播放失败:', error);
          });
        }
      }
    };

    // 等待播放器准备好
    const timer = setTimeout(tryPlay, 300);

    return () => clearTimeout(timer);
  }, [isPlaying]);

  // 当播放器准备好时也尝试播放
  const handleReady = () => {
    if (playerRef.current && isPlaying) {
      const internalPlayer = (playerRef.current as any).getInternalPlayer();
      if (internalPlayer && internalPlayer.paused) {
        try {
          // 确保静音
          if (internalPlayer.muted !== undefined) {
            internalPlayer.muted = volume === 0;
          }
          internalPlayer.play();
        } catch (error) {
          console.log('播放失败:', error);
        }
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
  usePageControl(1, handlePageControl);

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
          url="/assets/videos/page-1.mp4"
          playing={isPlaying}
          loop={true}
          muted={volume === 0}
          controls={false}
          width="100%"
          height="100%"
          playsinline={true}
          onReady={handleReady}
          onEnded={() => {
            // 视频结束后自动重新播放（循环）
            if (playerRef.current && isPlaying) {
              const internalPlayer = (playerRef.current as any).getInternalPlayer();
              if (internalPlayer) {
                internalPlayer.currentTime = 0;
                internalPlayer.play();
              }
            }
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          config={{
            file: {
              attributes: {
                autoPlay: true,
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

      {/* UI 叠加层 - 只显示文字，与画面协调 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        {/* 右上角标题区域 - 与天空区域协调 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            textAlign: 'right',
            maxWidth: '40%',
          }}
        >
          {/* 主标题：两只小象 - 温暖的橙色，与画面中的阳光呼应 */}
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              fontSize: 'clamp(56px, 8vw, 120px)',
              fontWeight: 'bold',
              color: '#FF8C42', // 温暖的橙色，与画面中的阳光和温暖色调协调
              fontFamily: '"Comic Sans MS", "微软雅黑", "黑体", sans-serif',
              lineHeight: '1.2',
              letterSpacing: '6px',
              margin: '0 0 12px 0',
              textShadow: `
                3px 3px 0px rgba(255, 255, 255, 0.9),
                -1px -1px 0px rgba(255, 255, 255, 0.9),
                1px -1px 0px rgba(255, 255, 255, 0.9),
                -1px 1px 0px rgba(255, 255, 255, 0.9),
                0 0 25px rgba(255, 255, 255, 0.6),
                0 4px 15px rgba(0, 0, 0, 0.25)
              `,
            }}
          >
            两只小象
          </motion.h1>

          {/* 出版社信息：浅蓝色，与天空协调 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{
              fontSize: 'clamp(18px, 2.8vw, 32px)',
              color: '#87CEEB', // 浅蓝色，与画面中的天空和水的颜色协调
              fontFamily: '"Comic Sans MS", "微软雅黑", "黑体", sans-serif',
              fontWeight: '600',
              lineHeight: '1.5',
              marginBottom: '8px',
              textShadow: `
                2px 2px 0px rgba(255, 255, 255, 0.9),
                -1px -1px 0px rgba(255, 255, 255, 0.9),
                1px -1px 0px rgba(255, 255, 255, 0.9),
                -1px 1px 0px rgba(255, 255, 255, 0.9),
                0 0 18px rgba(255, 255, 255, 0.5),
                0 2px 10px rgba(0, 0, 0, 0.2)
              `,
            }}
          >
            人民音乐出版社
          </motion.div>

          {/* 单元信息：稍深的蓝色，形成层次 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              fontSize: 'clamp(16px, 2.2vw, 26px)',
              color: '#5F9EA0', // 稍深的青蓝色，与画面协调
              fontFamily: '"Comic Sans MS", "微软雅黑", "黑体", sans-serif',
              fontWeight: '500',
              lineHeight: '1.4',
              textShadow: `
                2px 2px 0px rgba(255, 255, 255, 0.9),
                -1px -1px 0px rgba(255, 255, 255, 0.9),
                1px -1px 0px rgba(255, 255, 255, 0.9),
                -1px 1px 0px rgba(255, 255, 255, 0.9),
                0 0 15px rgba(255, 255, 255, 0.5),
                0 2px 8px rgba(0, 0, 0, 0.2)
              `,
            }}
          >
            一年级上册第四单元
          </motion.div>
        </motion.div>

        {/* 左下角信息区域 - 绿色，与植物协调 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            fontFamily: '"Comic Sans MS", "微软雅黑", "黑体", sans-serif',
            maxWidth: '35%',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(20px, 3vw, 32px)',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#2E8B57', // 绿色，与画面中的植物和叶子协调
              textShadow: `
                2px 2px 0px rgba(255, 255, 255, 0.9),
                -1px -1px 0px rgba(255, 255, 255, 0.9),
                1px -1px 0px rgba(255, 255, 255, 0.9),
                -1px 1px 0px rgba(255, 255, 255, 0.9),
                0 0 15px rgba(255, 255, 255, 0.6),
                0 2px 8px rgba(0, 0, 0, 0.2)
              `,
              lineHeight: '1.6',
            }}
          >
            执教人：华雨辰
          </div>
          <div
            style={{
              fontSize: 'clamp(18px, 2.5vw, 28px)',
              fontWeight: '500',
              color: '#228B22', // 稍深的绿色，形成层次感
              textShadow: `
                2px 2px 0px rgba(255, 255, 255, 0.9),
                -1px -1px 0px rgba(255, 255, 255, 0.9),
                1px -1px 0px rgba(255, 255, 255, 0.9),
                -1px 1px 0px rgba(255, 255, 255, 0.9),
                0 0 15px rgba(255, 255, 255, 0.6),
                0 2px 8px rgba(0, 0, 0, 0.2)
              `,
              lineHeight: '1.6',
            }}
          >
            武汉市青山区钢花小学
          </div>
        </motion.div>
      </div>
    </div>
  );
}

