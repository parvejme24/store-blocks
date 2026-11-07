import Link from "next/link";
import { ArrowRight, Plug, Settings } from "lucide-react";
import { StoreFrame } from "@/components/store/StoreFrame";
import { getCatalog } from "@/lib/catalog";
import { ACTIVE_TEMPLATE_ID } from "@/config/storefront";
import { getTemplate } from "@/templates/registry";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/** Shown until the API has products. Fresh installs never show demo products. */
function SetupNotice({ storeName }: { storeName: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
        <Settings className="h-7 w-7 text-primary" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">{storeName} is ready</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Add your first product in the admin dashboard. It appears here as soon as it is published.
      </p>
      <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
        <Plug className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <span className="font-mono">{API_URL}</span>
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/admin/products" className="btn-brand">
          Add a product
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link href="/docs" className="btn-ghost">Setup guide</Link>
      </div>
    </div>
  );
}

/** Shop home for the configured store type. Used by /shop and, in store mode, by /. */
export async function StoreHome({ storeName = "Your store" }: { storeName?: string }) {
  const template = getTemplate(ACTIVE_TEMPLATE_ID);
  const products = await getCatalog();

  return (
    <StoreFrame template={template}>
      {products.length === 0 ? (
        <SetupNotice storeName={storeName} />
      ) : (
        <template.Home products={products} shopHref="/products" />
      )}
    </StoreFrame>
  );
}
