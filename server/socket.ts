import { Server as SocketServer, Socket } from 'socket.io';

// 房间名称
const CONTROL_ROOM = 'control';
const DISPLAY_ROOM = 'display';

// 当前播放状态
let currentState = {
  currentSlide: 0,
  isPlaying: false,
  slides: [] as Array<{
    id: number;
    type: 'image' | 'video';
    url: string;
    duration?: number;
  }>,
};

// 根据页面ID判断是否应该自动播放
const shouldAutoPlay = (slideId: number): boolean => {
  // 第1页、第3-6页和28-29页、31页自动播放，第2页和第10-17页不自动播放，其他页面（图片等）不自动播放
  return slideId === 1 || (slideId >= 3 && slideId <= 6) || (slideId >= 28 && slideId <= 29) || slideId === 31;
};

export function setupSocket(io: SocketServer) {
  io.on('connection', (socket: Socket) => {
    console.log('客户端连接:', socket.id);

    // 客户端加入房间
    socket.on('join-room', (room: 'control' | 'display') => {
      if (room === 'control') {
        socket.join(CONTROL_ROOM);
        console.log(`控制端加入: ${socket.id}`);
        // 发送当前状态给控制端
        socket.emit('state-update', currentState);
      } else if (room === 'display') {
        socket.join(DISPLAY_ROOM);
        console.log(`展示端加入: ${socket.id}`);
        // 发送当前状态给展示端
        socket.emit('state-update', currentState);
      }
    });

    // 展示端：设置幻灯片列表（只有展示端可以设置）
    socket.on('set-slides', (slides: typeof currentState.slides) => {
      if (socket.rooms.has(DISPLAY_ROOM)) {
        currentState.slides = slides;
        // 广播给所有展示端
        io.to(DISPLAY_ROOM).emit('state-update', currentState);
        // 也更新控制端
        io.to(CONTROL_ROOM).emit('state-update', currentState);
        console.log('幻灯片列表已更新:', slides.length);
      }
    });

    // 根据页面ID判断是否应该自动播放
    const shouldAutoPlay = (slideId: number): boolean => {
      // 第1页、第3-6页和28-29页、31页自动播放，第2页和第10-17页不自动播放，其他页面（图片等）不自动播放
      return slideId === 1 || (slideId >= 3 && slideId <= 6) || (slideId >= 28 && slideId <= 29) || slideId === 31;
    };

    // 控制端：切换幻灯片
    socket.on('change-slide', (slideIndex: number) => {
      if (socket.rooms.has(CONTROL_ROOM)) {
        if (slideIndex >= 0 && slideIndex < currentState.slides.length) {
          currentState.currentSlide = slideIndex;
          const targetSlide = currentState.slides[slideIndex];
          // 根据目标页面设置播放状态
          if (targetSlide) {
            currentState.isPlaying = shouldAutoPlay(targetSlide.id);
          }
          // 广播给所有展示端
          io.to(DISPLAY_ROOM).emit('state-update', currentState);
          // 也更新控制端
          io.to(CONTROL_ROOM).emit('state-update', currentState);
          console.log('切换到幻灯片:', slideIndex, '播放状态:', currentState.isPlaying);
        }
      }
    });

    // 控制端：播放/暂停
    socket.on('toggle-play', (isPlaying: boolean) => {
      if (socket.rooms.has(CONTROL_ROOM)) {
        currentState.isPlaying = isPlaying;
        // 广播给所有展示端
        io.to(DISPLAY_ROOM).emit('state-update', currentState);
        // 也更新控制端
        io.to(CONTROL_ROOM).emit('state-update', currentState);
        console.log('播放状态:', isPlaying ? '播放' : '暂停');
      }
    });

    // 控制端：上一页/下一页
    socket.on('prev-slide', () => {
      if (socket.rooms.has(CONTROL_ROOM)) {
        if (currentState.currentSlide > 0) {
          currentState.currentSlide--;
          const targetSlide = currentState.slides[currentState.currentSlide];
          // 根据目标页面设置播放状态
          if (targetSlide) {
            currentState.isPlaying = shouldAutoPlay(targetSlide.id);
          }
          io.to(DISPLAY_ROOM).emit('state-update', currentState);
          io.to(CONTROL_ROOM).emit('state-update', currentState);
          console.log('上一页:', currentState.currentSlide, '播放状态:', currentState.isPlaying);
        }
      }
    });

    socket.on('next-slide', () => {
      if (socket.rooms.has(CONTROL_ROOM)) {
        if (currentState.currentSlide < currentState.slides.length - 1) {
          currentState.currentSlide++;
          const targetSlide = currentState.slides[currentState.currentSlide];
          // 根据目标页面设置播放状态
          if (targetSlide) {
            currentState.isPlaying = shouldAutoPlay(targetSlide.id);
          }
          io.to(DISPLAY_ROOM).emit('state-update', currentState);
          io.to(CONTROL_ROOM).emit('state-update', currentState);
          console.log('下一页:', currentState.currentSlide, '播放状态:', currentState.isPlaying);
        }
      }
    });

    // 控制端：页面特定控制
    socket.on('page-control', (data: { pageId: number; command: { type: string; value?: any } }) => {
      if (socket.rooms.has(CONTROL_ROOM)) {
        // 广播给所有展示端
        io.to(DISPLAY_ROOM).emit('page-control', data);
        console.log('页面控制命令:', data);
      }
    });

    // 断开连接
    socket.on('disconnect', () => {
      console.log('客户端断开:', socket.id);
    });
  });
}

