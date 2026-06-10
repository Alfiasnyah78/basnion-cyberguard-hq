# 🐳 Basnion — Docker Deployment

Jalankan **Basnion** secara lokal atau di server pakai Docker.
Web akan tersedia di **http://localhost:3618**.

---

## 1. Prerequisites

- Docker ≥ 24.x
- Docker Compose ≥ v2
- File `.env` di root project berisi kredensial Supabase (sudah ada — jangan commit ke Git)

---

## 2. Build & Run (single command)

```bash
# WAJIB: aktifkan BuildKit (auto pada Docker 23+ / Compose v2)
DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 \
  docker compose up -d --build
```

> ⚡ **Speed tips** (build pertama tetap ~2–4 menit, rebuild < 30 detik):
> - Dockerfile sudah pakai **BuildKit cache mounts** untuk `bun install` & Vite — rebuild setelah ubah kode hanya re-run step `build`, bukan re-install dependency.
> - `.dockerignore` sudah exclude `node_modules`, `.output`, `.git`, `docs/` — context transfer ke Docker daemon jadi kecil.
> - Multi-stage: image final hanya berisi `.output` (≈ 80 MB), bukan full `node_modules`.
> - Kalau build masih lama, cek: `docker buildx du` (cache usage) dan `docker system prune -f` (bersihkan layer lama yang nyangkut).
> - **Tanpa BuildKit** (Docker lama), cache mounts diabaikan → build akan jauh lebih lambat. Upgrade Docker ke v23+.

Container yang dijalankan:

| Container        | Port  | Deskripsi                                  |
| ---------------- | ----- | ------------------------------------------ |
| `basnion-web`    | 3618  | TanStack Start app (production build)      |
| `basnion-mysql`  | 3306  | MySQL 8 local database (opsional)          |

Cek log:
```bash
docker compose logs -f web
docker compose logs -f db
```

---

## 3. Akses

- **Landing page** → http://localhost:3618
- **Admin login**  → http://localhost:3618/Hosu35Hioasss
- **MySQL CLI**    → `docker exec -it basnion-mysql mysql -ubasnion -pbasnion_secret basnion`

---

## 4. Stop / Restart / Reset

```bash
docker compose down              # stop
docker compose down -v           # stop + hapus data MySQL
docker compose restart web       # restart web saja
docker compose up -d --build web # rebuild web setelah edit kode
```

---

## 5. Build manual (tanpa compose)

```bash
docker build -t basnion-web .
docker run -d --name basnion -p 3618:3618 \
  --env-file .env \
  basnion-web
```

---

## 6. Production tips

- Ganti `MYSQL_ROOT_PASSWORD` dan `MYSQL_PASSWORD` di `docker-compose.yml` sebelum deploy.
- Pasang reverse-proxy (Nginx / Caddy / Traefik) di depan port `3618` untuk TLS.
- Mount volume `basnion-mysql-data` ke storage persisten (EBS / Persistent Disk).
- Set `restart: unless-stopped` (sudah aktif) supaya container auto-recover.

---

## 7. Troubleshooting

| Gejala                                | Solusi                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------- |
| Port 3618 sudah dipakai               | Ubah mapping `"3618:3618"` di `docker-compose.yml` jadi `"8080:3618"`. |
| MySQL `Access denied`                 | `docker compose down -v` lalu rebuild ulang.                           |
| Web 500 saat akses Supabase           | Cek `.env`, pastikan `VITE_SUPABASE_*` dan `SUPABASE_*` terisi.        |
| Container `basnion-web` keluar exit 1 | `docker compose logs web` → cek stack trace build.                     |
