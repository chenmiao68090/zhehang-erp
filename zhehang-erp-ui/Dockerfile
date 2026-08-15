# =============================================================
# Stage 1: 构建前端(Node)
# =============================================================
FROM node:20-alpine AS builder

WORKDIR /build

# Source-only release contexts intentionally exclude local .env files. Keep
# the same-origin API gateway explicit in the immutable image build as a
# second line of defense behind the application-level `/api` fallback.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# 国内加速 npm(可选;海外服务器可删这一行)
RUN npm config set registry https://registry.npmmirror.com

# 先装依赖(利用 Docker 缓存:package 不变就不重复装)
COPY package*.json ./
RUN npm install

# 再拷源码并打包(生产模式 → import.meta.env.DEV=false,自动隐藏调试器/演示账号)
COPY . .
RUN ZHEHANG_UI_ONLY_BUILD=1 npm run build

# =============================================================
# Stage 2: Nginx 托管静态文件 + 反代 /api
# =============================================================
FROM nginx:1.27-alpine AS runtime

# 用项目自带的 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 拷贝构建产物
COPY --from=builder /build/dist /usr/share/nginx/html

EXPOSE 80
