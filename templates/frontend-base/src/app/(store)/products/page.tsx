import { getCatalog } from "@/lib/catalog";
import { ProductsView } from "@/components/store/ProductsView";

/** Catalogue page. Shows only products from the API. */
export default async function ProductsPage() {
  const catalog = await getCatalog(100);
  const products = catalog.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    priceMinor: product.priceMinor,
    currency: product.currency,
    category: product.category ?? "Uncategorised",
    stock: product.stock ?? 0
  }));

  return <ProductsView products={products} />;
}
