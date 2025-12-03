import { useSocket } from './useSocket';
import { Slide } from '@/types';

export function useDisplaySocket() {
  const socket = useSocket('display');

  const setSlides = (slides: Slide[]) => {
    socket?.emit('set-slides', slides);
  };

  return {
    setSlides,
  };
}

