/**
 * Meta Pixel & Google Analytics client event helpers
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
  }
}

export const trackViewItem = (item: { id: string; name: string; priceMinor: number; currency: string }) => {
  if (typeof window !== "undefined") {
    if (window.fbq) {
      window.fbq("track", "ViewContent", {
        content_ids: [item.id],
        content_name: item.name,
        value: item.priceMinor / 100,
        currency: item.currency
      });
    }
    if (window.gtag) {
      window.gtag("event", "view_item", {
        items: [{ id: item.id, name: item.name, price: item.priceMinor / 100 }],
        currency: item.currency,
        value: item.priceMinor / 100
      });
    }
  }
};

export const trackAddToCart = (item: { id: string; name: string; priceMinor: number; currency: string }) => {
  if (typeof window !== "undefined") {
    if (window.fbq) {
      window.fbq("track", "AddToCart", {
        content_ids: [item.id],
        content_name: item.name,
        value: item.priceMinor / 100,
        currency: item.currency
      });
    }
    if (window.gtag) {
      window.gtag("event", "add_to_cart", {
        items: [{ id: item.id, name: item.name, price: item.priceMinor / 100 }],
        currency: item.currency,
        value: item.priceMinor / 100
      });
    }
  }
};

export const trackPurchase = (order: { id: string; totalMinor: number; currency: string }) => {
  if (typeof window !== "undefined") {
    if (window.fbq) {
      window.fbq("track", "Purchase", {
        value: order.totalMinor / 100,
        currency: order.currency
      });
    }
    if (window.gtag) {
      window.gtag("event", "purchase", {
        transaction_id: order.id,
        value: order.totalMinor / 100,
        currency: order.currency
      });
    }
  }
};

