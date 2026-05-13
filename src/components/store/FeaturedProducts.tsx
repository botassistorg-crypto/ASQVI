import { ArrowRight } from 'lucide-react';
import { Product } from '../../types';
interface FeaturedProductsProps {
  products: Product[];
  onBuy: (product: Product) => void;
  onViewProduct: (productId: string) => void;
  currency: string;
}
export default function FeaturedProducts({ products, onBuy, onViewProduct, currency }: FeaturedProductsProps) {
  const featured = products.filter(p => p.featured).slice(0, 4);
  const currencySymbol = currency === 'BDT' ? '৳' : '$';
  if (featured.length === 0) return null;
  return (
    <section id="collection" className="py-16 sm:py-20 bg-natural-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[10px] font-semibold text-forest-green uppercase tracking-wider mb-3">
            Curated Selection
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary">
            Featured Collection
          </h2>
        </div>
        {/* Grid — 2 per row on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((product) => (
            <div
              key={product.id}
              onClick={() => onViewProduct(product.id)}
              className="group bg-soft-neutral rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
            >
              {/* Image */}
              <div className="bg-white m-2 rounded-xl overflow-hidden flex items-center justify-center" style={{ height: '150px' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                />
              </div>
              {/* Content */}
              <div className="px-3 pb-3 pt-1">
                <p className="text-[10px] font-semibold text-forest-green uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <h3 className="font-display text-sm font-semibold text-text-primary mb-1 line-clamp-1 group-hover:text-forest-green transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-display text-base font-semibold text-text-primary">
                    {currencySymbol}{product.price.toLocaleString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuy(product);
                    }}
                    className="px-3 py-1.5 rounded-full bg-forest-green text-natural-white text-[10px] font-medium uppercase tracking-wider hover:bg-forest-green-dark transition-all"
                  >
                    Acquire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <a
            href="#shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-forest-green uppercase tracking-elegant hover:gap-3 transition-all"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
