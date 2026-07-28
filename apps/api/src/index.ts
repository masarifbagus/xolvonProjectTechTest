import { Hono } from "hono";
import { createDb } from "./db";
import { products } from "./db/schema";
import { count } from "drizzle-orm";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Mini POS API");
});

// ─── Health Check ────────────────────────────────────────────────────
// Verifikasi koneksi DB + return jumlah produk sebagai indikator
app.get("/health", async (c) => {
  try {
    const db = createDb(c.env.DB);
    const result = await db.select({ total: count() }).from(products);

    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: {
        connected: true,
        productCount: result[0].total,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";

    return c.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        db: {
          connected: false,
          error: message,
        },
      },
      500
    );
  }
});

export default app;
