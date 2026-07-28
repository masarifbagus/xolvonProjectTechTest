<<<<<<< HEAD
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "./db";
import { products } from "./db/schema";
import { count } from "drizzle-orm";
import productsRoute from "./routes/products";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// ─── CORS ────────────────────────────────────────────────────────────
// Izinkan akses dari Next.js dev server & domain Cloudflare Pages
app.use(
  "/*",
  cors({
    origin: [
      "http://localhost:3000",
      "https://*.pages.dev",
    ],
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

export default app;
=======
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
>>>>>>> 3bbd456799f29bafd319c37953ee6f73cdc4cdcf
