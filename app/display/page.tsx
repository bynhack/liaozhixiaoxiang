'use client';

import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useDisplaySocket } from '@/hooks/useDisplaySocket';
import { usePresentationStore } from '@/stores/presentationStore';
import DisplaySlide from '@/components/display/DisplaySlide';
import { defaultSlides } from '@/config/slides';

export default function DisplayPage() {
  const socket = useSocket('display');
  const { setSlides } = useDisplaySocket();
  const { currentSlide, slides } = usePresentationStore();
  const hasInitialized = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenButton, setShowFullscreenButton] = useState(false);

  // 初始化时加载硬编码的PPT内容
  useEffect(() => {
    if (!socket || hasInitialized.current) return;

    const initializeSlides = () => {
      // 始终设置默认幻灯片，确保控制端能收到完整列表
      setSlides(defaultSlides);
      hasInitialized.current = true;
    };

    // 如果已经连接，立即设置
    if (socket.connected) {
      // 延迟一下，等待服务器状态同步完成
      setTimeout(initializeSlides, 200);
    } else {
      // 等待连接建立
      socket.on('connect', () => {
        setTimeout(initializeSlides, 200);
      });
    }
  }, [socket, setSlides]);

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 全屏切换函数
  const toggleFullscreen = () => {
    // 检查当前是否全屏
    if (!document.fullscreenElement) {
      // 进入全屏
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().catch((err) => {
          console.error('进入全屏失败:', err);
        });
      } else if ((element as any).webkitRequestFullscreen) {
        // Safari
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        // IE/Edge
        (element as any).msRequestFullscreen();
      }
    } else {
      // 退出全屏
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error('退出全屏失败:', err);
        });
      } else if ((document as any).webkitExitFullscreen) {
        // Safari
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        // IE/Edge
        (document as any).msExitFullscreen();
      }
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 16:9 容器 - 所有元素都限制在此容器内 */}
      <div
        style={{
          width: '100vw',
          height: '56.25vw', // 16:9 = 9/16 = 0.5625 = 56.25%
          maxHeight: '100vh',
          maxWidth: '177.78vh', // 16:9 = 16/9 = 1.7778
          position: 'relative',
          margin: 'auto',
          overflow: 'hidden', // 确保内容不会超出16:9区域
        }}
        onMouseEnter={() => setShowFullscreenButton(true)}
        onMouseLeave={() => setShowFullscreenButton(false)}
      >
        {currentSlideData ? (
          <DisplaySlide slide={currentSlideData} />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '24px',
            }}
          >
            等待内容加载...
          </div>
        )}

        {/* 全屏按钮 - 在16:9容器内，右上角，只在hover时显示 */}
        {showFullscreenButton && (
          <button
            onClick={toggleFullscreen}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 1000,
              padding: '6px 12px',
              background: 'rgba(0, 0, 0, 0.3)',
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s ease',
              opacity: showFullscreenButton ? 1 : 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="全屏切换"
          >
            <span>⛶</span>
            {isFullscreen ? '退出全屏' : '全屏'}
          </button>
        )}
      </div>
    </div>
  );
}

