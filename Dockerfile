FROM oven/bun:1.3.14-slim AS base

FROM base AS builder

WORKDIR /app

COPY package.json bun.lock .
RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
RUN bun run build

FROM base AS production

WORKDIR /app
COPY --from=builder /app/dist .
COPY --from=builder /app/public ./public
CMD ["bun", "index.js"]
