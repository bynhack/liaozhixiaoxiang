import { create } from 'zustand';
import { PresentationState, Slide } from '@/types';

interface PresentationStore extends PresentationState {
  setState: (state: PresentationState) => void;
  setSlides: (slides: Slide[]) => void;
  setCurrentSlide: (index: number) => void;
  togglePlay: () => void;
  nextSlide: () => void;
  prevSlide: () => void;
}

export const usePresentationStore = create<PresentationStore>((set, get) => ({
  currentSlide: 0,
  isPlaying: false,
  slides: [],

  setState: (state) => {
    // 如果服务器状态为空但本地已有内容，不覆盖
    const current = get();
    if (state.slides.length === 0 && current.slides.length > 0) {
      // 只更新播放状态和当前页，不覆盖幻灯片列表
      set({
        currentSlide: state.currentSlide,
        isPlaying: state.isPlaying,
      });
    } else {
      set(state);
    }
  },

  setSlides: (slides) => set({ slides }),

  setCurrentSlide: (index) => {
    const { slides } = get();
    if (index >= 0 && index < slides.length) {
      set({ currentSlide: index });
    }
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  nextSlide: () => {
    const { currentSlide, slides } = get();
    if (currentSlide < slides.length - 1) {
      set({ currentSlide: currentSlide + 1 });
    }
  },

  prevSlide: () => {
    const { currentSlide } = get();
    if (currentSlide > 0) {
      set({ currentSlide: currentSlide - 1 });
    }
  },
}));

