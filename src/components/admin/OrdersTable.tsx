import { useState } from 'react';
import {
  Trash2, ChevronDown, Filter, Package,
  Mail, Phone, Calendar, AlertTriangle, Wallet
} from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import Modal from '../ui/Modal';
import { Order, OrderStatus } from '../../types';

interface OrdersTableProps {
  orders: Order[];
  currency: string;
  onUpdateStatus: (orderId: string, status: OrderStatus) => boolean;
  onDeleteOrder: (orderId: string) => boolean;
}

const statuses: OrderStatus[] = ['Pending', 'Processed', 'Sent', 'Cancelled'];

export default function OrdersTable({ orders, currency, onUpdateStatus, onDeleteOrder }: OrdersTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);

  const filtered = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    onUpdateStatus(orderId, status);
    setStatusDropdown(null);
  };

  const handleDelete = (orderId: string) => {
    onDeleteOrder(orderId);
    setDeleteConfirm(null);
  };

  const currencySymbol = currency === 'BDT' ? '৳' : '$';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-text-primary">Orders</h2>
          <p className="text-sm text-text-secondary mt-1">Track and manage customer orders</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-full border border-warm-gray text-sm font-medium text-text-primary focus:outline-none focus:border-forest-green bg-natural-white"
          >
            <option value="All">All Status</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-natural-white rounded-2xl border border-soft-neutral overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-soft-neutral/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-elegant">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-elegant">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-elegant">bKash Sender</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-elegant">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-elegant">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-elegant">Date</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-text-muted uppercase tracking-elegant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft-neutral">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-soft-neutral/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{order.name}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                        <Mail className="w-3 h-3" />
                        {order.email}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-text-muted">
                        <Phone className="w-3 h-3" />
                        {order.whatsapp}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-text-primary max-w-[200px] truncate">{order.product}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-text-primary">
                      <Wallet className="w-3.5 h-3.5 text-forest-green" />
                      {order.senderBkash}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-text-primary">{currencySymbol}{order.price.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setStatusDropdown(statusDropdown === order.id ? null : order.id)}
                        className="flex items-center gap-1 group"
                      >
                        <StatusBadge status={order.status} />
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary transition-colors" />
                      </button>
                      {statusDropdown === order.id && (
                        <div className="absolute z-20 top-full mt-1 left-0 w-36 bg-natural-white rounded-2xl border border-soft-neutral shadow-xl py-2">
                          {statuses.map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(order.id, status)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-soft-neutral transition-colors ${
                                order.status === status ? 'font-semibold text-forest-green' : 'text-text-primary'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setDeleteConfirm(order.id)}
                      className="p-2 rounded-full hover:bg-soft-neutral text-text-muted hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-warm-gray mx-auto mb-3" />
            <p className="text-sm text-text-muted">No orders found</p>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="bg-natural-white rounded-2xl border border-soft-neutral p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-text-primary">{order.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{order.email}</p>
                <p className="text-xs text-text-muted">{order.whatsapp}</p>
              </div>
              <button
                onClick={() => setDeleteConfirm(order.id)}
                className="p-2 rounded-full hover:bg-soft-neutral text-text-muted hover:text-danger"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-text-primary font-medium mb-2 truncate">{order.product}</p>
            <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
              <Wallet className="w-3.5 h-3.5 text-forest-green" />
              Sender: {order.senderBkash}
            </div>
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-text-primary">{currencySymbol}{order.price.toLocaleString()}</p>
              <div className="relative">
                <button
                  onClick={() => setStatusDropdown(statusDropdown === order.id ? null : order.id)}
                  className="flex items-center gap-1"
                >
                  <StatusBadge status={order.status} />
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </button>
                {statusDropdown === order.id && (
                  <div className="absolute z-20 bottom-full mb-1 right-0 w-36 bg-natural-white rounded-2xl border border-soft-neutral shadow-xl py-2">
                    {statuses.map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(order.id, status)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-soft-neutral ${
                          order.status === status ? 'font-semibold text-forest-green' : 'text-text-primary'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-text-muted mt-3">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-warm-gray mx-auto mb-3" />
            <p className="text-sm text-text-muted">No orders found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-danger" />
          </div>
          <h3 className="font-display text-xl font-semibold text-text-primary mb-2">Delete Order?</h3>
          <p className="text-sm text-text-secondary mb-6">
            This action cannot be undone. The order will be permanently removed.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 px-4 py-3 rounded-full border border-warm-gray text-sm font-medium text-text-primary hover:bg-soft-neutral transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="flex-1 px-4 py-3 rounded-full bg-danger text-natural-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
