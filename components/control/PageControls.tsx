'use client';

import Page1Controls from './page-controls/Page1Controls';
import Page2Controls from './page-controls/Page2Controls';
import Page3Controls from './page-controls/Page3Controls';
import Page4Controls from './page-controls/Page4Controls';
import Page6Controls from './page-controls/Page6Controls';
import Page10Controls from './page-controls/Page10Controls';
import Page11Controls from './page-controls/Page11Controls';
import Page12Controls from './page-controls/Page12Controls';
import Page13Controls from './page-controls/Page13Controls';
import Page14Controls from './page-controls/Page14Controls';
import Page15Controls from './page-controls/Page15Controls';
import Page16Controls from './page-controls/Page16Controls';
import Page17Controls from './page-controls/Page17Controls';
import Page20Controls from './page-controls/Page20Controls';
import Page21Controls from './page-controls/Page21Controls';
import Page22Controls from './page-controls/Page22Controls';
import Page23Controls from './page-controls/Page23Controls';
import Page24Controls from './page-controls/Page24Controls';
import Page25Controls from './page-controls/Page25Controls';
import Page26Controls from './page-controls/Page26Controls';
import Page27Controls from './page-controls/Page27Controls';
import Page28Controls from './page-controls/Page28Controls';
import Page29Controls from './page-controls/Page29Controls';
import Page31Controls from './page-controls/Page31Controls';

interface PageControlsProps {
  currentSlideId: number;
}

// 页面控制组件映射
const pageControlComponents: Record<number, React.ComponentType> = {
  1: Page1Controls,
  2: Page2Controls,
  3: Page3Controls,
  4: Page4Controls,
  6: Page6Controls,
  10: Page10Controls,
  11: Page11Controls,
  12: Page12Controls,
  13: Page13Controls,
  14: Page14Controls,
  15: Page15Controls,
  16: Page16Controls,
  17: Page17Controls,
  20: Page20Controls,
  21: Page21Controls,
  22: Page22Controls,
  23: Page23Controls,
  24: Page24Controls,
  25: Page25Controls,
  26: Page26Controls,
  27: Page27Controls,
  28: Page28Controls,
  29: Page29Controls,
  31: Page31Controls,
  // 在这里添加更多页面的控制组件
};

export default function PageControls({ currentSlideId }: PageControlsProps) {
  const ControlComponent = pageControlComponents[currentSlideId];

  if (!ControlComponent) {
    return null;
  }

  return <ControlComponent />;
}
