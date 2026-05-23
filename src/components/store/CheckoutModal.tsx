import { useState, useEffect } from 'react';
import { User, Phone, Mail, Loader2, Wallet, Eye, EyeOff, ArrowRight, UserCheck } from 'lucide-react';
import Modal from '../ui/Modal';
import { Product } from '../../types';

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
  previousCustomer?: CustomerData | null;  // Auto-fill for upsell
  isUpsell?: boolean;
  onSubmit: (data: CustomerData) => void;
}

export default function CheckoutModal({ isOpen, onClose, product, bkashNumber, currency, previousCustomer, isUpsell, onSubmit }: CheckoutModalProps) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [senderBkash, setSenderBkash] = useState('');
  const [showBkashNumber, setShowBkashNumber] = useState(false);
  const [readyToPay, setReadyToPay] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [usePrevious, setUsePrevious] = useState(false);

  // Auto-fill from previous order when upsell
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    onSubmit({ name, whatsapp, email, senderBkash });
    setSubmitting(false);
    // Reset
    setName(''); setWhatsapp(''); setEmail(''); setSenderBkash('');
    setReadyToPay(false); setShowBkashNumber(false); setUsePrevious(false);
  };

  const handleFillPrevious = () => {
    if (!previousCustomer) return;
    setName(previousCustomer.name);
    setWhatsapp(previousCustomer.whatsapp);
    setEmail(previousCustomer.email);
    setSenderBkash(previousCustomer.senderBkash);
    setUsePrevious(true);
    setReadyToPay(true);
  };

  if (!product) return null;
  const cs = currency === 'BDT' ? '৳' : '$';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      {/* Product Summary */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0">
            <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{product.name}</h4>
            <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
            <p className="font-display text-xl font-semibold text-[#4A5D4E] mt-1">{cs}{product.price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Use Previous Customer — show only for upsell when we have data */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="Enter your name"
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#4A5D4E] bg-white" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">WhatsApp</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required
              placeholder="+880 1XXX XXXXXX"
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#4A5D4E] bg-white" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="your@email.com"
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#4A5D4E] bg-white" />
          </div>
        </div>

        {/* Payment */}
        <div className="pt-3 border-t border-gray-100">
          {!readyToPay ? (
            <button type="button" onClick={() => setReadyToPay(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-[#4A5D4E] text-[#4A5D4E] text-sm font-medium hover:bg-[#4A5D4E] hover:text-white transition-all">
              <Wallet className="w-4 h-4" /> I'm Ready to Pay
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Send Payment To</span>
                  <button type="button" onClick={() => setShowBkashNumber(!showBkashNumber)} className="text-[#4A5D4E]">
                    {showBkashNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="font-display text-lg font-semibold text-gray-900">{showBkashNumber ? bkashNumber : '••••••••••••'}</p>
                <p className="text-[10px] text-[#4A5D4E]">bKash Personal Number</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Your Sender bKash Number</label>
                <div className="relative">
                  <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" value={senderBkash} onChange={e => setSenderBkash(e.target.value)} required
                    placeholder="01XXX XXXXXX"
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#4A5D4E] bg-white" />
                </div>
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting || !readyToPay || !senderBkash}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-full bg-[#4A5D4E] hover:bg-[#3d4e41] disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium uppercase tracking-wider transition-all mt-2">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>Complete — {cs}{product.price.toLocaleString()} <ArrowRight className="w-3.5 h-3.5" /></>
          )}
        </button>
      </form>
    </Modal>
  );
}
