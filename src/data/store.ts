import { Order, SiteSettings, Product, Category } from '../types';
import { products as defaultProductsList } from './products';

// Simulated persistent store using localStorage
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
  scriptUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
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

// Fallback OTP for offline/demo mode
const FALLBACK_OTP = '123456';

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
    id: `ord-${String(orders.length + 1).padStart(3, '0')}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  saveOrders(orders);
  
  // Sync to Google Sheet
  const settings = getSettings();
  const scriptUrl = settings.scriptUrl;
  
  if (scriptUrl && !scriptUrl.includes('YOUR_SCRIPT_ID')) {
    try {
      await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
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
      console.error('❌ Sheet sync error:', err);
    }
  } else {
    console.log('📧 Admin notification: New order from', order.name, 'for', order.product);
  }
  
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: Order['status'], passcode: string): boolean {
  if (!getStoredPasscode()) return false;
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return false;
  orders[idx].status = status;
  saveOrders(orders);
  if (status === 'Sent') {
    console.log(`📧 Customer notification sent to ${orders[idx].email}: Your digital product "${orders[idx].product}" is ready!`);
  }
  return true;
}

export function deleteOrder(orderId: string, passcode: string): boolean {
  if (!getStoredPasscode()) return false;
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

export function addProduct(product: Omit<Product, 'id'>, passcode: string): Product | null {
  if (!getStoredPasscode()) return null;
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}`,
  };
  products.unshift(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(productId: string, updates: Partial<Product>, passcode: string): boolean {
  if (!getStoredPasscode()) return false;
  const products = getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) return false;
  products[idx] = { ...products[idx], ...updates };
  saveProducts(products);
  return true;
}

export function deleteProduct(productId: string, passcode: string): boolean {
  if (!getStoredPasscode()) return false;
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

export function addCategory(category: Omit<Category, 'id'>, passcode: string): Category | null {
  if (!getStoredPasscode()) return null;
  const categories = getCategories();
  const newCategory: Category = {
    ...category,
    id: `cat-${Date.now()}`,
  };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

export function updateCategory(categoryId: string, updates: Partial<Category>, passcode: string): boolean {
  if (!getStoredPasscode()) return false;
  const categories = getCategories();
  const idx = categories.findIndex(c => c.id === categoryId);
  if (idx === -1) return false;
  categories[idx] = { ...categories[idx], ...updates };
  saveCategories(categories);
  return true;
}

export function deleteCategory(categoryId: string, passcode: string): boolean {
  if (!getStoredPasscode()) return false;
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

export function saveSettings(settings: SiteSettings, passcode: string): boolean {
  if (!getStoredPasscode()) return false;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return true;
}

// ============ AUTH ============

export async function verifyPasscode(passcode: string): Promise<boolean> {
  const settings = getSettings();
  const scriptUrl = settings.scriptUrl;
  
  // If no script URL configured, use fallback
  if (!scriptUrl || scriptUrl.includes('YOUR_SCRIPT_ID')) {
    console.log('⚠️ Using fallback OTP (no Apps Script URL configured)');
    return passcode === FALLBACK_OTP;
  }
  
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'verify', 
        passcode: passcode 
      }),
    });
    
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('❌ Verification error:', error);
    // Fallback to local check on network error
    console.log('⚠️ Network error, using fallback OTP');
    return passcode === FALLBACK_OTP;
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
