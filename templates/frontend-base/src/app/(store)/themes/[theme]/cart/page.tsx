import { notFound } from "next/navigation";
import { StoreFrame } from "@/components/store/StoreFrame";
import { CartView } from "@/components/store/demo/CartView";
import { buildDemoDataset } from "@/admin/demo/dataset";
import { STORE_TEMPLATES } from "@/templates/registry";

export function generateStaticParams() {
  return STORE_TEMPLATES.map((template) => ({ theme: template.id }));
}

/** Shopping cart for one store theme. Lines are kept in this browser. */
export default async function ThemeCartPage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: themeId } = await params;
  const template = STORE_TEMPLATES.find((t) => t.id === themeId);
  if (!template) notFound();

  const { zones } = buildDemoDataset(template);

  return (
    <StoreFrame template={template} basePath={`/themes/${template.id}`}>
      <CartView zones={zones} currency={template.samples[0]?.currency ?? "BDT"} />
    </StoreFrame>
  );
}
