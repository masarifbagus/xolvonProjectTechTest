import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { createDb } from "../db";
import { products, transactions, transactionItems } from "../db/schema";

type Bindings = {
  DB: D1Database;
};

// ─── Types ───────────────────────────────────────────────────────────

interface CheckoutItem {
  productId: number;
  qty: number;
}

interface CheckoutRequestBody {
  items: CheckoutItem[];
}

interface ProductRow {
  id: number;
  name: string;
  price: number;
  stock: number;
  isActive: number;
}

// ─── Route ───────────────────────────────────────────────────────────

const checkoutRoute = new Hono<{ Bindings: Bindings }>();

// ─── POST /checkout ──────────────────────────────────────────────────
// Proses checkout: validasi server-side, harga dari DB, stok atomik
checkoutRoute.post("/", async (c) => {
  // 1. Parse request body
  let body: CheckoutRequestBody;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Request body harus berupa JSON yang valid" }, 400);
  }

  // 2. Validasi struktur request
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return c.json(
      { error: "items harus berupa array yang tidak kosong" },
      400
    );
  }

  // Validasi setiap item di array
  for (const item of body.items) {
    if (
      typeof item.productId !== "number" ||
      !Number.isInteger(item.productId) ||
      item.productId <= 0
    ) {
      return c.json(
        { error: "productId harus berupa integer positif" },
        400
      );
    }

    if (
      typeof item.qty !== "number" ||
      !Number.isInteger(item.qty) ||
      item.qty <= 0
    ) {
      return c.json(
        {
          error: `qty harus berupa integer > 0 (productId: ${item.productId})`,
        },
        400
      );
    }
  }

  // Cek duplikat productId — gabungkan qty jika ada duplikat
  const mergedItems = new Map<number, number>();
  for (const item of body.items) {
    const existing = mergedItems.get(item.productId) ?? 0;
    mergedItems.set(item.productId, existing + item.qty);
  }

  const db = createDb(c.env.DB);

  // 3. Ambil data produk TERKINI dari database
  const productIds = Array.from(mergedItems.keys());
  const productRows: ProductRow[] = [];

  for (const pid of productIds) {
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.id, pid))
      .limit(1);

    if (rows.length === 0) {
      return c.json(
        { error: `Produk dengan id ${pid} tidak ditemukan` },
        400
      );
    }

    productRows.push(rows[0] as ProductRow);
  }

  // 4. Validasi produk: isActive, stok cukup
  const lineItems: Array<{
    product: ProductRow;
    qty: number;
    subtotal: number;
  }> = [];

  let total = 0;

  for (const product of productRows) {
    const qty = mergedItems.get(product.id)!;

    // Cek apakah produk aktif
    if (!product.isActive) {
      return c.json(
        {
          error: `Produk "${product.name}" (id: ${product.id}) tidak aktif dan tidak bisa dibeli`,
        },
        400
      );
    }

    // Cek stok cukup
    if (qty > product.stock) {
      return c.json(
        {
          error: `Stok produk "${product.name}" (id: ${product.id}) tidak mencukupi. Diminta: ${qty}, tersedia: ${product.stock}`,
        },
        400
      );
    }

    const subtotal = product.price * qty;
    total += subtotal;

    lineItems.push({ product, qty, subtotal });
  }

  // 5. Insert transaksi untuk mendapatkan ID
  //    (dilakukan terpisah karena db.batch() tidak bisa return hasil antar-step)
  const now = new Date().toISOString();

  const [txRow] = await db
    .insert(transactions)
    .values({ total, createdAt: now })
    .returning();

  const transactionId = txRow.id;

  // 6. Batch: insert items + kurangi stok (ATOMIK)
  //    Stok dikurangi dengan kondisi WHERE stock >= qty untuk mencegah stok negatif
  //    jika ada race condition. Jika update menghasilkan 0 rows affected,
  //    artinya stok sudah berubah sejak validasi di atas.
  try {
    const batchOps: Parameters<typeof db.batch>[0] = [];

    for (const item of lineItems) {
      // Insert transaction item dengan snapshot data
      batchOps.push(
        db.insert(transactionItems).values({
          transactionId,
          productId: item.product.id,
          productNameSnapshot: item.product.name,
          priceSnapshot: item.product.price,
          qty: item.qty,
          subtotal: item.subtotal,
        })
      );

      // Kurangi stok dengan guard: WHERE stock >= qty
      // Ini memastikan stok TIDAK PERNAH jadi negatif
      batchOps.push(
        db
          .update(products)
          .set({
            stock: sql`${products.stock} - ${item.qty}`,
            updatedAt: now,
          })
          .where(
            sql`${products.id} = ${item.product.id} AND ${products.stock} >= ${item.qty}`
          )
      );
    }

    const batchResults = await db.batch(batchOps as any);

    // 7. Verifikasi: pastikan SEMUA stock update berhasil
    //    Untuk setiap item, hasil update stok ada di index ganjil (1, 3, 5, ...)
    //    Jika rowsWritten === 0, berarti race condition terjadi
    for (let i = 0; i < lineItems.length; i++) {
      const updateResult = batchResults[i * 2 + 1] as any;

      // D1 batch update result: cek apakah ada rows yang terpengaruh
      // Drizzle D1 update result bisa berupa object dengan rowsAffected / changes
      const rowsAffected =
        updateResult?.rowsAffected ??
        updateResult?.changes ??
        updateResult?.meta?.changes ??
        (Array.isArray(updateResult) ? updateResult.length : undefined);

      if (rowsAffected === 0) {
        // Race condition terdeteksi — stok sudah berubah
        // Karena D1 batch bersifat atomik (all-or-nothing),
        // jika satu statement gagal maka SEMUA dibatalkan.
        // Namun, WHERE clause yang tidak match bukanlah "error" —
        // batch tetap sukses tapi 0 rows affected.
        //
        // Kompensasi: hapus transaksi yang sudah dibuat + restore stok
        // yang mungkin terkurangi dari item sebelumnya dalam batch
        await rollbackTransaction(db, transactionId, lineItems, i);

        const failedItem = lineItems[i];
        return c.json(
          {
            error: `Gagal checkout: stok produk "${failedItem.product.name}" (id: ${failedItem.product.id}) telah berubah (race condition). Silakan coba lagi.`,
          },
          409
        );
      }
    }
  } catch (batchError) {
    // Jika batch gagal total, D1 otomatis rollback semua statement dalam batch.
    // Tapi transaksi header sudah di-insert sebelumnya, perlu dibersihkan.
    await cleanupTransactionHeader(db, transactionId);

    throw batchError;
  }

  // 8. Success — return ringkasan transaksi
  return c.json(
    {
      id: transactionId,
      total,
      items: lineItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        qty: item.qty,
        price: item.product.price,
        subtotal: item.subtotal,
      })),
      createdAt: now,
    },
    201
  );
});

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Rollback: hapus transaksi header, items yang sudah ter-insert,
 * dan restore stok yang sudah terkurangi.
 *
 * Dipanggil ketika race condition terdeteksi setelah batch.
 */
async function rollbackTransaction(
  db: ReturnType<typeof createDb>,
  transactionId: number,
  lineItems: Array<{ product: ProductRow; qty: number; subtotal: number }>,
  failedAtIndex: number
) {
  const rollbackOps: any[] = [];

  // Restore stok untuk item yang BERHASIL di-update (sebelum index yang gagal)
  for (let j = 0; j < failedAtIndex; j++) {
    rollbackOps.push(
      db
        .update(products)
        .set({
          stock: sql`${products.stock} + ${lineItems[j].qty}`,
        })
        .where(eq(products.id, lineItems[j].product.id))
    );
  }

  // Hapus transaction items yang sudah ter-insert
  rollbackOps.push(
    db
      .delete(transactionItems)
      .where(eq(transactionItems.transactionId, transactionId))
  );

  // Hapus transaction header
  rollbackOps.push(
    db.delete(transactions).where(eq(transactions.id, transactionId))
  );

  if (rollbackOps.length > 0) {
    await db.batch(rollbackOps as any);
  }
}

/**
 * Cleanup: hapus transaksi header yang sudah dibuat
 * jika batch gagal sepenuhnya (exception).
 */
async function cleanupTransactionHeader(
  db: ReturnType<typeof createDb>,
  transactionId: number
) {
  try {
    await db.delete(transactions).where(eq(transactions.id, transactionId));
  } catch {
    // Best effort cleanup — jangan throw lagi
    console.error(
      `Gagal cleanup transaksi header id=${transactionId}`
    );
  }
}

export default checkoutRoute;
