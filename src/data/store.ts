import { Order, SiteSettings, Product, Category, Offer, ThankYouConfig } from '../types';
import { APPS_SCRIPT_URL, OFFLINE_OTP, isScriptConfigured } from '../config';

const ORDERS_KEY = 'asqvi_orders';
const SETTINGS_KEY = 'asqvi_settings';
const PRODUCTS_KEY = 'asqvi_products';
const CATEGORIES_KEY = 'asqvi_categories';
const OFFERS_KEY = 'asqvi_offers';
const THANKYOU_KEY = 'asqvi_thankyou';
const AUTH_KEY = 'asqvi_auth';

const defaultSettings: SiteSettings = {
  storeName: 'ASQVI',
  tagline: 'Curated Digital Excellence',
  heroHeading: 'Discover Premium Digital Assets',
  heroSubheading: 'Handcrafted digital products designed to elevate your creative journey',
  aboutTitle: 'Our Story',
  aboutText: 'We believe in the power of thoughtfully crafted digital products. Each piece in our collection is carefully curated to bring exceptional value to creators, entrepreneurs, and visionaries who demand nothing but the finest.',
  bkashNumber: '01XXXXXXXXX',
  adminEmail: 'admin@asqvi.com',
  currency: 'BDT',
};

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Courses', description: 'Premium learning experiences' },
  { id: 'cat-2', name: 'eBooks', description: 'Knowledge in digital form' },
  { id: 'cat-3', name: 'Templates', description: 'Ready-to-use designs' },
  { id: 'cat-4', name: 'Digital Assets', description: 'Creative resources' },
  { id: 'cat-5', name: 'Services', description: 'Professional assistance' },
];

const defaultOrders: Order[] = [];

// ============ HELPERS ============

function isLoggedIn(): boolean {
  return !!getStoredPasscode() && isAuthenticated();
}

/** Convert literal \n strings to actual newlines */
function fixLineBreaks(text: string): string {
  if (!text) return '';
  // Replace literal two-char \n with actual newline
  return text.replace(/\\n/g, '\n');
}

async function scriptPost(data: any): Promise<any> {
  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const text = await response.text();
  return JSON.parse(text);
}

// ============ PRODUCTS — GOOGLE SHEET ============

/**
 * Fetch products from Google Sheet.
 * Falls back to localStorage if Sheet is unavailable.
 */
export async function fetchProductsFromSheet(): Promise<Product[]> {
  if (!isScriptConfigured()) {
    return getProductsLocal();
  }

  try {
    const url = APPS_SCRIPT_URL + '?action=getProducts';
    const response = await fetch(url);
    const text = await response.text();
    const result = JSON.parse(text);

    if (result.success && Array.isArray(result.products)) {
      // Fix descriptions — Google Sheets may store \n as literal text
      const cleaned = result.products.map((p: any) => ({
        ...p,
        description: fixLineBreaks(p.description || ''),
        fullDescription: fixLineBreaks(p.fullDescription || ''),
      }));
      // Cache in localStorage
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(cleaned));
      return cleaned;
    }
  } catch (err) {
    console.error('Failed to fetch products from Sheet:', err);
  }

  // Fallback to cached
  return getProductsLocal();
}

export async function addProductToSheet(product: Omit<Product, 'id'>): Promise<Product | null> {
  if (!isLoggedIn()) return null;

  const id = 'prod-' + Date.now();
  const newProduct: Product = { ...product, id };

  if (isScriptConfigured()) {
    try {
      const result = await scriptPost({
        action: 'addProduct',
        passcode: getStoredPasscode(),
        ...newProduct,
      });
      if (!result.success) return null;
    } catch (err) {
      console.error('Failed to add product to Sheet:', err);
      return null;
    }
  }

  // Also update local cache
  const products = getProductsLocal();
  products.unshift(newProduct);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return newProduct;
}

export async function updateProductOnSheet(productId: string, updates: Partial<Product>): Promise<boolean> {
  if (!isLoggedIn()) return false;

  // Update local cache first
  const products = getProductsLocal();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) return false;
  const updated = { ...products[idx], ...updates };
  products[idx] = updated;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

  if (isScriptConfigured()) {
    try {
      const result = await scriptPost({
        action: 'updateProduct',
        passcode: getStoredPasscode(),
        ...updated,
      });
      if (!result.success) return false;
    } catch (err) {
      console.error('Failed to update product on Sheet:', err);
      return false;
    }
  }

  return true;
}

export async function deleteProductFromSheet(productId: string): Promise<boolean> {
  if (!isLoggedIn()) return false;

  if (isScriptConfigured()) {
    try {
      const result = await scriptPost({
        action: 'deleteProduct',
        passcode: getStoredPasscode(),
        id: productId,
      });
      if (!result.success) return false;
    } catch (err) {
      console.error('Failed to delete product from Sheet:', err);
      return false;
    }
  }

  // Update local cache
  const products = getProductsLocal();
  const filtered = products.filter(p => p.id !== productId);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
  return true;
}

// ============ PRODUCTS — LOCAL (cache/fallback) ============

export function getProductsLocal(): Product[] {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (stored) return JSON.parse(stored);
  return [];
}

export function getProductCategories(): string[] {
  const products = getProductsLocal();
  return ['All', ...Array.from(new Set(products.map(p => p.category)))];
}

// ============ ORDERS ============

export function getOrders(): Order[] {
  const stored = localStorage.getItem(ORDERS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(defaultOrders));
  return defaultOrders;
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export async function addOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: `ord-${Date.now()}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  saveOrders(orders);

  if (isScriptConfigured()) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'newOrder',
          name: order.name,
          number: order.whatsapp,
          email: order.email,
          product: order.product,
          price: order.price,
          senderBkash: order.senderBkash,
        }),
      });
    } catch (err) {
      console.error('Sheet sync failed:', err);
    }
  }

  return newOrder;
}

export function updateOrderStatus(orderId: string, status: Order['status']): boolean {
  if (!isLoggedIn()) return false;
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return false;
  orders[idx].status = status;
  saveOrders(orders);
  return true;
}

export function deleteOrder(orderId: string): boolean {
  if (!isLoggedIn()) return false;
  const orders = getOrders();
  const filtered = orders.filter(o => o.id !== orderId);
  saveOrders(filtered);
  return true;
}

// ============ CATEGORIES ============

export function getCategories(): Category[] {
  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
  return defaultCategories;
}

export function saveCategories(categories: Category[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function addCategory(category: Omit<Category, 'id'>): Category | null {
  if (!isLoggedIn()) return null;
  const categories = getCategories();
  const newCategory: Category = { ...category, id: `cat-${Date.now()}` };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

export function updateCategory(categoryId: string, updates: Partial<Category>): boolean {
  if (!isLoggedIn()) return false;
  const categories = getCategories();
  const idx = categories.findIndex(c => c.id === categoryId);
  if (idx === -1) return false;
  categories[idx] = { ...categories[idx], ...updates };
  saveCategories(categories);
  return true;
}

export function deleteCategory(categoryId: string): boolean {
  if (!isLoggedIn()) return false;
  const categories = getCategories();
  const filtered = categories.filter(c => c.id !== categoryId);
  saveCategories(filtered);
  return true;
}

// ============ SETTINGS ============

export function getSettings(): SiteSettings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if ('scriptUrl' in parsed) {
      delete parsed.scriptUrl;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  return defaultSettings;
}

export function saveSettings(settings: SiteSettings): boolean {
  if (!isLoggedIn()) return false;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return true;
}

// ============ AUTH ============

export async function verifyPasscode(passcode: string): Promise<boolean> {
  if (!isScriptConfigured()) {
    return passcode === OFFLINE_OTP;
  }

  try {
    const result = await scriptPost({
      action: 'verify',
      passcode: passcode,
    });
    return result.success === true;
  } catch {
    return false;
  }
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function setAuthenticated(value: boolean): void {
  if (value) {
    localStorage.setItem(AUTH_KEY, 'true');
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function getStoredPasscode(): string {
  return localStorage.getItem('asqvi_passcode') || '';
}

export function setStoredPasscode(passcode: string): void {
  localStorage.setItem('asqvi_passcode', passcode);
}

// ============ OFFERS ============

const defaultOffers: Offer[] = [];

export function getOffers(): Offer[] {
  const stored = localStorage.getItem(OFFERS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(OFFERS_KEY, JSON.stringify(defaultOffers));
  return defaultOffers;
}

export function saveOffers(offers: Offer[]): void {
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
}

export function addOffer(offer: Omit<Offer, 'id'>): Offer | null {
  if (!isLoggedIn()) return null;
  const offers = getOffers();
  const newOffer: Offer = { ...offer, id: `offer-${Date.now()}` };
  offers.unshift(newOffer);
  saveOffers(offers);
  return newOffer;
}

export function updateOffer(offerId: string, updates: Partial<Offer>): boolean {
  if (!isLoggedIn()) return false;
  const offers = getOffers();
  const idx = offers.findIndex(o => o.id === offerId);
  if (idx === -1) return false;
  offers[idx] = { ...offers[idx], ...updates };
  saveOffers(offers);
  return true;
}

export function deleteOffer(offerId: string): boolean {
  if (!isLoggedIn()) return false;
  const offers = getOffers();
  saveOffers(offers.filter(o => o.id !== offerId));
  return true;
}

export function getActiveOfferForProduct(productId: string): Offer | undefined {
  return getOffers().find(o => o.active && o.productIds.includes(productId));
}

// ============ THANK YOU CONFIG ============

const defaultThankYou: ThankYouConfig = {
  heading: 'Thank You for Your Purchase! 🎉',
  message: 'Your order has been received successfully.\n\nWe will verify your payment and send you the access details to your email shortly.\n\nThank you for choosing ASQVI!',
  showUpsell: false,
  upsellHeading: 'Exclusive Offer — Just for You',
  upsellProductIds: [],
  upsellDiscount: 0,
  upsellBadge: 'Special Deal',
};

export function getThankYouConfig(): ThankYouConfig {
  const stored = localStorage.getItem(THANKYOU_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(THANKYOU_KEY, JSON.stringify(defaultThankYou));
  return defaultThankYou;
}

export function saveThankYouConfig(config: ThankYouConfig): boolean {
  if (!isLoggedIn()) return false;
  localStorage.setItem(THANKYOU_KEY, JSON.stringify(config));
  return true;
}
