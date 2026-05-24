import { Order, SiteSettings, Product, Category, Offer, ThankYouConfig, ThankYouRule } from '../types';
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

const defaultThankYou: ThankYouConfig = {
  defaultHeading: 'Thank You for Your Purchase! 🎉',
  defaultMessage: 'Your order has been received successfully.\n\nWe will verify your payment and send you the access details to your email shortly.\n\nThank you for choosing ASQVI!',
  rules: [],
};

// ============ HELPERS ============

function isLoggedIn(): boolean { return !!getStoredPasscode() && isAuthenticated(); }

function fixLineBreaks(text: string): string {
  if (!text) return '';
  return text.replace(/\\n/g, '\n');
}

async function scriptPost(data: any): Promise<any> {
  const response = await fetch(APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(data) });
  return JSON.parse(await response.text());
}

async function scriptGet(action: string): Promise<any> {
  const response = await fetch(APPS_SCRIPT_URL + '?action=' + action);
  return JSON.parse(await response.text());
}

// ============ PRODUCTS ============

export async function fetchProductsFromSheet(): Promise<Product[]> {
  if (!isScriptConfigured()) return getProductsLocal();
  try {
    const result = await scriptGet('getProducts');
    if (result.success && Array.isArray(result.products)) {
      const cleaned = result.products.map((p: any) => ({
        ...p, description: fixLineBreaks(p.description || ''), fullDescription: fixLineBreaks(p.fullDescription || ''),
      }));
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(cleaned));
      return cleaned;
    }
  } catch (e) { console.error('Fetch products failed:', e); }
  return getProductsLocal();
}

export async function addProductToSheet(product: Omit<Product, 'id'>): Promise<Product | null> {
  if (!isLoggedIn()) return null;
  const id = 'prod-' + Date.now();
  const newProduct: Product = { ...product, id };
  if (isScriptConfigured()) {
    try { const r = await scriptPost({ action: 'addProduct', passcode: getStoredPasscode(), ...newProduct }); if (!r.success) return null; } catch { return null; }
  }
  const products = getProductsLocal(); products.unshift(newProduct);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return newProduct;
}

export async function updateProductOnSheet(productId: string, updates: Partial<Product>): Promise<boolean> {
  if (!isLoggedIn()) return false;
  const products = getProductsLocal();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) return false;
  const updated = { ...products[idx], ...updates }; products[idx] = updated;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  if (isScriptConfigured()) {
    try { const r = await scriptPost({ action: 'updateProduct', passcode: getStoredPasscode(), ...updated }); if (!r.success) return false; } catch { return false; }
  }
  return true;
}

export async function deleteProductFromSheet(productId: string): Promise<boolean> {
  if (!isLoggedIn()) return false;
  if (isScriptConfigured()) {
    try { const r = await scriptPost({ action: 'deleteProduct', passcode: getStoredPasscode(), id: productId }); if (!r.success) return false; } catch { return false; }
  }
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(getProductsLocal().filter(p => p.id !== productId)));
  return true;
}

export function getProductsLocal(): Product[] {
  const s = localStorage.getItem(PRODUCTS_KEY); return s ? JSON.parse(s) : [];
}

export function getProductCategories(): string[] {
  return ['All', ...Array.from(new Set(getProductsLocal().map(p => p.category)))];
}

// ============ ORDERS ============

export function getOrders(): Order[] {
  const s = localStorage.getItem(ORDERS_KEY); if (s) return JSON.parse(s);
  localStorage.setItem(ORDERS_KEY, JSON.stringify([])); return [];
}
export function saveOrders(orders: Order[]): void { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); }

export async function addOrder(
  order: Omit<Order, 'id' | 'createdAt' | 'status'>,
  options?: { orderType?: string; offerDetails?: string; originalPrice?: number }
): Promise<Order> {
  const orders = getOrders();
  const newOrder: Order = { ...order, id: `ord-${Date.now()}`, status: 'Pending', createdAt: new Date().toISOString() };
  orders.unshift(newOrder); saveOrders(orders);
  if (isScriptConfigured()) {
    try {
      await fetch(APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify({
        action: 'newOrder', name: order.name, number: order.whatsapp, email: order.email,
        product: order.product, price: order.price, senderBkash: order.senderBkash,
        orderType: options?.orderType || 'direct', offerDetails: options?.offerDetails || '',
        originalPrice: options?.originalPrice || '',
      })});
    } catch (e) { console.error('Order sync failed:', e); }
  }
  return newOrder;
}

export function updateOrderStatus(id: string, status: Order['status']): boolean {
  if (!isLoggedIn()) return false;
  const orders = getOrders(); const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return false; orders[idx].status = status; saveOrders(orders); return true;
}

export function deleteOrder(id: string): boolean {
  if (!isLoggedIn()) return false; saveOrders(getOrders().filter(o => o.id !== id)); return true;
}

// ============ CATEGORIES ============

export function getCategories(): Category[] {
  const s = localStorage.getItem(CATEGORIES_KEY); if (s) return JSON.parse(s);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories)); return defaultCategories;
}
export function saveCategories(c: Category[]): void { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(c)); }
export function addCategory(c: Omit<Category, 'id'>): Category | null {
  if (!isLoggedIn()) return null; const all = getCategories(); const n: Category = { ...c, id: `cat-${Date.now()}` };
  all.push(n); saveCategories(all); return n;
}
export function updateCategory(id: string, u: Partial<Category>): boolean {
  if (!isLoggedIn()) return false; const all = getCategories(); const i = all.findIndex(c => c.id === id);
  if (i === -1) return false; all[i] = { ...all[i], ...u }; saveCategories(all); return true;
}
export function deleteCategory(id: string): boolean {
  if (!isLoggedIn()) return false; saveCategories(getCategories().filter(c => c.id !== id)); return true;
}

// ============ SETTINGS ============

export function getSettings(): SiteSettings {
  const s = localStorage.getItem(SETTINGS_KEY);
  if (s) { const p = JSON.parse(s); if ('scriptUrl' in p) { delete p.scriptUrl; localStorage.setItem(SETTINGS_KEY, JSON.stringify(p)); } return p; }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings)); return defaultSettings;
}
export function saveSettings(s: SiteSettings): boolean {
  if (!isLoggedIn()) return false; localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); return true;
}

// ============ AUTH ============

export async function verifyPasscode(passcode: string): Promise<boolean> {
  if (!isScriptConfigured()) return passcode === OFFLINE_OTP;
  try { const r = await scriptPost({ action: 'verify', passcode }); return r.success === true; } catch { return false; }
}
export function isAuthenticated(): boolean { return localStorage.getItem(AUTH_KEY) === 'true'; }
export function setAuthenticated(v: boolean): void { if (v) localStorage.setItem(AUTH_KEY, 'true'); else localStorage.removeItem(AUTH_KEY); }
export function getStoredPasscode(): string { return localStorage.getItem('asqvi_passcode') || ''; }
export function setStoredPasscode(p: string): void { localStorage.setItem('asqvi_passcode', p); }

// ============ OFFERS — SYNCED TO SHEET ============

export function getOffers(): Offer[] {
  const s = localStorage.getItem(OFFERS_KEY); return s ? JSON.parse(s) : [];
}
function saveOffersLocal(o: Offer[]): void { localStorage.setItem(OFFERS_KEY, JSON.stringify(o)); }

export async function addOffer(offer: Omit<Offer, 'id'>): Promise<Offer | null> {
  if (!isLoggedIn()) return null;
  const all = getOffers(); const n: Offer = { ...offer, id: `offer-${Date.now()}` };
  all.unshift(n); saveOffersLocal(all); await syncConfigToSheet(); return n;
}
export async function updateOffer(id: string, u: Partial<Offer>): Promise<boolean> {
  if (!isLoggedIn()) return false; const all = getOffers(); const i = all.findIndex(o => o.id === id);
  if (i === -1) return false; all[i] = { ...all[i], ...u }; saveOffersLocal(all); await syncConfigToSheet(); return true;
}
export async function deleteOffer(id: string): Promise<boolean> {
  if (!isLoggedIn()) return false; saveOffersLocal(getOffers().filter(o => o.id !== id)); await syncConfigToSheet(); return true;
}

/** Get DISCOUNT offer for a product — ONLY discount/freebie type, NOT bundle */
export function getDiscountOfferForProduct(productId: string): Offer | undefined {
  return getOffers().find(o => o.active && o.type === 'discount' && o.productIds.includes(productId));
}

// ============ THANK YOU CONFIG ============

export function getThankYouConfig(): ThankYouConfig {
  const s = localStorage.getItem(THANKYOU_KEY);
  if (s) { const p = JSON.parse(s); if (p.rules) return p; }
  return defaultThankYou;
}

export async function saveThankYouConfig(config: ThankYouConfig): Promise<boolean> {
  if (!isLoggedIn()) return false;
  localStorage.setItem(THANKYOU_KEY, JSON.stringify(config));
  await syncConfigToSheet(); return true;
}

export function getThankYouRuleForProduct(productId: string): ThankYouRule | null {
  return getThankYouConfig().rules.find(r => r.active && r.triggerProductIds.includes(productId)) || null;
}

// ============ SYNC CONFIG TO/FROM SHEET ============

async function syncConfigToSheet(): Promise<void> {
  if (!isScriptConfigured() || !isLoggedIn()) return;
  try {
    await scriptPost({
      action: 'saveSiteConfig', passcode: getStoredPasscode(),
      offers: JSON.stringify(getOffers()),
      thankYou: JSON.stringify(getThankYouConfig()),
    });
  } catch (e) { console.error('Config sync to sheet failed:', e); }
}

/**
 * Load offers + thankyou from Sheet — PUBLIC GET, no auth.
 * This is what makes offers/bundles visible on ALL devices.
 */
export async function fetchConfigFromSheet(): Promise<{ offers: Offer[]; thankYou: ThankYouConfig }> {
  if (!isScriptConfigured()) {
    return { offers: getOffers(), thankYou: getThankYouConfig() };
  }
  try {
    const result = await scriptGet('getSiteConfig');
    let offers: Offer[] = [];
    let thankYou: ThankYouConfig = defaultThankYou;

    if (result.success) {
      if (result.offers && result.offers !== '[]' && result.offers !== '') {
        try { offers = JSON.parse(result.offers); } catch { offers = []; }
      }
      if (result.thankYou && result.thankYou !== '{}' && result.thankYou !== '') {
        try { const parsed = JSON.parse(result.thankYou); if (parsed.rules) thankYou = parsed; } catch { /* */ }
      }
      // Save to localStorage as cache
      saveOffersLocal(offers);
      localStorage.setItem(THANKYOU_KEY, JSON.stringify(thankYou));
      return { offers, thankYou };
    }
  } catch (e) {
    console.error('Fetch config from sheet failed:', e);
  }
  // Fallback to whatever is in localStorage
  return { offers: getOffers(), thankYou: getThankYouConfig() };
}

// ============ HELPERS ============

function isLoggedIn(): boolean { return !!getStoredPasscode() && isAuthenticated(); }

function fixLineBreaks(text: string): string {
  if (!text) return '';
  return text.replace(/\\n/g, '\n');
}

async function scriptPost(data: any): Promise<any> {
  const response = await fetch(APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(data) });
  return JSON.parse(await response.text());
}

async function scriptGet(action: string): Promise<any> {
  const response = await fetch(APPS_SCRIPT_URL + '?action=' + action);
  return JSON.parse(await response.text());
}

// ============ PRODUCTS ============

export async function fetchProductsFromSheet(): Promise<Product[]> {
  if (!isScriptConfigured()) return getProductsLocal();
  try {
    const result = await scriptGet('getProducts');
    if (result.success && Array.isArray(result.products)) {
      const cleaned = result.products.map((p: any) => ({
        ...p, description: fixLineBreaks(p.description || ''), fullDescription: fixLineBreaks(p.fullDescription || ''),
      }));
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(cleaned));
      return cleaned;
    }
  } catch (e) { console.error('Fetch products failed:', e); }
  return getProductsLocal();
}

export async function addProductToSheet(product: Omit<Product, 'id'>): Promise<Product | null> {
  if (!isLoggedIn()) return null;
  const id = 'prod-' + Date.now();
  const newProduct: Product = { ...product, id };
  if (isScriptConfigured()) {
    try { const r = await scriptPost({ action: 'addProduct', passcode: getStoredPasscode(), ...newProduct }); if (!r.success) return null; } catch { return null; }
  }
  const products = getProductsLocal(); products.unshift(newProduct);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return newProduct;
}

export async function updateProductOnSheet(productId: string, updates: Partial<Product>): Promise<boolean> {
  if (!isLoggedIn()) return false;
  const products = getProductsLocal();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) return false;
  const updated = { ...products[idx], ...updates }; products[idx] = updated;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  if (isScriptConfigured()) {
    try { const r = await scriptPost({ action: 'updateProduct', passcode: getStoredPasscode(), ...updated }); if (!r.success) return false; } catch { return false; }
  }
  return true;
}

export async function deleteProductFromSheet(productId: string): Promise<boolean> {
  if (!isLoggedIn()) return false;
  if (isScriptConfigured()) {
    try { const r = await scriptPost({ action: 'deleteProduct', passcode: getStoredPasscode(), id: productId }); if (!r.success) return false; } catch { return false; }
  }
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(getProductsLocal().filter(p => p.id !== productId)));
  return true;
}

export function getProductsLocal(): Product[] {
  const s = localStorage.getItem(PRODUCTS_KEY); return s ? JSON.parse(s) : [];
}

export function getProductCategories(): string[] {
  return ['All', ...Array.from(new Set(getProductsLocal().map(p => p.category)))];
}

// ============ ORDERS ============

export function getOrders(): Order[] {
  const s = localStorage.getItem(ORDERS_KEY); if (s) return JSON.parse(s);
  localStorage.setItem(ORDERS_KEY, JSON.stringify([])); return [];
}
export function saveOrders(orders: Order[]): void { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); }

export async function addOrder(
  order: Omit<Order, 'id' | 'createdAt' | 'status'>,
  options?: { orderType?: string; offerDetails?: string; originalPrice?: number }
): Promise<Order> {
  const orders = getOrders();
  const newOrder: Order = { ...order, id: `ord-${Date.now()}`, status: 'Pending', createdAt: new Date().toISOString() };
  orders.unshift(newOrder); saveOrders(orders);
  if (isScriptConfigured()) {
    try {
      await fetch(APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify({
        action: 'newOrder', name: order.name, number: order.whatsapp, email: order.email,
        product: order.product, price: order.price, senderBkash: order.senderBkash,
        orderType: options?.orderType || 'direct', offerDetails: options?.offerDetails || '',
        originalPrice: options?.originalPrice || '',
      })});
    } catch (e) { console.error('Order sync failed:', e); }
  }
  return newOrder;
}

export function updateOrderStatus(id: string, status: Order['status']): boolean {
  if (!isLoggedIn()) return false;
  const orders = getOrders(); const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return false; orders[idx].status = status; saveOrders(orders); return true;
}

export function deleteOrder(id: string): boolean {
  if (!isLoggedIn()) return false; saveOrders(getOrders().filter(o => o.id !== id)); return true;
}

// ============ CATEGORIES ============

export function getCategories(): Category[] {
  const s = localStorage.getItem(CATEGORIES_KEY); if (s) return JSON.parse(s);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories)); return defaultCategories;
}
export function saveCategories(c: Category[]): void { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(c)); }
export function addCategory(c: Omit<Category, 'id'>): Category | null {
  if (!isLoggedIn()) return null; const all = getCategories(); const n: Category = { ...c, id: `cat-${Date.now()}` };
  all.push(n); saveCategories(all); return n;
}
export function updateCategory(id: string, u: Partial<Category>): boolean {
  if (!isLoggedIn()) return false; const all = getCategories(); const i = all.findIndex(c => c.id === id);
  if (i === -1) return false; all[i] = { ...all[i], ...u }; saveCategories(all); return true;
}
export function deleteCategory(id: string): boolean {
  if (!isLoggedIn()) return false; saveCategories(getCategories().filter(c => c.id !== id)); return true;
}

// ============ SETTINGS ============

export function getSettings(): SiteSettings {
  const s = localStorage.getItem(SETTINGS_KEY);
  if (s) { const p = JSON.parse(s); if ('scriptUrl' in p) { delete p.scriptUrl; localStorage.setItem(SETTINGS_KEY, JSON.stringify(p)); } return p; }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings)); return defaultSettings;
}
export function saveSettings(s: SiteSettings): boolean {
  if (!isLoggedIn()) return false; localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); return true;
}

// ============ AUTH ============

export async function verifyPasscode(passcode: string): Promise<boolean> {
  if (!isScriptConfigured()) return passcode === OFFLINE_OTP;
  try { const r = await scriptPost({ action: 'verify', passcode }); return r.success === true; } catch { return false; }
}
export function isAuthenticated(): boolean { return localStorage.getItem(AUTH_KEY) === 'true'; }
export function setAuthenticated(v: boolean): void { if (v) localStorage.setItem(AUTH_KEY, 'true'); else localStorage.removeItem(AUTH_KEY); }
export function getStoredPasscode(): string { return localStorage.getItem('asqvi_passcode') || ''; }
export function setStoredPasscode(p: string): void { localStorage.setItem('asqvi_passcode', p); }

// ============ OFFERS — SYNCED TO SHEET ============

export function getOffers(): Offer[] {
  const s = localStorage.getItem(OFFERS_KEY); return s ? JSON.parse(s) : [];
}
function saveOffersLocal(o: Offer[]): void { localStorage.setItem(OFFERS_KEY, JSON.stringify(o)); }

export async function addOffer(offer: Omit<Offer, 'id'>): Promise<Offer | null> {
  if (!isLoggedIn()) return null;
  const all = getOffers(); const n: Offer = { ...offer, id: `offer-${Date.now()}` };
  all.unshift(n); saveOffersLocal(all); await syncConfigToSheet(); return n;
}
export async function updateOffer(id: string, u: Partial<Offer>): Promise<boolean> {
  if (!isLoggedIn()) return false; const all = getOffers(); const i = all.findIndex(o => o.id === id);
  if (i === -1) return false; all[i] = { ...all[i], ...u }; saveOffersLocal(all); await syncConfigToSheet(); return true;
}
export async function deleteOffer(id: string): Promise<boolean> {
  if (!isLoggedIn()) return false; saveOffersLocal(getOffers().filter(o => o.id !== id)); await syncConfigToSheet(); return true;
}

/** Get DISCOUNT offer for a product — ONLY discount/freebie type, NOT bundle */
export function getDiscountOfferForProduct(productId: string): Offer | undefined {
  return getOffers().find(o => o.active && o.type === 'discount' && o.productIds.includes(productId));
}

// ============ THANK YOU CONFIG ============

export function getThankYouConfig(): ThankYouConfig {
  const s = localStorage.getItem(THANKYOU_KEY);
  if (s) { const p = JSON.parse(s); if (p.rules) return p; }
  return defaultThankYou;
}

export async function saveThankYouConfig(config: ThankYouConfig): Promise<boolean> {
  if (!isLoggedIn()) return false;
  localStorage.setItem(THANKYOU_KEY, JSON.stringify(config));
  await syncConfigToSheet(); return true;
}

export function getThankYouRuleForProduct(productId: string): ThankYouRule | null {
  return getThankYouConfig().rules.find(r => r.active && r.triggerProductIds.includes(productId)) || null;
}

// ============ SYNC CONFIG TO/FROM SHEET ============

async function syncConfigToSheet(): Promise<void> {
  if (!isScriptConfigured() || !isLoggedIn()) return;
  try {
    await scriptPost({
      action: 'saveSiteConfig', passcode: getStoredPasscode(),
      offers: JSON.stringify(getOffers()),
      thankYou: JSON.stringify(getThankYouConfig()),
    });
  } catch (e) { console.error('Config sync to sheet failed:', e); }
}

/**
 * Load offers + thankyou from Sheet — PUBLIC GET, no auth.
 * This is what makes offers/bundles visible on ALL devices.
 */
export async function fetchConfigFromSheet(): Promise<{ offers: Offer[]; thankYou: ThankYouConfig }> {
  if (!isScriptConfigured()) {
    return { offers: getOffers(), thankYou: getThankYouConfig() };
  }
  try {
    const result = await scriptGet('getSiteConfig');
    let offers: Offer[] = [];
    let thankYou: ThankYouConfig = defaultThankYou;

    if (result.success) {
      if (result.offers && result.offers !== '[]' && result.offers !== '') {
        try { offers = JSON.parse(result.offers); } catch { offers = []; }
      }
      if (result.thankYou && result.thankYou !== '{}' && result.thankYou !== '') {
        try { const parsed = JSON.parse(result.thankYou); if (parsed.rules) thankYou = parsed; } catch { /* */ }
      }
      // Save to localStorage as cache
      saveOffersLocal(offers);
      localStorage.setItem(THANKYOU_KEY, JSON.stringify(thankYou));
      return { offers, thankYou };
    }
  } catch (e) {
    console.error('Fetch config from sheet failed:', e);
  }
  // Fallback to whatever is in localStorage
  return { offers: getOffers(), thankYou: getThankYouConfig() };
}
