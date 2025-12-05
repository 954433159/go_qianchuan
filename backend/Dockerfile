# 多阶段构建 - 减小最终镜像大小
# 此 Dockerfile 需要从项目根目录构建，而不是 backend 目录
# docker build -f backend/Dockerfile -t qianchuan-backend .
FROM golang:1.20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装必要的依赖
RUN apk add --no-cache ca-certificates git curl

# 复制 oceanengineSDK 到指定位置
COPY oceanengineSDK /app/oceanengineSDK

# 复制 backend 的 go mod 文件
COPY backend/go.mod backend/go.sum ./

# 下载依赖
ENV GOPROXY=https://goproxy.cn,direct
RUN go mod download

# 复制 backend 源代码
COPY backend/ .

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o qianchuan-server ./cmd/server/main.go

# 使用更小的 alpine 镜像作为基础镜像
FROM alpine:latest

# 安装必要工具
RUN apk --no-cache add ca-certificates curl

# 创建非 root 用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# 设置工作目录
WORKDIR /app

# 从 builder 阶段复制二进制文件
COPY --from=builder /app/qianchuan-server .

# 注意：.env 通过 docker-compose volumes 挂载，不在 Dockerfile 中复制
# 这样可以在不重建镜像的情况下更新配置

# 更改文件所有者为非 root 用户
RUN chown -R appuser:appgroup /app

# 切换到非 root 用户
USER appuser

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# 启动应用
CMD ["./qianchuan-server"]
