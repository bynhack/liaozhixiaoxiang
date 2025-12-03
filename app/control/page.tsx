'use client';

import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useControlSocket } from '@/hooks/useControlSocket';
import { usePresentationStore } from '@/stores/presentationStore';
import ControlPanel from '@/components/control/ControlPanel';
import PageControls from '@/components/control/PageControls';

export default function ControlPage() {
  useSocket('control');
  const { slides, currentSlide, isPlaying } = usePresentationStore();
  const { togglePlay, prevSlide, nextSlide, changeSlide } = useControlSocket();
  
  // 获取当前页面的ID
  const currentSlideId = slides[currentSlide]?.id || 0;

  // 键盘快捷键（移动端可能不需要，但保留）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSlide();
          break;
        case ' ':
          e.preventDefault();
          togglePlay(!isPlaying);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide, togglePlay, isPlaying]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景装饰 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* 主内容 */}
      <div
        style={{
          width: '100%',
          maxWidth: '100%',
          padding: '20px 16px',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* 标题区域 */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '8px',
          }}
        >
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#ffffff',
              margin: '0',
              letterSpacing: '0.5px',
            }}
          >
            演示控制
          </h1>
          {slides.length > 0 && (
            <div
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginTop: '4px',
              }}
            >
              {currentSlide + 1} / {slides.length}
            </div>
          )}
        </div>

        {/* 控制面板 */}
        <ControlPanel
          currentSlide={currentSlide}
          totalSlides={slides.length}
          isPlaying={isPlaying}
          onPrev={prevSlide}
          onNext={nextSlide}
          onTogglePlay={() => togglePlay(!isPlaying)}
          onJumpTo={changeSlide}
        />

        {/* 页面特定控制 */}
        {slides.length > 0 && currentSlideId > 0 && (
          <PageControls currentSlideId={currentSlideId} />
        )}

        {slides.length === 0 && (
          <div
            style={{
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            等待展示端配置PPT内容...
          </div>
        )}
      </div>
    </div>
  );
}
