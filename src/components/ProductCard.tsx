import { Link } from 'react-router-dom';
import { Product } from '../types';
import { motion } from 'motion/react';
import { ChevronRight, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl border border-natural-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
      id={`product-${product.id}`}
    >
      <Link to={`/product/${product.id}`} className="block overflow-hidden aspect-[4/3] bg-natural-50 p-3">
        <div className="w-full h-full rounded-xl overflow-hidden bg-natural-200 relative">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          {product.category && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-[10px] font-bold uppercase tracking-widest text-forest-500">
              {product.category}
            </div>
          )}
        </div>
      </Link>
      <div className="p-6 flex-grow flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-xl font-serif font-bold text-[#1A1C19] line-clamp-1 group-hover:text-forest-500 transition-colors">
            {product.title}
          </h3>
        </Link>
        <p className="mt-2 text-xs text-[#6B7280] line-clamp-2 leading-relaxed font-medium uppercase tracking-tighter">
          {product.description}
        </p>
        <div className="mt-auto pt-6 flex items-center justify-between">
          <span className="text-xl font-bold text-forest-500">৳{product.price}</span>
          <Link
            to={`/product/${product.id}`}
            className="px-6 py-2 bg-forest-500 text-white rounded-full text-[10px] items-center uppercase tracking-widest font-bold transition-all hover:bg-forest-600"
          >
            Learn More
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
