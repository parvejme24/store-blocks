"use client";

import { useDemo } from "./AdminShell";
import type { FeatureId } from "./features";
import { CatalogPanel } from "./panels/catalog";
import { InsightsPanel } from "./panels/insights";
import { OperationsPanel } from "./panels/operations";
import { PeoplePanel } from "./panels/people";
import { SalesPanel } from "./panels/sales";

/**
 * Renders one dashboard feature from demo data. Each feature group lives in
 * admin/panels/. Changes stay in memory for this session.
 */
export function DemoFeature({ featureId }: { featureId: FeatureId }) {
  const demo = useDemo();
  if (!demo) return null;
  const { data, update } = demo;

  switch (featureId) {
    case "overview":
    case "revenue":
      return <InsightsPanel feature={featureId} data={data} />;
    case "products":
    case "categories":
    case "brands":
    case "inventory":
    case "reviews":
      return <CatalogPanel feature={featureId} data={data} update={update} />;
    case "orders":
    case "couriers":
    case "coupons":
      return <SalesPanel feature={featureId} data={data} update={update} />;
    case "customers":
      return <PeoplePanel data={data} update={update} />;
    case "shipping":
    case "notifications":
    case "settings":
      return <OperationsPanel feature={featureId} data={data} update={update} />;
    default:
      return null;
  }
}
