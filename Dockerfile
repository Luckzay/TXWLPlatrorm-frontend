# 使用较新的Node.js LTS版本镜像
FROM node:18-alpine AS builder

WORKDIR /app

# 安装构建所需的工具
RUN apk add --no-cache python3 make g++

# 复制package文件
COPY package*.json ./

# 配置npm使用淘宝镜像源以提高安装速度，并使用--prefer-online避免缓存问题
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm config set prefer-online true

# 安装依赖 - 使用--force参数确保即使有警告也能安装
RUN npm install --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 使用Nginx作为生产服务器
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]