import { useEffect } from 'react';
import { useSocket } from './useSocket';

export interface PageControlCommand {
  type: string;
  value?: any;
}

export function usePageControl(
  pageId: number,
  onControl: (command: PageControlCommand) => void
) {
  const socket = useSocket('display');

  useEffect(() => {
    if (!socket) return;

    const handlePageControl = (data: { pageId: number; command: PageControlCommand }) => {
      // 只处理当前页面的控制命令
      if (data.pageId === pageId) {
        onControl(data.command);
      }
    };

    socket.on('page-control', handlePageControl);

    return () => {
      socket.off('page-control', handlePageControl);
    };
  }, [socket, pageId, onControl]);
}

