# 使用较新的Node.js LTS版本镜像
FROM node:18-alpine AS builder

WORKDIR /app

# 安装构建所需的工具
RUN apk add --no-cache python3 make g++

# 复制package文件
COPY package*.json ./

# 配置npm使用淘宝镜像源
RUN npm config set registry https://registry.npmmirror.com/

# 安装依赖
RUN npm install --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 使用Nginx作为生产服务器
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置模板
COPY default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]