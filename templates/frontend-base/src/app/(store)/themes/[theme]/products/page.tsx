import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreFrame } from "@/components/store/StoreFrame";
import { getCatalog } from "@/lib/catalog";
import { STORE_TEMPLATES } from "@/templates/registry";

export function generateStaticParams() {
  return STORE_TEMPLATES.map((template) => ({ theme: template.id }));
}

/** Catalogue for one store theme, with category filter chips. */
export default async function ThemeProductsPage({
  params,
  searchParams
}: {
  params: Promise<{ theme: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { theme: themeId } = await params;
  const { category } = await searchParams;
  const template = STORE_TEMPLATES.find((t) => t.id === themeId);
  if (!template) notFound();

  const base = `/themes/${template.id}`;
  const catalog = await getCatalog(24);
  const all = catalog.length > 0 ? catalog : template.samples;
  const categories = ["All", ...Array.from(new Set(all.map((p) => p.category).filter((c): c is string => Boolean(c))))];
  const selected = category && categories.includes(category) ? category : "All";
  const products = selected === "All" ? all : all.filter((p) => p.category === selected);

  return (
    <StoreFrame template={template} basePath={base}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm font-medium text-primary">{template.name}</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {selected === "All" ? "All products" : selected}
          </h1>
          <p className="text-muted-foreground">
            Showing {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </header>

        <nav aria-label="Categories" className="mt-8 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = cat === selected;
            const href = cat === "All" ? `${base}/products` : `${base}/products?category=${encodeURIComponent(cat)}`;
            return (
              <Link
                key={cat}
                href={href}
                aria-current={isSelected ? "page" : undefined}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-6 py-20 text-center text-muted-foreground">
              No products in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </StoreFrame>
  );
}
