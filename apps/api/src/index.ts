import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "./db";
import { products } from "./db/schema";
import { count } from "drizzle-orm";
import productsRoute from "./routes/products";
import checkoutRoute from "./routes/checkout";
import transactionsRoute from "./routes/transactions";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// ─── CORS ────────────────────────────────────────────────────────────
// Izinkan akses dari Next.js dev server & domain Cloudflare Pages
app.use(
  "/*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (
        origin === "http://localhost:3000" ||
        origin.endsWith(".pages.dev")
      ) {
        return origin;
      }
      return "*";
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

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

// ─── Routes ──────────────────────────────────────────────────────────
app.route("/products", productsRoute);
app.route("/checkout", checkoutRoute);
app.route("/transactions", transactionsRoute);

export default app;
