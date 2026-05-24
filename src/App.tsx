import { useState, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/store/Navbar';
import Hero from './components/store/Hero';
import AboutSection from './components/store/AboutSection';
import FeaturedProducts from './components/store/FeaturedProducts';
import ProductCard from './components/store/ProductCard';
import ProductPage from './components/store/ProductPage';
import BundleCard from './components/store/BundleCard';
import CheckoutModal from './components/store/CheckoutModal';
import type { CustomerData } from './components/store/CheckoutModal';
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
  getThankYouConfig, saveThankYouConfig, fetchConfigFromSheet,
  getSettings, saveSettings, verifyPasscode,
  isAuthenticated, setAuthenticated,
  getStoredPasscode, setStoredPasscode,
} from './data/store';
import { Product, Order, SiteSettings, Category, Offer, ThankYouConfig } from './types';
import { Package, Loader2, Gift } from 'lucide-react';
import { trackPageView, trackViewContent, trackInitiateCheckout, trackPurchase } from './utils/tracking';

type View = 'store' | 'product' | 'admin-login' | 'admin-panel';

export default function App() {
  const [view, setView] = useState<View>('store');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isUpsellPurchase, setIsUpsellPurchase] = useState(false);
  const [upsellOriginalPrice, setUpsellOriginalPrice] = useState(0);
  const [activeOfferDetails, setActiveOfferDetails] = useState('');
  const [activeOriginalPrice, setActiveOriginalPrice] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [lastCustomer, setLastCustomer] = useState<CustomerData | null>(null);
  const [orders, setOrders] = useState<Order[]>(getOrders());
  const [products, setProducts] = useState<Product[]>(getProductsLocal());
  const [categories, setCategories] = useState<Category[]>(getCategories());
  const [offers, setOffers] = useState<Offer[]>(getOffers());
  const [thankYouConfig, setThankYouConfig] = useState<ThankYouConfig>(getThankYouConfig());
  const [productCategories, setProductCategories] = useState<string[]>(getProductCategories());
  const [settings, setSettings] = useState<SiteSettings>(getSettings());
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => { trackPageView(view); }, [view]);

  useEffect(() => {
    const cached = getProductsLocal();
    if (cached.length > 0) setProducts(cached); else setLoadingProducts(true);
    fetchProductsFromSheet().then(f => { setProducts(f); setLoadingProducts(false); }).catch(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    fetchConfigFromSheet().then(({ offers: o, thankYou: t }) => { setOffers(o); setThankYouConfig(t); });
  }, []);

  useEffect(() => { setProductCategories(getProductCategories()); }, [products]);

  const filteredProducts = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);
  const selectedProduct = selectedProductId ? products.find(p => p.id === selectedProductId) : null;
  const relatedProducts = selectedProduct?.relatedProducts ? products.filter(p => selectedProduct.relatedProducts?.includes(p.id)) : [];

  // Active bundles to show on storefront
  const activeBundles = offers.filter(o => o.active && o.type === 'bundle');

  // Thank you rule matching
  const purchasedProduct = lastOrder ? products.find(p => p.name === lastOrder.product) : null;
  const matchedRule = purchasedProduct ? thankYouConfig.rules.find(r => r.active && r.triggerProductIds.includes(purchasedProduct.id)) || null : null;
  const upsellProducts = matchedRule ? matchedRule.upsellProductIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[] : [];

  // Get active offer for a product
  const getOffer = (productId: string): Offer | undefined => {
    return offers.find(o => o.active && o.productIds.includes(productId) && (o.type === 'discount' || o.type === 'freebie'));
  };

  // Offer for product page
  const selectedProductOffer = selectedProduct ? getOffer(selectedProduct.id) : undefined;

  // --- STOREFRONT ---

  const handleBuy = (product: Product, offer?: Offer) => {
    let price = product.price;
    let originalPrice = 0;
    let offerDetails = '';

    if (offer && offer.active) {
      if (offer.discountPercent) {
        originalPrice = product.price;
        price = Math.round(product.price * (1 - offer.discountPercent / 100));
        offerDetails = `${offer.discountPercent}% OFF — "${offer.name}"`;
      } else if (offer.discountFlat) {
        originalPrice = product.price;
        price = Math.max(0, product.price - offer.discountFlat);
        offerDetails = `৳${offer.discountFlat} OFF — "${offer.name}"`;
      }
    }

    setCheckoutProduct({ ...product, price });
    setActiveOriginalPrice(originalPrice);
    setActiveOfferDetails(offerDetails);
    setCheckoutOpen(true);
    setIsUpsellPurchase(false);
    trackInitiateCheckout({ id: product.id, name: product.name, price });
  };

  const handleBuyBundle = (offer: Offer) => {
    const allIds = [...offer.productIds, ...(offer.bundleProductIds || [])];
    const bundleProducts = allIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
    const names = bundleProducts.map(p => p.name).join(' + ');
    const totalOriginal = bundleProducts.reduce((sum, p) => sum + p.price, 0);
    const bundlePrice = offer.bundlePrice || totalOriginal;

    // Create a virtual "bundle product" for checkout
    const bundleProduct: Product = {
      id: offer.id,
      name: `Bundle: ${names}`,
      description: offer.name,
      price: bundlePrice,
      category: 'Bundle',
      image: bundleProducts[0]?.image || '',
      rating: 0, reviews: 0, inStock: true,
    };

    setCheckoutProduct(bundleProduct);
    setActiveOriginalPrice(totalOriginal);
    setActiveOfferDetails(`Bundle "${offer.name}" — ${bundleProducts.length} products`);
    setCheckoutOpen(true);
    setIsUpsellPurchase(false);
    trackInitiateCheckout({ id: offer.id, name: bundleProduct.name, price: bundlePrice });
  };

  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setView('product');
    window.scrollTo(0, 0);
    const p = products.find(x => x.id === productId);
    if (p) trackViewContent({ id: p.id, name: p.name, price: p.price, category: p.category });
  };

  const handleBackToStore = () => { setSelectedProductId(null); setView('store'); };

  const handleCheckoutSubmit = async (data: CustomerData) => {
    if (!checkoutProduct) return;
    try {
      setLastCustomer(data);

      let offerDetails = activeOfferDetails;
      let originalPrice: number | undefined = activeOriginalPrice || undefined;

      // Override for upsell purchases
      if (isUpsellPurchase && matchedRule) {
        originalPrice = upsellOriginalPrice;
        offerDetails = matchedRule.upsellDiscount
          ? `${matchedRule.upsellDiscount}% OFF via "${matchedRule.name}"`
          : `Upsell via "${matchedRule.name}"`;
      }

      const order = await addOrder(
        { name: data.name, whatsapp: data.whatsapp, email: data.email,
          senderBkash: data.senderBkash, product: checkoutProduct.name, price: checkoutProduct.price },
        { orderType: isUpsellPurchase ? 'upsell' : activeOfferDetails ? 'offer' : 'direct', offerDetails, originalPrice }
      );
      setOrders(getOrders());
      setLastOrder(order);
      setCheckoutOpen(false);
      setActiveOfferDetails('');
      setActiveOriginalPrice(0);
      trackPurchase({ id: order.id, product: order.product, price: order.price });
      setShowThankYou(true);
    } catch (err) {
      console.error('Order error:', err);
      toast.error('Failed to place order.');
    }
  };

  const handleBuyUpsell = (product: Product) => {
    setShowThankYou(false);
    const orig = product.price;
    let discounted = orig;
    if (matchedRule?.upsellDiscount) discounted = Math.round(orig * (1 - matchedRule.upsellDiscount / 100));
    setCheckoutProduct({ ...product, price: discounted });
    setUpsellOriginalPrice(orig);
    setCheckoutOpen(true);
    setIsUpsellPurchase(true);
    trackInitiateCheckout({ id: product.id, name: product.name, price: discounted });
  };

  const handleCloseThankYou = () => { setShowThankYou(false); setIsUpsellPurchase(false); };

  // --- ADMIN ---

  const handleAdminLogin = useCallback(async (code: string): Promise<boolean> => {
    try { const v = await verifyPasscode(code); if (v) { setAuthenticated(true); setStoredPasscode(code); setView('admin-panel'); } return v; } catch { return false; }
  }, []);
  const handleUpdateStatus = useCallback((id: string, s: Order['status']): boolean => { const ok = updateOrderStatus(id, s); if (ok) { setOrders(getOrders()); toast.success(`→ ${s}`, { icon: '✅' }); } return ok; }, []);
  const handleDeleteOrder = useCallback((id: string): boolean => { const ok = deleteOrder(id); if (ok) { setOrders(getOrders()); toast.success('Deleted'); } return ok; }, []);
  const handleAddProduct = useCallback(async (d: Omit<Product, 'id'>) => { const p = await addProductToSheet(d); if (p) { setProducts(getProductsLocal()); toast.success('Added', { icon: '🛍️' }); } return p; }, []);
  const handleUpdateProduct = useCallback(async (id: string, u: Partial<Product>) => { const s = await updateProductOnSheet(id, u); if (s) { setProducts(getProductsLocal()); toast.success('Updated'); } return s; }, []);
  const handleDeleteProduct = useCallback(async (id: string) => { const s = await deleteProductFromSheet(id); if (s) { setProducts(getProductsLocal()); toast.success('Deleted'); } return s; }, []);
  const handleAddCategory = useCallback((d: Omit<Category, 'id'>) => { const c = addCategory(d); if (c) setCategories(getCategories()); return c; }, []);
  const handleUpdateCategory = useCallback((id: string, u: Partial<Category>) => { const s = updateCategory(id, u); if (s) setCategories(getCategories()); return s; }, []);
  const handleDeleteCategory = useCallback((id: string) => { const s = deleteCategory(id); if (s) setCategories(getCategories()); return s; }, []);
  const handleAddOffer = useCallback(async (d: Omit<Offer, 'id'>) => { const o = await addOffer(d); if (o) { setOffers(getOffers()); toast.success('Created', { icon: '🎁' }); } return o; }, []);
  const handleUpdateOffer = useCallback(async (id: string, u: Partial<Offer>) => { const s = await updateOffer(id, u); if (s) { setOffers(getOffers()); toast.success('Updated'); } return s; }, []);
  const handleDeleteOffer = useCallback(async (id: string) => { const s = await deleteOffer(id); if (s) { setOffers(getOffers()); toast.success('Deleted'); } return s; }, []);
  const handleSaveThankYou = useCallback(async (c: ThankYouConfig) => { const s = await saveThankYouConfig(c); if (s) { setThankYouConfig(c); toast.success('Saved', { icon: '🎉' }); } return s; }, []);
  const handleSaveSettings = useCallback((s: SiteSettings) => { const ok = saveSettings(s); if (ok) { setSettings(s); toast.success('Saved', { icon: '⚙️' }); } return ok; }, []);
  const handleLogout = () => { setAuthenticated(false); setStoredPasscode(''); setView('store'); };

  const toastOpts = { className: '!rounded-2xl !shadow-xl !border !border-soft-neutral !text-sm !font-medium !bg-natural-white', style: { fontFamily: 'Inter, sans-serif' } };
  const navAction = () => { if (isAuthenticated() && getStoredPasscode()) setView('admin-panel'); else setView('admin-login'); };

  // --- VIEWS ---

  if (view === 'admin-login') return (<><Toaster position="top-right" toastOptions={toastOpts} /><AdminLogin onLogin={handleAdminLogin} onBack={() => setView('store')} /></>);

  if (view === 'admin-panel') return (
    <><Toaster position="top-right" toastOptions={toastOpts} />
      <AdminPanel orders={orders} products={products} categories={categories}
        offers={offers} thankYouConfig={thankYouConfig} settings={settings}
        onUpdateStatus={handleUpdateStatus} onDeleteOrder={handleDeleteOrder}
        onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct}
        onAddCategory={handleAddCategory} onUpdateCategory={handleUpdateCategory} onDeleteCategory={handleDeleteCategory}
        onAddOffer={handleAddOffer} onUpdateOffer={handleUpdateOffer} onDeleteOffer={handleDeleteOffer}
        onSaveThankYou={handleSaveThankYou} onSaveSettings={handleSaveSettings} onLogout={handleLogout} />
    </>
  );

  if (view === 'product' && selectedProduct) return (
    <><Toaster position="top-right" toastOptions={toastOpts} />
      <Navbar onAdminClick={navAction} storeName={settings.storeName} />
      <ProductPage product={selectedProduct} relatedProducts={relatedProducts} currency={settings.currency}
        offer={selectedProductOffer} onBuy={handleBuy} onBack={handleBackToStore} onViewProduct={handleViewProduct} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} product={checkoutProduct}
        bkashNumber={settings.bkashNumber} currency={settings.currency} previousCustomer={lastCustomer} isUpsell={isUpsellPurchase} onSubmit={handleCheckoutSubmit} />
      {showThankYou && lastOrder && <ThankYouPage order={lastOrder} heading={matchedRule?.heading || thankYouConfig.defaultHeading}
        message={matchedRule?.message || thankYouConfig.defaultMessage} rule={matchedRule} upsellProducts={upsellProducts}
        currency={settings.currency} onBuyUpsell={handleBuyUpsell} onClose={handleCloseThankYou} />}
      <Footer storeName={settings.storeName} bkashNumber={settings.bkashNumber} />
    </>
  );

  // Storefront
  return (
    <div className="min-h-screen bg-natural-white">
      <Toaster position="top-right" toastOptions={toastOpts} />
      <Navbar onAdminClick={navAction} storeName={settings.storeName} />
      <Hero settings={settings} />
      <AboutSection settings={settings} />
      {!loadingProducts && <FeaturedProducts products={products} onBuy={handleBuy} onViewProduct={handleViewProduct} currency={settings.currency} />}

      {/* Bundles Section */}
      {activeBundles.length > 0 && (
        <section className="py-10 bg-natural-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 mb-3">
                <Gift className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Special Bundles</span>
              </div>
              <h2 className="font-display text-2xl font-semibold text-text-primary">Save More with Bundles</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {activeBundles.map(b => <BundleCard key={b.id} offer={b} products={products} currency={settings.currency} onBuy={handleBuyBundle} />)}
            </div>
          </div>
        </section>
      )}

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
            <div className="text-center py-16"><Loader2 className="w-8 h-8 text-forest-green mx-auto mb-3 animate-spin" /></div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} index={0} onBuy={handleBuy}
                  onViewProduct={handleViewProduct} currency={settings.currency}
                  offer={getOffer(p.id)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16"><Package className="w-12 h-12 text-warm-gray mx-auto mb-3" /><p className="text-sm text-text-muted">No products</p></div>
          )}
        </div>
      </section>

      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} product={checkoutProduct}
        bkashNumber={settings.bkashNumber} currency={settings.currency} previousCustomer={lastCustomer} isUpsell={isUpsellPurchase} onSubmit={handleCheckoutSubmit} />
      {showThankYou && lastOrder && <ThankYouPage order={lastOrder} heading={matchedRule?.heading || thankYouConfig.defaultHeading}
        message={matchedRule?.message || thankYouConfig.defaultMessage} rule={matchedRule} upsellProducts={upsellProducts}
        currency={settings.currency} onBuyUpsell={handleBuyUpsell} onClose={handleCloseThankYou} />}
      <Footer storeName={settings.storeName} bkashNumber={settings.bkashNumber} />
    </div>
  );
}
