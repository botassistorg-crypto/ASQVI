import { useState } from 'react';
import {
  Plus, Pencil, Trash2, Gift, Tag, Percent,
  Save, Loader2, AlertTriangle, CheckCircle
} from 'lucide-react';
import Modal from '../ui/Modal';
import { Offer, Product, ThankYouConfig, ThankYouRule } from '../../types';

interface OffersPanelProps {
  offers: Offer[];
  products: Product[];
  thankYouConfig: ThankYouConfig;
  currency: string;
  onAddOffer: (offer: Omit<Offer, 'id'>) => Promise<Offer | null>;
  onUpdateOffer: (offerId: string, updates: Partial<Offer>) => Promise<boolean>;
  onDeleteOffer: (offerId: string) => Promise<boolean>;
  onSaveThankYou: (config: ThankYouConfig) => Promise<boolean>;
}

const defaultOffer: Omit<Offer, 'id'> = {
  name: '', type: 'discount', active: true, category: '', productIds: [],
  discountPercent: 0, discountFlat: 0, bundleProductIds: [], bundlePrice: 0,
  bundleOriginalPrice: 0, badge: '', bundleDescription: '',
};

const defaultRule: Omit<ThankYouRule, 'id'> = {
  name: '', active: true, triggerProductIds: [],
  heading: 'Thank You for Your Purchase! 🎉',
  message: 'Your order has been received.\n\nWe will send access details to your email shortly.',
  showUpsell: true, upsellHeading: 'Exclusive Offer — Just for You',
  upsellProductIds: [], upsellDiscount: 0, upsellBadge: 'Special Deal',
};

export default function OffersPanel({
  offers, products, thankYouConfig, currency,
  onAddOffer, onUpdateOffer, onDeleteOffer, onSaveThankYou,
}: OffersPanelProps) {
  const [tab, setTab] = useState<'offers' | 'thankyou'>('offers');

  // Offer state
  const [isOfferModal, setIsOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerForm, setOfferForm] = useState<Omit<Offer, 'id'>>(defaultOffer);
  const [offerSaving, setOfferSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Thank you rule state
  const [isRuleModal, setIsRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ThankYouRule | null>(null);
  const [ruleForm, setRuleForm] = useState<Omit<ThankYouRule, 'id'>>(defaultRule);
  const [ruleSaving, setRuleSaving] = useState(false);
  const [deleteRuleConfirm, setDeleteRuleConfirm] = useState<string | null>(null);

  // Default message state
  const [defHeading, setDefHeading] = useState(thankYouConfig.defaultHeading);
  const [defMessage, setDefMessage] = useState(thankYouConfig.defaultMessage);
  const [defSaving, setDefSaving] = useState(false);
  const [defSaved, setDefSaved] = useState(false);

  const cs = currency === 'BDT' ? '৳' : '$';

  // --- OFFER HANDLERS ---
  const openAddOffer = () => { setEditingOffer(null); setOfferForm(defaultOffer); setIsOfferModal(true); };
  const openEditOffer = (o: Offer) => { setEditingOffer(o); setOfferForm({ name: o.name, type: o.type, active: o.active, category: o.category || '', productIds: o.productIds, discountPercent: o.discountPercent, discountFlat: o.discountFlat, bundleProductIds: o.bundleProductIds, bundlePrice: o.bundlePrice, bundleOriginalPrice: o.bundleOriginalPrice, badge: o.badge, bundleDescription: o.bundleDescription }); setIsOfferModal(true); };
  const saveOffer = async () => {
    if (!offerForm.name) return;
    setOfferSaving(true);
    if (editingOffer) await onUpdateOffer(editingOffer.id, offerForm); else await onAddOffer(offerForm);
    setOfferSaving(false); setIsOfferModal(false);
  };
  const deleteOfferConfirmed = async (id: string) => { await onDeleteOffer(id); setDeleteConfirm(null); };
  const toggleOfferProduct = (id: string, field: 'productIds' | 'bundleProductIds') => {
    const c = (offerForm[field] as string[]) || [];
    setOfferForm(p => ({ ...p, [field]: c.includes(id) ? c.filter(x => x !== id) : [...c, id] }));
  };

  // --- RULE HANDLERS ---
  const openAddRule = () => { setEditingRule(null); setRuleForm(defaultRule); setIsRuleModal(true); };
  const openEditRule = (r: ThankYouRule) => {
    setEditingRule(r);
    setRuleForm({ name: r.name, active: r.active, triggerProductIds: r.triggerProductIds, heading: r.heading, message: r.message, showUpsell: r.showUpsell, upsellHeading: r.upsellHeading, upsellProductIds: r.upsellProductIds, upsellDiscount: r.upsellDiscount, upsellBadge: r.upsellBadge });
    setIsRuleModal(true);
  };
  const saveRule = async () => {
    if (!ruleForm.name || ruleForm.triggerProductIds.length === 0) return;
    setRuleSaving(true);
    await new Promise(r => setTimeout(r, 300));
    const rules = [...thankYouConfig.rules];
    if (editingRule) {
      const idx = rules.findIndex(r => r.id === editingRule.id);
      if (idx !== -1) rules[idx] = { ...editingRule, ...ruleForm };
    } else {
      rules.push({ id: `tyr-${Date.now()}`, ...ruleForm });
    }
    await onSaveThankYou({ ...thankYouConfig, rules });
    setRuleSaving(false); setIsRuleModal(false);
  };
  const deleteRuleConfirmed = async (id: string) => {
    await onSaveThankYou({ ...thankYouConfig, rules: thankYouConfig.rules.filter(r => r.id !== id) });
    setDeleteRuleConfirm(null);
  };
  const toggleRuleTrigger = (id: string) => {
    const c = ruleForm.triggerProductIds;
    setRuleForm(p => ({ ...p, triggerProductIds: c.includes(id) ? c.filter(x => x !== id) : [...c, id] }));
  };
  const toggleRuleUpsell = (id: string) => {
    const c = ruleForm.upsellProductIds;
    setRuleForm(p => ({ ...p, upsellProductIds: c.includes(id) ? c.filter(x => x !== id) : [...c, id] }));
  };
  const saveDefaults = async () => {
    setDefSaving(true);
    await onSaveThankYou({ ...thankYouConfig, defaultHeading: defHeading, defaultMessage: defMessage });
    setDefSaving(false); setDefSaved(true); setTimeout(() => setDefSaved(false), 2000);
  };

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || id;
  const typeLabels: Record<Offer['type'], string> = { discount: 'Discount', bundle: 'Bundle', upsell: 'Upsell', freebie: 'Freebie' };
  const typeColors: Record<Offer['type'], string> = { discount: 'bg-amber-100 text-amber-700', bundle: 'bg-blue-100 text-blue-700', upsell: 'bg-emerald-100 text-emerald-700', freebie: 'bg-red-100 text-red-700' };

  // Product selector helper
  const ProductGrid = ({ selected, onToggle, exclude }: { selected: string[]; onToggle: (id: string) => void; exclude?: string[] }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1">
      {products.filter(p => !(exclude || []).includes(p.id)).map(p => {
        const sel = selected.includes(p.id);
        return (
          <button key={p.id} type="button" onClick={() => onToggle(p.id)} className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${sel ? 'border-[#4A5D4E] bg-[#4A5D4E]/5' : 'border-gray-200 hover:border-gray-300'}`}>
            <img src={p.image} alt="" className="w-8 h-8 rounded object-contain bg-gray-50 shrink-0" />
            <span className="truncate flex-1">{p.name}</span>
            {sel && <CheckCircle className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        <button onClick={() => setTab('offers')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'offers' ? 'border-[#4A5D4E] text-[#4A5D4E]' : 'border-transparent text-gray-400'}`}>
          <Gift className="w-4 h-4 inline mr-1.5" />Offers & Bundles
        </button>
        <button onClick={() => setTab('thankyou')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'thankyou' ? 'border-[#4A5D4E] text-[#4A5D4E]' : 'border-transparent text-gray-400'}`}>
          <CheckCircle className="w-4 h-4 inline mr-1.5" />Thank You Upsells
        </button>
      </div>

      {/* ========== OFFERS TAB ========== */}
      {tab === 'offers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><h2 className="font-display text-2xl font-semibold text-gray-900">Offers & Bundles</h2><p className="text-sm text-gray-500 mt-1">Create discounts, bundles, and freebies</p></div>
            <button onClick={openAddOffer} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4A5D4E] hover:bg-[#3d4e41] text-white text-sm font-medium"><Plus className="w-4 h-4" />Add Offer</button>
          </div>
          {offers.map(o => (
            <div key={o.id} className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${o.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[o.type]}`}>{typeLabels[o.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{o.name}</p>
                <p className="text-xs text-gray-500">{o.category ? `📁 ${o.category} • ` : ''}{o.productIds.length} product(s){o.discountPercent ? ` • ${o.discountPercent}% off` : ''}{o.bundlePrice ? ` • Bundle: ${cs}${o.bundlePrice}` : ''}</p>
              </div>
              <span className={`text-xs font-medium ${o.active ? 'text-green-600' : 'text-gray-400'}`}>{o.active ? 'Active' : 'Off'}</span>
              <button onClick={() => openEditOffer(o)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#4A5D4E]"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => setDeleteConfirm(o.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {offers.length === 0 && <div className="text-center py-12"><Gift className="w-10 h-10 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-400">No offers yet</p></div>}

          {/* Offer Modal */}
          <Modal isOpen={isOfferModal} onClose={() => setIsOfferModal(false)} title={editingOffer ? 'Edit Offer' : 'Create Offer'} maxWidth="max-w-2xl">
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input value={offerForm.name} onChange={e => setOfferForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Summer Sale" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={offerForm.type} onChange={e => setOfferForm(p => ({ ...p, type: e.target.value as any }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"><option value="discount">Discount</option><option value="bundle">Bundle</option><option value="upsell">Upsell</option><option value="freebie">Freebie</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={offerForm.category || ''} onChange={e => setOfferForm(p => ({ ...p, category: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"><option value="">No Category</option>{Array.from(new Set(products.map(p => p.category))).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Badge</label><input value={offerForm.badge || ''} onChange={e => setOfferForm(p => ({ ...p, badge: e.target.value }))} placeholder="30% OFF" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" /></div>
              </div>
              {(offerForm.type === 'discount' || offerForm.type === 'upsell') && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label><div className="relative"><Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="number" min="0" max="100" value={offerForm.discountPercent || ''} onChange={e => setOfferForm(p => ({ ...p, discountPercent: Number(e.target.value) }))} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" /></div></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Flat ({cs})</label><input type="number" min="0" value={offerForm.discountFlat || ''} onChange={e => setOfferForm(p => ({ ...p, discountFlat: Number(e.target.value) }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" /></div>
                </div>
              )}
              {offerForm.type === 'bundle' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Original Total ({cs})</label><input type="number" min="0" value={offerForm.bundleOriginalPrice || ''} onChange={e => setOfferForm(p => ({ ...p, bundleOriginalPrice: Number(e.target.value) }))} placeholder="Total if bought separately" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Bundle Price ({cs}) *</label><input type="number" min="0" value={offerForm.bundlePrice || ''} onChange={e => setOfferForm(p => ({ ...p, bundlePrice: Number(e.target.value) }))} placeholder="Discounted bundle price" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Bundle Description</label><input value={offerForm.bundleDescription || ''} onChange={e => setOfferForm(p => ({ ...p, bundleDescription: e.target.value }))} placeholder="e.g., 3 bestselling eBooks in one pack" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" /></div>
                </div>
              )}
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Apply to Products</label><ProductGrid selected={offerForm.productIds} onToggle={id => toggleOfferProduct(id, 'productIds')} /></div>
              {offerForm.type === 'bundle' && <div><label className="block text-sm font-medium text-gray-700 mb-2">Bundle Includes</label><ProductGrid selected={offerForm.bundleProductIds || []} onToggle={id => toggleOfferProduct(id, 'bundleProductIds')} /></div>}
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={offerForm.active} onChange={e => setOfferForm(p => ({ ...p, active: e.target.checked }))} className="w-5 h-5 rounded border-gray-300 text-[#4A5D4E]" /><span className="text-sm">Active</span></label>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsOfferModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={saveOffer} disabled={offerSaving || !offerForm.name} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#4A5D4E] hover:bg-[#3d4e41] disabled:bg-gray-300 text-white text-sm font-medium">{offerSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{editingOffer ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </Modal>
          <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="max-w-sm"><div className="text-center"><div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-7 h-7 text-red-600" /></div><h3 className="text-lg font-semibold mb-2">Delete Offer?</h3><div className="flex gap-3 mt-6"><button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium">Cancel</button><button onClick={() => deleteConfirm && deleteOfferConfirmed(deleteConfirm)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium">Delete</button></div></div></Modal>
        </div>
      )}

      {/* ========== THANK YOU TAB ========== */}
      {tab === 'thankyou' && (
        <div className="space-y-6">
          <div><h2 className="font-display text-2xl font-semibold text-gray-900">Thank You Page Upsells</h2><p className="text-sm text-gray-500 mt-1">Create rules: "When customer buys X → show Y as upsell"</p></div>

          {/* Default Message */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-w-2xl">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Tag className="w-4 h-4" />Default Thank You (when no rule matches)</h3>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Heading</label><input value={defHeading} onChange={e => setDefHeading(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Message</label><textarea value={defMessage} onChange={e => setDefMessage(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E] resize-none" /></div>
            <div className="flex justify-end"><button onClick={saveDefaults} disabled={defSaving} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4A5D4E] hover:bg-[#3d4e41] text-white text-sm font-medium">{defSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : defSaved ? <><CheckCircle className="w-4 h-4" />Saved</> : <><Save className="w-4 h-4" />Save Default</>}</button></div>
          </div>

          {/* Rules */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Upsell Rules ({thankYouConfig.rules.length})</h3>
            <button onClick={openAddRule} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4A5D4E] hover:bg-[#3d4e41] text-white text-sm font-medium"><Plus className="w-4 h-4" />Add Rule</button>
          </div>

          <div className="space-y-3">
            {thankYouConfig.rules.map(rule => (
              <div key={rule.id} className={`bg-white rounded-xl border p-4 ${rule.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-[#4A5D4E] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{rule.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-medium">When buying:</span> {rule.triggerProductIds.map(id => getProductName(id)).join(', ')}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="font-medium">Show upsell:</span> {rule.showUpsell ? rule.upsellProductIds.map(id => getProductName(id)).join(', ') || 'None selected' : 'Disabled'}
                      {rule.upsellDiscount ? ` (${rule.upsellDiscount}% off)` : ''}
                    </p>
                  </div>
                  <span className={`text-xs font-medium ${rule.active ? 'text-green-600' : 'text-gray-400'}`}>{rule.active ? 'Active' : 'Off'}</span>
                  <button onClick={() => openEditRule(rule)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#4A5D4E]"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteRuleConfirm(rule.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {thankYouConfig.rules.length === 0 && <div className="text-center py-10 bg-white rounded-xl border border-gray-200"><Gift className="w-10 h-10 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-400">No upsell rules yet</p><p className="text-xs text-gray-400 mt-1">Create a rule to show specific upsells when specific products are purchased</p></div>}
          </div>

          {/* Rule Modal */}
          <Modal isOpen={isRuleModal} onClose={() => setIsRuleModal(false)} title={editingRule ? 'Edit Upsell Rule' : 'Create Upsell Rule'} maxWidth="max-w-2xl">
            <div className="space-y-5">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Rule Name *</label><input value={ruleForm.name} onChange={e => setRuleForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., eBook buyers → Course upsell" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" /></div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <label className="block text-sm font-semibold text-blue-800 mb-2">When customer buys ANY of these products: *</label>
                <ProductGrid selected={ruleForm.triggerProductIds} onToggle={toggleRuleTrigger} />
                {ruleForm.triggerProductIds.length > 0 && <p className="text-xs text-blue-600 mt-2 font-medium">{ruleForm.triggerProductIds.length} trigger(s) selected</p>}
              </div>

              <div><label className="block text-sm font-medium text-gray-700 mb-1">Thank You Heading</label><input value={ruleForm.heading} onChange={e => setRuleForm(p => ({ ...p, heading: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Thank You Message</label><textarea value={ruleForm.message} onChange={e => setRuleForm(p => ({ ...p, message: e.target.value }))} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E] resize-none" /></div>

              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={ruleForm.showUpsell} onChange={e => setRuleForm(p => ({ ...p, showUpsell: e.target.checked }))} className="w-5 h-5 rounded border-gray-300 text-[#4A5D4E]" /><span className="text-sm font-medium">Show upsell products on this Thank You page</span></label>

              {ruleForm.showUpsell && (
                <div className="space-y-4 pl-4 border-l-2 border-[#4A5D4E]/20">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-emerald-800 mb-2">Show THESE products as upsell:</label>
                    <ProductGrid selected={ruleForm.upsellProductIds} onToggle={toggleRuleUpsell} />
                    {ruleForm.upsellProductIds.length > 0 && <p className="text-xs text-emerald-600 mt-2 font-medium">{ruleForm.upsellProductIds.length} upsell(s) selected</p>}
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Upsell Heading</label><input value={ruleForm.upsellHeading} onChange={e => setRuleForm(p => ({ ...p, upsellHeading: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label><input type="number" min="0" max="100" value={ruleForm.upsellDiscount || ''} onChange={e => setRuleForm(p => ({ ...p, upsellDiscount: Number(e.target.value) }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Badge</label><input value={ruleForm.upsellBadge || ''} onChange={e => setRuleForm(p => ({ ...p, upsellBadge: e.target.value }))} placeholder="50% OFF" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]" /></div>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={ruleForm.active} onChange={e => setRuleForm(p => ({ ...p, active: e.target.checked }))} className="w-5 h-5 rounded border-gray-300 text-[#4A5D4E]" /><span className="text-sm">Active</span></label>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsRuleModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={saveRule} disabled={ruleSaving || !ruleForm.name || ruleForm.triggerProductIds.length === 0} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#4A5D4E] hover:bg-[#3d4e41] disabled:bg-gray-300 text-white text-sm font-medium">{ruleSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{editingRule ? 'Update' : 'Create Rule'}</button>
              </div>
            </div>
          </Modal>
          <Modal isOpen={!!deleteRuleConfirm} onClose={() => setDeleteRuleConfirm(null)} maxWidth="max-w-sm"><div className="text-center"><div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-7 h-7 text-red-600" /></div><h3 className="text-lg font-semibold mb-2">Delete Rule?</h3><div className="flex gap-3 mt-6"><button onClick={() => setDeleteRuleConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium">Cancel</button><button onClick={() => deleteRuleConfirm && deleteRuleConfirmed(deleteRuleConfirm)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium">Delete</button></div></div></Modal>
        </div>
      )}
    </div>
  );
}
