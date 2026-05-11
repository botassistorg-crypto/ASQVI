import { useState } from 'react';
import { User, Phone, Mail, Check, Loader2, Wallet, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Modal from '../ui/Modal';
import { Product } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  bkashNumber: string;
  currency: string;
  onSubmit: (data: { name: string; whatsapp: string; email: string; senderBkash: string }) => void;
}

export default function CheckoutModal({ isOpen, onClose, product, bkashNumber, currency, onSubmit }: CheckoutModalProps) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [senderBkash, setSenderBkash] = useState('');
  const [showBkashNumber, setShowBkashNumber] = useState(false);
  const [readyToPay, setReadyToPay] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    onSubmit({ name, whatsapp, email, senderBkash });
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setName('');
      setWhatsapp('');
      setEmail('');
      setSenderBkash('');
      setReadyToPay(false);
      setShowBkashNumber(false);
      onClose();
    }, 2500);
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      {success ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-forest-green/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-forest-green" />
          </div>
          <h3 className="font-display text-2xl font-semibold text-text-primary mb-3">Order Confirmed</h3>
          <p className="text-text-secondary">We'll verify your payment and send access details to your email shortly.</p>
        </div>
      ) : (
        <>
          {/* Portfolio Summary */}
          <div className="bg-soft-neutral rounded-2xl p-5 mb-6">
            <p className="text-xs font-medium text-forest-green uppercase tracking-elegant mb-3">
              Portfolio Summary
            </p>
            <div className="flex items-start gap-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-lg font-semibold text-text-primary line-clamp-1">{product.name}</h4>
                <p className="text-xs text-text-muted mt-1">{product.category}</p>
                <div className="mt-3">
                  <span className="text-xs text-text-muted uppercase tracking-elegant">Asset Valuation</span>
                  <p className="font-display text-xl font-semibold text-forest-green">
                    {currency === 'BDT' ? '৳' : '$'}{product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Enter your name"
                  className="w-full pl-11 pr-4 py-3.5 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green transition-colors bg-natural-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">WhatsApp Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  required
                  placeholder="+880 1XXX XXXXXX"
                  className="w-full pl-11 pr-4 py-3.5 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green transition-colors bg-natural-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green transition-colors bg-natural-white"
                />
              </div>
              <p className="text-xs text-text-muted mt-1.5 pl-4">Access details will be sent here</p>
            </div>

            {/* Payment Section */}
            <div className="pt-4 border-t border-soft-neutral">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-elegant mb-4">Payment Details</p>
              
              {/* Ready to Pay Toggle */}
              {!readyToPay ? (
                <button
                  type="button"
                  onClick={() => setReadyToPay(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-forest-green text-forest-green text-sm font-medium uppercase tracking-elegant hover:bg-forest-green hover:text-natural-white transition-all"
                >
                  <Wallet className="w-4 h-4" />
                  I'm Ready to Pay
                </button>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {/* bKash Number Display */}
                  <div className="bg-soft-neutral rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-text-muted uppercase tracking-elegant">Send Payment To</span>
                      <button
                        type="button"
                        onClick={() => setShowBkashNumber(!showBkashNumber)}
                        className="text-forest-green"
                      >
                        {showBkashNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="font-display text-xl font-semibold text-text-primary">
                      {showBkashNumber ? bkashNumber : '••••••••••••'}
                    </p>
                    <p className="text-xs text-forest-green mt-1">bKash Personal Number</p>
                  </div>

                  {/* Sender bKash Number */}
                  <div>
                    <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">
                      Your Sender bKash Number
                    </label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="tel"
                        value={senderBkash}
                        onChange={e => setSenderBkash(e.target.value)}
                        required
                        placeholder="01XXX XXXXXX"
                        className="w-full pl-11 pr-4 py-3.5 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green transition-colors bg-natural-white"
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1.5 pl-4">The number you're sending payment from</p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !readyToPay || !senderBkash}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-forest-green hover:bg-forest-green-dark disabled:bg-warm-gray disabled:text-text-muted text-natural-white text-sm font-medium uppercase tracking-elegant transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Acquisition
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-center text-text-muted pt-2">
              By completing this purchase, you agree to our Terms of Service.
            </p>
          </form>
        </>
      )}
    </Modal>
  );
}
