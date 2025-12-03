import { useSocket } from './useSocket';

export interface PageControlCommand {
  type: string;
  value?: any;
}

export function useControlSocket() {
  const socket = useSocket('control');

  const changeSlide = (index: number) => {
    socket?.emit('change-slide', index);
  };

  const togglePlay = (isPlaying: boolean) => {
    socket?.emit('toggle-play', isPlaying);
  };

  const prevSlide = () => {
    socket?.emit('prev-slide');
  };

  const nextSlide = () => {
    socket?.emit('next-slide');
  };

  // 页面特定控制
  const setPageControl = (pageId: number, command: PageControlCommand) => {
    socket?.emit('page-control', { pageId, command });
  };

  return {
    changeSlide,
    togglePlay,
    prevSlide,
    nextSlide,
    setPageControl,
  };
}

