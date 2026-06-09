-- Basnion local MySQL schema
-- Auto-loaded by docker-compose when MySQL container first starts.

CREATE DATABASE IF NOT EXISTS basnion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE basnion;

CREATE TABLE IF NOT EXISTS gallery_items (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  title         VARCHAR(255)  NOT NULL,
  description   TEXT          NULL,
  image_url     TEXT          NOT NULL,
  sort_order    INT           NOT NULL DEFAULT 0,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS programs (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  title         VARCHAR(255)  NOT NULL,
  description   TEXT          NOT NULL,
  icon          VARCHAR(64)   NULL,
  event_date    DATE          NULL,
  sort_order    INT           NOT NULL DEFAULT 0,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS site_settings (
  `key`        VARCHAR(64)   NOT NULL PRIMARY KEY,
  `value`      JSON          NOT NULL,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('admin','member') NOT NULL DEFAULT 'member',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
