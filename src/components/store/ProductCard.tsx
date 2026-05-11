import { ArrowRight } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  index: number;
  onBuy: (product: Product) => void;
  currency: string;
}

export default function ProductCard({ product, index, onBuy, currency }: ProductCardProps) {
  const badgeColors: Record<string, string> = {
    'Best Seller': 'bg-forest-green text-natural-white',
    'Featured': 'bg-forest-green text-natural-white',
    'New': 'bg-text-primary text-natural-white',
    'Popular': 'bg-warning text-text-primary',
    'Premium': 'bg-text-primary text-natural-white',
  };

  return (
    <div
      className={`group bg-natural-white rounded-3xl overflow-hidden border border-soft-neutral hover:border-forest-green/30 transition-all duration-500 hover:shadow-xl hover:shadow-forest-green/5 animate-fade-in opacity-0 stagger-${Math.min(index + 1, 8)}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-soft-neutral">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        {product.badge && (
          <span className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-elegant ${badgeColors[product.badge] || 'bg-forest-green text-natural-white'}`}>
            {product.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category */}
        <p className="text-xs font-medium text-forest-green uppercase tracking-elegant mb-3">
          {product.category}
        </p>

        {/* Name */}
        <h3 className="font-display text-xl font-semibold text-text-primary mb-2 line-clamp-1 group-hover:text-forest-green transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-text-secondary line-clamp-2 mb-5 leading-relaxed">
          {product.description}
        </p>

        {/* Price & Button */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-2xl font-semibold text-text-primary">
              {currency === 'BDT' ? '৳' : '$'}{product.price.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => onBuy(product)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-forest-green text-natural-white text-xs font-medium uppercase tracking-elegant hover:bg-forest-green-dark transition-all group/btn"
          >
            Acquire
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
