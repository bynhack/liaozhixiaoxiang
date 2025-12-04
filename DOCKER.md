# Docker 部署说明

## 快速开始

### 使用 Docker Compose（推荐）

1. **构建并启动容器**
   ```bash
   docker-compose up -d
   ```

2. **查看日志**
   ```bash
   docker-compose logs -f
   ```

3. **停止容器**
   ```bash
   docker-compose down
   ```

4. **重启容器**
   ```bash
   docker-compose restart
   ```

### 使用 Docker 命令

1. **构建镜像**
   ```bash
   docker build -t liaozhixiaoxiang .
   ```

2. **运行容器**
   ```bash
   docker run -d \
     --name liaozhixiaoxiang \
     -p 3000:3000 \
     -v $(pwd):/app \
     -v /app/node_modules \
     liaozhixiaoxiang
   ```

3. **查看日志**
   ```bash
   docker logs -f liaozhixiaoxiang
   ```

4. **停止容器**
   ```bash
   docker stop liaozhixiaoxiang
   ```

5. **删除容器**
   ```bash
   docker rm liaozhixiaoxiang
   ```

## 访问应用

启动成功后，可以通过以下地址访问：

- **展示端**: http://localhost:3000/display
- **控制端**: http://localhost:3000/control

如果是在远程服务器上部署，将 `localhost` 替换为服务器的 IP 地址。

## 环境变量

可以通过环境变量配置：

- `PORT`: 服务端口（默认: 3000）
- `NODE_ENV`: 运行环境（development/production）

在 `docker-compose.yml` 中修改 `environment` 部分来设置环境变量。

## 注意事项

1. 当前配置使用开发模式（`npm run dev`），支持热重载
2. 生产环境建议使用 `npm run build && npm start`
3. 确保端口 3000 未被其他服务占用
4. 如果需要修改端口，同时更新 `docker-compose.yml` 中的端口映射和 `PORT` 环境变量

