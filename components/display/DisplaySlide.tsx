'use client';

import React from 'react';
import { Slide } from '@/types';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import Page3 from './pages/Page3';
import Page4 from './pages/Page4';
import Page5 from './pages/Page5';
import Page6 from './pages/Page6';
import Page7 from './pages/Page7';
import Page8 from './pages/Page8';
import Page9 from './pages/Page9';
import Page10 from './pages/Page10';
import Page11 from './pages/Page11';
import Page12 from './pages/Page12';
import Page13 from './pages/Page13';
import Page14 from './pages/Page14';
import Page15 from './pages/Page15';
import Page16 from './pages/Page16';
import Page17 from './pages/Page17';
import Page18 from './pages/Page18';
import Page19 from './pages/Page19';
import Page20 from './pages/Page20';
import Page21 from './pages/Page21';
import Page22 from './pages/Page22';
import Page23 from './pages/Page23';
import Page24 from './pages/Page24';
import Page25 from './pages/Page25';
import Page26 from './pages/Page26';
import Page27 from './pages/Page27';
import Page28 from './pages/Page28';
import Page29 from './pages/Page29';
import Page30 from './pages/Page30';
import Page31 from './pages/Page31';

interface DisplaySlideProps {
  slide: Slide;
}

// 页面组件映射
const pageComponents: Record<number, React.ComponentType> = {
  1: Page1,
  2: Page2,
  3: Page3,
  4: Page4,
  5: Page5,
  6: Page6,
  7: Page7,
  8: Page8,
  9: Page9,
  10: Page10,
  11: Page11,
  12: Page12,
  13: Page13,
  14: Page14,
  15: Page15,
  16: Page16,
  17: Page17,
  18: Page18,
  19: Page19,
  20: Page20,
  21: Page21,
  22: Page22,
  23: Page23,
  24: Page24,
  25: Page25,
  26: Page26,
  27: Page27,
  28: Page28,
  29: Page29,
  30: Page30,
  31: Page31,
  // 在这里添加更多页面组件
};

export default function DisplaySlide({ slide }: DisplaySlideProps) {
  // 根据 slide.id 获取对应的页面组件
  const PageComponent = pageComponents[slide.id];

  // 如果有对应的页面组件，使用它
  if (PageComponent) {
    return <PageComponent />;
  }

  // 否则使用默认的通用页面（图片/视频背景）
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
        {slide.type === 'image' ? (
          <img
            src={slide.url}
            alt={`Slide ${slide.id}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '24px',
            }}
          >
            视频页面（请创建对应的页面组件）
          </div>
        )}
      </div>
    </div>
  );
}

