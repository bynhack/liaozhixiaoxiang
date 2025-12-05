'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { usePresentationStore } from '@/stores/presentationStore';
import { usePageControl } from '@/hooks/usePageControl';

export default function Page34() {
  const audioPlayerRef = useRef<ReactPlayer>(null);
  const { isPlaying, setState } = usePresentationStore((state) => ({
    isPlaying: state.isPlaying,
    setState: state.setState,
  }));
  const [volume, setVolume] = useState(100); // 0-100，默认最大音量，有声音

  // 页面加载时，自动设置为播放状态
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
    if (audioPlayerRef.current) {
      const internalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
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

  // 确保音频初始自动播放
  useEffect(() => {
    const tryPlay = () => {
      if (audioPlayerRef.current && isPlaying) {
        const internalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
        if (internalPlayer) {
          // 设置初始音量
          if (internalPlayer.volume !== undefined) {
            internalPlayer.volume = volume / 100;
          }
          // 根据音量设置静音状态
          if (internalPlayer.muted !== undefined) {
            internalPlayer.muted = volume === 0;
          }
          if (internalPlayer.paused) {
            internalPlayer.play().catch((error: any) => {
              console.log('自动播放失败:', error);
            });
          }
        }
      }
    };

    // 等待播放器准备好
    const timer = setTimeout(tryPlay, 300);

    return () => clearTimeout(timer);
  }, [isPlaying, volume]);

  // 当播放器准备好时也尝试播放
  const handleReady = () => {
    if (audioPlayerRef.current && isPlaying) {
      const internalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
      if (internalPlayer) {
        // 设置初始音量
        if (internalPlayer.volume !== undefined) {
          internalPlayer.volume = volume / 100;
        }
        // 根据音量设置静音状态
        if (internalPlayer.muted !== undefined) {
          internalPlayer.muted = volume === 0;
        }
        if (internalPlayer.paused) {
          try {
            internalPlayer.play();
          } catch (error) {
            console.log('播放失败:', error);
          }
        }
      }
    }
  };

  // 处理页面控制命令
  const handlePageControl = useCallback((command: { type: string; value?: any }) => {
    if (!audioPlayerRef.current) return;

    const internalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
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
  usePageControl(34, handlePageControl);

  // 更新音频音量
  useEffect(() => {
    if (audioPlayerRef.current) {
      const internalPlayer = (audioPlayerRef.current as any).getInternalPlayer();
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

  // 8个填空区域的状态，每个区域显示的文字
  const [filledTexts, setFilledTexts] = useState<Record<number, string>>({});

  // 歌词填空的答案
  const lyricsAnswers = [
    '两',      // 第1句：两只小象
    '河 边',   // 第2句：河边走（分开显示）
    '扬 起',   // 第3句：扬起鼻子（分开显示）
    '勾 勾',   // 第4句：勾一勾（显示为"沟 沟"）
    '',        // 第5句：没有
    '好朋友',  // 第6句：好朋友
    '握握手',  // 第7句：见面握握手（第一句）
    '握握手',  // 第8句：见面握握手（第二句）
  ];

  // 每个区域的字符间距配置（可根据需要调整）
  const letterSpacingConfig: Record<number, string> = {
    1: '0.3em', // 第2句（河 边）
    2: '0.3em', // 第3句（扬 起）
    3: '1.1em', // 第4句（沟 沟）
    5: '0.8em', // 第6句（好朋友）- 可调整
    6: '0.5em', // 第7句（握握手）- 可调整
    7: '0.6em', // 第8句（握握手）- 可调整
  };

  // 处理区域点击
  const handleAreaClick = (index: number) => {
    setFilledTexts((prev) => {
      const newTexts = { ...prev };
      if (newTexts[index]) {
        // 如果已经显示文字，点击后隐藏
        delete newTexts[index];
      } else {
        // 如果未显示，点击后显示对应文字
        newTexts[index] = lyricsAnswers[index];
      }
      return newTexts;
    });
  };

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
          src="/assets/images/歌词填空.png"
          alt="歌词填空"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* 8个可点击区域 - 4行2列布局，精确覆盖文字填空区域 */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: '68%',
          height: '60%',
          zIndex: 10,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'repeat(4, 1fr)',
          gap: '1%',
        }}
      >
        {Array.from({ length: 8 }).map((_, index) => {
          const row = Math.floor(index / 2) + 1;
          const col = (index % 2) + 1;
          const isFilled = !!filledTexts[index];
          
          // 根据不同的区域设置文字位置（相对于区域的位置，对应图片上的填空框位置）
          const getTextPosition = () => {
            switch (index) {
              case 0: // 第一句：两 - 显示在左侧开始位置（第一个填空框）
                return { left: '5%', top: '40%', transform: 'translateY(-50%)' };
              case 1: // 第二句：河边 - 显示在中间偏左位置（第二个填空框）
                return { left: '5%', top: '40%', transform: 'translateY(-50%)' };
              case 2: // 第三句：扬起 - 显示在左侧开始位置（第三个填空框）
                return { left: '5%', top: '40%', transform: 'translateY(-50%)' };
              case 3: // 第四句：沟 沟 - 显示在中间位置（第四个填空框，中间有空格）
                return { left: '5%', top: '40%', transform: 'translateY(-50%)' };
              case 4: // 第五句：没有 - 不显示文字
                return { left: '50%', top: '40%', transform: 'translate(-50%, -50%)' };
              case 5: // 第六句：好朋友 - 显示在中间位置（第六个填空框）
                return { left: '5%', top: '40%', transform: 'translateY(-50%)' };
              case 6: // 第七句：握握手 - 显示在中间位置（第七个填空框）
                return { left: '25%', top: '40%', transform: 'translateY(-50%)' };
              case 7: // 第八句：握握手 - 显示在中间位置（第八个填空框）
                return { left: '25%', top: '40%', transform: 'translateY(-50%)' };
              default:
                return { left: '50%', top: '40%', transform: 'translate(-50%, -50%)' };
            }
          };
          
          const textPosition = getTextPosition();
          
          return (
            <div
              key={index}
              onClick={() => handleAreaClick(index)}
              style={{
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {/* 显示文字 - 根据区域调整位置 */}
              {isFilled && lyricsAnswers[index] && (
                <span
                  style={{
                    position: 'absolute',
                    ...textPosition,
                    fontSize: 'clamp(20px, 3.5vw, 42px)',
                    fontWeight: 'bold',
                    color: '#2d3748',
                    textShadow: '2px 2px 4px rgba(255, 255, 255, 0.9)',
                    whiteSpace: 'nowrap',
                    zIndex: 15,
                    letterSpacing: letterSpacingConfig[index] || 'normal', // 使用配置的字符间距
                  }}
                >
                  {filledTexts[index]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 音频播放器（隐藏） */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: 0 }}>
        <ReactPlayer
          ref={audioPlayerRef}
          url="/assets/audios/完整伴奏.mp3"
          playing={isPlaying}
          loop={true}
          muted={volume === 0}
          controls={false}
          width="1px"
          height="1px"
          onReady={handleReady}
          config={{
            file: {
              attributes: {
                autoPlay: true,
                muted: volume === 0,
                loop: true,
              },
            },
          }}
        />
      </div>
    </div>
  );
}

