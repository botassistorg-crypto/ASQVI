import { Order, SiteSettings, Product, Category } from '../types';
import { products as defaultProductsList } from './products';
const ORDERS_KEY = 'asqvi_orders';
const SETTINGS_KEY = 'asqvi_settings';
const PRODUCTS_KEY = 'asqvi_products';
const CATEGORIES_KEY = 'asqvi_categories';
const AUTH_KEY = 'asqvi_auth';
const defaultSettings: SiteSettings = {
  storeName: 'ASQVI',
  tagline: 'Curated Digital Excellence',
  heroHeading: 'Discover Premium Digital Assets',
  heroSubheading: 'Handcrafted digital products designed to elevate your creative journey',
  aboutTitle: 'Our Story',
  aboutText: 'We believe in the power of thoughtfully crafted digital products. Each piece in our collection is carefully curated to bring exceptional value to creators, entrepreneurs, and visionaries who demand nothing but the finest.',
  bkashNumber: '01XXXXXXXXX',
  scriptUrl: '',
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
// Fallback OTP — ONLY used when NO Apps Script URL is configured
const OFFLINE_OTP = '123456';
// ============ HELPERS ============
function hasScriptUrl(): boolean {
  const settings = getSettings();
  const url = settings.scriptUrl;
  return !!(url && url.startsWith('https://script.google.com'));
}
function isLoggedIn(): boolean {
  return !!getStoredPasscode() && isAuthenticated();
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
  // Sync to Google Sheet
  if (hasScriptUrl()) {
    const scriptUrl = getSettings().scriptUrl;
    try {
      await fetch(scriptUrl, {
        method: 'POST',
        // NO Content-Type header — avoids CORS preflight
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
      console.log('✅ Order synced to Google Sheet');
    } catch (err) {
      console.error('❌ Sheet sync failed (order saved locally):', err);
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
  if (status === 'Sent') {
    console.log(`📧 Customer notification: ${orders[idx].email} — "${orders[idx].product}" is ready`);
  }
  return true;
}
export function deleteOrder(orderId: string): boolean {
  if (!isLoggedIn()) return false;
  const orders = getOrders();
  const filtered = orders.filter(o => o.id !== orderId);
  saveOrders(filtered);
  return true;
}
// ============ PRODUCTS ============
export function getProducts(): Product[] {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProductsList));
  return defaultProductsList;
}
export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}
export function addProduct(product: Omit<Product, 'id'>): Product | null {
  if (!isLoggedIn()) return null;
  const products = getProducts();
  const newProduct: Product = { ...product, id: `prod-${Date.now()}` };
  products.unshift(newProduct);
  saveProducts(products);
  return newProduct;
}
export function updateProduct(productId: string, updates: Partial<Product>): boolean {
  if (!isLoggedIn()) return false;
  const products = getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) return false;
  products[idx] = { ...products[idx], ...updates };
  saveProducts(products);
  return true;
}
export function deleteProduct(productId: string): boolean {
  if (!isLoggedIn()) return false;
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);
  saveProducts(filtered);
  return true;
}
export function getProductCategories(): string[] {
  const products = getProducts();
  return ['All', ...Array.from(new Set(products.map(p => p.category)))];
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
  if (stored) return JSON.parse(stored);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  return defaultSettings;
}
export function saveSettings(settings: SiteSettings): boolean {
  if (!isLoggedIn()) return false;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return true;
}
// ============ AUTH ============
/**
 * Verify passcode against Google Sheet cell G2 via Apps Script.
 * Falls back to offline OTP only when no Apps Script URL is configured.
 * 
 * KEY FIX: No "Content-Type: application/json" header.
 * That header triggers a CORS preflight OPTIONS request which
 * Google Apps Script does NOT support, causing silent failure.
 * Without the header, fetch sends a "simple request" — no preflight, no CORS issue.
 */
export async function verifyPasscode(passcode: string): Promise<boolean> {
  // If no Apps Script URL set → use offline fallback
  if (!hasScriptUrl()) {
    console.log('⚠️ No Apps Script URL configured — using offline OTP (123456)');
    return passcode === OFFLINE_OTP;
  }
  const scriptUrl = getSettings().scriptUrl;
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      // ⚠️ DO NOT add Content-Type header — it breaks CORS with Google Apps Script
      body: JSON.stringify({
        action: 'verify',
        passcode: passcode,
      }),
    });
    // Try to parse response
    const text = await response.text();
    
    try {
      const result = JSON.parse(text);
      return result.success === true;
    } catch {
      console.error('❌ Could not parse response:', text);
      return false;
    }
  } catch (error) {
    console.error('❌ Verification failed:', error);
    // Do NOT fall back to 123456 — show the real error
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
