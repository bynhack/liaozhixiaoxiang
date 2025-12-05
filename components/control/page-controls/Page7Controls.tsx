'use client';

import { useControlSocket } from '@/hooks/useControlSocket';

export default function Page7Controls() {
  const { setPageControl } = useControlSocket();

  // 播放片段1：从第3秒播放到第5秒
  const handlePlaySegment1 = () => {
    setPageControl(7, { type: 'play-segment-1' });
  };

  // 播放片段2：从第10秒播放到第12秒
  const handlePlaySegment2 = () => {
    setPageControl(7, { type: 'play-segment-2' });
  };

  // 播放片段3：从第16秒播放到最后
  const handlePlaySegment3 = () => {
    setPageControl(7, { type: 'play-segment-3' });
  };

  // 播放/暂停完整歌曲带伴奏（切换）
  const handleToggleFullSong = () => {
    setPageControl(7, { type: 'play-full-song' });
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
              padding: '12px',
              background: 'rgba(102, 126, 234, 0.3)',
              border: '1px solid rgba(102, 126, 234, 0.5)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '15px',
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            出现呀
          </button>
          <button
            onClick={handlePlaySegment2}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(102, 126, 234, 0.3)',
              border: '1px solid rgba(102, 126, 234, 0.5)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '15px',
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            出现手
          </button>
          <button
            onClick={handlePlaySegment3}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(102, 126, 234, 0.3)',
              border: '1px solid rgba(102, 126, 234, 0.5)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '15px',
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            出现遮盖
          </button>
        </div>
      </div>

      {/* 完整歌曲播放控制 */}
      <div style={{ marginTop: '20px' }}>
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '12px',
          }}
        >
          完整歌曲播放
        </div>
        <button
          onClick={handleToggleFullSong}
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
          播放/暂停完整歌曲
        </button>
      </div>
    </div>
  );
}

