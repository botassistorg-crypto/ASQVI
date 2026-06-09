export interface ProductTier {
  id: string;
  name: string;                  // "Basic" | "Pro" | "Elite" | custom
  price: number;                 // e.g. 2999
  paymentType: 'onetime' | 'monthly';  // One Time or Monthly
  description: string;           // Short tier description
  features: string[];            // Tier-specific features list
  isPopular?: boolean;           // Highlight as "Most Popular"
}

export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;      // Detailed description for product page
  price: number;                 // Used for single-price products
  category: string;
  image: string;
  images?: string[];             // Additional images for product page
  badge?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
  relatedProducts?: string[];    // Array of product IDs for upselling
  features?: string[];           // Product features/highlights (single price)

  // --- TIER PRICING (optional — only for tiered products) ---
  isTiered?: boolean;            // true = tiered product, false/undefined = single price
  tiers?: ProductTier[];         // Array of tiers (2-4 tiers)
}

export interface Order {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  senderBkash: string;
  product: string;               // Product name
  price: number;
  status: 'Pending' | 'Processed' | 'Sent' | 'Cancelled';
  createdAt: string;

  // --- TIER INFO (optional — only for tiered orders) ---
  tierName?: string;             // e.g. "Pro"
  tierPaymentType?: 'onetime' | 'monthly'; // Payment type of selected tier
}

export interface SiteSettings {
  storeName: string;
  tagline: string;
  heroHeading: string;
  heroSubheading: string;
  aboutTitle: string;
  aboutText: string;
  bkashNumber: string;
  adminEmail: string;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export type OrderStatus = Order['status'];

export interface Offer {
  id: string;
  name: string;                    // Internal name for admin
  type: 'discount' | 'bundle' | 'upsell' | 'freebie';
  active: boolean;
  category?: string;               // Category this offer belongs to
  productIds: string[];            // Products this offer applies to
  discountPercent?: number;        // e.g. 20 for 20% off
  discountFlat?: number;           // e.g. 500 for ৳500 off
  bundleProductIds?: string[];     // Products included in bundle
  bundlePrice?: number;            // Bundle sale price
  bundleOriginalPrice?: number;    // Original total before bundle discount
  badge?: string;                  // Badge text e.g. "20% OFF"
  bundleDescription?: string;      // Short description for bundle card
}

export interface ThankYouRule {
  id: string;
  name: string;                    // Admin label
  active: boolean;
  triggerProductIds: string[];     // When ANY of these products is purchased...
  heading: string;                 // Thank you heading
  message: string;                 // Thank you body
  showUpsell: boolean;
  upsellHeading: string;           // "Exclusive Offer — Just for You"
  upsellProductIds: string[];      // ...show THESE products as upsell
  upsellDiscount?: number;         // Discount % on upsell products
  upsellBadge?: string;            // "50% OFF — Limited Time"
}

export interface ThankYouConfig {
  defaultHeading: string;          // Fallback when no rule matches
  defaultMessage: string;          // Fallback message
  rules: ThankYouRule[];           // Per-product upsell rules
}
