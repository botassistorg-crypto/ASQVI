import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocument } from '../lib/firestore';
import { Product } from '../types';
import { ChevronLeft, ShoppingCart, ShieldCheck, Download, Clock, Star, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        const data = await getDocument<Product>('products', id);
        setProduct(data);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <Link to="/shop" className="text-indigo-600 font-bold flex items-center">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div id="product-detail-page" className="min-h-screen bg-natural-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <Link to="/shop" className="inline-flex items-center text-[10px] uppercase tracking-[0.3em] font-bold text-forest-500 hover:text-forest-700 mb-12 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to library
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Image & Highlights */}
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-natural-200"
            >
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2.5rem] bg-white border border-natural-200 flex items-start space-x-5 shadow-sm">
                <div className="p-3 rounded-2xl bg-natural-100 text-forest-500">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#1A1C19] uppercase tracking-widest">Instant Access</h4>
                  <p className="text-[10px] text-[#6B7280] mt-1 font-medium uppercase tracking-tighter">Deliverable immediately.</p>
                </div>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-white border border-natural-200 flex items-start space-x-5 shadow-sm">
                <div className="p-3 rounded-2xl bg-natural-100 text-forest-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#1A1C19] uppercase tracking-widest">Verified Safe</h4>
                  <p className="text-[10px] text-[#6B7280] mt-1 font-medium uppercase tracking-tighter">Hand-curated quality.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info & Pricing */}
          <div className="flex flex-col py-4">
            <div className="flex items-center space-x-2 mb-6">
              <span className="px-3 py-1 bg-natural-100 text-forest-500 text-[10px] font-bold uppercase tracking-widest rounded-full">
                {product.category || 'Premium Learning'}
              </span>
              <span className="w-1 h-1 bg-natural-200 rounded-full" />
              <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest italic">Digital Asset</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1A1C19] leading-tight mb-6">
              {product.title}
            </h1>
            
            <div className="flex items-baseline space-x-4 mb-8">
              <span className="text-5xl font-bold text-forest-500 tracking-tighter">৳{product.price}</span>
              <span className="text-natural-200 line-through text-xl">৳{(product.price * 1.4).toFixed(0)}</span>
              <span className="px-3 py-1 rounded-lg bg-natural-100 border border-natural-200 text-forest-500 text-[10px] font-bold uppercase tracking-widest italic">40% OFF</span>
            </div>

            <div className="space-y-6 mb-10">
              <div className="prose prose-forest text-[#6B7280] leading-relaxed text-lg font-medium">
                <p>{product.description}</p>
              </div>
              
              {product.perks && product.perks.length > 0 && (
                <div className="p-8 bg-white rounded-[2.5rem] border border-natural-200 shadow-sm relative overflow-hidden">
                  <h3 className="text-[10px] font-bold text-forest-500 uppercase tracking-widest mb-4">Inside this product:</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.perks.map((perk, i) => (
                      <li key={i} className="flex items-center text-xs text-[#2D3436] font-medium uppercase tracking-tight">
                        <div className="w-1.5 h-1.5 rounded-full bg-forest-500 mr-3 shrink-0" /> {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-4">
              <Link
                to={`/checkout/${product.id}`}
                className="w-full py-6 bg-forest-500 text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-forest-600 shadow-2xl shadow-natural-200 transition-all flex items-center justify-center group"
              >
                Proceed to Checkout <ShoppingCart className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center justify-center space-x-6 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest pt-4">
                <span className="flex items-center"><Clock className="w-3 h-3 mr-2" /> Digital Delivery</span>
                <span className="w-1 h-1 bg-natural-200 rounded-full" />
                <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-2" /> bKash Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
