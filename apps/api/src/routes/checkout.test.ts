import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";
import app from "../index";
import { createDb } from "../db";
import { products, transactions } from "../db/schema";
import { eq } from "drizzle-orm";

describe("Checkout API Routes", () => {
  const setupDatabase = async () => {
    const ddl = [
      "DROP TABLE IF EXISTS transaction_items;",
      "DROP TABLE IF EXISTS transactions;",
      "DROP TABLE IF EXISTS products;",

      `CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        stock INTEGER DEFAULT 0 NOT NULL,
        is_active INTEGER DEFAULT 1 NOT NULL,
        created_at TEXT DEFAULT (datetime('now')) NOT NULL,
        updated_at TEXT DEFAULT (datetime('now')) NOT NULL
      );`,

      `CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        total INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')) NOT NULL
      );`,

      `CREATE TABLE transaction_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        transaction_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name_snapshot TEXT NOT NULL,
        price_snapshot INTEGER NOT NULL,
        qty INTEGER NOT NULL,
        subtotal INTEGER NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
        FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE NO ACTION ON DELETE NO ACTION
      );`,
    ];

    for (const stmt of ddl) {
      await env.DB.prepare(stmt).run();
    }
  };

  beforeEach(async () => {
    await setupDatabase();
  });

  it("1. Checkout ditolak jika qty item melebihi stok yang tersedia (response error & stok di DB tidak berubah)", async () => {
    const db = createDb(env.DB);
    const now = new Date().toISOString();

    // Insert 1 produk dengan stok 5
    const [inserted] = await db
      .insert(products)
      .values({
        name: "Kopi Susu",
        price: 15000,
        stock: 5,
        isActive: 1,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Kirim request checkout dengan qty 10 (melebihi stok 5)
    const response = await app.request(
      "/checkout",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: inserted.id, qty: 10 }],
        }),
      },
      env
    );

    // Verifikasi status error (400)
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty("error");
    expect((body as any).error).toMatch(/Stok produk.*tidak mencukupi/i);

    // Verifikasi stok di DB tidak berubah sama sekali (tetap 5)
    const dbProducts = await db
      .select()
      .from(products)
      .where(eq(products.id, inserted.id));

    expect(dbProducts).toHaveLength(1);
    expect(dbProducts[0].stock).toBe(5);
  });

  it("2. Total transaksi dihitung dari harga produk di database (payload tanpa field harga)", async () => {
    const db = createDb(env.DB);
    const now = new Date().toISOString();

    // Insert 2 produk ke DB
    const [p1] = await db
      .insert(products)
      .values({
        name: "Roti Bakar",
        price: 20000,
        stock: 10,
        isActive: 1,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const [p2] = await db
      .insert(products)
      .values({
        name: "Es Teh",
        price: 5000,
        stock: 10,
        isActive: 1,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Send payload TANPA field harga
    const payload = {
      items: [
        { productId: p1.id, qty: 2 },
        { productId: p2.id, qty: 3 },
      ],
    };

    const response = await app.request(
      "/checkout",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      env
    );

    expect(response.status).toBe(201);

    const body = (await response.json()) as any;

    // Total yang diharapkan: (20000 * 2) + (5000 * 3) = 40000 + 15000 = 55000
    const expectedTotal = 20000 * 2 + 5000 * 3;
    expect(body.total).toBe(expectedTotal);

    // Verifikasi transaksi yang tersimpan di DB
    const dbTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, body.id));

    expect(dbTransactions).toHaveLength(1);
    expect(dbTransactions[0].total).toBe(expectedTotal);
  });

  it("3. Snapshot harga pada transaction_items tidak berubah walau harga produk diubah setelah transaksi dibuat", async () => {
    const db = createDb(env.DB);
    const now = new Date().toISOString();

    // 1. Insert produk awal dengan harga 10000
    const [insertedProduct] = await db
      .insert(products)
      .values({
        name: "Nasi Goreng",
        price: 10000,
        stock: 20,
        isActive: 1,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // 2. Buat transaksi via POST /checkout
    const checkoutRes = await app.request(
      "/checkout",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: insertedProduct.id, qty: 2 }],
        }),
      },
      env
    );

    expect(checkoutRes.status).toBe(201);
    const createdTx = (await checkoutRes.json()) as any;

    // 3. Update harga produk via PUT /products/:id menjadi 18000
    const updateRes = await app.request(
      `/products/${insertedProduct.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: 18000,
        }),
      },
      env
    );

    expect(updateRes.status).toBe(200);

    // Verifikasi di DB bahwa harga produk terkini sudah berubah menjadi 18000
    const updatedDbProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, insertedProduct.id));
    expect(updatedDbProduct[0].price).toBe(18000);

    // 4. Ambil ulang detail transaksi lama via GET /transactions/:id
    const txDetailRes = await app.request(
      `/transactions/${createdTx.id}`,
      {
        method: "GET",
      },
      env
    );

    expect(txDetailRes.status).toBe(200);
    const txDetail = (await txDetailRes.json()) as any;

    // Pastikan priceSnapshot pada item transaksi LAMA tetap 10000 (tidak berubah)
    expect(txDetail.items).toHaveLength(1);
    expect(txDetail.items[0].priceSnapshot).toBe(10000);
  });
});
