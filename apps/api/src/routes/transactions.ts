import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { createDb } from "../db";
import { transactions, transactionItems } from "../db/schema";

type Bindings = {
  DB: D1Database;
};

const transactionsRoute = new Hono<{ Bindings: Bindings }>();

// ─── GET /transactions ───────────────────────────────────────────────
// List semua transaksi, urutkan terbaru dulu, return id, total, createdAt
transactionsRoute.get("/", async (c) => {
  const db = createDb(c.env.DB);

  const list = await db
    .select({
      id: transactions.id,
      total: transactions.total,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .orderBy(desc(transactions.createdAt), desc(transactions.id));

  return c.json(list);
});

// ─── GET /transactions/:id ───────────────────────────────────────────
// Detail satu transaksi: id, total, createdAt, dan list items. Return 404 jika tidak ditemukan.
transactionsRoute.get("/:id", async (c) => {
  const paramId = c.req.param("id");
  const transactionId = parseInt(paramId, 10);

  if (isNaN(transactionId) || transactionId <= 0) {
    return c.json({ error: "Transaksi tidak ditemukan" }, 404);
  }

  const db = createDb(c.env.DB);

  // Ambil header transaksi
  const txRows = await db
    .select({
      id: transactions.id,
      total: transactions.total,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .limit(1);

  if (txRows.length === 0) {
    return c.json({ error: "Transaksi tidak ditemukan" }, 404);
  }

  const tx = txRows[0];

  // Ambil item transaksi dengan data snapshot
  const items = await db
    .select({
      id: transactionItems.id,
      productId: transactionItems.productId,
      productNameSnapshot: transactionItems.productNameSnapshot,
      priceSnapshot: transactionItems.priceSnapshot,
      qty: transactionItems.qty,
      subtotal: transactionItems.subtotal,
    })
    .from(transactionItems)
    .where(eq(transactionItems.transactionId, transactionId));

  return c.json({
    id: tx.id,
    total: tx.total,
    createdAt: tx.createdAt,
    items,
  });
});

export default transactionsRoute;
