# Multi-stage production build for Onuvuti Go Backend
# Stage 1: Build binary
FROM golang:1.24-alpine AS builder

WORKDIR /build

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates tzdata

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Compile optimized static linux binary without debugging symbols
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o /build/onuvuti-server \
    ./cmd/server

# Stage 2: Minimal hardened production image
FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata wget \
    && addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /build/onuvuti-server /app/onuvuti-server
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

USER appuser

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8081/api/v1/health || exit 1

ENTRYPOINT ["/app/onuvuti-server"]

