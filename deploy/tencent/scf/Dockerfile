# =============================================================================
# 腾讯云 SCF 云函数 - 自定义镜像 Dockerfile
# 千川SDK管理平台
# 
# 注意：SCF 自定义镜像有特殊要求
# - 必须监听 9000 端口
# - 必须在 /var/runtime 目录运行
# - 基础镜像推荐使用腾讯云官方镜像
# =============================================================================

# 构建阶段
FROM golang:1.20-alpine AS builder

WORKDIR /build

# 安装依赖
RUN apk add --no-cache ca-certificates git

# 复制 SDK
COPY oceanengineSDK /build/oceanengineSDK

# 复制 go mod 文件
COPY backend/go.mod backend/go.sum ./

# 下载依赖
ENV GOPROXY=https://goproxy.cn,direct
RUN go mod download

# 复制源码
COPY backend/ .

# 构建（SCF 需要静态编译）
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-s -w" \
    -o qianchuan-scf \
    ./cmd/server/main.go

# 运行阶段 - 使用腾讯云官方基础镜像
FROM ccr.ccs.tencentyun.com/scf-repo/runtime-go:latest

# 设置工作目录（SCF 要求）
WORKDIR /var/runtime

# 复制二进制
COPY --from=builder /build/qianchuan-scf /var/runtime/

# 复制 CA 证书
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# 设置环境变量
ENV PORT=9000
ENV GIN_MODE=release
ENV SCF_RUNTIME=true

# 暴露端口（SCF 默认 9000）
EXPOSE 9000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD curl -f http://localhost:9000/health || exit 1

# 启动命令
ENTRYPOINT ["./qianchuan-scf"]
