'use client';

import { useControlSocket } from '@/hooks/useControlSocket';

export default function Page36Controls() {
  const { setPageControl } = useControlSocket();

  // 播放片段1：从0秒播放到15秒
  const handlePlaySegment1 = () => {
    setPageControl(36, { type: 'play-segment-1' });
  };

  // 播放片段2：从15秒播放到最后
  const handlePlaySegment2 = () => {
    setPageControl(36, { type: 'play-segment-2' });
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
      {/* 视频片段播放控制 */}
      <div>
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '12px',
          }}
        >
          视频片段播放
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handlePlaySegment1}
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
            伴奏
          </button>
          <button
            onClick={handlePlaySegment2}
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
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            正确
          </button>
        </div>
      </div>
    </div>
  );
}
