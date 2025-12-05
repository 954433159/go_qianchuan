# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# 可选：通过 build args 覆盖默认的 .env.production 配置
# 如果不传入，则使用 .env.production 中的默认值
ARG VITE_API_BASE_URL
ARG VITE_OAUTH_APP_ID
ARG VITE_OAUTH_REDIRECT_URI
ARG VITE_APP_TITLE
ARG VITE_APP_VERSION

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code (includes .env.production)
COPY . .

# 仅在传入 build args 时设置环境变量（覆盖 .env.production）
# Vite 会优先使用环境变量，其次是 .env.production 文件
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-}
ENV VITE_OAUTH_APP_ID=${VITE_OAUTH_APP_ID:-}
ENV VITE_OAUTH_REDIRECT_URI=${VITE_OAUTH_REDIRECT_URI:-}
ENV VITE_APP_TITLE=${VITE_APP_TITLE:-}
ENV VITE_APP_VERSION=${VITE_APP_VERSION:-}

# Build application
# Vite 在 production 模式下会自动加载 .env.production
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for health check
RUN apk add --no-cache curl

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
