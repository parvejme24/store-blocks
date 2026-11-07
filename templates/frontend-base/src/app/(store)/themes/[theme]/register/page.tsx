import { notFound } from "next/navigation";
import { StoreFrame } from "@/components/store/StoreFrame";
import { AuthForm } from "@/components/store/demo/AuthForm";
import { STORE_TEMPLATES } from "@/templates/registry";

export function generateStaticParams() {
  return STORE_TEMPLATES.map((template) => ({ theme: template.id }));
}

/** Registration page for one store theme. Demo only: no account is created. */
export default async function ThemeRegisterPage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: themeId } = await params;
  const template = STORE_TEMPLATES.find((t) => t.id === themeId);
  if (!template) notFound();

  return (
    <StoreFrame template={template} basePath={`/themes/${template.id}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <AuthForm mode="register" storeName={template.name} />
      </div>
    </StoreFrame>
  );
}
