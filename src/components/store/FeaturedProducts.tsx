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
    <section id="collection" className="py-24 sm:py-32 bg-natural-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-medium text-forest-green uppercase tracking-elegant mb-4 animate-fade-in">
            Curated Selection
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-text-primary animate-fade-in stagger-1">
            Featured Collection
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featured.map((product, index) => (
            <div
              key={product.id}
              onClick={() => onViewProduct(product.id)}
              className={`group relative bg-soft-neutral rounded-3xl overflow-hidden animate-fade-in opacity-0 stagger-${index + 2} cursor-pointer hover:shadow-xl transition-shadow duration-300`}
            >
              <div className="flex flex-col lg:flex-row">
                {/* Image */}
                <div className="lg:w-1/2 aspect-square lg:aspect-auto overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                
                {/* Content */}
                <div className="lg:w-1/2 p-8 flex flex-col justify-center">
                  <p className="text-xs font-medium text-forest-green uppercase tracking-elegant mb-3">
                    {product.category}
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-text-primary mb-3 group-hover:text-forest-green transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-6 line-clamp-3">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl font-semibold text-text-primary">
                      {currencySymbol}{product.price.toLocaleString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBuy(product);
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-forest-green text-natural-white text-xs font-medium uppercase tracking-elegant hover:bg-forest-green-dark transition-all group/btn"
                    >
                      Acquire Now
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12 animate-fade-in stagger-6">
          <a
            href="#shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-forest-green uppercase tracking-elegant hover:gap-4 transition-all"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
