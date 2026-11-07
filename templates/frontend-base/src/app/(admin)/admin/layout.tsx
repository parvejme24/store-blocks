import { AdminShell } from "@/admin/AdminShell";
import { buildDemoDataset } from "@/admin/demo/dataset";
import { HOME_MODE } from "@/config/storefront";
import { DEFAULT_TEMPLATE } from "@/templates/registry";

/**
 * Main admin. In the StoreBlocks demo site (landing mode) it runs on demo data.
 * In a generated store it is connected to the live API.
 */
export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const dataset = HOME_MODE === "landing" ? buildDemoDataset(DEFAULT_TEMPLATE) : undefined;
  return (
    <AdminShell basePath="/admin" storefrontHref="/" dataset={dataset}>
      {children}
    </AdminShell>
  );
}
