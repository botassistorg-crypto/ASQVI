import { useState, useEffect } from 'react';
import {
  User, Phone, Mail, Loader2, Wallet,
  Eye, EyeOff, ArrowRight, UserCheck, Layers
} from 'lucide-react';
import Modal from '../ui/Modal';
import { Product, ProductTier } from '../../types';

export interface CustomerData {
  name: string;
  whatsapp: string;
  email: string;
  senderBkash: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  bkashNumber: string;
  currency: string;
  previousCustomer?: CustomerData | null;
  isUpsell?: boolean;
  selectedTier?: ProductTier | null;   // ← NEW: passed from ProductPage
  onSubmit: (data: CustomerData) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  product,
  bkashNumber,
  currency,
  previousCustomer,
  isUpsell,
  selectedTier,
  onSubmit,
}: CheckoutModalProps) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [senderBkash, setSenderBkash] = useState('');
  const [showBkashNumber, setShowBkashNumber] = useState(false);
  const [readyToPay, setReadyToPay] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [usePrevious, setUsePrevious] = useState(false);

  // ── AUTO-FILL for upsell ──────────────────────────────────
  useEffect(() => {
    if (isUpsell && previousCustomer && isOpen) {
      setName(previousCustomer.name);
      setWhatsapp(previousCustomer.whatsapp);
      setEmail(previousCustomer.email);
      setSenderBkash(previousCustomer.senderBkash);
      setUsePrevious(true);
      setReadyToPay(true);
    }
  }, [isOpen, isUpsell, previousCustomer]);

  if (!product) return null;

  const cs = currency === 'BDT' ? '৳' : '$';

  // ── PRICE LOGIC ───────────────────────────────────────────
  // If a tier is selected → use tier price, else use product price
  const displayPrice = selectedTier ? selectedTier.price : product.price;
  const paymentLabel = selectedTier
    ? selectedTier.paymentType === 'monthly'
      ? '/ month'
      : 'one-time'
    : 'one-time';

  // ── HANDLERS ─────────────────────────────────────────────
  const handleFillPrevious = () => {
    if (!previousCustomer) return;
    setName(previousCustomer.name);
    setWhatsapp(previousCustomer.whatsapp);
    setEmail(previousCustomer.email);
    setSenderBkash(previousCustomer.senderBkash);
    setUsePrevious(true);
    setReadyToPay(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    onSubmit({ name, whatsapp, email, senderBkash });
    setSubmitting(false);
    // Reset
    setName('');
    setWhatsapp('');
    setEmail('');
    setSenderBkash('');
    setReadyToPay(false);
    setShowBkashNumber(false);
    setUsePrevious(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">

      {/* ── PRODUCT SUMMARY ── */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
              {product.name}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>

            {/* Tier badge — shown when a tier is selected */}
            {selectedTier && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold uppercase tracking-wider">
                  <Layers className="w-3 h-3" />
                  {selectedTier.name} Plan
                </span>
                {selectedTier.isPopular && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">
                    ⭐ Most Popular
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-1.5 mt-1">
              <p className="font-display text-xl font-semibold text-[#4A5D4E]">
                {cs}{displayPrice.toLocaleString()}
              </p>
              <span className="text-xs text-gray-400">{paymentLabel}</span>
            </div>
          </div>
        </div>

        {/* Tier features summary — shown inside checkout */}
        {selectedTier && selectedTier.features && selectedTier.features.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">
              Included in {selectedTier.name}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedTier.features.slice(0, 4).map((feat, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-xs text-gray-600"
                >
                  ✓ {feat}
                </span>
              ))}
              {selectedTier.features.length > 4 && (
                <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-xs text-gray-400">
                  +{selectedTier.features.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── USE PREVIOUS CUSTOMER ── */}
      {previousCustomer && !usePrevious && (
        <button
          type="button"
          onClick={handleFillPrevious}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-sm font-medium mb-5 hover:bg-[#4A5D4E]/20 transition-colors"
        >
          <UserCheck className="w-4 h-4" />
          Use same details as previous order
        </button>
      )}

      {/* ── FORM ── */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Enter your name"
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#4A5D4E] bg-white"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
            WhatsApp
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              required
              placeholder="+880 1XXX XXXXXX"
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#4A5D4E] bg-white"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#4A5D4E] bg-white"
            />
          </div>
        </div>

        {/* ── PAYMENT SECTION ── */}
        <div className="pt-3 border-t border-gray-100">
          {!readyToPay ? (
            <button
              type="button"
              onClick={() => setReadyToPay(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-[#4A5D4E] text-[#4A5D4E] text-sm font-medium hover:bg-[#4A5D4E] hover:text-white transition-all"
            >
              <Wallet className="w-4 h-4" />
              I'm Ready to Pay — {cs}{displayPrice.toLocaleString()}
              {selectedTier?.paymentType === 'monthly' && '/mo'}
            </button>
          ) : (
            <div className="space-y-3">
              {/* bKash number reveal */}
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Send Payment To
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBkashNumber(!showBkashNumber)}
                    className="text-[#4A5D4E]"
                  >
                    {showBkashNumber
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="font-display text-lg font-semibold text-gray-900">
                  {showBkashNumber ? bkashNumber : '••••••••••••'}
                </p>
                <p className="text-[10px] text-[#4A5D4E]">bKash Personal Number</p>

                {/* Payment reminder for monthly */}
                {selectedTier?.paymentType === 'monthly' && (
                  <p className="text-[10px] text-amber-600 mt-1.5 bg-amber-50 px-2 py-1 rounded-lg">
                    📅 Send {cs}{displayPrice.toLocaleString()} now for first month
                  </p>
                )}
              </div>

              {/* Sender bKash input */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Your Sender bKash Number
                </label>
                <div className="relative">
                  <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={senderBkash}
                    onChange={e => setSenderBkash(e.target.value)}
                    required
                    placeholder="01XXX XXXXXX"
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#4A5D4E] bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── SUBMIT BUTTON ── */}
        <button
          type="submit"
          disabled={submitting || !readyToPay || !senderBkash}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-full bg-[#4A5D4E] hover:bg-[#3d4e41] disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium uppercase tracking-wider transition-all mt-2"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Complete — {cs}{displayPrice.toLocaleString()}
              {selectedTier?.paymentType === 'monthly' ? '/mo' : ''}
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </Modal>
  );
}
