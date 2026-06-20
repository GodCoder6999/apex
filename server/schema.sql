-- Apex Electronics — MySQL schema for Hostinger.
-- Import via phpMyAdmin (Hostinger → Databases → phpMyAdmin → Import) or CLI.
-- Money columns are DECIMAL(12,2) ₹. Timestamps are epoch-milliseconds BIGINT
-- to match the web app's data shapes exactly (src/data/types.ts).

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id            TINYINT      NOT NULL DEFAULT 1,
  name          VARCHAR(160) NOT NULL DEFAULT '',
  address       VARCHAR(400) NOT NULL DEFAULT '',
  gstin         VARCHAR(20)  NOT NULL DEFAULT '',
  state         VARCHAR(80)  NOT NULL DEFAULT '',
  logo          LONGTEXT     NULL,
  phone         VARCHAR(40)  NOT NULL DEFAULT '',
  invoice_prefix VARCHAR(16) NOT NULL DEFAULT 'APX',
  tax_default   DECIMAL(5,2) NOT NULL DEFAULT 18,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id      VARCHAR(40)  NOT NULL,
  name    VARCHAR(120) NOT NULL,
  active  TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id          VARCHAR(40)   NOT NULL,
  name        VARCHAR(200)  NOT NULL,
  category_id VARCHAR(40)   NOT NULL,
  barcode     VARCHAR(64)   NULL,
  price       DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost_price  DECIMAL(12,2) NOT NULL DEFAULT 0,
  gst_rate    DECIMAL(5,2)  NOT NULL DEFAULT 18,
  hsn         VARCHAR(20)   NULL,
  brand       VARCHAR(120)  NULL,
  specs       VARCHAR(500)  NULL,
  image       LONGTEXT      NULL,
  active      TINYINT(1)    NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_products_category (category_id),
  KEY idx_products_barcode (barcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS units (
  id            VARCHAR(40)   NOT NULL,
  product_id    VARCHAR(40)   NOT NULL,
  serial        VARCHAR(120)  NOT NULL,
  cost_price    DECIMAL(12,2) NOT NULL DEFAULT 0,
  status        ENUM('in_storage','with_seller','sold','returned') NOT NULL DEFAULT 'in_storage',
  held_by       VARCHAR(40)   NULL,
  sold_order_id VARCHAR(40)   NULL,
  added_at      BIGINT        NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_units_serial (serial),
  KEY idx_units_product (product_id),
  KEY idx_units_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS customers (
  id      VARCHAR(40)  NOT NULL,
  name    VARCHAR(160) NOT NULL,
  phone   VARCHAR(40)  NOT NULL,
  address VARCHAR(400) NULL,
  gstin   VARCHAR(20)  NULL,
  PRIMARY KEY (id),
  KEY idx_customers_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sellers (
  id       VARCHAR(40)  NOT NULL,
  name     VARCHAR(160) NOT NULL,
  phone    VARCHAR(40)  NOT NULL,
  email    VARCHAR(160) NULL,
  password VARCHAR(255) NULL,  -- store a bcrypt hash in production (see API note)
  active   TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sellers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id             VARCHAR(40)   NOT NULL,
  invoice_no     VARCHAR(60)   NOT NULL,
  customer_id    VARCHAR(40)   NULL,
  lines          JSON          NOT NULL,
  sub_total      DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_total      DECIMAL(12,2) NOT NULL DEFAULT 0,
  grand_total    DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid_now       DECIMAL(12,2) NOT NULL DEFAULT 0,
  due            DECIMAL(12,2) NOT NULL DEFAULT 0,
  sold_by        VARCHAR(40)   NOT NULL DEFAULT 'owner',
  method         ENUM('cash','online','split') NOT NULL DEFAULT 'cash',
  created_at     BIGINT        NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_invoice (invoice_no),
  KEY idx_orders_customer (customer_id),
  KEY idx_orders_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  id           VARCHAR(40)   NOT NULL,
  customer_id  VARCHAR(40)   NULL,
  order_id     VARCHAR(40)   NULL,
  amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
  method       ENUM('cash','online','split') NOT NULL DEFAULT 'cash',
  collected_by VARCHAR(40)   NOT NULL DEFAULT 'owner',
  for_due      TINYINT(1)    NOT NULL DEFAULT 0,
  at           BIGINT        NOT NULL,
  PRIMARY KEY (id),
  KEY idx_payments_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS enquiries (
  id          VARCHAR(40)  NOT NULL,
  customer_id VARCHAR(40)  NULL,
  name        VARCHAR(160) NOT NULL,
  phone       VARCHAR(40)  NULL,
  items       JSON         NOT NULL,
  note        VARCHAR(600) NULL,
  status      ENUM('open','quoted','converted','lost') NOT NULL DEFAULT 'open',
  created_at  BIGINT       NOT NULL,
  PRIMARY KEY (id),
  KEY idx_enquiries_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Atomic invoice-number sequence (GST-compliant numbering).
CREATE TABLE IF NOT EXISTS counters (
  name  VARCHAR(40) NOT NULL,
  value INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO settings (id, name, address, gstin, state, phone, invoice_prefix, tax_default)
VALUES (1, 'Apex Electronics', '14 Lindsay Street, New Market, Kolkata 700087',
        '19ABCDE1234F1Z5', 'West Bengal', '+91 98300 11223', 'APX', 18)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO counters (name, value) VALUES ('invoice', 38)
ON DUPLICATE KEY UPDATE name = name;
