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
  scriptUrl: string;
  adminEmail: string;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export type OrderStatus = Order['status'];
