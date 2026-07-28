import { redirect } from "next/navigation";

/**
 * /products route — redirects ke halaman utama '/'
 * Halaman produk sudah ditampilkan di root page.
 */
export default function ProductsRedirect() {
  redirect("/");
}
