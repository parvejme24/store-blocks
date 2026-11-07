import { StoreFrame } from "@/components/store/StoreFrame";
import { CustomerDashboard } from "@/account/CustomerDashboard";
import { DEFAULT_TEMPLATE } from "@/templates/registry";

/** Customer dashboard: orders, wishlist and profile. Same look on every store theme. */
export default function AccountPage() {
  return (
    <StoreFrame template={DEFAULT_TEMPLATE} basePath="">
      <CustomerDashboard />
    </StoreFrame>
  );
}
