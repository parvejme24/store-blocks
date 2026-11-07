import type { TemplateProduct } from "@/templates/types";

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  priceMinor: number;
  currency: string;
  stock?: number;
  rating?: number;
  categoryIds?: string[];
  images?: { key: string; alt?: string }[];
};

/**
 * Products from the API, mapped to the template product shape.
 * Returns [] when the API is unreachable, so pages fall back to template samples.
 */
export async function getCatalog(limit = 8): Promise<TemplateProduct[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  try {
    const res = await fetch(`${apiUrl}/api/products?limit=${limit}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    const body: { data?: ApiProduct[] } = await res.json();
    return (body.data ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      priceMinor: product.priceMinor,
      currency: product.currency,
      stock: product.stock,
      rating: product.rating,
      category: product.categoryIds?.[0],
      imageUrl: product.images?.[0]?.key,
      imageAlt: product.images?.[0]?.alt ?? product.name
    }));
  } catch {
    return [];
  }
}
