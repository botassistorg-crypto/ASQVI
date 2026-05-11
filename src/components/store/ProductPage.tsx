import { ArrowLeft, ArrowRight, Star, Check, ShoppingBag, Share2, Heart } from 'lucide-react';
import { Product } from '../../types';

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

  const badgeColors: Record<string, string> = {
    'Best Seller': 'bg-forest-green text-natural-white',
    'Featured': 'bg-forest-green text-natural-white',
    'New': 'bg-text-primary text-natural-white',
    'Popular': 'bg-warning text-text-primary',
    'Premium': 'bg-text-primary text-natural-white',
  };

  return (
    <div className="min-h-screen bg-natural-white">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-forest-green text-sm font-medium uppercase tracking-elegant transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </button>
      </div>

      {/* Product Details */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-soft-neutral">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-medium ${badgeColors[product.badge] || 'bg-forest-green text-natural-white'}`}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Additional Images */}
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                <div className="aspect-square rounded-2xl overflow-hidden bg-soft-neutral border-2 border-forest-green">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                {product.images.slice(0, 3).map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-soft-neutral border-2 border-transparent hover:border-forest-green transition-colors cursor-pointer">
                    <img src={img} alt={`${product.name} ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Category */}
            <p className="text-xs font-medium text-forest-green uppercase tracking-elegant mb-3">
              {product.category}
            </p>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-text-primary mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-warning fill-warning'
                        : 'text-warm-gray'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-text-secondary">
                {product.rating} ({product.reviews.toLocaleString()} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-8">
              <span className="font-display text-4xl font-semibold text-text-primary">
                {currencySymbol}{product.price.toLocaleString()}
              </span>
              <span className="text-sm text-text-muted ml-2">one-time payment</span>
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-text-secondary leading-relaxed">
                {product.fullDescription || product.description}
              </p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-text-primary uppercase tracking-elegant mb-4">
                  What's Included
                </h3>
                <ul className="space-y-3">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-forest-green/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-forest-green" />
                      </div>
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button
                onClick={() => onBuy(product)}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-forest-green hover:bg-forest-green-dark text-natural-white text-sm font-medium uppercase tracking-elegant transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Acquire Now — {currencySymbol}{product.price.toLocaleString()}
              </button>
              <button className="p-4 rounded-full border border-warm-gray text-text-muted hover:border-forest-green hover:text-forest-green transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-4 rounded-full border border-warm-gray text-text-muted hover:border-forest-green hover:text-forest-green transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-soft-neutral">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Check className="w-4 h-4 text-forest-green" />
                Instant Delivery
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Check className="w-4 h-4 text-forest-green" />
                Lifetime Access
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Check className="w-4 h-4 text-forest-green" />
                24/7 Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-soft-neutral py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-medium text-forest-green uppercase tracking-elegant mb-3">
                You May Also Like
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary">
                Related Products
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  onClick={() => onViewProduct(relatedProduct.id)}
                  className="group bg-natural-white rounded-2xl overflow-hidden border border-soft-neutral hover:border-forest-green/30 transition-all duration-300 cursor-pointer hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-soft-neutral">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium text-forest-green uppercase tracking-elegant mb-2">
                      {relatedProduct.category}
                    </p>
                    <h3 className="font-display text-lg font-semibold text-text-primary mb-2 group-hover:text-forest-green transition-colors line-clamp-1">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xl font-semibold text-text-primary">
                        {currencySymbol}{relatedProduct.price.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-forest-green font-medium uppercase tracking-elegant group-hover:gap-2 transition-all">
                        View
                        <ArrowRight className="w-3 h-3" />
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
