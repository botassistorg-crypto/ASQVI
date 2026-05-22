export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;  // Detailed description for product page
  price: number;
  category: string;
  image: string;
  images?: string[];         // Additional images for product page
  badge?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
  relatedProducts?: string[]; // Array of product IDs for upselling
  features?: string[];        // Product features/highlights
}

export interface Order {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  senderBkash: string;
  product: string;
  price: number;
  status: 'Pending' | 'Processed' | 'Sent' | 'Cancelled';
  createdAt: string;
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
  productIds: string[];            // Products this offer applies to
  discountPercent?: number;        // e.g. 20 for 20% off
  discountFlat?: number;           // e.g. 500 for ৳500 off
  bundleProductIds?: string[];     // Products included in bundle
  bundlePrice?: number;            // Bundle price (overrides individual prices)
  badge?: string;                  // Badge text shown on product e.g. "20% OFF"
}

export interface ThankYouConfig {
  heading: string;                 // e.g. "Thank You for Your Purchase!"
  message: string;                 // Rich text body
  showUpsell: boolean;
  upsellHeading: string;          // e.g. "Exclusive Offer — Just for You"
  upsellProductIds: string[];     // Product IDs to show as upsell
  upsellDiscount?: number;        // Discount % on upsell products
  upsellBadge?: string;           // e.g. "50% OFF — Limited Time"
}
