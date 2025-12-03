'use client';

export default function Page19() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 背景图片层 */}
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
        <img
          src="/assets/images/page-19.png"
          alt="Page 19"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    </div>
  );
}

