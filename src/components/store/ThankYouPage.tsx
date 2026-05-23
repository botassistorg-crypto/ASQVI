import { ArrowRight, CheckCircle, Gift } from 'lucide-react';
import { Product, ThankYouRule, Order } from '../../types';
import FormattedText from '../ui/FormattedText';

interface ThankYouPageProps {
  order: Order;
  heading: string;
  message: string;
  rule: ThankYouRule | null;  // null = no upsell, just show thank you
  upsellProducts: Product[];
  currency: string;
  onBuyUpsell: (product: Product) => void;
  onBackToStore: () => void;
}

export default function ThankYouPage({
  order, heading, message, rule, upsellProducts,
  currency, onBuyUpsell, onBackToStore,
}: ThankYouPageProps) {
  const cs = currency === 'BDT' ? '৳' : '$';

  const getDiscountedPrice = (price: number) => {
    if (!rule?.upsellDiscount) return price;
    return Math.round(price * (1 - rule.upsellDiscount / 100));
  };

  return (
    <div className="min-h-screen bg-natural-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Success */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-forest-green/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-forest-green" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-text-primary mb-4">{heading}</h1>
          <FormattedText text={message} className="text-text-secondary leading-relaxed max-w-xl mx-auto" />
        </div>

        {/* Order Summary */}
        <div className="bg-soft-neutral rounded-2xl p-6 mb-10">
          <p className="text-xs font-semibold text-forest-green uppercase tracking-wider mb-3">Order Summary</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-text-primary">{order.product}</p>
              <p className="text-sm text-text-muted mt-1">Order ID: {order.id}</p>
            </div>
            <span className="font-display text-xl font-semibold text-text-primary">{cs}{order.price.toLocaleString()}</span>
          </div>
        </div>

        {/* Upsell — only if rule exists and has products */}
        {rule && rule.showUpsell && upsellProducts.length > 0 && (
          <div className="mb-10">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 text-warning mb-4">
                <Gift className="w-4 h-4" />
                <span className="text-sm font-semibold">{rule.upsellBadge || 'Special Offer'}</span>
              </div>
              <h2 className="font-display text-2xl font-semibold text-text-primary">{rule.upsellHeading}</h2>
            </div>

            <div className={`grid gap-4 ${upsellProducts.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {upsellProducts.map(product => {
                const discounted = getDiscountedPrice(product.price);
                const hasDiscount = rule.upsellDiscount && rule.upsellDiscount > 0;
                return (
                  <div key={product.id} className="bg-white rounded-2xl border-2 border-warning/30 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="bg-soft-neutral p-3">
                      <div className="rounded-xl overflow-hidden bg-white flex items-center justify-center" style={{ height: '150px' }}>
                        <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-semibold text-forest-green uppercase tracking-wider mb-1">{product.category}</p>
                      <h3 className="font-display text-base font-semibold text-text-primary mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-text-secondary line-clamp-2 mb-3">{product.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        {hasDiscount && <span className="text-sm text-text-muted line-through">{cs}{product.price.toLocaleString()}</span>}
                        <span className="font-display text-xl font-semibold text-forest-green">{cs}{discounted.toLocaleString()}</span>
                        {hasDiscount && <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-bold">{rule.upsellDiscount}% OFF</span>}
                      </div>
                      <button onClick={() => onBuyUpsell(product)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-forest-green hover:bg-forest-green-dark text-natural-white text-sm font-medium uppercase tracking-wider transition-all">
                        Add to Order <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center">
          <button onClick={onBackToStore} className="px-8 py-3 rounded-full border border-warm-gray text-text-secondary text-sm font-medium uppercase tracking-wider hover:border-forest-green hover:text-forest-green transition-all">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
