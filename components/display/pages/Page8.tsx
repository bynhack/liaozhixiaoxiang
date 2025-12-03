'use client';

import { useEffect } from 'react';
import ReactPlayer from 'react-player';
import { usePresentationStore } from '@/stores/presentationStore';

export default function Page8() {
  const { isPlaying, setState } = usePresentationStore((state) => ({
    isPlaying: state.isPlaying,
    setState: state.setState,
  }));

  useEffect(() => {
    // 确保进入页面时自动播放
    const currentState = usePresentationStore.getState();
    if (!currentState.isPlaying) {
      setState({
        ...currentState,
        isPlaying: true,
      });
    }
  }, [setState]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
        <ReactPlayer
          url="/assets/videos/page-8.mp4"
          playing={isPlaying}
          loop={false}
          muted={false}
          width="100%"
          height="100%"
          controls={false}
          playsinline={true}
          config={{
            file: {
              attributes: {
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
