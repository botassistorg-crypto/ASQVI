import { ArrowRight } from 'lucide-react';
import { Product, Offer } from '../../types';

interface ProductCardProps {
  product: Product;
  index: number;
  onBuy: (product: Product, offer?: Offer) => void;
  onViewProduct?: (productId: string) => void;
  currency: string;
  offer?: Offer;  // Active offer for this product
}

export default function ProductCard({ product, onBuy, onViewProduct, currency, offer }: ProductCardProps) {
  const cs = currency === 'BDT' ? '৳' : '$';

  const handleCardClick = () => {
    if (onViewProduct) onViewProduct(product.id);
  };

  // Calculate discounted price
  let discountedPrice = product.price;
  let hasDiscount = false;
  if (offer && offer.active && (offer.type === 'discount' || offer.type === 'upsell')) {
    if (offer.discountPercent) {
      discountedPrice = Math.round(product.price * (1 - offer.discountPercent / 100));
      hasDiscount = true;
    } else if (offer.discountFlat) {
      discountedPrice = Math.max(0, product.price - offer.discountFlat);
      hasDiscount = true;
    }
  }

  const displayBadge = offer?.badge || product.badge;

  return (
    <div
      className={`group bg-natural-white rounded-2xl overflow-hidden border ${hasDiscount ? 'border-amber-200' : 'border-soft-neutral'} hover:border-forest-green/30 transition-all duration-300 hover:shadow-lg ${onViewProduct ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="bg-soft-neutral p-3">
        <div className="relative rounded-xl overflow-hidden bg-white flex items-center justify-center" style={{ height: '180px' }}>
          <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" loading="lazy" />
          {displayBadge && (
            <span className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
              hasDiscount ? 'bg-amber-500 text-white' : 'bg-forest-green text-natural-white'
            }`}>
              {displayBadge}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 pt-2">
        <p className="text-[10px] font-semibold text-forest-green uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-display text-base font-semibold text-text-primary mb-1 line-clamp-1 group-hover:text-forest-green transition-colors">{product.name}</h3>
        <p className="text-xs text-text-secondary line-clamp-2 mb-3 leading-relaxed whitespace-pre-line">{product.description}</p>

        <div className="flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-text-muted line-through">{cs}{product.price.toLocaleString()}</span>
                <span className="font-display text-lg font-semibold text-amber-700">{cs}{discountedPrice.toLocaleString()}</span>
              </div>
            ) : (
              <span className="font-display text-lg font-semibold text-text-primary">{cs}{product.price.toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onBuy(product, offer || undefined); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-green text-natural-white text-[11px] font-medium uppercase tracking-wider hover:bg-forest-green-dark transition-all group/btn"
          >
            Acquire <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
