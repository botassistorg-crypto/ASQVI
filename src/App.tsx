import { useState, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/store/Navbar';
import Hero from './components/store/Hero';
import AboutSection from './components/store/AboutSection';
import FeaturedProducts from './components/store/FeaturedProducts';
import ProductCard from './components/store/ProductCard';
import ProductPage from './components/store/ProductPage';
import BundleCard from './components/store/BundleCard';
import CategoryPopup from './components/store/CategoryPopup';
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
import { Product, Order, SiteSettings, Category, Offer, ThankYouConfig, ProductTier } from './types';
import { Package, Loader2, Gift, ArrowRight } from 'lucide-react';
import { trackPageView, trackViewContent, trackInitiateCheckout, trackPurchase } from './utils/tracking';

type View = 'store' | 'product' | 'category' | 'admin-login' | 'admin-panel';

// Parse URL on load to restore the correct view
function getInitialState(): { view: View; productId: string | null; category: string } {
  const path = window.location.pathname;
  const productMatch = path.match(/^\/product\/(.+)/);
  if (productMatch) return { view: 'product', productId: decodeURIComponent(productMatch[1]), category: '' };
  const catMatch = path.match(/^\/category\/(.+)/);
  if (catMatch) return { view: 'category', productId: null, category: decodeURIComponent(catMatch[1]) };
  if (path === '/admin') return { view: 'admin-login', productId: null, category: '' };
  return { view: 'store', productId: null, category: '' };
}

export default function App() {
  const initial = getInitialState();
  const [view, setView] = useState<View>(initial.view);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categoryPageName, setCategoryPageName] = useState(initial.category);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initial.productId);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isUpsellPurchase, setIsUpsellPurchase] = useState(false);
  const [upsellOriginalPrice, setUpsellOriginalPrice] = useState(0);
  const [activeOfferDetails, setActiveOfferDetails] = useState('');
  const [activeOriginalPrice, setActiveOriginalPrice] = useState(0);
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<ProductTier | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
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

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const s = getInitialState();
      setView(s.view);
      setSelectedProductId(s.productId);
      setCategoryPageName(s.category);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const c = getProductsLocal(); if (c.length > 0) setProducts(c); else setLoadingProducts(true);
    fetchProductsFromSheet().then(f => { setProducts(f); setLoadingProducts(false); }).catch(() => setLoadingProducts(false));
  }, []);
  useEffect(() => { fetchConfigFromSheet().then(({ offers: o, thankYou: t }) => { setOffers(o); setThankYouConfig(t); }); }, []);
  useEffect(() => { setProductCategories(getProductCategories()); }, [products]);

  const selectedProduct = selectedProductId ? products.find(p => p.id === selectedProductId) : null;
  const relatedProducts = selectedProduct?.relatedProducts ? products.filter(p => selectedProduct.relatedProducts?.includes(p.id)) : [];
  const activeBundles = offers.filter(o => o.active && o.type === 'bundle').slice(0, 3);
  const purchasedProduct = lastOrder ? products.find(p => p.name === lastOrder.product) : null;
  const matchedRule = purchasedProduct ? thankYouConfig.rules.find(r => r.active && r.triggerProductIds.includes(purchasedProduct.id)) || null : null;
  const upsellProducts = matchedRule ? matchedRule.upsellProductIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[] : [];
  // ONLY discount offers affect product prices — NOT bundles, NOT upsells
  const getOffer = (pid: string) => offers.find(o => o.active && o.type === 'discount' && o.productIds.includes(pid));
  const selectedProductOffer = selectedProduct ? getOffer(selectedProduct.id) : undefined;

  // Group products by category (max 3 per category for homepage)
  const categoriesWithProducts = productCategories.filter(c => c !== 'All').map(cat => ({
    name: cat,
    products: products.filter(p => p.category === cat),
  })).filter(c => c.products.length > 0);

  // Category page products — "All" means ALL products
  const categoryPageProducts = categoryPageName === 'All' ? products : categoryPageName ? products.filter(p => p.category === categoryPageName) : [];

  // --- HANDLERS ---
  const handleBuy = (product: Product, offer?: Offer, selectedTier?: ProductTier) => {
    let price = product.price; let origP = 0; let det = '';
    if (offer && offer.active) {
      if (offer.discountPercent) { origP = product.price; price = Math.round(product.price * (1 - offer.discountPercent / 100)); det = `${offer.discountPercent}% OFF — "${offer.name}"`; }
      else if (offer.discountFlat) { origP = product.price; price = Math.max(0, product.price - offer.discountFlat); det = `৳${offer.discountFlat} OFF — "${offer.name}"`; }
    }
    const finalPrice = selectedTier ? selectedTier.price : price;
setCheckoutProduct({ ...product, price: finalPrice });
setSelectedTierForCheckout(selectedTier || null);
setActiveOriginalPrice(origP);
setActiveOfferDetails(det);
setCheckoutOpen(true);
setIsUpsellPurchase(false);
trackInitiateCheckout({ id: product.id, name: product.name, price: finalPrice });
  };
  const handleBuyBundle = (offer: Offer) => {
    const allIds = [...offer.productIds, ...(offer.bundleProductIds || [])];
    const bp = allIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
    const names = bp.map(p => p.name).join(' + ');
    const origP = offer.bundleOriginalPrice || bp.reduce((s, p) => s + p.price, 0);
    const bPrice = offer.bundlePrice || origP;
    const bundleProd: Product = { id: offer.id, name: `Bundle: ${names}`, description: offer.bundleDescription || offer.name, price: bPrice, category: 'Bundle', image: bp[0]?.image || '', rating: 0, reviews: 0, inStock: true };
    setCheckoutProduct(bundleProd); setActiveOriginalPrice(origP); setActiveOfferDetails(`Bundle "${offer.name}" — ${bp.length} products`);
    setCheckoutOpen(true); setIsUpsellPurchase(false);
    trackInitiateCheckout({ id: offer.id, name: bundleProd.name, price: bPrice });
  };
  const handleViewProduct = (pid: string) => {
    setSelectedProductId(pid); setView('product'); window.scrollTo(0, 0);
    window.history.pushState({}, '', '/product/' + encodeURIComponent(pid));
    const p = products.find(x => x.id === pid);
    if (p) {
      document.title = p.name + ' — ' + settings.storeName;
      trackViewContent({ id: p.id, name: p.name, price: p.price, category: p.category });
    }
  };
  const handleBackToStore = () => {
    setSelectedProductId(null); setView('store');
    window.history.pushState({}, '', '/');
    document.title = settings.storeName;
  };
  const handleViewCategory = (cat: string) => {
    setCategoryPageName(cat); setView('category'); window.scrollTo(0, 0);
    window.history.pushState({}, '', '/category/' + encodeURIComponent(cat));
    document.title = cat + ' — ' + settings.storeName;
  };
  const handleCheckoutSubmit = async (data: CustomerData) => {
    if (!checkoutProduct) return;
    try {
      setLastCustomer(data);
      let det = activeOfferDetails; let origP: number | undefined = activeOriginalPrice || undefined;
      if (isUpsellPurchase && matchedRule) { origP = upsellOriginalPrice; det = matchedRule.upsellDiscount ? `${matchedRule.upsellDiscount}% OFF via "${matchedRule.name}"` : `Upsell via "${matchedRule.name}"`; }
      const order = await addOrder(
        { name: data.name, whatsapp: data.whatsapp, email: data.email, senderBkash: data.senderBkash, product: checkoutProduct.name, price: checkoutProduct.price },
        { orderType: isUpsellPurchase ? 'upsell' : activeOfferDetails ? 'offer' : 'direct', offerDetails: det, originalPrice: origP }
      );
      setOrders(getOrders()); setLastOrder(order); setCheckoutOpen(false); setActiveOfferDetails(''); setActiveOriginalPrice(0);
      trackPurchase({ id: order.id, product: order.product, price: order.price }); setShowThankYou(true);
    } catch { toast.error('Failed to place order.'); }
  };
  const handleBuyUpsell = (product: Product) => {
    setShowThankYou(false); const orig = product.price; let disc = orig;
    if (matchedRule?.upsellDiscount) disc = Math.round(orig * (1 - matchedRule.upsellDiscount / 100));
    setCheckoutProduct({ ...product, price: disc }); setUpsellOriginalPrice(orig); setCheckoutOpen(true); setIsUpsellPurchase(true);
    trackInitiateCheckout({ id: product.id, name: product.name, price: disc });
  };
  const handleCloseThankYou = () => { setShowThankYou(false); setIsUpsellPurchase(false); };

  // Admin handlers
  const handleAdminLogin = useCallback(async (c: string) => { try { const v = await verifyPasscode(c); if (v) { setAuthenticated(true); setStoredPasscode(c); setView('admin-panel'); window.history.pushState({}, '', '/admin'); } return v; } catch { return false; } }, []);
  const handleUpdateStatus = useCallback((id: string, s: Order['status']) => { const ok = updateOrderStatus(id, s); if (ok) { setOrders(getOrders()); toast.success(`→ ${s}`, { icon: '✅' }); } return ok; }, []);
  const handleDeleteOrder = useCallback((id: string) => { const ok = deleteOrder(id); if (ok) { setOrders(getOrders()); toast.success('Deleted'); } return ok; }, []);
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
  const handleLogout = () => { setAuthenticated(false); setStoredPasscode(''); setView('store'); window.history.pushState({}, '', '/'); };

  const to = { className: '!rounded-2xl !shadow-xl !border !border-soft-neutral !text-sm !font-medium !bg-natural-white', style: { fontFamily: 'Inter, sans-serif' } };
  const nav = () => {
    if (isAuthenticated() && getStoredPasscode()) { setView('admin-panel'); window.history.pushState({}, '', '/admin'); }
    else { setView('admin-login'); window.history.pushState({}, '', '/admin'); }
  };

  // Shared components
  const checkoutEl = <CheckoutModal isOpen={checkoutOpen} onClose={() => { setCheckoutOpen(false); setSelectedTierForCheckout(null); }} product={checkoutProduct} bkashNumber={settings.bkashNumber} currency={settings.currency} previousCustomer={lastCustomer} isUpsell={isUpsellPurchase} selectedTier={selectedTierForCheckout} onSubmit={handleCheckoutSubmit} />;
  const thankYouEl = showThankYou && lastOrder ? <ThankYouPage order={lastOrder} heading={matchedRule?.heading || thankYouConfig.defaultHeading} message={matchedRule?.message || thankYouConfig.defaultMessage} rule={matchedRule} upsellProducts={upsellProducts} currency={settings.currency} onBuyUpsell={handleBuyUpsell} onClose={handleCloseThankYou} /> : null;

  // --- VIEWS ---
  if (view === 'admin-login') return (<><Toaster position="top-right" toastOptions={to} /><AdminLogin onLogin={handleAdminLogin} onBack={() => setView('store')} /></>);

  if (view === 'admin-panel') return (
    <><Toaster position="top-right" toastOptions={to} />
      <AdminPanel orders={orders} products={products} categories={categories} offers={offers} thankYouConfig={thankYouConfig} settings={settings}
        onUpdateStatus={handleUpdateStatus} onDeleteOrder={handleDeleteOrder} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct}
        onAddCategory={handleAddCategory} onUpdateCategory={handleUpdateCategory} onDeleteCategory={handleDeleteCategory}
        onAddOffer={handleAddOffer} onUpdateOffer={handleUpdateOffer} onDeleteOffer={handleDeleteOffer} onSaveThankYou={handleSaveThankYou}
        onSaveSettings={handleSaveSettings} onLogout={handleLogout} />
    </>
  );

  if (view === 'product' && selectedProduct) return (
    <><Toaster position="top-right" toastOptions={to} />
      <Navbar onAdminClick={nav} onCollectionClick={() => setShowCategoryPopup(true)} storeName={settings.storeName} />
      <ProductPage product={selectedProduct} relatedProducts={relatedProducts} currency={settings.currency} offer={selectedProductOffer} onBuy={handleBuy} onBack={handleBackToStore} onViewProduct={handleViewProduct} />
      {checkoutEl}{thankYouEl}
      <CategoryPopup isOpen={showCategoryPopup} onClose={() => setShowCategoryPopup(false)} categories={productCategories} onSelectCategory={handleViewCategory} />
      <Footer storeName={settings.storeName} bkashNumber={settings.bkashNumber} />
    </>
  );

  // Category Page
  if (view === 'category' && categoryPageName) {
    const isAllProducts = categoryPageName === 'All';
    const pageTitle = isAllProducts ? 'All Products' : categoryPageName;
    const allCatsGrouped = categoriesWithProducts;
    // Bundles assigned to this category
    const categoryBundles = isAllProducts
      ? activeBundles
      : offers.filter(o => o.active && o.type === 'bundle' && o.category === categoryPageName).slice(0, 3);

    return (
      <><Toaster position="top-right" toastOptions={to} />
        <Navbar onAdminClick={nav} onCollectionClick={() => setShowCategoryPopup(true)} storeName={settings.storeName} />
        <section className="py-14 bg-natural-white min-h-screen">
          <div className="max-w-6xl mx-auto px-6">
            <button onClick={handleBackToStore} className="flex items-center gap-2 text-text-muted hover:text-forest-green text-sm font-medium uppercase tracking-wider mb-8 transition-colors">
              ← Back
            </button>
            <div className="text-center mb-10">
              <p className="text-[10px] font-semibold text-forest-green uppercase tracking-wider mb-2">Collection</p>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-text-primary">{pageTitle}</h1>
              <p className="text-sm text-text-muted mt-2">{categoryPageProducts.length} product{categoryPageProducts.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Category Bundles */}
            {categoryBundles.length > 0 && (
              <div className="mb-10">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 mb-2"><Gift className="w-3.5 h-3.5" /><span className="text-xs font-semibold uppercase tracking-wider">Bundles</span></div>
                </div>
                <div className={`grid gap-4 max-w-4xl mx-auto ${categoryBundles.length === 1 ? 'grid-cols-1 max-w-md' : categoryBundles.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                  {categoryBundles.map(b => <BundleCard key={b.id} offer={b} products={products} currency={settings.currency} onBuy={handleBuyBundle} />)}
                </div>
              </div>
            )}

            {isAllProducts ? (
              <div className="space-y-12">
                {allCatsGrouped.map(({ name, products: catProds }) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-xl font-semibold text-text-primary">{name}</h3>
                      {catProds.length > 3 && (
                        <button onClick={() => handleViewCategory(name)} className="flex items-center gap-1 text-xs font-medium text-forest-green uppercase tracking-wider hover:gap-2 transition-all">
                          See All ({catProds.length}) <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {catProds.slice(0, 3).map(p => <ProductCard key={p.id} product={p} index={0} onBuy={handleBuy} onViewProduct={handleViewProduct} currency={settings.currency} offer={getOffer(p.id)} />)}
                    </div>
                  </div>
                ))}
              </div>
            ) : categoryPageProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryPageProducts.map(p => <ProductCard key={p.id} product={p} index={0} onBuy={handleBuy} onViewProduct={handleViewProduct} currency={settings.currency} offer={getOffer(p.id)} />)}
              </div>
            ) : (
              <div className="text-center py-16"><Package className="w-12 h-12 text-warm-gray mx-auto mb-3" /><p className="text-sm text-text-muted">No products in this category</p></div>
            )}
          </div>
        </section>
        {checkoutEl}{thankYouEl}
        <CategoryPopup isOpen={showCategoryPopup} onClose={() => setShowCategoryPopup(false)} categories={productCategories} onSelectCategory={handleViewCategory} />
        <Footer storeName={settings.storeName} bkashNumber={settings.bkashNumber} />
      </>
    );
  }

  // --- STOREFRONT ---
  return (
    <div className="min-h-screen bg-natural-white">
      <Toaster position="top-right" toastOptions={to} />
      <Navbar onAdminClick={nav} onCollectionClick={() => setShowCategoryPopup(true)} storeName={settings.storeName} />
      <Hero settings={settings} />
      <AboutSection settings={settings} />
      {!loadingProducts && <FeaturedProducts products={products} onBuy={handleBuy} onViewProduct={handleViewProduct} currency={settings.currency} />}

      {/* Bundles — max 3 */}
      {activeBundles.length > 0 && (
        <section className="py-10 bg-natural-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 mb-3"><Gift className="w-3.5 h-3.5" /><span className="text-xs font-semibold uppercase tracking-wider">Special Bundles</span></div>
              <h2 className="font-display text-2xl font-semibold text-text-primary">Save More with Bundles</h2>
            </div>
            <div className={`grid gap-4 max-w-4xl mx-auto ${activeBundles.length === 1 ? 'grid-cols-1 max-w-md' : activeBundles.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {activeBundles.map(b => <BundleCard key={b.id} offer={b} products={products} currency={settings.currency} onBuy={handleBuyBundle} />)}
            </div>
          </div>
        </section>
      )}

      {/* Categories with max 3 products each + See More */}
      <section id="shop" className="py-14 sm:py-20 bg-soft-neutral">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-[10px] font-semibold text-forest-green uppercase tracking-wider mb-2">Full Catalog</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary">Shop All Products</h2>
          </div>

          {/* Category filter buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {productCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${selectedCategory === cat ? 'bg-forest-green text-natural-white' : 'bg-natural-white text-text-secondary border border-warm-gray hover:border-forest-green hover:text-forest-green'}`}>
                {cat}
              </button>
            ))}
          </div>

          {loadingProducts ? (
            <div className="text-center py-16"><Loader2 className="w-8 h-8 text-forest-green mx-auto mb-3 animate-spin" /></div>
          ) : selectedCategory === 'All' ? (
            /* Show each category with max 3 + See More */
            <div className="space-y-12">
              {categoriesWithProducts.map(({ name, products: catProducts }) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-xl font-semibold text-text-primary">{name}</h3>
                    {catProducts.length > 3 && (
                      <button onClick={() => handleViewCategory(name)} className="flex items-center gap-1 text-xs font-medium text-forest-green uppercase tracking-wider hover:gap-2 transition-all">
                        See All ({catProducts.length}) <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {catProducts.slice(0, 3).map(p => <ProductCard key={p.id} product={p} index={0} onBuy={handleBuy} onViewProduct={handleViewProduct} currency={settings.currency} offer={getOffer(p.id)} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Filtered view — show all in selected category */
            (() => {
              const filtered = products.filter(p => p.category === selectedCategory);
              return filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filtered.map(p => <ProductCard key={p.id} product={p} index={0} onBuy={handleBuy} onViewProduct={handleViewProduct} currency={settings.currency} offer={getOffer(p.id)} />)}
                </div>
              ) : (
                <div className="text-center py-16"><Package className="w-12 h-12 text-warm-gray mx-auto mb-3" /><p className="text-sm text-text-muted">No products</p></div>
              );
            })()
          )}
        </div>
      </section>

      {checkoutEl}{thankYouEl}
      <CategoryPopup isOpen={showCategoryPopup} onClose={() => setShowCategoryPopup(false)} categories={productCategories} onSelectCategory={handleViewCategory} />
      <Footer storeName={settings.storeName} bkashNumber={settings.bkashNumber} />
    </div>
  );
}
