import { useState, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/store/Navbar';
import Hero from './components/store/Hero';
import AboutSection from './components/store/AboutSection';
import FeaturedProducts from './components/store/FeaturedProducts';
import ProductCard from './components/store/ProductCard';
import ProductPage from './components/store/ProductPage';
import CheckoutModal from './components/store/CheckoutModal';
import Footer from './components/store/Footer';
import AdminLogin from './components/admin/AdminLogin';
import AdminPanel from './components/admin/AdminPanel';
import {
  getOrders, addOrder, updateOrderStatus, deleteOrder,
  getProducts, addProduct, updateProduct, deleteProduct, getProductCategories,
  getCategories, addCategory, updateCategory, deleteCategory,
  getSettings, saveSettings, verifyPasscode,
  isAuthenticated, setAuthenticated,
  getStoredPasscode, setStoredPasscode,
} from './data/store';
import { Product, Order, SiteSettings, Category } from './types';
import { Package } from 'lucide-react';

type View = 'store' | 'product' | 'admin-login' | 'admin-panel';

export default function App() {
  const [view, setView] = useState<View>('store');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(getOrders());
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [categories, setCategories] = useState<Category[]>(getCategories());
  const [productCategories, setProductCategories] = useState<string[]>(getProductCategories());
  const [settings, setSettings] = useState<SiteSettings>(getSettings());

  useEffect(() => {
    setProductCategories(getProductCategories());
  }, [products]);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const selectedProduct = selectedProductId 
    ? products.find(p => p.id === selectedProductId) 
    : null;

  const relatedProducts = selectedProduct?.relatedProducts
    ? products.filter(p => selectedProduct.relatedProducts?.includes(p.id))
    : [];

  const handleBuy = (product: Product) => {
    setCheckoutProduct(product);
    setCheckoutOpen(true);
  };

  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setView('product');
    window.scrollTo(0, 0);
  };

  const handleBackToStore = () => {
    setSelectedProductId(null);
    setView('store');
  };

  const handleCheckoutSubmit = async (data: { name: string; whatsapp: string; email: string; senderBkash: string }) => {
    if (!checkoutProduct) return;
    try {
      const order = await addOrder({
        name: data.name,
        whatsapp: data.whatsapp,
        email: data.email,
        senderBkash: data.senderBkash,
        product: checkoutProduct.name,
        price: checkoutProduct.price,
      });
      setOrders(getOrders());
      toast.success(`Order placed! ID: ${order.id}`, { icon: '✨', duration: 4000 });
    } catch (err) {
      console.error('Order error:', err);
      toast.error('Failed to place order. Please try again.');
    }
  };

  const handleAdminLogin = useCallback(async (code: string): Promise<boolean> => {
    try {
      const valid = await verifyPasscode(code);
      if (valid) {
        setAuthenticated(true);
        setStoredPasscode(code);
        setView('admin-panel');
        toast.success('Welcome to Site Engine', { icon: '🔐' });
      }
      return valid;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  }, []);

  const handleUpdateStatus = useCallback((orderId: string, status: Order['status']): boolean => {
    const success = updateOrderStatus(orderId, status);
    if (success) {
      setOrders(getOrders());
      toast.success(`Order → ${status}`, {
        icon: status === 'Sent' ? '📦' : status === 'Cancelled' ? '❌' : '✅',
      });
      if (status === 'Sent') {
        toast('Customer notified via email', { icon: '📧', duration: 3000 });
      }
    } else {
      toast.error('Session expired. Please re-login.');
    }
    return success;
  }, []);

  const handleDeleteOrder = useCallback((orderId: string): boolean => {
    const success = deleteOrder(orderId);
    if (success) {
      setOrders(getOrders());
      toast.success('Order deleted');
    }
    return success;
  }, []);

  const handleAddProduct = useCallback((productData: Omit<Product, 'id'>): Product | null => {
    const newProduct = addProduct(productData);
    if (newProduct) {
      setProducts(getProducts());
      toast.success('Product added', { icon: '🛍️' });
    }
    return newProduct;
  }, []);

  const handleUpdateProduct = useCallback((productId: string, updates: Partial<Product>): boolean => {
    const success = updateProduct(productId, updates);
    if (success) {
      setProducts(getProducts());
      toast.success('Product updated');
    }
    return success;
  }, []);

  const handleDeleteProduct = useCallback((productId: string): boolean => {
    const success = deleteProduct(productId);
    if (success) {
      setProducts(getProducts());
      toast.success('Product deleted');
    }
    return success;
  }, []);

  const handleAddCategory = useCallback((categoryData: Omit<Category, 'id'>): Category | null => {
    const newCategory = addCategory(categoryData);
    if (newCategory) {
      setCategories(getCategories());
      toast.success('Category added');
    }
    return newCategory;
  }, []);

  const handleUpdateCategory = useCallback((categoryId: string, updates: Partial<Category>): boolean => {
    const success = updateCategory(categoryId, updates);
    if (success) {
      setCategories(getCategories());
      toast.success('Category updated');
    }
    return success;
  }, []);

  const handleDeleteCategory = useCallback((categoryId: string): boolean => {
    const success = deleteCategory(categoryId);
    if (success) {
      setCategories(getCategories());
      toast.success('Category deleted');
    }
    return success;
  }, []);

  const handleSaveSettings = useCallback((newSettings: SiteSettings): boolean => {
    const success = saveSettings(newSettings);
    if (success) {
      setSettings(newSettings);
      toast.success('Settings saved', { icon: '⚙️' });
    }
    return success;
  }, []);

  const handleLogout = () => {
    setAuthenticated(false);
    setStoredPasscode('');
    setView('store');
    toast('Logged out', { icon: '👋' });
  };

  const toastOptions = {
    className: '!rounded-2xl !shadow-xl !border !border-soft-neutral !text-sm !font-medium !bg-natural-white',
    style: { fontFamily: 'Inter, sans-serif' },
  };

  // Admin Login View
  if (view === 'admin-login') {
    return (
      <>
        <Toaster position="top-right" toastOptions={toastOptions} />
        <AdminLogin onLogin={handleAdminLogin} onBack={() => setView('store')} />
      </>
    );
  }

  // Admin Panel View
  if (view === 'admin-panel') {
    return (
      <>
        <Toaster position="top-right" toastOptions={toastOptions} />
        <AdminPanel
          orders={orders}
          products={products}
          categories={categories}
          settings={settings}
          onUpdateStatus={handleUpdateStatus}
          onDeleteOrder={handleDeleteOrder}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onSaveSettings={handleSaveSettings}
          onLogout={handleLogout}
        />
      </>
    );
  }

  // Product Page View
  if (view === 'product' && selectedProduct) {
    return (
      <>
        <Toaster position="top-right" toastOptions={toastOptions} />
        <Navbar
          onAdminClick={() => {
            if (isAuthenticated() && getStoredPasscode()) {
              setView('admin-panel');
            } else {
              setView('admin-login');
            }
          }}
          storeName={settings.storeName}
        />
        <ProductPage
          product={selectedProduct}
          relatedProducts={relatedProducts}
          currency={settings.currency}
          onBuy={handleBuy}
          onBack={handleBackToStore}
          onViewProduct={handleViewProduct}
        />
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          product={checkoutProduct}
          bkashNumber={settings.bkashNumber}
          currency={settings.currency}
          onSubmit={handleCheckoutSubmit}
        />
        <Footer storeName={settings.storeName} bkashNumber={settings.bkashNumber} />
      </>
    );
  }

  // Storefront View
  return (
    <div className="min-h-screen bg-natural-white">
      <Toaster position="top-right" toastOptions={toastOptions} />

      <Navbar
        onAdminClick={() => {
          if (isAuthenticated() && getStoredPasscode()) {
            setView('admin-panel');
          } else {
            setView('admin-login');
          }
        }}
        storeName={settings.storeName}
      />

      <Hero settings={settings} />
      <AboutSection settings={settings} />
      <FeaturedProducts 
        products={products} 
        onBuy={handleBuy} 
        onViewProduct={handleViewProduct}
        currency={settings.currency} 
      />

      {/* Shop Section */}
      <section id="shop" className="py-24 sm:py-32 bg-soft-neutral">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-medium text-forest-green uppercase tracking-elegant mb-4 animate-fade-in">Full Catalog</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-text-primary animate-fade-in stagger-1">
              Shop All Products
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-in stagger-2">
            {productCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium uppercase tracking-elegant transition-all ${
                  selectedCategory === cat
                    ? 'bg-forest-green text-natural-white'
                    : 'bg-natural-white text-text-secondary border border-warm-gray hover:border-forest-green hover:text-forest-green'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index} 
                  onBuy={handleBuy} 
                  onViewProduct={handleViewProduct}
                  currency={settings.currency} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-warm-gray mx-auto mb-4" />
              <p className="text-text-muted font-medium">No products in this category</p>
            </div>
          )}
        </div>
      </section>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        product={checkoutProduct}
        bkashNumber={settings.bkashNumber}
        currency={settings.currency}
        onSubmit={handleCheckoutSubmit}
      />

      <Footer storeName={settings.storeName} bkashNumber={settings.bkashNumber} />
    </div>
  );
}
