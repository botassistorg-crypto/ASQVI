import { ArrowLeft, ArrowRight, Star, Check, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import FormattedText from '../ui/FormattedText';

interface ProductPageProps {
  product: Product;
  relatedProducts: Product[];
  currency: string;
  onBuy: (product: Product) => void;
  onBack: () => void;
  onViewProduct: (productId: string) => void;
}

export default function ProductPage({
  product,
  relatedProducts,
  currency,
  onBuy,
  onBack,
  onViewProduct,
}: ProductPageProps) {
  const currencySymbol = currency === 'BDT' ? '৳' : '$';

  return (
    <div className="min-h-screen bg-natural-white">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-6 py-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-forest-green text-sm font-medium uppercase tracking-elegant transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Product Details */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Product Image — shows full image, no cropping */}
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden bg-soft-neutral flex items-center justify-center p-6" style={{ maxHeight: '450px' }}>
              <img
                src={product.image}
                alt={product.name}
                className="max-w-full max-h-[400px] object-contain"
              />
            </div>

            {/* Gallery thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-soft-neutral border-2 border-forest-green flex items-center justify-center">
                  <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
                </div>
                {product.images.map((img, idx) => (
                  <div key={idx} className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-soft-neutral border-2 border-transparent hover:border-forest-green transition-colors cursor-pointer flex items-center justify-center">
                    <img src={img} alt={`${product.name} ${idx + 2}`} className="max-w-full max-h-full object-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
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
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'text-warning fill-warning' : 'text-warm-gray'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-text-secondary">
                {product.rating} ({product.reviews.toLocaleString()} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="font-display text-3xl font-semibold text-text-primary">
                {currencySymbol}{product.price.toLocaleString()}
              </span>
              <span className="text-sm text-text-muted ml-2">one-time</span>
            </div>

            {/* Description */}
            <FormattedText 
              text={product.fullDescription || product.description} 
              className="text-text-secondary leading-relaxed mb-6 text-sm"
            />

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
                  What's Included
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-forest-green/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-forest-green" />
                      </div>
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Buy Button */}
            <button
              onClick={() => onBuy(product)}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-forest-green hover:bg-forest-green-dark text-natural-white text-sm font-medium uppercase tracking-elegant transition-all mt-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              Acquire Now — {currencySymbol}{product.price.toLocaleString()}
            </button>

            {/* Trust */}
            <div className="flex flex-wrap gap-4 mt-5 text-xs text-text-muted">
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-forest-green" /> Instant Delivery</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-forest-green" /> Lifetime Access</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-forest-green" /> Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-soft-neutral py-14">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-8">
              <p className="text-[10px] font-semibold text-forest-green uppercase tracking-wider mb-2">You May Also Like</p>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-text-primary">Related Products</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {relatedProducts.map((rp) => (
                <div
                  key={rp.id}
                  onClick={() => onViewProduct(rp.id)}
                  className="group bg-natural-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
                >
                  <div className="bg-soft-neutral m-2 rounded-xl overflow-hidden flex items-center justify-center" style={{ height: '130px' }}>
                    <img src={rp.image} alt={rp.name} className="max-w-full max-h-full object-contain" loading="lazy" />
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-[10px] font-semibold text-forest-green uppercase tracking-wider mb-1">{rp.category}</p>
                    <h3 className="text-sm font-semibold text-text-primary line-clamp-1 group-hover:text-forest-green transition-colors">{rp.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-display text-base font-semibold text-text-primary">{currencySymbol}{rp.price.toLocaleString()}</span>
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
