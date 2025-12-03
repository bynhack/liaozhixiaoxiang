'use client';

export default function Page30() {
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
          src="/assets/images/page-30.png"
          alt="Page 30"
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

