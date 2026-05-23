import { ArrowRight, CheckCircle, Gift, X } from 'lucide-react';
import { Product, ThankYouRule, Order } from '../../types';
import FormattedText from '../ui/FormattedText';

interface ThankYouPageProps {
  order: Order;
  heading: string;
  message: string;
  rule: ThankYouRule | null;
  upsellProducts: Product[];
  currency: string;
  onBuyUpsell: (product: Product) => void;
  onClose: () => void;
}

export default function ThankYouPage({
  order, heading, message, rule, upsellProducts,
  currency, onBuyUpsell, onClose,
}: ThankYouPageProps) {
  const cs = currency === 'BDT' ? '৳' : '$';

  const getDiscountedPrice = (price: number) => {
    if (!rule?.upsellDiscount) return price;
    return Math.round(price * (1 - rule.upsellDiscount / 100));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Popup */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto" style={{ animation: 'scaleIn 0.3s ease-out' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Success */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#4A5D4E]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#4A5D4E]" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">{heading}</h1>
            <FormattedText text={message} className="text-gray-500 leading-relaxed text-sm max-w-lg mx-auto" />
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <p className="text-[10px] font-semibold text-[#4A5D4E] uppercase tracking-wider mb-2">Order Summary</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{order.product}</p>
                <p className="text-xs text-gray-400 mt-0.5">ID: {order.id}</p>
              </div>
              <span className="font-display text-lg font-semibold text-gray-900">{cs}{order.price.toLocaleString()}</span>
            </div>
          </div>

          {/* Upsell */}
          {rule && rule.showUpsell && upsellProducts.length > 0 && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 mb-3">
                  <Gift className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">{rule.upsellBadge || 'Special Offer'}</span>
                </div>
                <h2 className="font-display text-xl font-semibold text-gray-900">{rule.upsellHeading}</h2>
              </div>

              <div className={`grid gap-3 ${upsellProducts.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {upsellProducts.map(product => {
                  const discounted = getDiscountedPrice(product.price);
                  const hasDiscount = rule.upsellDiscount && rule.upsellDiscount > 0;
                  return (
                    <div key={product.id} className="bg-white rounded-xl border-2 border-amber-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="bg-gray-50 p-2">
                        <div className="rounded-lg overflow-hidden bg-white flex items-center justify-center" style={{ height: '120px' }}>
                          <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          {hasDiscount && <span className="text-xs text-gray-400 line-through">{cs}{product.price.toLocaleString()}</span>}
                          <span className="font-display text-lg font-semibold text-[#4A5D4E]">{cs}{discounted.toLocaleString()}</span>
                          {hasDiscount && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">{rule.upsellDiscount}% OFF</span>}
                        </div>
                        <button onClick={() => onBuyUpsell(product)} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-[#4A5D4E] hover:bg-[#3d4e41] text-white text-xs font-medium uppercase tracking-wider transition-all">
                          Add to Order <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Continue */}
          <div className="text-center pt-2">
            <button onClick={onClose} className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-500 text-sm font-medium hover:border-[#4A5D4E] hover:text-[#4A5D4E] transition-all">
              Continue Shopping
            </button>
          </div>
        </div>

        <style>{`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
