import { useState } from 'react';
import { ArrowLeft, ArrowRight, Star, Check, ShoppingBag, Layers, ZoomIn, MessageCircle } from 'lucide-react';
import { Product, Offer, ProductTier } from '../../types';
import FormattedText from '../ui/FormattedText';
const WHATSAPP_NUMBER = '8801700524647';


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

  // ── ALL IMAGES (main + gallery combined) ─────────────────
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeImage = allImages[activeImageIndex] || product.image;

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

  // ── PREV / NEXT IMAGE ─────────────────────────────────────
  const prevImage = () => setActiveImageIndex(i => (i - 1 + allImages.length) % allImages.length);
  const nextImage = () => setActiveImageIndex(i => (i + 1) % allImages.length);

  return (
    <div className="min-h-screen bg-natural-white">

      {/* ── LIGHTBOX ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>
          {allImages.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </>
          )}
          <img
            src={activeImage}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
          {/* Dots */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 flex gap-2">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setActiveImageIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeImageIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── BACK BUTTON ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-forest-green text-sm font-medium uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* ── IMAGE SECTION ── */}
          <div className="space-y-3">

            {/* Main Image */}
            <div className="relative group">
              <div className="rounded-2xl overflow-hidden bg-soft-neutral flex items-center justify-center"
                style={{ height: '400px' }}>
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 transition-all duration-300"
                  style={{ maxHeight: '400px' }}
                />
              </div>

              {/* Zoom button */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
              >
                <ZoomIn className="w-4 h-4 text-text-secondary" />
              </button>

              {/* Prev/Next arrows (only if multiple images) */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                  >
                    <ArrowLeft className="w-4 h-4 text-text-secondary" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                  >
                    <ArrowRight className="w-4 h-4 text-text-secondary" />
                  </button>
                </>
              )}

              {/* Image counter badge */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/40 text-white text-xs font-medium">
                  {activeImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* ── THUMBNAILS ── */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 bg-soft-neutral flex items-center justify-center ${
                      activeImageIndex === idx
                        ? 'border-forest-green shadow-md scale-105'
                        : 'border-transparent hover:border-forest-green/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── INFO SECTION ── */}
          <div className="flex flex-col">

            {/* Category + Badge */}
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-semibold text-forest-green uppercase tracking-wider">
                {product.category}
              </p>
              {product.badge && (
                <span className="px-2.5 py-0.5 rounded-full bg-forest-green text-natural-white text-[10px] font-semibold uppercase tracking-wider">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary mb-3 leading-tight">
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
            {product.isContactOrder ? (
  /* Contact Order Price */
  <div className="mb-5 p-4 rounded-2xl bg-green-50 border border-green-200">
    <p className="text-xs text-green-600 uppercase tracking-wider font-semibold mb-1">
      💬 Chat to Order
    </p>
    {product.startingPrice ? (
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-text-muted">Starting from</span>
        <span className="font-display text-3xl font-semibold text-text-primary">
          {cs}{product.startingPrice.toLocaleString()}
        </span>
      </div>
    ) : (
      <p className="font-display text-xl font-semibold text-green-700">
        Contact for Pricing
      </p>
    )}
    <p className="text-xs text-green-600 mt-1">
      Final price decided after discussion
    </p>
  </div>
) : hasTiers ? (
  <div className="mb-5 p-4 rounded-2xl bg-soft-neutral">
    {selectedTier ? (
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
          Selected Plan
        </p>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-semibold text-text-primary">
            {cs}{selectedTier.price.toLocaleString()}
          </span>
          <span className="text-sm text-text-muted">
            {selectedTier.paymentType === 'monthly' ? '/ month' : 'one-time'}
          </span>
        </div>
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
  <div className="mb-5">
    {hasDiscount ? (
      <div className="flex items-center gap-3 flex-wrap">
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
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl font-semibold text-text-primary">
          {cs}{product.price.toLocaleString()}
        </span>
        <span className="text-sm text-text-muted">one-time</span>
      </div>
    )}
  </div>
)}

            {/* Divider */}
            <div className="h-px bg-soft-neutral mb-5" />

            {/* Description */}
            <FormattedText
              text={product.fullDescription || product.description}
              className="text-text-secondary leading-relaxed mb-5 text-sm"
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
                <div className="space-y-2.5">
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
                            : 'border-warm-gray bg-natural-white hover:border-forest-green/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'border-forest-green' : 'border-gray-300'
                              }`}>
                                {isSelected && <span className="w-2 h-2 rounded-full bg-forest-green block" />}
                              </span>
                              <span className="text-sm font-semibold text-text-primary">
                                {tier.name}
                              </span>
                              {tier.isPopular && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                                  ⭐ Most Popular
                                </span>
                              )}
                            </div>
                            {tier.description && (
                              <p className="text-xs text-text-muted ml-6 mb-2">{tier.description}</p>
                            )}
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

            {/* ── FEATURES (single price) ── */}
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

            {product.isContactOrder ? (
  /* ── CONTACT TO ORDER BUTTONS ── */
  <div className="space-y-3 mt-auto">
    {/* Primary — WhatsApp */}
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        product.contactMessage ||
        `Hi ASQVI! I'm interested in "${product.name}".${product.startingPrice ? ` (Starting from ${cs}${product.startingPrice.toLocaleString()})` : ''} Please tell me more about this service.`
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium uppercase tracking-wider transition-all shadow-lg hover:shadow-xl"
    >
      <MessageCircle className="w-4 h-4" />
      Chat on WhatsApp to Order
    </a>

    {/* Secondary — Book Advance (if startingPrice exists) */}
    {product.startingPrice ? (
      <button
        onClick={handleBuy}
        className="flex items-center justify-center gap-2 px-8 py-3 rounded-full border-2 border-forest-green text-forest-green hover:bg-forest-green hover:text-natural-white text-sm font-medium uppercase tracking-wider transition-all"
      >
        <ShoppingBag className="w-4 h-4" />
        Book Advance — {cs}{product.startingPrice.toLocaleString()}
      </button>
    ) : null}

    {/* Info note */}
    <p className="text-xs text-text-muted text-center">
      💬 Chat with us first to discuss your requirements
    </p>
  </div>
) : (
  /* ── NORMAL BUY BUTTON ── */
  <button
    onClick={handleBuy}
    disabled={hasTiers && !selectedTier}
    className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-forest-green hover:bg-forest-green-dark disabled:opacity-50 text-natural-white text-sm font-medium uppercase tracking-wider transition-all mt-auto shadow-lg hover:shadow-xl"
  >
    <ShoppingBag className="w-4 h-4" />
    {buyLabel}
  </button>
)}

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-soft-neutral text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-forest-green" /> Instant Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-forest-green" /> Lifetime Access
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-forest-green" /> Support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED PRODUCTS ── */}
      {relatedProducts.length > 0 && (
        <section className="bg-soft-neutral py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <p className="text-[10px] font-semibold text-forest-green uppercase tracking-wider mb-2">
                You May Also Like
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-text-primary">
                Related Products
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {relatedProducts.map(rp => (
                <div
                  key={rp.id}
                  onClick={() => onViewProduct(rp.id)}
                  className="group bg-natural-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all border border-soft-neutral hover:border-forest-green/20"
                >
                  {/* Related product image */}
                  <div className="bg-soft-neutral flex items-center justify-center overflow-hidden"
                    style={{ height: '160px' }}>
                    <img
                      src={rp.image}
                      alt={rp.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-semibold text-forest-green uppercase tracking-wider mb-1">
                      {rp.category}
                    </p>
                    <h3 className="text-sm font-semibold text-text-primary line-clamp-2 group-hover:text-forest-green transition-colors mb-2">
                      {rp.name}
                    </h3>
                    <div className="flex items-center justify-between">
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
                      <span className="text-[10px] text-forest-green font-medium uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
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
