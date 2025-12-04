import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { usePresentationStore } from '@/stores/presentationStore';
import { RoomType, PresentationState } from '@/types';

export function useSocket(room: RoomType) {
  const socketRef = useRef<Socket | null>(null);
  const setState = usePresentationStore((state) => state.setState);

  useEffect(() => {
    // 自动检测当前域名，用于 WebSocket 连接
    const getSocketUrl = () => {
      if (process.env.NEXT_PUBLIC_SOCKET_URL) {
        return process.env.NEXT_PUBLIC_SOCKET_URL;
      }
      // 在生产环境或部署环境，使用当前页面的域名
      if (typeof window !== 'undefined') {
        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        const host = window.location.host;
        return `${protocol}//${host}`;
      }
      // 服务端渲染时回退到 localhost
      return 'http://localhost:3000';
    };

    // 初始化 Socket 连接
    const socket = io(getSocketUrl(), {
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

