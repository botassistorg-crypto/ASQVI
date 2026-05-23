import { useState, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/store/Navbar';
import Hero from './components/store/Hero';
import AboutSection from './components/store/AboutSection';
import FeaturedProducts from './components/store/FeaturedProducts';
import ProductCard from './components/store/ProductCard';
import ProductPage from './components/store/ProductPage';
import CheckoutModal from './components/store/CheckoutModal';
import ThankYouPage from './components/store/ThankYouPage';
import Footer from './components/store/Footer';
import AdminLogin from './components/admin/AdminLogin';
import AdminPanel from './components/admin/AdminPanel';
import {
  getOrders, addOrder, updateOrderStatus, deleteOrder,
  fetchProductsFromSheet, addProductToSheet, updateProductOnSheet, deleteProductFromSheet,
  getProductsLocal, getProductCategories,
  getCategories, addCategory, updateCategory, deleteCategory,
  getOffers, addOffer, updateOffer, deleteOffer,
  getThankYouConfig, saveThankYouConfig,
  getSettings, saveSettings, verifyPasscode,
  isAuthenticated, setAuthenticated,
  getStoredPasscode, setStoredPasscode,
} from './data/store';
import { Product, Order, SiteSettings, Category, Offer, ThankYouConfig } from './types';
import { Package, Loader2 } from 'lucide-react';
import { trackPageView, trackViewContent, trackInitiateCheckout, trackPurchase } from './utils/tracking';

type View = 'store' | 'product' | 'thankyou' | 'admin-login' | 'admin-panel';

export default function App() {
  const [view, setView] = useState<View>('store');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>(getOrders());
  const [products, setProducts] = useState<Product[]>(getProductsLocal());
  const [categories, setCategories] = useState<Category[]>(getCategories());
  const [offers, setOffers] = useState<Offer[]>(getOffers());
  const [thankYouConfig, setThankYouConfig] = useState<ThankYouConfig>(getThankYouConfig());
  const [productCategories, setProductCategories] = useState<string[]>(getProductCategories());
  const [settings, setSettings] = useState<SiteSettings>(getSettings());
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Meta Pixel + GA4: track page views on every view change
  // First call is skipped internally (index.html already fired it)
  useEffect(() => {
    trackPageView(view);
  }, [view]);

  // Load products from Sheet
  useEffect(() => {
    const cached = getProductsLocal();
    if (cached.length > 0) setProducts(cached);
    else setLoadingProducts(true);

    fetchProductsFromSheet()
      .then(fetched => { setProducts(fetched); setLoadingProducts(false); })
      .catch(() => setLoadingProducts(false));
  }, []);

  useEffect(() => { setProductCategories(getProductCategories()); }, [products]);

  const filteredProducts = selectedCategory === 'All'
    ? products : products.filter(p => p.category === selectedCategory);

  const selectedProduct = selectedProductId ? products.find(p => p.id === selectedProductId) : null;
  const relatedProducts = selectedProduct?.relatedProducts
    ? products.filter(p => selectedProduct.relatedProducts?.includes(p.id)) : [];

  // Find the matching thank-you upsell rule for the last purchased product
  const matchedRule = lastOrder && checkoutProduct
    ? thankYouConfig.rules.find(r => r.active && r.triggerProductIds.includes(checkoutProduct.id)) || null
    : null;
  const upsellProducts = matchedRule
    ? matchedRule.upsellProductIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[]
    : [];

  // --- STOREFRONT HANDLERS ---

  const handleBuy = (product: Product) => {
    setCheckoutProduct(product);
    setCheckoutOpen(true);
    trackInitiateCheckout({ id: product.id, name: product.name, price: product.price });
  };

  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setView('product');
    window.scrollTo(0, 0);
    const p = products.find(x => x.id === productId);
    if (p) trackViewContent({ id: p.id, name: p.name, price: p.price, category: p.category });
  };

  const handleBackToStore = () => { setSelectedProductId(null); setView('store'); };

  const handleCheckoutSubmit = async (data: { name: string; whatsapp: string; email: string; senderBkash: string }) => {
    if (!checkoutProduct) return;
    try {
      const order = await addOrder({
        name: data.name, whatsapp: data.whatsapp, email: data.email,
        senderBkash: data.senderBkash, product: checkoutProduct.name, price: checkoutProduct.price,
      });
      setOrders(getOrders());
      setLastOrder(order);
      setCheckoutOpen(false);
      trackPurchase({ id: order.id, product: order.product, price: order.price });
      setView('thankyou');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Order error:', err);
      toast.error('Failed to place order.');
    }
  };

  const handleBuyUpsell = (product: Product) => {
    setCheckoutProduct(product);
    setCheckoutOpen(true);
    trackInitiateCheckout({ id: product.id, name: product.name, price: product.price });
  };

  // --- ADMIN HANDLERS ---

  const handleAdminLogin = useCallback(async (code: string): Promise<boolean> => {
    try {
      const valid = await verifyPasscode(code);
      if (valid) { setAuthenticated(true); setStoredPasscode(code); setView('admin-panel'); }
      return valid;
    } catch { return false; }
  }, []);

  const handleUpdateStatus = useCallback((orderId: string, status: Order['status']): boolean => {
    const success = updateOrderStatus(orderId, status);
    if (success) { setOrders(getOrders()); toast.success(`Order → ${status}`, { icon: status === 'Sent' ? '📦' : '✅' }); }
    return success;
  }, []);

  const handleDeleteOrder = useCallback((orderId: string): boolean => {
    const success = deleteOrder(orderId);
    if (success) { setOrders(getOrders()); toast.success('Order deleted'); }
    return success;
  }, []);

  const handleAddProduct = useCallback(async (d: Omit<Product, 'id'>): Promise<Product | null> => {
    const p = await addProductToSheet(d);
    if (p) { setProducts(getProductsLocal()); toast.success('Product added', { icon: '🛍️' }); }
    return p;
  }, []);

  const handleUpdateProduct = useCallback(async (id: string, u: Partial<Product>): Promise<boolean> => {
    const s = await updateProductOnSheet(id, u);
    if (s) { setProducts(getProductsLocal()); toast.success('Product updated'); }
    return s;
  }, []);

  const handleDeleteProduct = useCallback(async (id: string): Promise<boolean> => {
    const s = await deleteProductFromSheet(id);
    if (s) { setProducts(getProductsLocal()); toast.success('Product deleted'); }
    return s;
  }, []);

  const handleAddCategory = useCallback((d: Omit<Category, 'id'>): Category | null => {
    const c = addCategory(d); if (c) setCategories(getCategories()); return c;
  }, []);
  const handleUpdateCategory = useCallback((id: string, u: Partial<Category>): boolean => {
    const s = updateCategory(id, u); if (s) setCategories(getCategories()); return s;
  }, []);
  const handleDeleteCategory = useCallback((id: string): boolean => {
    const s = deleteCategory(id); if (s) setCategories(getCategories()); return s;
  }, []);

  const handleAddOffer = useCallback((d: Omit<Offer, 'id'>): Offer | null => {
    const o = addOffer(d); if (o) { setOffers(getOffers()); toast.success('Offer created', { icon: '🎁' }); } return o;
  }, []);
  const handleUpdateOffer = useCallback((id: string, u: Partial<Offer>): boolean => {
    const s = updateOffer(id, u); if (s) { setOffers(getOffers()); toast.success('Offer updated'); } return s;
  }, []);
  const handleDeleteOffer = useCallback((id: string): boolean => {
    const s = deleteOffer(id); if (s) { setOffers(getOffers()); toast.success('Offer deleted'); } return s;
  }, []);
  const handleSaveThankYou = useCallback((c: ThankYouConfig): boolean => {
    const s = saveThankYouConfig(c); if (s) { setThankYouConfig(c); toast.success('Thank You page saved', { icon: '🎉' }); } return s;
  }, []);

  const handleSaveSettings = useCallback((s: SiteSettings): boolean => {
    const ok = saveSettings(s); if (ok) { setSettings(s); toast.success('Settings saved', { icon: '⚙️' }); } return ok;
  }, []);

  const handleLogout = () => { setAuthenticated(false); setStoredPasscode(''); setView('store'); };

  const toastOpts = {
    className: '!rounded-2xl !shadow-xl !border !border-soft-neutral !text-sm !font-medium !bg-natural-white',
    style: { fontFamily: 'Inter, sans-serif' },
  };

  // --- VIEWS ---

  if (view === 'admin-login') return (
    <><Toaster position="top-right" toastOptions={toastOpts} /><AdminLogin onLogin={handleAdminLogin} onBack={() => setView('store')} /></>
  );

  if (view === 'admin-panel') return (
    <><Toaster position="top-right" toastOptions={toastOpts} />
      <AdminPanel
        orders={orders} products={products} categories={categories}
        offers={offers} thankYouConfig={thankYouConfig} settings={settings}
        onUpdateStatus={handleUpdateStatus} onDeleteOrder={handleDeleteOrder}
        onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct}
        onAddCategory={handleAddCategory} onUpdateCategory={handleUpdateCategory} onDeleteCategory={handleDeleteCategory}
        onAddOffer={handleAddOffer} onUpdateOffer={handleUpdateOffer} onDeleteOffer={handleDeleteOffer}
        onSaveThankYou={handleSaveThankYou}
        onSaveSettings={handleSaveSettings} onLogout={handleLogout}
      />
    </>
  );

  if (view === 'thankyou' && lastOrder) return (
    <><Toaster position="top-right" toastOptions={toastOpts} />
      <Navbar onAdminClick={() => { if (isAuthenticated() && getStoredPasscode()) setView('admin-panel'); else setView('admin-login'); }} storeName={settings.storeName} />
      <ThankYouPage
        order={lastOrder}
        heading={matchedRule?.heading || thankYouConfig.defaultHeading}
        message={matchedRule?.message || thankYouConfig.defaultMessage}
        rule={matchedRule}
        upsellProducts={upsellProducts}
        currency={settings.currency} onBuyUpsell={handleBuyUpsell} onBackToStore={handleBackToStore}
      />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} product={checkoutProduct}
        bkashNumber={settings.bkashNumber} currency={settings.currency} onSubmit={handleCheckoutSubmit} />
      <Footer storeName={settings.storeName} bkashNumber={settings.bkashNumber} />
    </>
  );

  if (view === 'product' && selectedProduct) return (
    <><Toaster position="top-right" toastOptions={toastOpts} />
      <Navbar onAdminClick={() => { if (isAuthenticated() && getStoredPasscode()) setView('admin-panel'); else setView('admin-login'); }} storeName={settings.storeName} />
      <ProductPage product={selectedProduct} relatedProducts={relatedProducts} currency={settings.currency} onBuy={handleBuy} onBack={handleBackToStore} onViewProduct={handleViewProduct} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} product={checkoutProduct}
        bkashNumber={settings.bkashNumber} currency={settings.currency} onSubmit={handleCheckoutSubmit} />
      <Footer storeName={settings.storeName} bkashNumber={settings.bkashNumber} />
    </>
  );

  // Storefront
  return (
    <div className="min-h-screen bg-natural-white">
      <Toaster position="top-right" toastOptions={toastOpts} />
      <Navbar onAdminClick={() => { if (isAuthenticated() && getStoredPasscode()) setView('admin-panel'); else setView('admin-login'); }} storeName={settings.storeName} />
      <Hero settings={settings} />
      <AboutSection settings={settings} />
      {!loadingProducts && <FeaturedProducts products={products} onBuy={handleBuy} onViewProduct={handleViewProduct} currency={settings.currency} />}

      <section id="shop" className="py-14 sm:py-20 bg-soft-neutral">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-[10px] font-semibold text-forest-green uppercase tracking-wider mb-2">Full Catalog</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary">Shop All Products</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {productCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${selectedCategory === cat ? 'bg-forest-green text-natural-white' : 'bg-natural-white text-text-secondary border border-warm-gray hover:border-forest-green hover:text-forest-green'}`}>
                {cat}
              </button>
            ))}
          </div>
          {loadingProducts ? (
            <div className="text-center py-16"><Loader2 className="w-8 h-8 text-forest-green mx-auto mb-3 animate-spin" /><p className="text-sm text-text-muted">Loading...</p></div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} index={0} onBuy={handleBuy} onViewProduct={handleViewProduct} currency={settings.currency} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16"><Package className="w-12 h-12 text-warm-gray mx-auto mb-3" /><p className="text-sm text-text-muted">No products in this category</p></div>
          )}
        </div>
      </section>

      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} product={checkoutProduct}
        bkashNumber={settings.bkashNumber} currency={settings.currency} onSubmit={handleCheckoutSubmit} />
      <Footer storeName={settings.storeName} bkashNumber={settings.bkashNumber} />
    </div>
  );
}
