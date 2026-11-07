/**
 * Formats a price stored in minor units (e.g. paisa, cents) for display.
 * Falls back to a plain amount if the currency code is not recognised.
 */
export function formatPrice(amountMinor: number, currency: string): string {
  const amount = amountMinor / 100;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${currency}`;
  }
}
