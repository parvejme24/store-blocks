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

/**
 * Formats large amounts compactly (e.g. "14.5k BDT", "1.2M BDT") for charts and badges.
 */
export function formatCompactPrice(amountMinor: number, currency: string): string {
  const amount = amountMinor / 100;
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M ${currency}`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}k ${currency}`;
  }
  return formatPrice(amountMinor, currency);
}
