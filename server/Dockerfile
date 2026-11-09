FROM golang:1.25-alpine AS builder

WORKDIR /app

# Dependencies first: this layer is reused until go.mod or go.sum change
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Source, then build. The cache mounts keep Go's module cache and compiled
# packages between builds, so only the code you changed is recompiled.
COPY . .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /taskflow .

FROM alpine:3.20
COPY --from=builder /taskflow /taskflow

ENV PORT=8080
EXPOSE 8080
CMD ["/taskflow"]