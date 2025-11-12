# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# 注入构建时环境变量
ARG VITE_API_BASE_URL
ARG VITE_OAUTH_APP_ID
ARG VITE_OAUTH_REDIRECT_URI
ARG VITE_APP_TITLE
ARG VITE_APP_VERSION

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_OAUTH_APP_ID=${VITE_OAUTH_APP_ID}
ENV VITE_OAUTH_REDIRECT_URI=${VITE_OAUTH_REDIRECT_URI}
ENV VITE_APP_TITLE=${VITE_APP_TITLE:-"千川SDK管理平台"}
ENV VITE_APP_VERSION=${VITE_APP_VERSION:-"1.0.0"}

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build application
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
