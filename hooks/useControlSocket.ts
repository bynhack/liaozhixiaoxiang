import { useSocket } from './useSocket';

export interface PageControlCommand {
  type: string;
  value?: any;
}

export function useControlSocket() {
  const socket = useSocket('control');

  const changeSlide = (index: number) => {
    if (socket && socket.connected) {
      socket.emit('change-slide', index);
    } else {
      console.warn('Socket 未连接，无法发送 change-slide 命令');
    }
  };

  const togglePlay = (isPlaying: boolean) => {
    if (socket && socket.connected) {
      socket.emit('toggle-play', isPlaying);
    } else {
      console.warn('Socket 未连接，无法发送 toggle-play 命令');
    }
  };

  const prevSlide = () => {
    if (socket && socket.connected) {
      socket.emit('prev-slide');
    } else {
      console.warn('Socket 未连接，无法发送 prev-slide 命令');
    }
  };

  const nextSlide = () => {
    if (socket && socket.connected) {
      socket.emit('next-slide');
    } else {
      console.warn('Socket 未连接，无法发送 next-slide 命令');
    }
  };

  // 页面特定控制
  const setPageControl = (pageId: number, command: PageControlCommand) => {
    if (socket && socket.connected) {
      socket.emit('page-control', { pageId, command });
    } else {
      console.warn('Socket 未连接，无法发送 page-control 命令');
    }
  };

  return {
    changeSlide,
    togglePlay,
    prevSlide,
    nextSlide,
    setPageControl,
    isConnected: socket?.connected || false,
  };
}

