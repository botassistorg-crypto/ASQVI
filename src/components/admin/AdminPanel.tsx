import { useState, useMemo } from 'react';
import {
  LayoutDashboard, Package, Settings, LogOut, Gift,
  Search, BarChart3, DollarSign, Clock, Users, ShoppingCart, FolderOpen
} from 'lucide-react';
import OrdersTable from './OrdersTable';
import ProductsPanel from './ProductsPanel';
import CategoriesPanel from './CategoriesPanel';
import OffersPanel from './OffersPanel';
import SettingsPanel from './SettingsPanel';
import { Order, SiteSettings, Product, Category, Offer, ThankYouConfig } from '../../types';

interface AdminPanelProps {
  orders: Order[];
  products: Product[];
  categories: Category[];
  offers: Offer[];
  thankYouConfig: ThankYouConfig;
  settings: SiteSettings;
  onUpdateStatus: (orderId: string, status: Order['status']) => boolean;
  onDeleteOrder: (orderId: string) => boolean;
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => Promise<boolean>;
  onDeleteProduct: (productId: string) => Promise<boolean>;
  onAddCategory: (category: Omit<Category, 'id'>) => Category | null;
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => boolean;
  onDeleteCategory: (categoryId: string) => boolean;
  onAddOffer: (offer: Omit<Offer, 'id'>) => Offer | null;
  onUpdateOffer: (offerId: string, updates: Partial<Offer>) => boolean;
  onDeleteOffer: (offerId: string) => boolean;
  onSaveThankYou: (config: ThankYouConfig) => boolean;
  onSaveSettings: (settings: SiteSettings) => boolean;
  onLogout: () => void;
}

type Tab = 'dashboard' | 'orders' | 'products' | 'categories' | 'offers' | 'settings';

export default function AdminPanel({
  orders, products, categories, offers, thankYouConfig, settings,
  onUpdateStatus, onDeleteOrder,
  onAddProduct, onUpdateProduct, onDeleteProduct,
  onAddCategory, onUpdateCategory, onDeleteCategory,
  onAddOffer, onUpdateOffer, onDeleteOffer, onSaveThankYou,
  onSaveSettings, onLogout,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'Pending').length;
    const processed = orders.filter(o => o.status === 'Processed').length;
    const sent = orders.filter(o => o.status === 'Sent').length;
    const cancelled = orders.filter(o => o.status === 'Cancelled').length;
    const revenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.price, 0);
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const activeOffers = offers.filter(o => o.active).length;
    return { total, pending, processed, sent, cancelled, revenue, totalProducts, totalCategories, activeOffers };
  }, [orders, products, categories, offers]);

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders' as Tab, label: 'Orders', icon: Package, badge: stats.pending },
    { id: 'products' as Tab, label: 'Products', icon: ShoppingCart, badge: stats.totalProducts },
    { id: 'categories' as Tab, label: 'Categories', icon: FolderOpen, badge: stats.totalCategories },
    { id: 'offers' as Tab, label: 'Offers', icon: Gift, badge: stats.activeOffers },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  const currencySymbol = settings.currency === 'BDT' ? '৳' : '$';

  return (
    <div className="min-h-screen bg-soft-neutral flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-text-primary/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-natural-white border-r border-soft-neutral flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-soft-neutral">
          <img
            src="https://i.ibb.co.com/h1K82LNT/file-00000000050471faaf07c29464158bf6.png"
            alt="ASQVI"
            className="h-9 w-auto"
          />
          <div>
            <p className="text-[10px] font-medium text-forest-green uppercase tracking-elegant">Site Engine</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-forest-green/10 text-forest-green'
                  : 'text-text-secondary hover:bg-soft-neutral hover:text-text-primary'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === tab.id ? 'bg-forest-green text-natural-white' : 'bg-soft-neutral text-text-muted'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-soft-neutral">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-text-secondary hover:bg-danger/10 hover:text-danger transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-natural-white/80 backdrop-blur-xl border-b border-soft-neutral h-16 flex items-center px-4 sm:px-6 lg:px-8 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-full hover:bg-soft-neutral">
            <LayoutDashboard className="w-5 h-5 text-text-primary" />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="hidden sm:flex relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
              />
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-forest-green flex items-center justify-center text-natural-white text-sm font-medium">
            A
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView stats={stats} orders={orders} products={products} currencySymbol={currencySymbol} />
          )}
          {activeTab === 'orders' && (
            <OrdersTable
              orders={orders}
              currency={settings.currency}
              onUpdateStatus={onUpdateStatus}
              onDeleteOrder={onDeleteOrder}
            />
          )}
          {activeTab === 'products' && (
            <ProductsPanel
              products={products}
              categories={categories}
              currency={settings.currency}
              onAddProduct={onAddProduct}
              onUpdateProduct={onUpdateProduct}
              onDeleteProduct={onDeleteProduct}
            />
          )}
          {activeTab === 'categories' && (
            <CategoriesPanel
              categories={categories}
              onAddCategory={onAddCategory}
              onUpdateCategory={onUpdateCategory}
              onDeleteCategory={onDeleteCategory}
            />
          )}
          {activeTab === 'offers' && (
            <OffersPanel
              offers={offers}
              products={products}
              thankYouConfig={thankYouConfig}
              currency={settings.currency}
              onAddOffer={onAddOffer}
              onUpdateOffer={onUpdateOffer}
              onDeleteOffer={onDeleteOffer}
              onSaveThankYou={onSaveThankYou}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsPanel settings={settings} onSave={onSaveSettings} />
          )}
        </div>
      </main>
    </div>
  );
}

function DashboardView({ stats, orders, products, currencySymbol }: { stats: any; orders: Order[]; products: Product[]; currencySymbol: string }) {
  const recentOrders = orders.slice(0, 5);
  const topProducts = products.slice(0, 4);

  const statCards = [
    { label: 'Total Orders', value: stats.total, icon: Package, bg: 'bg-forest-green/10', text: 'text-forest-green' },
    { label: 'Revenue', value: `${currencySymbol}${stats.revenue.toLocaleString()}`, icon: DollarSign, bg: 'bg-success/10', text: 'text-success' },
    { label: 'Pending', value: stats.pending, icon: Clock, bg: 'bg-warning/10', text: 'text-warning' },
    { label: 'Products', value: stats.totalProducts, icon: ShoppingCart, bg: 'bg-info/10', text: 'text-info' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-semibold text-text-primary">Dashboard</h2>
        <p className="text-sm text-text-secondary mt-1">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((card, i) => (
          <div key={card.label} className={`bg-natural-white rounded-2xl p-6 border border-soft-neutral animate-fade-in opacity-0 stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-full ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.text}`} />
              </div>
              <BarChart3 className="w-5 h-5 text-warm-gray" />
            </div>
            <p className="font-display text-2xl font-semibold text-text-primary">{card.value}</p>
            <p className="text-sm text-text-muted mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-natural-white rounded-2xl border border-soft-neutral overflow-hidden">
          <div className="px-6 py-4 border-b border-soft-neutral flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-text-primary">Recent Orders</h3>
            <span className="text-xs font-medium text-text-muted">{orders.length} total</span>
          </div>
          <div className="divide-y divide-soft-neutral">
            {recentOrders.map(order => (
              <div key={order.id} className="px-6 py-4 flex items-center gap-4 hover:bg-soft-neutral/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-forest-green/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-forest-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{order.name}</p>
                  <p className="text-xs text-text-muted truncate">{order.product}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-text-primary">{currencySymbol}{order.price.toLocaleString()}</p>
                  <span className={`text-xs font-medium ${
                    order.status === 'Pending' ? 'text-warning' :
                    order.status === 'Processed' ? 'text-info' :
                    order.status === 'Sent' ? 'text-success' : 'text-danger'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Package className="w-12 h-12 text-warm-gray mx-auto mb-3" />
                <p className="text-sm text-text-muted">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-natural-white rounded-2xl border border-soft-neutral overflow-hidden">
          <div className="px-6 py-4 border-b border-soft-neutral flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-text-primary">Products</h3>
            <span className="text-xs font-medium text-text-muted">{products.length} total</span>
          </div>
          <div className="divide-y divide-soft-neutral">
            {topProducts.map(product => (
              <div key={product.id} className="px-6 py-4 flex items-center gap-4 hover:bg-soft-neutral/50 transition-colors">
                <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover bg-soft-neutral" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{product.name}</p>
                  <p className="text-xs text-text-muted">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-text-primary">{currencySymbol}{product.price.toLocaleString()}</p>
                  <span className="text-xs text-text-muted">⭐ {product.rating}</span>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="px-6 py-12 text-center">
                <ShoppingCart className="w-12 h-12 text-warm-gray mx-auto mb-3" />
                <p className="text-sm text-text-muted">No products yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-natural-white rounded-2xl border border-soft-neutral p-6">
        <h3 className="font-display text-lg font-semibold text-text-primary mb-6">Order Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Pending', count: stats.pending, color: 'bg-warning' },
            { label: 'Processed', count: stats.processed, color: 'bg-info' },
            { label: 'Sent', count: stats.sent, color: 'bg-success' },
            { label: 'Cancelled', count: stats.cancelled, color: 'bg-danger' },
          ].map(item => (
            <div key={item.label} className="text-center p-4 rounded-2xl bg-soft-neutral">
              <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`} />
              <p className="font-display text-2xl font-semibold text-text-primary">{item.count}</p>
              <p className="text-xs text-text-muted uppercase tracking-elegant">{item.label}</p>
            </div>
          ))}
        </div>
        {stats.total > 0 && (
          <div className="mt-6 h-2 rounded-full bg-soft-neutral overflow-hidden flex">
            <div className="bg-warning" style={{ width: `${(stats.pending / stats.total) * 100}%` }} />
            <div className="bg-info" style={{ width: `${(stats.processed / stats.total) * 100}%` }} />
            <div className="bg-success" style={{ width: `${(stats.sent / stats.total) * 100}%` }} />
            <div className="bg-danger" style={{ width: `${(stats.cancelled / stats.total) * 100}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
