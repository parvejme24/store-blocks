import { notFound } from "next/navigation";
import { StoreFrame } from "@/components/store/StoreFrame";
import { CheckoutForm } from "@/components/store/demo/CheckoutForm";
import { buildDemoDataset } from "@/admin/demo/dataset";
import { STORE_TEMPLATES } from "@/templates/registry";

export function generateStaticParams() {
  return STORE_TEMPLATES.map((template) => ({ theme: template.id }));
}

/** Checkout for one store theme. Delivery zones and coupons come from that theme's demo data. */
export default async function ThemeCheckoutPage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: themeId } = await params;
  const template = STORE_TEMPLATES.find((t) => t.id === themeId);
  if (!template) notFound();

  const { zones, coupons } = buildDemoDataset(template);

  return (
    <StoreFrame template={template} basePath={`/themes/${template.id}`}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-medium text-primary">Checkout</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Complete your order</h1>
        </header>
        <CheckoutForm zones={zones} coupons={coupons.filter((c) => c.active)} currency={template.samples[0]?.currency ?? "BDT"} />
      </div>
    </StoreFrame>
  );
}
