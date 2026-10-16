FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /taskflow

FROM alpine:3.20
COPY --from=builder /taskflow /taskflow

ENV PORT=8080
EXPOSE 8080
CMD ["/taskflow"]
