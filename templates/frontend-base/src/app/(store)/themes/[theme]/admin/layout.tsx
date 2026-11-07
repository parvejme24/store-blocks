import { notFound } from "next/navigation";
import { AdminShell } from "@/admin/AdminShell";
import { buildDemoDataset } from "@/admin/demo/dataset";
import { STORE_TEMPLATES } from "@/templates/registry";

export function generateStaticParams() {
  return STORE_TEMPLATES.map((template) => ({ theme: template.id }));
}

/** Admin for one store theme. Uses that theme's demo products, orders and settings. */
export default async function ThemeAdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ theme: string }>;
}) {
  const { theme: themeId } = await params;
  const template = STORE_TEMPLATES.find((t) => t.id === themeId);
  if (!template) notFound();

  return (
    <AdminShell
      basePath={`/themes/${template.id}/admin`}
      storefrontHref={`/themes/${template.id}`}
      dataset={buildDemoDataset(template)}
    >
      {children}
    </AdminShell>
  );
}
