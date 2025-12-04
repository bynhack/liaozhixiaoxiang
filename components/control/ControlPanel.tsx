'use client';

import { Slide } from '@/types';

interface ControlPanelProps {
  currentSlide: number;
  totalSlides: number;
  slides: Slide[];
  isPlaying: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onJumpTo: (index: number) => void;
}

export default function ControlPanel({
  currentSlide,
  totalSlides,
  slides,
  isPlaying,
  onPrev,
  onNext,
  onTogglePlay,
  onJumpTo,
}: ControlPanelProps) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* 页面指示器 */}
      {totalSlides > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {Array.from({ length: totalSlides }).map((_, index) => {
              const slide = slides[index];
              const displayText = slide?.title || `${index + 1}`;
              return (
              <button
                key={index}
                onClick={() => onJumpTo(index)}
                style={{
                    minWidth: '44px',
                  height: '44px',
                    padding: '0 12px',
                  border: 'none',
                  borderRadius: '12px',
                  background:
                    currentSlide === index
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                  color: currentSlide === index ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                  fontWeight: currentSlide === index ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow:
                    currentSlide === index
                      ? '0 4px 12px rgba(102, 126, 234, 0.4)'
                      : 'none',
                    whiteSpace: 'nowrap',
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                  {displayText}
              </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 主要控制按钮 */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        {/* 上一页 */}
        <button
          onClick={onPrev}
          disabled={currentSlide === 0}
          style={{
            width: '56px',
            height: '56px',
            border: 'none',
            borderRadius: '16px',
            background:
              currentSlide === 0
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.1)',
            color: currentSlide === 0 ? 'rgba(255, 255, 255, 0.3)' : '#fff',
            fontSize: '24px',
            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
          onTouchStart={(e) => {
            if (currentSlide > 0) {
              e.currentTarget.style.transform = 'scale(0.9)';
            }
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ‹
        </button>

        {/* 播放/暂停 */}
        <button
          onClick={onTogglePlay}
          style={{
            width: '72px',
            height: '72px',
            border: 'none',
            borderRadius: '20px',
            background: isPlaying
              ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
              : 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)',
            color: '#fff',
            fontSize: '32px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isPlaying
              ? '0 8px 24px rgba(255, 107, 107, 0.4)'
              : '0 8px 24px rgba(81, 207, 102, 0.4)',
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.9)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* 下一页 */}
        <button
          onClick={onNext}
          disabled={currentSlide >= totalSlides - 1}
          style={{
            width: '56px',
            height: '56px',
            border: 'none',
            borderRadius: '16px',
            background:
              currentSlide >= totalSlides - 1
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.1)',
            color:
              currentSlide >= totalSlides - 1
                ? 'rgba(255, 255, 255, 0.3)'
                : '#fff',
            fontSize: '24px',
            cursor: currentSlide >= totalSlides - 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
          onTouchStart={(e) => {
            if (currentSlide < totalSlides - 1) {
              e.currentTarget.style.transform = 'scale(0.9)';
            }
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
}
