/**
 * Meta Pixel (968151346118618) + GA4 (G-FHTLMT1GJ9) SPA Tracking
 *
 * index.html handles:
 *   - Pixel init + first PageView
 *   - GA4 config + first page_view (send_page_view: true)
 *
 * This file handles:
 *   - SPA route-change PageView (skips the very first render to avoid double)
 *   - ViewContent, InitiateCheckout, Purchase with per-session dedup
 */

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    gtag: (...args: any[]) => void;
  }
}

// --- Dedup ---
const fired = new Set<string>();
let initialPageViewDone = false; // true after first call so we skip it

function once(key: string): boolean {
  if (fired.has(key)) return false;
  fired.add(key);
  return true;
}

// --- Helpers ---
function fbq(...args: any[]) {
  if (typeof window !== 'undefined' && window.fbq) window.fbq(...args);
}

function gtag(...args: any[]) {
  if (typeof window !== 'undefined' && window.gtag) window.gtag(...args);
}

// ============================================================
// PageView — call on every view change in App.tsx
// Skips the FIRST call because index.html already fired it.
// ============================================================
export function trackPageView(viewName: string) {
  if (!initialPageViewDone) {
    // First call = page load = index.html already tracked it
    initialPageViewDone = true;
    return;
  }

  // SPA route change → fire both
  fbq('track', 'PageView');
  gtag('event', 'page_view', {
    page_title: viewName,
    page_location: window.location.href,
  });
}

// ============================================================
// ViewContent — product detail page opened (once per product)
// ============================================================
export function trackViewContent(product: {
  id: string; name: string; price: number; category: string;
}) {
  if (!once(`vc_${product.id}`)) return;

  fbq('track', 'ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    content_category: product.category,
    value: product.price,
    currency: 'BDT',
  });

  gtag('event', 'view_item', {
    currency: 'BDT',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
    }],
  });
}

// ============================================================
// InitiateCheckout — Buy button clicked (once per product)
// ============================================================
export function trackInitiateCheckout(product: {
  id: string; name: string; price: number;
}) {
  if (!once(`ic_${product.id}`)) return;

  fbq('track', 'InitiateCheckout', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'BDT',
    num_items: 1,
  });

  gtag('event', 'begin_checkout', {
    currency: 'BDT',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
    }],
  });
}

// ============================================================
// Purchase — order completed (once per order ID)
// ============================================================
export function trackPurchase(order: {
  id: string; product: string; price: number;
}) {
  if (!once(`pu_${order.id}`)) return;

  fbq('track', 'Purchase', {
    content_name: order.product,
    value: order.price,
    currency: 'BDT',
    num_items: 1,
  });

  gtag('event', 'purchase', {
    transaction_id: order.id,
    currency: 'BDT',
    value: order.price,
    items: [{
      item_name: order.product,
      price: order.price,
      quantity: 1,
    }],
  });
}
