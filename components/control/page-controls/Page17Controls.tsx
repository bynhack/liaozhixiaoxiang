'use client';

import { useControlSocket } from '@/hooks/useControlSocket';

export default function Page17Controls() {
  const { setPageControl } = useControlSocket();

  // 播放伴奏
  const handlePlayAudio = () => {
    setPageControl(17, { type: 'play-audio' });
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
      {/* 伴奏播放控制 */}
      <div>
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '12px',
          }}
        >
          伴奏播放
        </div>
        <button
          onClick={handlePlayAudio}
          style={{
            width: '100%',
            padding: '14px',
            background: 'rgba(255, 193, 7, 0.3)',
            border: '1px solid rgba(255, 193, 7, 0.5)',
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
          播放伴奏
        </button>
      </div>
    </div>
  );
}
