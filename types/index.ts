export interface Slide {
  id: number;
  type: 'image' | 'video';
  url: string;
  duration?: number; // 视频时长（秒）
}

export interface PresentationState {
  currentSlide: number;
  isPlaying: boolean;
  slides: Slide[];
}

export type RoomType = 'control' | 'display';

