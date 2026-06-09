# 🐬 Basnion — Local MySQL Setup

Project utama Basnion menggunakan **Lovable Cloud (Supabase / Postgres)**.
Untuk kebutuhan **lokal / development / mirror data**, disediakan setup MySQL via bash script.

---

## 1. Quick start

```bash
chmod +x scripts/setup-mysql.sh
./scripts/setup-mysql.sh
```

Script ini akan:

1. Menjalankan container `mysql:8.0` bernama `basnion-mysql` di port `3306`.
2. Membuat database `basnion`.
3. Menerapkan schema dari `scripts/mysql-init.sql` (`gallery_items`, `programs`, `site_settings`, `users`).
4. Seed admin user `jurikju31@harbas.onion.com`.

---

## 2. Default credentials

| Field        | Value                                  |
| ------------ | -------------------------------------- |
| Host         | `localhost`                            |
| Port         | `3306`                                 |
| Database     | `basnion`                              |
| User         | `basnion`                              |
| Password     | `basnion_secret`                       |
| Root PW      | `rootroot`                             |
| Admin email  | `jurikju31@harbas.onion.com`           |
| Admin PW     | `Gatsdu^#%5627Husget39hAKuB3bf5JJS`    |

> ⚠️ Wajib diganti sebelum deploy ke production. Edit `scripts/setup-mysql.sh`.

---

## 3. Konek dari aplikasi

Tambah ke `.env`:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=basnion
MYSQL_USER=basnion
MYSQL_PASSWORD=basnion_secret
```

Connection string siap pakai:

```
mysql://basnion:basnion_secret@localhost:3306/basnion
```

---

## 4. Konek manual

```bash
# via Docker CLI
docker exec -it basnion-mysql mysql -ubasnion -pbasnion_secret basnion

# via host CLI (butuh mysql-client)
mysql -h 127.0.0.1 -P 3306 -ubasnion -pbasnion_secret basnion
```

---

## 5. Reset / hapus

```bash
docker rm -f basnion-mysql
docker volume rm basnion-mysql-data
```

Jalankan ulang `./scripts/setup-mysql.sh` untuk fresh install.

---

## 6. Schema overview

| Tabel           | Fungsi                                                   |
| --------------- | -------------------------------------------------------- |
| `gallery_items` | Daftar gambar gallery landing page                       |
| `programs`      | Program kerja / event Basnion                            |
| `site_settings` | Konten dinamis landing (key/value JSON)                  |
| `users`         | Akun lokal + role (`admin` / `member`)                   |

Schema lengkap: lihat `scripts/mysql-init.sql`.
