import { ArrowRight, Package } from 'lucide-react';
import { Offer, Product } from '../../types';

interface BundleCardProps {
  offer: Offer;
  products: Product[];
  currency: string;
  onBuy: (offer: Offer) => void;
}

export default function BundleCard({ offer, products, currency, onBuy }: BundleCardProps) {
  const cs = currency === 'BDT' ? '৳' : '$';

  // Get all products in the bundle (trigger + included)
  const allIds = [...offer.productIds, ...(offer.bundleProductIds || [])];
  const bundleProducts = allIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
  const totalOriginal = bundleProducts.reduce((sum, p) => sum + p.price, 0);
  const bundlePrice = offer.bundlePrice || totalOriginal;
  const savings = totalOriginal - bundlePrice;

  if (bundleProducts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="bg-amber-50 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-700" />
          <span className="text-sm font-semibold text-amber-800">{offer.name}</span>
        </div>
        {offer.badge && (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
            {offer.badge}
          </span>
        )}
      </div>

      {/* Products in bundle */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {bundleProducts.map(p => (
            <div key={p.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 flex-1 min-w-[120px]">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
                <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-[10px] text-gray-400 line-through">{cs}{p.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 line-through">{cs}{totalOriginal.toLocaleString()}</span>
              <span className="font-display text-xl font-semibold text-[#4A5D4E]">{cs}{bundlePrice.toLocaleString()}</span>
            </div>
            {savings > 0 && (
              <p className="text-xs text-amber-700 font-medium mt-0.5">Save {cs}{savings.toLocaleString()}</p>
            )}
          </div>
          <button
            onClick={() => onBuy(offer)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#4A5D4E] hover:bg-[#3d4e41] text-white text-[11px] font-medium uppercase tracking-wider transition-all"
          >
            Get Bundle <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
