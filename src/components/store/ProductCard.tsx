import { ArrowRight } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  index: number;
  onBuy: (product: Product) => void;
  onViewProduct?: (productId: string) => void;
  currency: string;
}

export default function ProductCard({ product, onBuy, onViewProduct, currency }: ProductCardProps) {
  const currencySymbol = currency === 'BDT' ? '৳' : '$';

  const handleCardClick = () => {
    if (onViewProduct) onViewProduct(product.id);
  };

  return (
    <div
      className={`group bg-natural-white rounded-2xl overflow-hidden border border-soft-neutral hover:border-forest-green/30 transition-all duration-300 hover:shadow-lg ${onViewProduct ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      {/* Image — object-contain so nothing gets cropped */}
      <div className="bg-soft-neutral p-3">
        <div className="relative rounded-xl overflow-hidden bg-white flex items-center justify-center" style={{ height: '180px' }}>
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
            loading="lazy"
          />
          {product.badge && (
            <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-forest-green text-natural-white text-[10px] font-semibold uppercase tracking-wider">
              {product.badge}
            </span>
          )}
        </div>
      </div>

      {/* Content — compact */}
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
          <span className="font-display text-lg font-semibold text-text-primary">
            {currencySymbol}{product.price.toLocaleString()}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuy(product);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-green text-natural-white text-[11px] font-medium uppercase tracking-wider hover:bg-forest-green-dark transition-all group/btn"
          >
            Acquire
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
