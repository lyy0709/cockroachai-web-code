# 使用官方Node.js作为基础镜像
FROM node:14-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 在Dockerfile中设置环境变量的默认值
ENV CONFIG_PATH /usr/src/app/config/config.yaml

# 将 package.json 和 package-lock.json 复制到工作目录
COPY package*.json ./

# 将项目文件复制到工作目录
COPY . .

# 安装依赖并清理缓存
RUN npm ci --only=production

# 暴露端口8201
EXPOSE 8201

# 启动Node.js应用
CMD ["node", "server.js"]

