import { ArrowRight, Layers } from 'lucide-react';
import { Product, Offer } from '../../types';

interface ProductCardProps {
  product: Product;
  index: number;
  onBuy: (product: Product, offer?: Offer) => void;
  onViewProduct?: (productId: string) => void;
  currency: string;
  offer?: Offer;
}

export default function ProductCard({ product, onBuy, onViewProduct, currency, offer }: ProductCardProps) {
  const cs = currency === 'BDT' ? '৳' : '$';

  const handleCardClick = () => {
    if (onViewProduct) onViewProduct(product.id);
  };

  // ── TIER CHECK ────────────────────────────────────────────
  const hasTiers = product.isTiered && product.tiers && product.tiers.length > 0;
  const lowestTierPrice = hasTiers
    ? Math.min(...product.tiers!.map(t => t.price))
    : null;
  const popularTier = hasTiers
    ? product.tiers!.find(t => t.isPopular) || product.tiers![0]
    : null;

  // ── DISCOUNT LOGIC (single-price only) ───────────────────
  let discountedPrice = product.price;
  let hasDiscount = false;
  if (!hasTiers && offer && offer.active && (offer.type === 'discount' || offer.type === 'upsell')) {
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
      className={`group bg-natural-white rounded-2xl overflow-hidden border ${
        hasDiscount ? 'border-amber-200' : 'border-soft-neutral'
      } hover:border-forest-green/30 transition-all duration-300 hover:shadow-lg ${
        onViewProduct ? 'cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* ── IMAGE ── */}
      <div className="bg-soft-neutral p-3">
        <div
          className="relative rounded-xl overflow-hidden bg-white flex items-center justify-center"
          style={{ height: '180px' }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
            loading="lazy"
          />

          {/* Badge — offer or product badge */}
          {displayBadge && (
            <span className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
              hasDiscount ? 'bg-amber-500 text-white' : 'bg-forest-green text-natural-white'
            }`}>
              {displayBadge}
            </span>
          )}

          {/* Tier badge — top right */}
          {hasTiers && (
            <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600 text-white text-[10px] font-semibold">
              <Layers className="w-2.5 h-2.5" />
              {product.tiers!.length} Plans
            </span>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-4 pb-4 pt-2">
        <p className="text-[10px] font-semibold text-forest-green uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <h3 className="font-display text-base font-semibold text-text-primary mb-1 line-clamp-1 group-hover:text-forest-green transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-text-secondary line-clamp-2 mb-3 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>

        <div className="flex items-center justify-between">

          {/* ── PRICE ── */}
          <div>
            {hasTiers && lowestTierPrice !== null ? (
              /* Tiered pricing */
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] text-text-muted">From</span>
                  <span className="font-display text-lg font-semibold text-text-primary">
                    {cs}{lowestTierPrice.toLocaleString()}
                  </span>
                </div>
                {/* Show popular tier payment type */}
                {popularTier && (
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {popularTier.paymentType === 'monthly' ? '/ month' : 'one-time'}
                  </p>
                )}
              </div>
            ) : hasDiscount ? (
              /* Discounted single price */
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-text-muted line-through">
                  {cs}{product.price.toLocaleString()}
                </span>
                <span className="font-display text-lg font-semibold text-amber-700">
                  {cs}{discountedPrice.toLocaleString()}
                </span>
              </div>
            ) : (
              /* Regular single price */
              <span className="font-display text-lg font-semibold text-text-primary">
                {cs}{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* ── BUY / VIEW BUTTON ── */}
          {hasTiers ? (
            /* Tiered — clicking goes to product page to select tier */
            <button
              onClick={e => { e.stopPropagation(); onViewProduct?.(product.id); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 text-white text-[11px] font-medium uppercase tracking-wider hover:bg-blue-700 transition-all group/btn"
            >
              Plans <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            /* Single price — direct buy */
            <button
              onClick={e => { e.stopPropagation(); onBuy(product, offer || undefined); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-green text-natural-white text-[11px] font-medium uppercase tracking-wider hover:bg-forest-green-dark transition-all group/btn"
            >
              Acquire <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
