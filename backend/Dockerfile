# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy SDK first (from parent context)
COPY qianchuanSDK /qianchuanSDK

# Copy go mod files
COPY backend/go.mod backend/go.sum* ./

# Download dependencies
RUN go mod download

# Copy backend source code
COPY backend/ .

# Build application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./cmd/server

# Production stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests and curl for health check
RUN apk --no-cache add ca-certificates tzdata curl

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/server .

# Copy .env.example for reference
COPY --from=builder /app/.env.example .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost:8080/health || exit 1

CMD ["./server"]
