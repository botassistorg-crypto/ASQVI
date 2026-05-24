import { ArrowRight } from 'lucide-react';
import { Offer, Product } from '../../types';

interface BundleCardProps {
  offer: Offer;
  products: Product[];
  currency: string;
  onBuy: (offer: Offer) => void;
}

export default function BundleCard({ offer, products, currency, onBuy }: BundleCardProps) {
  const cs = currency === 'BDT' ? '৳' : '$';
  const allIds = [...offer.productIds, ...(offer.bundleProductIds || [])];
  const bundleProducts = allIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
  const bundlePrice = offer.bundlePrice || 0;
  const originalPrice = offer.bundleOriginalPrice || bundleProducts.reduce((s, p) => s + p.price, 0);
  const savings = originalPrice - bundlePrice;

  if (bundleProducts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Collage Image */}
      <div className="relative bg-soft-neutral p-3">
        <div className="rounded-xl overflow-hidden" style={{ height: '180px' }}>
          {bundleProducts.length === 1 && (
            <div className="w-full h-full bg-white flex items-center justify-center">
              <img src={bundleProducts[0].image} alt="" className="max-w-full max-h-full object-contain" />
            </div>
          )}
          {bundleProducts.length === 2 && (
            <div className="grid grid-cols-2 gap-1 h-full">
              {bundleProducts.map(p => (
                <div key={p.id} className="bg-white flex items-center justify-center rounded-lg p-2">
                  <img src={p.image} alt="" className="max-w-full max-h-full object-contain" />
                </div>
              ))}
            </div>
          )}
          {bundleProducts.length >= 3 && (
            <div className="grid grid-cols-3 gap-1 h-full">
              {bundleProducts.slice(0, 3).map(p => (
                <div key={p.id} className="bg-white flex items-center justify-center rounded-lg p-2">
                  <img src={p.image} alt="" className="max-w-full max-h-full object-contain" />
                </div>
              ))}
            </div>
          )}
        </div>
        {offer.badge && (
          <span className="absolute top-5 left-5 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
            {offer.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-base font-semibold text-gray-900 mb-1">{offer.name}</h3>
        {offer.bundleDescription && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{offer.bundleDescription}</p>
        )}
        <p className="text-[10px] text-gray-400 mb-3">{bundleProducts.length} products included</p>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              {originalPrice > bundlePrice && (
                <span className="text-sm text-gray-400 line-through">{cs}{originalPrice.toLocaleString()}</span>
              )}
              <span className="font-display text-xl font-semibold text-[#4A5D4E]">{cs}{bundlePrice.toLocaleString()}</span>
            </div>
            {savings > 0 && <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Save {cs}{savings.toLocaleString()}</p>}
          </div>
          <button onClick={() => onBuy(offer)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4A5D4E] hover:bg-[#3d4e41] text-white text-[11px] font-medium uppercase tracking-wider transition-all">
            Get Bundle <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
