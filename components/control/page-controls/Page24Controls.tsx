'use client';

import { useState } from 'react';
import { usePresentationStore } from '@/stores/presentationStore';
import { useControlSocket } from '@/hooks/useControlSocket';

export default function Page24Controls() {
  const { isPlaying } = usePresentationStore();
  const { togglePlay, setPageControl } = useControlSocket();
  const [volume, setVolume] = useState(0); // 0-100，0表示静音
  const [isRecording, setIsRecording] = useState(false); // 是否正在记录波形

  // 发送音量控制
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setPageControl(24, { type: 'volume', value: newVolume });
  };

  // 发送视频跳转控制
  const handleSeek = (seconds: number) => {
    setPageControl(24, { type: 'seek', value: seconds });
  };

  // 开始/停止收音
  const handleToggleRecording = () => {
    if (isRecording) {
      // 停止记录
      setIsRecording(false);
      setPageControl(24, { type: 'stop-recording' });
    } else {
      // 开始记录
      setIsRecording(true);
      setPageControl(24, { type: 'start-recording' });
    }
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
      <h3
        style={{
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '20px',
          color: '#fff',
        }}
      >
        视频控制
      </h3>

      {/* 音量控制 */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>音量</span>
          <span style={{ fontSize: '14px', color: '#fff', fontWeight: '600' }}>
            {volume}%
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
            }}
          />
          <button
            onClick={() => handleVolumeChange(volume === 0 ? 50 : 0)}
            style={{
              width: '44px',
              height: '44px',
              border: 'none',
              borderRadius: '12px',
              background:
                volume === 0
                  ? 'rgba(255, 107, 107, 0.2)'
                  : 'rgba(81, 207, 102, 0.2)',
              color: '#fff',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.9)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {volume === 0 ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 快速跳转 */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '12px',
          }}
        >
          快速跳转
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[0, 10, 30].map((seconds) => (
            <button
              key={seconds}
              onClick={() => handleSeek(seconds)}
              style={{
                flex: 1,
                minWidth: '80px',
                padding: '12px',
                background: 'rgba(102, 126, 234, 0.2)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.3)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
              }}
            >
              {seconds === 0 ? '开始' : `${seconds}秒`}
            </button>
          ))}
        </div>
      </div>

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
        <button
          onClick={handleToggleRecording}
          style={{
            width: '100%',
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
      </div>
    </div>
  );
}

