# TXWL Platform 前端 Docker 部署指南

本文档介绍如何使用 Docker 部署 TXWL Platform 前端应用。

## 1. 快速启动

### 使用 Docker Compose（推荐）
```bash
# 启动前端应用
docker-compose up -d

# 访问应用
# 应用将在 http://localhost 上运行
```

### 单独构建和运行
```bash
# 构建 Docker 镜像
docker build -t txwl-platform-frontend .

# 运行应用
docker run -p 80:80 txwl-platform-frontend
```

## 2. 构建 Docker 镜像

### 手动构建
```bash
# 进入前端项目目录
cd TXWLPlatform-frontend/txwl-frontend

# 构建镜像
docker build -t txwl-platform-frontend .
```

## 3. 部署到阿里云容器镜像服务

### 构建并推送镜像
```bash
# 登录阿里云镜像仓库
docker login --username=<你的阿里云账号> registry.cn-hangzhou.aliyuncs.com

# 构建镜像
docker build -t txwl-platform-frontend .

# 标记镜像
docker tag txwl-platform-frontend registry.cn-hangzhou.aliyuncs.com/<你的命名空间>/txwl-platform-frontend:latest

# 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/<你的命名空间>/txwl-platform-frontend:latest
```

## 4. 解决静态资源加载问题

如果你在部署后遇到静态资源（CSS/JS文件）404错误，请按以下步骤检查：

### 4.1 检查 Vite 构建配置
确保 [vite.config.js](file:///F:/TXWLPlatform/TXWLPlatform-frontend/txwl-frontend/vite.config.js) 中设置了正确的基础路径：
```javascript
export default defineConfig({
  // ...
  base: '/'  // 确保基础路径设置正确
})
```

### 4.2 检查 Nginx 配置
确保 [nginx.conf](file:///F:/TXWLPlatform/TXWLPlatform-frontend/txwl-frontend/nginx.conf) 正确配置静态资源处理：
- 静态资源路径正确指向 `/usr/share/nginx/html`
- 静态资源正则表达式包含所有必要的文件扩展名
- 使用 `try_files` 正确处理 SPA 路由

### 4.3 重新构建和部署
如果静态资源仍有问题，请重新执行以下步骤：
```bash
# 清理之前的构建
rm -rf dist

# 重新安装依赖
npm install

# 重新构建
npm run build

# 重新构建 Docker 镜像
docker build -t txwl-platform-frontend .

# 重新运行
docker run -p 80:80 txwl-platform-frontend
```

## 5. 生产环境部署

对于生产环境，建议使用以下配置：

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    image: registry.cn-hangzhou.aliyuncs.com/<你的命名空间>/txwl-platform-frontend:latest
    container_name: txwl-frontend
    ports:
      - "80:80"
    environment:
      - NGINX_HOST=localhost
    restart: unless-stopped
    depends_on:
      - backend

  backend:
    image: registry.cn-hangzhou.aliyuncs.com/<你的命名空间>/txwl-platform-backend:latest
    container_name: txwl-backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/txwl_platform
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=admin
    restart: unless-stopped
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    container_name: txwl-mysql
    environment:
      MYSQL_ROOT_PASSWORD: admin
      MYSQL_DATABASE: txwl_platform
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

## 6. 监控和日志

```bash
# 查看容器日志
docker logs txwl-frontend

# 查看容器资源使用情况
docker stats txwl-frontend

# 进入容器调试
docker exec -it txwl-frontend sh
```

## 7. 故障排除

### 静态资源 404 错误
- 检查 Nginx 配置中的静态资源路径
- 确认构建产物已正确复制到 Nginx 目录
- 验证文件权限是否正确

### 页面空白
- 检查浏览器开发者工具的控制台错误
- 验证静态资源是否正确加载
- 确认 Nginx 配置是否正确处理 SPA 路由

### 构建失败
- 确认所有依赖已正确安装
- 验证 [package.json](file:///F:/TXWLPlatform/TXWLPlatform-frontend/txwl-frontend/package.json) 中包含所有必需的依赖
- 检查 [vite.config.js](file:///F:/TXWLPlatform/TXWLPlatform-frontend/txwl-frontend/vite.config.js) 配置是否正确

## 8. 安全建议

- 在生产环境中使用 HTTPS
- 配置适当的安全头
- 定期更新基础镜像
- 不要在前端暴露敏感信息