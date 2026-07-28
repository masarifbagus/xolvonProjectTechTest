-- Seed data: 5 contoh produk untuk testing manual Mini POS
INSERT INTO products (name, price, stock, is_active, created_at, updated_at) VALUES
  ('Kopi Hitam',          8000,  50, 1, datetime('now'), datetime('now')),
  ('Teh Manis',           5000,  80, 1, datetime('now'), datetime('now')),
  ('Nasi Goreng Spesial', 25000, 30, 1, datetime('now'), datetime('now')),
  ('Roti Bakar Coklat',   12000, 40, 1, datetime('now'), datetime('now')),
  ('Es Jeruk Segar',      7000,  60, 1, datetime('now'), datetime('now'));
