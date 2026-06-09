#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  Basnion · Local MySQL Setup
#  Spins up a MySQL 8 container, creates database & schema,
#  and seeds an admin user.
# ─────────────────────────────────────────────────────────────
set -euo pipefail

CONTAINER_NAME="basnion-mysql"
MYSQL_ROOT_PASSWORD="rootroot"
MYSQL_DATABASE="basnion"
MYSQL_USER="basnion"
MYSQL_PASSWORD="basnion_secret"
MYSQL_PORT="3306"
ADMIN_EMAIL="jurikju31@harbas.onion.com"
ADMIN_PASSWORD='Gatsdu^#%5627Husget39hAKuB3bf5JJS'

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log() { echo -e "${GREEN}[basnion]${NC} $*"; }
warn(){ echo -e "${YELLOW}[basnion]${NC} $*"; }
err() { echo -e "${RED}[basnion]${NC} $*" >&2; }

# ── Prereq check ───────────────────────────────────────────
command -v docker >/dev/null 2>&1 || { err "Docker tidak ditemukan. Install dulu: https://docs.docker.com/get-docker/"; exit 1; }

# ── Stop existing container if any ─────────────────────────
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  warn "Container ${CONTAINER_NAME} sudah ada — menghapus..."
  docker rm -f "${CONTAINER_NAME}" >/dev/null
fi

# ── Run MySQL ──────────────────────────────────────────────
log "Menjalankan MySQL 8 di port ${MYSQL_PORT}..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  -e MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD}" \
  -e MYSQL_DATABASE="${MYSQL_DATABASE}" \
  -e MYSQL_USER="${MYSQL_USER}" \
  -e MYSQL_PASSWORD="${MYSQL_PASSWORD}" \
  -p "${MYSQL_PORT}:3306" \
  -v basnion-mysql-data:/var/lib/mysql \
  mysql:8.0 \
  --default-authentication-plugin=mysql_native_password \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci >/dev/null

# ── Wait for MySQL to be ready ─────────────────────────────
log "Menunggu MySQL siap..."
for i in {1..60}; do
  if docker exec "${CONTAINER_NAME}" mysqladmin ping -h localhost -p"${MYSQL_ROOT_PASSWORD}" >/dev/null 2>&1; then
    log "MySQL siap!"; break
  fi
  sleep 2
  [ "$i" -eq 60 ] && { err "MySQL tidak siap setelah 120 detik"; exit 1; }
done

# ── Apply schema ───────────────────────────────────────────
log "Menerapkan schema..."
SCHEMA_FILE="$(dirname "$0")/mysql-init.sql"
if [ ! -f "${SCHEMA_FILE}" ]; then
  err "File schema tidak ditemukan: ${SCHEMA_FILE}"; exit 1
fi
docker exec -i "${CONTAINER_NAME}" mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" < "${SCHEMA_FILE}"

# ── Seed admin user ────────────────────────────────────────
log "Membuat admin user: ${ADMIN_EMAIL}"
ADMIN_ID="$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid)"
# bcrypt hash via openssl-style fallback: we store SHA-256 here for portability.
# Replace with bcrypt in your app server when verifying.
HASH="$(printf '%s' "${ADMIN_PASSWORD}" | openssl dgst -sha256 | awk '{print $2}')"
docker exec -i "${CONTAINER_NAME}" mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}" <<SQL
INSERT INTO users (id, email, password_hash, role)
VALUES ('${ADMIN_ID}', '${ADMIN_EMAIL}', 'sha256:${HASH}', 'admin')
ON DUPLICATE KEY UPDATE role='admin', password_hash=VALUES(password_hash);
SQL

cat <<EOF

${GREEN}✓ Setup selesai!${NC}

  Host     : localhost
  Port     : ${MYSQL_PORT}
  Database : ${MYSQL_DATABASE}
  User     : ${MYSQL_USER}
  Password : ${MYSQL_PASSWORD}
  Root PW  : ${MYSQL_ROOT_PASSWORD}

  Admin    : ${ADMIN_EMAIL}
  Hash     : sha256:${HASH}

  Konek dari CLI:
    docker exec -it ${CONTAINER_NAME} mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE}

EOF
