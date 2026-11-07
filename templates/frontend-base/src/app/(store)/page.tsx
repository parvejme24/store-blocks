import type { Metadata } from "next";
import { HOME_MODE, STORE_NAME } from "@/config/storefront";
import { StoreHome } from "@/components/store/StoreHome";
import { StoreBlocksLanding } from "@/landing/StoreBlocksLanding";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

export function generateMetadata(): Metadata {
  const title = HOME_MODE === "landing" ? `${SITE_NAME} | ${SITE_TAGLINE}` : STORE_NAME;
  return {
    title: { absolute: title },
    description: SITE_DESCRIPTION,
    alternates: { canonical: SITE_URL },
    openGraph: { title, description: SITE_DESCRIPTION, url: SITE_URL }
  };
}

/**
 * Root page. In "landing" mode it introduces StoreBlocks; in "store" mode
 * (set by the CLI for generated projects) it is the shop home.
 */
export default function RootPage() {
  if (HOME_MODE === "store") {
    return <StoreHome storeName={STORE_NAME} />;
  }
  return <StoreBlocksLanding />;
}
