import { useState } from 'react';
import {
  Plus, Pencil, Trash2, Gift, Tag, Percent,
  Save, Loader2, AlertTriangle, CheckCircle
} from 'lucide-react';
import Modal from '../ui/Modal';
import { Offer, Product, ThankYouConfig } from '../../types';

interface OffersPanelProps {
  offers: Offer[];
  products: Product[];
  thankYouConfig: ThankYouConfig;
  currency: string;
  onAddOffer: (offer: Omit<Offer, 'id'>) => Offer | null;
  onUpdateOffer: (offerId: string, updates: Partial<Offer>) => boolean;
  onDeleteOffer: (offerId: string) => boolean;
  onSaveThankYou: (config: ThankYouConfig) => boolean;
}

const defaultOffer: Omit<Offer, 'id'> = {
  name: '',
  type: 'discount',
  active: true,
  productIds: [],
  discountPercent: 0,
  discountFlat: 0,
  bundleProductIds: [],
  bundlePrice: 0,
  badge: '',
};

export default function OffersPanel({
  offers, products, thankYouConfig, currency,
  onAddOffer, onUpdateOffer, onDeleteOffer, onSaveThankYou,
}: OffersPanelProps) {
  const [tab, setTab] = useState<'offers' | 'thankyou'>('offers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [form, setForm] = useState<Omit<Offer, 'id'>>(defaultOffer);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Thank you state
  const [tyConfig, setTyConfig] = useState<ThankYouConfig>({ ...thankYouConfig });
  const [tySaving, setTySaving] = useState(false);
  const [tySaved, setTySaved] = useState(false);

  const cs = currency === 'BDT' ? '৳' : '$';

  const openAdd = () => { setEditingOffer(null); setForm(defaultOffer); setIsModalOpen(true); };
  const openEdit = (o: Offer) => {
    setEditingOffer(o);
    setForm({ name: o.name, type: o.type, active: o.active, productIds: o.productIds, discountPercent: o.discountPercent, discountFlat: o.discountFlat, bundleProductIds: o.bundleProductIds, bundlePrice: o.bundlePrice, badge: o.badge });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    if (editingOffer) onUpdateOffer(editingOffer.id, form);
    else onAddOffer(form);
    setSaving(false);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => { onDeleteOffer(id); setDeleteConfirm(null); };

  const handleSaveThankYou = async () => {
    setTySaving(true);
    await new Promise(r => setTimeout(r, 400));
    onSaveThankYou(tyConfig);
    setTySaving(false);
    setTySaved(true);
    setTimeout(() => setTySaved(false), 2000);
  };

  const toggleProduct = (id: string, field: 'productIds' | 'bundleProductIds') => {
    const current = (form[field] as string[]) || [];
    setForm(prev => ({ ...prev, [field]: current.includes(id) ? current.filter(x => x !== id) : [...current, id] }));
  };

  const toggleTyProduct = (id: string) => {
    setTyConfig(prev => ({
      ...prev,
      upsellProductIds: prev.upsellProductIds.includes(id) ? prev.upsellProductIds.filter(x => x !== id) : [...prev.upsellProductIds, id],
    }));
  };

  const typeLabels: Record<Offer['type'], string> = { discount: 'Discount', bundle: 'Bundle', upsell: 'Upsell', freebie: 'Freebie' };
  const typeColors: Record<Offer['type'], string> = { discount: 'bg-warning/10 text-warning', bundle: 'bg-info/10 text-info', upsell: 'bg-forest-green/10 text-forest-green', freebie: 'bg-danger/10 text-danger' };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        <button onClick={() => setTab('offers')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'offers' ? 'border-[#4A5D4E] text-[#4A5D4E]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          <Gift className="w-4 h-4 inline mr-1.5" />Offers & Bundles
        </button>
        <button onClick={() => setTab('thankyou')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'thankyou' ? 'border-[#4A5D4E] text-[#4A5D4E]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          <CheckCircle className="w-4 h-4 inline mr-1.5" />Thank You Page
        </button>
      </div>

      {/* OFFERS TAB */}
      {tab === 'offers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-gray-900">Offers & Bundles</h2>
              <p className="text-sm text-gray-500 mt-1">Create discounts, bundles, upsells, and freebies</p>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4A5D4E] hover:bg-[#3d4e41] text-white text-sm font-medium transition-all">
              <Plus className="w-4 h-4" />Add Offer
            </button>
          </div>

          {/* Offers List */}
          <div className="space-y-3">
            {offers.map(offer => (
              <div key={offer.id} className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${offer.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[offer.type]}`}>
                  {typeLabels[offer.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{offer.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {offer.productIds.length} product(s)
                    {offer.discountPercent ? ` • ${offer.discountPercent}% off` : ''}
                    {offer.discountFlat ? ` • ${cs}${offer.discountFlat} off` : ''}
                    {offer.bundlePrice ? ` • Bundle: ${cs}${offer.bundlePrice}` : ''}
                  </p>
                </div>
                <span className={`text-xs font-medium ${offer.active ? 'text-green-600' : 'text-gray-400'}`}>
                  {offer.active ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => openEdit(offer)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#4A5D4E]"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteConfirm(offer.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {offers.length === 0 && (
              <div className="text-center py-12">
                <Gift className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No offers yet</p>
              </div>
            )}
          </div>

          {/* Offer Modal */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingOffer ? 'Edit Offer' : 'Create Offer'} maxWidth="max-w-2xl">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Summer Sale 30% Off" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as Offer['type'] }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]">
                    <option value="discount">Discount</option>
                    <option value="bundle">Bundle</option>
                    <option value="upsell">Upsell</option>
                    <option value="freebie">Freebie (Free product)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                  <input value={form.badge || ''} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))} placeholder="e.g., 30% OFF" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" />
                </div>
              </div>

              {(form.type === 'discount' || form.type === 'upsell') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                    <div className="relative"><Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="number" min="0" max="100" value={form.discountPercent || ''} onChange={e => setForm(p => ({ ...p, discountPercent: Number(e.target.value) }))} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" /></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Flat Discount ({cs})</label>
                    <input type="number" min="0" value={form.discountFlat || ''} onChange={e => setForm(p => ({ ...p, discountFlat: Number(e.target.value) }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" />
                  </div>
                </div>
              )}

              {form.type === 'bundle' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Price ({cs})</label>
                  <input type="number" min="0" value={form.bundlePrice || ''} onChange={e => setForm(p => ({ ...p, bundlePrice: Number(e.target.value) }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" />
                </div>
              )}

              {/* Apply to Products */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apply to Products</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                  {products.map(p => {
                    const sel = form.productIds.includes(p.id);
                    return (
                      <button key={p.id} type="button" onClick={() => toggleProduct(p.id, 'productIds')} className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${sel ? 'border-[#4A5D4E] bg-[#4A5D4E]/5' : 'border-gray-200'}`}>
                        <img src={p.image} alt="" className="w-8 h-8 rounded object-contain bg-gray-50" />
                        <span className="truncate flex-1">{p.name}</span>
                        {sel && <CheckCircle className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bundle Products */}
              {form.type === 'bundle' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bundle Includes (extra products)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                    {products.map(p => {
                      const sel = (form.bundleProductIds || []).includes(p.id);
                      return (
                        <button key={p.id} type="button" onClick={() => toggleProduct(p.id, 'bundleProductIds')} className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${sel ? 'border-[#4A5D4E] bg-[#4A5D4E]/5' : 'border-gray-200'}`}>
                          <img src={p.image} alt="" className="w-8 h-8 rounded object-contain bg-gray-50" />
                          <span className="truncate flex-1">{p.name}</span>
                          {sel && <CheckCircle className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="w-5 h-5 rounded border-gray-300 text-[#4A5D4E] focus:ring-[#4A5D4E]" />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={handleSave} disabled={saving || !form.name} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#4A5D4E] hover:bg-[#3d4e41] disabled:bg-gray-300 text-white text-sm font-medium">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingOffer ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </Modal>

          {/* Delete Modal */}
          <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="max-w-sm">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-7 h-7 text-red-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Offer?</h3>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium">Cancel</button>
                <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium">Delete</button>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* THANK YOU TAB */}
      {tab === 'thankyou' && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h2 className="font-display text-2xl font-semibold text-gray-900">Thank You Page</h2>
            <p className="text-sm text-gray-500 mt-1">Customize the page customers see after purchasing</p>
          </div>

          {/* Message */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Tag className="w-4 h-4" />Message</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
              <input value={tyConfig.heading} onChange={e => setTyConfig(p => ({ ...p, heading: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body Message</label>
              <textarea value={tyConfig.message} onChange={e => setTyConfig(p => ({ ...p, message: e.target.value }))} rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E] resize-none" placeholder="Write your thank you message... Use line breaks, bullet points etc." />
            </div>
          </div>

          {/* Upsell Config */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Gift className="w-4 h-4" />Upsell Offer</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={tyConfig.showUpsell} onChange={e => setTyConfig(p => ({ ...p, showUpsell: e.target.checked }))} className="w-5 h-5 rounded border-gray-300 text-[#4A5D4E] focus:ring-[#4A5D4E]" />
                <span className="text-sm text-gray-600">Show upsell</span>
              </label>
            </div>

            {tyConfig.showUpsell && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upsell Heading</label>
                  <input value={tyConfig.upsellHeading} onChange={e => setTyConfig(p => ({ ...p, upsellHeading: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upsell Discount %</label>
                    <input type="number" min="0" max="100" value={tyConfig.upsellDiscount || ''} onChange={e => setTyConfig(p => ({ ...p, upsellDiscount: Number(e.target.value) }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                    <input value={tyConfig.upsellBadge || ''} onChange={e => setTyConfig(p => ({ ...p, upsellBadge: e.target.value }))} placeholder="e.g., 50% OFF" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Upsell Products</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                    {products.map(p => {
                      const sel = tyConfig.upsellProductIds.includes(p.id);
                      return (
                        <button key={p.id} type="button" onClick={() => toggleTyProduct(p.id)} className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${sel ? 'border-[#4A5D4E] bg-[#4A5D4E]/5' : 'border-gray-200'}`}>
                          <img src={p.image} alt="" className="w-8 h-8 rounded object-contain bg-gray-50" />
                          <span className="truncate flex-1">{p.name}</span>
                          {sel && <CheckCircle className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  {tyConfig.upsellProductIds.length > 0 && <p className="text-xs text-[#4A5D4E] mt-2 font-medium">{tyConfig.upsellProductIds.length} product(s) selected</p>}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button onClick={handleSaveThankYou} disabled={tySaving} className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#4A5D4E] hover:bg-[#3d4e41] text-white text-sm font-medium transition-all">
              {tySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : tySaved ? <><CheckCircle className="w-4 h-4" />Saved</> : <><Save className="w-4 h-4" />Save</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
