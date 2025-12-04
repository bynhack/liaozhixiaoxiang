FROM node:20-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，因为我们需要 tsx）
RUN npm install

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 3000

# 使用开发模式启动
# 注意：生产环境建议使用 npm run build && npm start
CMD ["npm", "run", "dev"]
