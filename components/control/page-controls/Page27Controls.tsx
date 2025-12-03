'use client';

import { useState } from 'react';
import { useControlSocket } from '@/hooks/useControlSocket';

export default function Page27Controls() {
  const { setPageControl } = useControlSocket();
  const [isRecording, setIsRecording] = useState(false); // 是否正在记录波形

  // 开始/停止收音
  const handleToggleRecording = () => {
    if (isRecording) {
      // 停止记录
      setIsRecording(false);
      setPageControl(27, { type: 'stop-recording' });
    } else {
      // 开始记录
      setIsRecording(true);
      setPageControl(27, { type: 'start-recording' });
    }
  };

  // 点击"正确"按钮播放视频
  const handlePlayVideo = () => {
    setPageControl(27, { type: 'play-video' });
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
      {/* 波形记录控制 */}
      <div>
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '12px',
          }}
        >
          波形记录
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleToggleRecording}
            style={{
              flex: 1,
              padding: '14px',
              background: isRecording
                ? 'rgba(255, 107, 107, 0.3)'
                : 'rgba(81, 207, 102, 0.3)',
              border: isRecording
                ? '1px solid rgba(255, 107, 107, 0.5)'
                : '1px solid rgba(81, 207, 102, 0.5)',
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
            {isRecording ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                停止收音
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
                开始收音
              </>
            )}
          </button>
          <button
            onClick={handlePlayVideo}
            disabled={isRecording}
            style={{
              flex: 1,
              padding: '14px',
              background: isRecording
                ? 'rgba(128, 128, 128, 0.2)'
                : 'rgba(102, 126, 234, 0.3)',
              border: isRecording
                ? '1px solid rgba(128, 128, 128, 0.3)'
                : '1px solid rgba(102, 126, 234, 0.5)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isRecording ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isRecording ? 0.5 : 1,
            }}
            onTouchStart={(e) => {
              if (!isRecording) {
                e.currentTarget.style.transform = 'scale(0.95)';
              }
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            正确
          </button>
        </div>
      </div>
    </div>
  );
}
