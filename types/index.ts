export interface Slide {
  id: number;
  type: 'image' | 'video' | 'component';
  url: string;
  duration?: number; // 视频时长（秒）
  title?: string; // 页面标题，用于控制端显示
}

export interface PresentationState {
  currentSlide: number;
  isPlaying: boolean;
  slides: Slide[];
}

export type RoomType = 'control' | 'display';

