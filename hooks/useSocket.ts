import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { usePresentationStore } from '@/stores/presentationStore';
import { RoomType, PresentationState } from '@/types';

export function useSocket(room: RoomType) {
  const socketRef = useRef<Socket | null>(null);
  const setState = usePresentationStore((state) => state.setState);

  useEffect(() => {
    // 初始化 Socket 连接
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    // 加入房间
    socket.emit('join-room', room);

    // 监听状态更新
    socket.on('state-update', (state: PresentationState) => {
      setState(state);
    });

    // 连接成功
    socket.on('connect', () => {
      console.log('Socket 连接成功');
    });

    // 连接断开
    socket.on('disconnect', () => {
      console.log('Socket 连接断开');
    });

    // 清理
    return () => {
      socket.disconnect();
    };
  }, [room, setState]);

  return socketRef.current;
}

