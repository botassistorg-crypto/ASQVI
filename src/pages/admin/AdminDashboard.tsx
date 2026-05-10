import { useState, useEffect } from 'react';
import { getCollection } from '../../lib/firestore';
import { Product, Order, Category } from '../../types';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [products, orders] = await Promise.all([
        getCollection<Product>('products'),
        getCollection<Order>('orders'),
      ]);

      const completedOrders = orders.filter(o => o.status === 'completed');
      const totalSales = completedOrders.reduce((sum, o) => sum + o.amount, 0);

      setStats({
        totalSales,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalProducts: products.length,
      });

      setRecentOrders(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Revenue', value: `৳${stats.totalSales}`, icon: <TrendingUp className="w-6 h-6" />, color: 'bg-green-50 text-green-600' },
    { title: 'Total Orders', value: stats.totalOrders, icon: <ShoppingCart className="w-6 h-6" />, color: 'bg-indigo-50 text-indigo-600' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: <Clock className="w-6 h-6" />, color: 'bg-amber-50 text-amber-600' },
    { title: 'Active Products', value: stats.totalProducts, icon: <Package className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600' },
  ];

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white rounded-3xl" />)}
    </div>
    <div className="h-96 bg-white rounded-3xl" />
  </div>;

  return (
    <div id="admin-dashboard">
      <h1 className="text-3xl font-serif font-bold text-[#1A1C19] mb-10">Control Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {statCards.map((card, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={card.title}
            className="bg-white p-10 rounded-[3rem] border border-natural-200 shadow-sm"
          >
            <div className={`w-14 h-14 rounded-2xl ${card.color.includes('indigo') ? 'bg-natural-100 text-forest-500' : card.color} flex items-center justify-center mb-6`}>
              {card.icon}
            </div>
            <p className="text-[10px] font-bold text-forest-500 uppercase tracking-[0.2em] mb-2">{card.title}</p>
            <h3 className="text-4xl font-bold text-[#1A1C19] tracking-tighter">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[3.5rem] border border-natural-200 shadow-xl overflow-hidden">
        <div className="p-10 border-b border-natural-100 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-[#1A1C19]">Recent Registry Activity</h2>
          <Link to="/admin/orders" className="text-forest-500 text-[10px] uppercase tracking-widest font-bold flex items-center hover:translate-x-1 transition-transform">
            Review all records <ArrowUpRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-natural-50 text-[10px] uppercase tracking-[0.3em] font-bold text-forest-500">
                <th className="px-10 py-6">Identity</th>
                <th className="px-10 py-6">Asset</th>
                <th className="px-10 py-6">Valuation</th>
                <th className="px-10 py-6">State</th>
                <th className="px-10 py-6">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-natural-50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="font-bold text-[#1A1C19]">{order.customerName}</div>
                    <div className="text-[10px] text-[#6B7280] font-medium tracking-widest uppercase mt-1">{order.customerWhatsapp}</div>
                  </td>
                  <td className="px-10 py-8 font-serif font-bold text-lg text-forest-500">{order.productTitle}</td>
                  <td className="px-10 py-8 font-bold text-[#1A1C19]">৳{order.amount}</td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                      order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : 
                      order.status === 'pending' ? 'bg-natural-100 text-forest-500 border-natural-200' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-[10px] font-bold text-[#6B7280] uppercase tracking-tighter">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
