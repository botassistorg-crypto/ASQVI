import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  Tag, 
  ShoppingCart, 
  Settings, 
  LayoutDashboard,
  ExternalLink
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Products', path: '/admin/products', icon: <Package className="w-5 h-5" /> },
    { name: 'Categories', path: '/admin/categories', icon: <Tag className="w-5 h-5" /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div id="admin-layout" className="min-h-screen bg-natural-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-natural-100 border-r border-natural-200 hidden lg:flex flex-col">
        <div className="p-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-forest-500 rounded flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="text-2xl font-serif font-bold text-forest-500">ASQVI</span>
            <span className="text-[10px] font-bold bg-white text-forest-500 px-2 py-0.5 border border-natural-200 rounded uppercase tracking-widest ml-2">Panel</span>
          </Link>
        </div>
        
        <nav className="flex-grow px-4 pb-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-5 py-4 rounded-3xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                (item.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.path))
                  ? 'bg-forest-500 text-white shadow-xl shadow-natural-200'
                  : 'text-[#6B7280] hover:bg-white hover:text-forest-500'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-natural-200">
          <Link
            to="/"
            className="flex items-center space-x-3 px-5 py-4 rounded-3xl text-[10px] uppercase font-bold tracking-widest text-[#6B7280] hover:bg-white transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            <span>Marketplace</span>
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
