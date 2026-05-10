export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  perks: string[];
  contentLink?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerWhatsapp: string;
  senderNumber: string;
  productId: string;
  productTitle: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
}

export interface SiteSettings {
  bKashNumber: string;
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  checkoutRules: string;
  appsScriptUrl?: string;
  announcement?: string;
  homeAboutText?: string;
  homeAboutImage?: string;
  heroImage?: string;
}

export const ADMIN_EMAIL = 'botassist.org@gmail.com';
export const IMGBB_API_KEY = '249d6156eb00d39b61ac4b421fd59003';
