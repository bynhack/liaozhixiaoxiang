import express, { Request, Response } from 'express';
import { createServer } from 'http';
import next from 'next';
import { Server as SocketServer } from 'socket.io';
import { setupSocket } from './socket';
import { networkInterfaces } from 'os';

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev });
const handle = app.getRequestHandler();

// 获取本机 IP 地址
function getLocalIP(): string {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];
    if (nets) {
      for (const net of nets) {
        // 跳过内部（即 127.0.0.1）和非 IPv4 地址
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }
  return 'localhost';
}

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);
  const io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // 设置 Socket.io
  setupSocket(io);

  // Next.js 路由处理
  expressApp.all('*', (req: Request, res: Response) => {
    return handle(req, res);
  });

  const host = '0.0.0.0'; // 监听所有网络接口
  const localIP = getLocalIP();

  server.listen(port, host, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Ready on http://${localIP}:${port}`);
    console.log(`> Display: http://localhost:${port}/display 或 http://${localIP}:${port}/display`);
    console.log(`> Control: http://localhost:${port}/control 或 http://${localIP}:${port}/control`);
  });
});

