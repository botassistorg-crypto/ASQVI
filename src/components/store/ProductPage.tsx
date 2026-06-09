import { useState } from 'react';
import { ArrowLeft, ArrowRight, Star, Check, ShoppingBag, Layers } from 'lucide-react';
import { Product, Offer, ProductTier } from '../../types';
import FormattedText from '../ui/FormattedText';

interface ProductPageProps {
  product: Product;
  relatedProducts: Product[];
  currency: string;
  offer?: Offer;
  onBuy: (product: Product, offer?: Offer, selectedTier?: ProductTier) => void;
  onBack: () => void;
  onViewProduct: (productId: string) => void;
}

export default function ProductPage({
  product, relatedProducts, currency, offer, onBuy, onBack, onViewProduct,
}: ProductPageProps) {
  const cs = currency === 'BDT' ? '৳' : '$';

  // ── TIER STATE ────────────────────────────────────────────
  const hasTiers = product.isTiered && product.tiers && product.tiers.length > 0;
  const defaultTier = hasTiers
    ? (product.tiers!.find(t => t.isPopular) || product.tiers![0])
    : null;
  const [selectedTier, setSelectedTier] = useState<ProductTier | null>(defaultTier);

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

  // ── BUY HANDLER ───────────────────────────────────────────
  const handleBuy = () => {
    if (hasTiers && selectedTier) {
      onBuy(product, undefined, selectedTier);
    } else {
      onBuy(product, offer || undefined);
    }
  };

  // ── BUY BUTTON LABEL ──────────────────────────────────────
  const buyLabel = hasTiers && selectedTier
    ? `Get ${selectedTier.name} — ${cs}${selectedTier.price.toLocaleString()}${selectedTier.paymentType === 'monthly' ? '/mo' : ''}`
    : `Acquire Now — ${cs}${hasDiscount ? discountedPrice.toLocaleString() : product.price.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-natural-white">
      <div className="max-w-5xl mx-auto px-6 py-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-forest-green text-sm font-medium uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── IMAGE ── */}
          <div className="space-y-3">
            <div
              className="rounded-2xl overflow-hidden bg-soft-neutral flex items-center justify-center p-6"
              style={{ maxHeight: '450px' }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="max-w-full max-h-[400px] object-contain"
              />
            </div>
            {product.images && product.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-soft-neutral border-2 border-forest-green flex items-center justify-center">
                  <img src={product.image} alt="" className="max-w-full max-h-full object-contain" />
                </div>
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-soft-neutral border-2 border-transparent hover:border-forest-green transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <img src={img} alt="" className="max-w-full max-h-full object-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── INFO ── */}
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-forest-green uppercase tracking-wider mb-2">
              {product.category}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-warning fill-warning' : 'text-warm-gray'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-text-secondary">
                {product.rating} ({product.reviews.toLocaleString()} reviews)
              </span>
            </div>

            {/* ── PRICE SECTION ── */}
            {hasTiers ? (
              /* Tiered price — show selected tier price */
              <div className="mb-4">
                {selectedTier ? (
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-semibold text-text-primary">
                      {cs}{selectedTier.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-text-muted">
                      {selectedTier.paymentType === 'monthly' ? '/ month' : 'one-time'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-text-muted">From</span>
                    <span className="font-display text-3xl font-semibold text-text-primary">
                      {cs}{Math.min(...product.tiers!.map(t => t.price)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Single price */
              <div className="mb-6">
                {hasDiscount ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-text-muted line-through">
                      {cs}{product.price.toLocaleString()}
                    </span>
                    <span className="font-display text-3xl font-semibold text-amber-700">
                      {cs}{discountedPrice.toLocaleString()}
                    </span>
                    {offer?.badge && (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                        {offer.badge}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="font-display text-3xl font-semibold text-text-primary">
                    {cs}{product.price.toLocaleString()}
                  </span>
                )}
                <span className="text-sm text-text-muted ml-2">one-time</span>
              </div>
            )}

            {/* Description */}
            <FormattedText
              text={product.fullDescription || product.description}
              className="text-text-secondary leading-relaxed mb-6 text-sm"
            />

            {/* ── TIER SELECTOR ── */}
            {hasTiers && product.tiers && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-forest-green" />
                  <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                    Choose Your Plan
                  </h3>
                </div>

                <div className="space-y-3">
                  {product.tiers.map(tier => {
                    const isSelected = selectedTier?.id === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                          isSelected
                            ? 'border-forest-green bg-forest-green/5 shadow-sm'
                            : 'border-warm-gray bg-natural-white hover:border-forest-green/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Left — name + description + features */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {/* Radio dot */}
                              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'border-forest-green' : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-forest-green block" />
                                )}
                              </span>
                              <span className="text-sm font-semibold text-text-primary">
                                {tier.name}
                              </span>
                              {tier.isPopular && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                                  Most Popular
                                </span>
                              )}
                            </div>

                            {tier.description && (
                              <p className="text-xs text-text-muted ml-6 mb-2">
                                {tier.description}
                              </p>
                            )}

                            {/* Tier features */}
                            {tier.features && tier.features.length > 0 && (
                              <ul className="ml-6 space-y-1">
                                {tier.features.map((feat, fi) => (
                                  <li key={fi} className="flex items-center gap-1.5">
                                    <Check className="w-3 h-3 text-forest-green shrink-0" />
                                    <span className="text-xs text-text-secondary">{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          {/* Right — price */}
                          <div className="text-right shrink-0">
                            <p className="font-display text-lg font-semibold text-text-primary">
                              {cs}{tier.price.toLocaleString()}
                            </p>
                            <p className="text-[11px] text-text-muted">
                              {tier.paymentType === 'monthly' ? '/ month' : 'one-time'}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── FEATURES (single price products) ── */}
            {!hasTiers && product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
                  What's Included
                </h3>
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-forest-green/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-forest-green" />
                      </div>
                      <span className="text-sm text-text-secondary">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── BUY BUTTON ── */}
            <button
              onClick={handleBuy}
              disabled={hasTiers && !selectedTier}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-forest-green hover:bg-forest-green-dark disabled:opacity-50 text-natural-white text-sm font-medium uppercase tracking-wider transition-all mt-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              {buyLabel}
            </button>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mt-5 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-forest-green" /> Instant Delivery
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-forest-green" /> Lifetime Access
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-forest-green" /> Support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED PRODUCTS ── */}
      {relatedProducts.length > 0 && (
        <section className="bg-soft-neutral py-14">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-text-primary">
                Related Products
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {relatedProducts.map(rp => (
                <div
                  key={rp.id}
                  onClick={() => onViewProduct(rp.id)}
                  className="group bg-natural-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                >
                  <div
                    className="bg-soft-neutral m-2 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{ height: '130px' }}
                  >
                    <img
                      src={rp.image}
                      alt={rp.name}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="px-3 pb-3">
                    <h3 className="text-sm font-semibold text-text-primary line-clamp-1 group-hover:text-forest-green transition-colors">
                      {rp.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      {/* Price — handle tiered related products */}
                      {rp.isTiered && rp.tiers && rp.tiers.length > 0 ? (
                        <div>
                          <span className="text-[10px] text-text-muted">From </span>
                          <span className="font-display text-base font-semibold text-text-primary">
                            {cs}{Math.min(...rp.tiers.map(t => t.price)).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="font-display text-base font-semibold text-text-primary">
                          {cs}{rp.price.toLocaleString()}
                        </span>
                      )}
                      <span className="text-[10px] text-forest-green font-medium uppercase tracking-wider flex items-center gap-1">
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
