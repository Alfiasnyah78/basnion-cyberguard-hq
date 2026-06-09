# ───── Basnion — Production Dockerfile ─────
# Multi-stage build for the TanStack Start app

FROM oven/bun:1.1 AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.1 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN bun run build

FROM oven/bun:1.1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3618
ENV HOST=0.0.0.0

# Copy build output + minimal runtime files
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

EXPOSE 3618
CMD ["bun", "run", ".output/server/index.mjs"]
