import { notFound } from "next/navigation";
import { StoreFrame } from "@/components/store/StoreFrame";
import { ProductDetail } from "@/components/store/demo/ProductDetail";
import { getCatalog } from "@/lib/catalog";
import { getProductDetail } from "@/templates/demo/details";
import { STORE_TEMPLATES } from "@/templates/registry";

export function generateStaticParams() {
  return STORE_TEMPLATES.flatMap((template) => template.samples.map((product) => ({ theme: template.id, slug: product.slug })));
}

/** Product details for one store theme: brand, description, highlights and related products. */
export default async function ThemeProductPage({
  params
}: {
  params: Promise<{ theme: string; slug: string }>;
}) {
  const { theme: themeId, slug } = await params;
  const template = STORE_TEMPLATES.find((t) => t.id === themeId);
  if (!template) notFound();

  const catalog = await getCatalog(24);
  const all = catalog.length > 0 ? catalog : template.samples;
  const product = all.find((p) => p.slug === slug) ?? template.samples.find((p) => p.slug === slug);
  if (!product) notFound();

  const sameCategory = all.filter((p) => p.id !== product.id && p.category === product.category);
  const related = (sameCategory.length > 0 ? sameCategory : all.filter((p) => p.id !== product.id)).slice(0, 4);

  return (
    <StoreFrame template={template} basePath={`/themes/${template.id}`}>
      <ProductDetail product={product} details={getProductDetail(template.id, product.id)} related={related} />
    </StoreFrame>
  );
}
