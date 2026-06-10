# syntax=docker/dockerfile:1.7
# ───── Basnion — Production Dockerfile ─────
# Multi-stage build with BuildKit cache mounts.
# Rebuilds after a code change finish in seconds because
# bun's install + Vite caches are persisted across builds.
#
# Requires BuildKit (default in Docker 23+ / Compose v2).

# ── deps ──────────────────────────────────────────────────
FROM oven/bun:1.2 AS deps
WORKDIR /app

# Only copy manifests first → this layer is cached as long as
# package.json / bun.lock don't change.
COPY package.json bun.lock* bunfig.toml* ./

RUN --mount=type=cache,target=/root/.bun/install/cache,sharing=locked \
    bun install --frozen-lockfile

# ── build ─────────────────────────────────────────────────
FROM oven/bun:1.2 AS build
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN --mount=type=cache,target=/app/node_modules/.vite,sharing=locked \
    --mount=type=cache,target=/root/.bun/install/cache,sharing=locked \
    bun run build

# ── runtime (slim) ────────────────────────────────────────
FROM oven/bun:1.2-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3618 \
    HOST=0.0.0.0

# Only ship the build output + package manifest → image stays small.
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

EXPOSE 3618
CMD ["bun", "run", ".output/server/index.mjs"]
