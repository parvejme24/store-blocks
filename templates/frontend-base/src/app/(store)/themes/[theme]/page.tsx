import { notFound } from "next/navigation";
import { StoreFrame } from "@/components/store/StoreFrame";
import { getCatalog } from "@/lib/catalog";
import { STORE_TEMPLATES } from "@/templates/registry";

export function generateStaticParams() {
  return STORE_TEMPLATES.map((template) => ({ theme: template.id }));
}

/** A complete website for one store theme: its own home page and catalogue. */
export default async function ThemeHomePage({
  params
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme: themeId } = await params;
  const template = STORE_TEMPLATES.find((t) => t.id === themeId);
  if (!template) notFound();

  const base = `/themes/${template.id}`;
  const catalog = await getCatalog();
  const products = catalog.length > 0 ? catalog : template.samples;

  return (
    <StoreFrame template={template} basePath={base}>
      <template.Home products={products} shopHref={`${base}/products`} />
    </StoreFrame>
  );
}
