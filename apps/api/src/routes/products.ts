import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "../db";
import { products } from "../db/schema";

type Bindings = {
  DB: D1Database;
};

const productsRoute = new Hono<{ Bindings: Bindings }>();

// ─── Helpers ─────────────────────────────────────────────────────────

/** Validasi input produk (POST & PUT). Return pesan error atau null jika valid. */
function validateProductInput(
  body: Record<string, unknown>,
  isPartial: boolean
): string | null {
  const { name, price, stock } = body;

  // --- name ---
  if (!isPartial || name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      return "name harus berupa string yang tidak kosong";
    }
  }

  // --- price ---
  if (!isPartial || price !== undefined) {
    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
      return "price harus berupa angka >= 0";
    }
    if (!Number.isInteger(price)) {
      return "price harus berupa integer (bilangan bulat)";
    }
  }

  // --- stock ---
  if (!isPartial || stock !== undefined) {
    if (typeof stock !== "number" || !Number.isFinite(stock) || stock < 0) {
      return "stock harus berupa angka integer >= 0";
    }
    if (!Number.isInteger(stock)) {
      return "stock harus berupa integer (bilangan bulat)";
    }
  }

  return null;
}

// ─── GET /products ───────────────────────────────────────────────────
// Return semua produk termasuk yang nonaktif (untuk halaman manajemen)
productsRoute.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const allProducts = await db.select().from(products);

  return c.json(allProducts);
});

// ─── POST /products ──────────────────────────────────────────────────
// Buat produk baru
productsRoute.post("/", async (c) => {
  let body: Record<string, unknown>;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Request body harus berupa JSON yang valid" }, 400);
  }

  // Validasi: semua field wajib ada
  if (body.name === undefined || body.price === undefined || body.stock === undefined) {
    return c.json(
      { error: "Field name, price, dan stock wajib diisi" },
      400
    );
  }

  const validationError = validateProductInput(body, false);
  if (validationError) {
    return c.json({ error: validationError }, 400);
  }

  const db = createDb(c.env.DB);
  const now = new Date().toISOString();

  const result = await db
    .insert(products)
    .values({
      name: (body.name as string).trim(),
      price: body.price as number,
      stock: body.stock as number,
      isActive: 1,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return c.json(result[0], 201);
});

// ─── PUT /products/:id ──────────────────────────────────────────────
// Update produk berdasarkan id (partial update diperbolehkan)
productsRoute.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: "ID produk tidak valid" }, 400);
  }

  let body: Record<string, unknown>;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Request body harus berupa JSON yang valid" }, 400);
  }

  // Minimal satu field harus diupdate
  const { name, price, stock } = body;
  if (name === undefined && price === undefined && stock === undefined) {
    return c.json(
      { error: "Minimal satu field (name, price, stock) harus diisi" },
      400
    );
  }

  const validationError = validateProductInput(body, true);
  if (validationError) {
    return c.json({ error: validationError }, 400);
  }

  const db = createDb(c.env.DB);

  // Cek apakah produk ada
  const existing = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ error: "Produk tidak ditemukan" }, 404);
  }

  // Build update values
  const updateValues: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (name !== undefined) updateValues.name = (name as string).trim();
  if (price !== undefined) updateValues.price = price;
  if (stock !== undefined) updateValues.stock = stock;

  const result = await db
    .update(products)
    .set(updateValues)
    .where(eq(products.id, id))
    .returning();

  return c.json(result[0]);
});

// ─── PATCH /products/:id/status ─────────────────────────────────────
// Toggle status aktif/nonaktif produk
productsRoute.patch("/:id/status", async (c) => {
  const id = Number(c.req.param("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: "ID produk tidak valid" }, 400);
  }

  let body: Record<string, unknown>;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Request body harus berupa JSON yang valid" }, 400);
  }

  if (typeof body.isActive !== "boolean") {
    return c.json(
      { error: "isActive harus berupa boolean (true/false)" },
      400
    );
  }

  const db = createDb(c.env.DB);

  // Cek apakah produk ada
  const existing = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ error: "Produk tidak ditemukan" }, 404);
  }

  const result = await db
    .update(products)
    .set({
      isActive: body.isActive ? 1 : 0,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(products.id, id))
    .returning();

  return c.json(result[0]);
});

export default productsRoute;
