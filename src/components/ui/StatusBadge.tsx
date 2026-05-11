import { OrderStatus } from '../../types';
import { Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
}

const config: Record<OrderStatus, { bg: string; text: string; icon: React.ComponentType<any> }> = {
  Pending: { bg: 'bg-warning/10 border-warning/30', text: 'text-warning', icon: Clock },
  Processed: { bg: 'bg-info/10 border-info/30', text: 'text-info', icon: CheckCircle },
  Sent: { bg: 'bg-forest-green/10 border-forest-green/30', text: 'text-forest-green', icon: Truck },
  Cancelled: { bg: 'bg-danger/10 border-danger/30', text: 'text-danger', icon: XCircle },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { bg, text, icon: Icon } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${bg} ${text}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}
