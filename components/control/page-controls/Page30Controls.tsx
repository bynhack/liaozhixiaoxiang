'use client';

import { useControlSocket } from '@/hooks/useControlSocket';

export default function Page30Controls() {
  const { setPageControl } = useControlSocket();

  // 点击"第二个问题"按钮播放视频
  const handlePlayVideo = () => {
    setPageControl(30, { type: 'play-video' });
  };

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
      {/* 视频控制 */}
      <div>
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '12px',
          }}
        >
          视频控制
        </div>
        <button
          onClick={handlePlayVideo}
          style={{
            width: '100%',
            padding: '14px',
            background: 'rgba(76, 175, 80, 0.3)',
            border: '1px solid rgba(76, 175, 80, 0.5)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          第二个问题
        </button>
      </div>
    </div>
  );
}
