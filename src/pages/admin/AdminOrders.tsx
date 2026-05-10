import { useState, useEffect } from 'react';
import { getCollection } from '../../lib/firestore';
import { proxyWrite } from '../../lib/adminProxy';
import { Order } from '../../types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ShoppingCart
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getCollection<Order>('orders');
    setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  };

  const updateStatus = async (id: string, status: Order['status']) => {
    try {
      await proxyWrite('orders', id, { status });
      fetchData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.senderNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="admin-orders">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Orders Management</h1>
          <p className="text-xs text-gray-400 font-bold tracking-widest mt-1">Verify bKash payments and fulfill orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all shadow-sm"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <motion.div
            layout
            key={order.id}
            className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Customer</h3>
                  <div className="font-bold text-gray-900">{order.customerName}</div>
                  <div className="text-sm text-indigo-600 flex items-center mt-1">
                    <MessageCircle className="w-3 h-3 mr-1" /> {order.customerWhatsapp}
                  </div>
                  {order.customerEmail && <div className="text-xs text-gray-400 mt-1">{order.customerEmail}</div>}
                </div>
                
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Product & Payment</h3>
                  <div className="font-bold text-gray-900">{order.productTitle}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm font-black text-gray-900 italic">৳{order.amount}</span>
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-black uppercase">via {order.senderNumber}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Status & Date</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {order.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {order.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {order.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                      {order.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-6 lg:pt-0 border-t lg:border-t-0 border-gray-50 lg:pl-8">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(order.id, 'completed')}
                      className="flex-grow lg:flex-none px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, 'rejected')}
                      className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      Reject
                    </button>
                  </>
                )}
                {order.status !== 'pending' && (
                  <button
                    onClick={() => updateStatus(order.id, 'pending')}
                    className="px-6 py-3 bg-gray-50 text-gray-400 rounded-2xl font-black text-sm hover:bg-amber-50 hover:text-amber-600 transition-all"
                  >
                    Reset to Pending
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
          <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
          <p className="text-sm text-gray-400">Wait for your customers to take action.</p>
        </div>
      )}
    </div>
  );
}
