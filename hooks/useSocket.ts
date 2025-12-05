import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { usePresentationStore } from '@/stores/presentationStore';
import { RoomType, PresentationState } from '@/types';

export function useSocket(room: RoomType) {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const setState = usePresentationStore((state) => state.setState);
  const roomRef = useRef(room);

  // 更新 room ref，确保在重连时使用最新的 room
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

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
    const socketInstance = io(getSocketUrl(), {
      transports: ['websocket'],
      reconnection: true, // 启用自动重连
      reconnectionDelay: 1000, // 重连延迟 1 秒
      reconnectionDelayMax: 5000, // 最大重连延迟 5 秒
      reconnectionAttempts: Infinity, // 无限重连尝试
      timeout: 20000, // 连接超时时间
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // 加入房间的函数
    const joinRoom = () => {
      if (socketInstance.connected) {
        socketInstance.emit('join-room', roomRef.current);
        console.log(`已加入房间: ${roomRef.current}`);
      }
    };

    // 监听状态更新
    socketInstance.on('state-update', (state: PresentationState) => {
      setState(state);
    });

    // 连接成功
    socketInstance.on('connect', () => {
      console.log('Socket 连接成功');
      // 连接成功后立即加入房间
      joinRoom();
    });

    // 重连成功
    socketInstance.on('reconnect', (attemptNumber: number) => {
      console.log(`Socket 重连成功 (尝试次数: ${attemptNumber})`);
      // 重连后重新加入房间
      joinRoom();
    });

    // 连接断开
    socketInstance.on('disconnect', (reason: string) => {
      console.log('Socket 连接断开:', reason);
    });

    // 重连尝试
    socketInstance.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`正在尝试重连... (第 ${attemptNumber} 次)`);
    });

    // 重连失败
    socketInstance.on('reconnect_failed', () => {
      console.error('Socket 重连失败');
    });

    // 如果已经连接，立即加入房间
    if (socketInstance.connected) {
      joinRoom();
    }

    // 清理
    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('reconnect');
      socketInstance.off('reconnect_attempt');
      socketInstance.off('reconnect_failed');
      socketInstance.off('state-update');
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [setState]); // 移除 room 依赖，使用 ref 来跟踪

  return socket;
}

