import { notFound } from "next/navigation";
import { FeatureView } from "@/admin/FeatureView";
import { ADMIN_FEATURES, getFeature } from "@/admin/features";

export function generateStaticParams() {
  return ADMIN_FEATURES.filter((feature) => feature.id !== "overview").map((feature) => ({ feature: feature.id }));
}

export default async function ThemeAdminFeature({
  params
}: {
  params: Promise<{ theme: string; feature: string }>;
}) {
  const { feature: featureParam } = await params;
  const feature = getFeature(featureParam);
  if (!feature) notFound();
  return <FeatureView featureId={feature.id} />;
}
