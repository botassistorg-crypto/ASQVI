import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { getDocument, createDocument } from '../lib/firestore';
import { Product, Order } from '../types';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { ChevronLeft, ShieldCheck, Wallet, MessageCircle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReadyForPayment, setIsReadyForPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerWhatsapp: '',
    senderNumber: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsSubmitting(true);
    try {
      const orderData: Omit<Order, 'id'> = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerWhatsapp: formData.customerWhatsapp,
        senderNumber: formData.senderNumber,
        productId: product.id,
        productTitle: product.title,
        amount: product.price,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const orderId = await createDocument('orders', orderData);
      if (orderId) {
        // Trigger backend email notification
        try {
          fetch('/api/notify-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              orderDetails: { ...orderData, id: orderId } 
            }),
          }).catch(err => console.warn('Notification error:', err));
        } catch (err) {
          console.warn('Failed to trigger email notification:', err);
        }

        navigate('/order-success', { state: { orderId, bKashSender: formData.senderNumber, bKashReceiver: settings.bKashNumber } });
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) return <Navigate to="/shop" />;

  return (
    <div id="checkout-page" className="min-h-screen bg-natural-50 py-12 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/product/${product.id}`} className="inline-flex items-center text-[10px] uppercase tracking-[0.2em] font-bold text-forest-500 hover:text-forest-700 mb-10 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-2" /> Return to product details
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Order Summary */}
          <div className="space-y-10">
            <div className="bg-white p-10 rounded-[3rem] border border-natural-200 shadow-sm">
              <h2 className="text-[10px] font-bold text-forest-500 uppercase tracking-[0.3em] mb-10">Order Portfolio</h2>
              <div className="flex items-center space-x-6 mb-10">
                <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-natural-100 bg-natural-50 shrink-0">
                  <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-serif font-bold text-2xl text-[#1A1C19] mb-1 leading-tight">{product.title}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-[#6B7280] font-bold italic">{product.category}</span>
                </div>
              </div>
              <div className="border-t border-natural-100 pt-8 space-y-5">
                <div className="flex justify-between text-xs font-medium text-[#6B7280] uppercase tracking-widest">
                  <span>Asset Valuation</span>
                  <span>৳{product.price}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-[#6B7280] uppercase tracking-widest">
                  <span>Acquisition Path</span>
                  <span className="text-forest-500 italic">Instant Digital</span>
                </div>
                <div className="flex justify-between pt-8 border-t border-natural-100 items-baseline">
                  <span className="text-[10px] font-bold text-forest-500 uppercase tracking-[0.3em]">Total Value</span>
                  <span className="text-4xl font-bold text-[#1A1C19]">৳{product.price}</span>
                </div>
              </div>
            </div>

            <div className="bg-natural-100 p-10 rounded-[3rem] border border-natural-200">
              <div className="flex items-center space-x-3 text-forest-500 font-bold mb-6">
                <Info className="w-5 h-5" />
                <h3 className="uppercase tracking-[0.2em] text-[10px]">Registry Instructions</h3>
              </div>
              <p className="text-xs text-forest-700/70 leading-relaxed font-medium uppercase tracking-tight italic">
                {settings.checkoutRules}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-natural-200 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-natural-100 rounded-bl-[6rem] -mr-12 -mt-12 pointer-events-none" />
            
            <h2 className="text-3xl font-serif font-bold text-[#1A1C19] mb-10">Checkout Preview</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-forest-500 uppercase tracking-[0.2em] px-1">Full Identity</label>
                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-6 py-4 bg-natural-50 border border-natural-200 rounded-2xl focus:ring-1 focus:ring-forest-500 focus:outline-none transition-all text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-forest-500 uppercase tracking-[0.2em] px-1">WhatsApp Path</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-500/50" />
                    <input
                      required
                      type="tel"
                      placeholder="01..."
                      value={formData.customerWhatsapp}
                      onChange={(e) => setFormData({ ...formData, customerWhatsapp: e.target.value })}
                      className="w-full pl-14 pr-6 py-4 bg-natural-50 border border-natural-200 rounded-2xl focus:ring-1 focus:ring-forest-500 focus:outline-none transition-all text-xs font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-forest-500 uppercase tracking-[0.2em] px-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="mail@..."
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-6 py-4 bg-natural-50 border border-natural-200 rounded-2xl focus:ring-1 focus:ring-forest-500 focus:outline-none transition-all text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-forest-500 uppercase tracking-[0.2em] px-1">Sender bKash Wallet</label>
                <div className="relative">
                  <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-500/50" />
                  <input
                    required
                    type="tel"
                    placeholder="01..."
                    value={formData.senderNumber}
                    onChange={(e) => setFormData({ ...formData, senderNumber: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 bg-natural-50 border border-natural-200 rounded-2xl focus:ring-1 focus:ring-forest-500 focus:outline-none transition-all text-xs font-medium"
                  />
                </div>
              </div>

              <AnimatePresence>
                {!isReadyForPayment ? (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    type="button"
                    onClick={() => setIsReadyForPayment(true)}
                    disabled={!formData.customerName || !formData.customerWhatsapp || !formData.senderNumber}
                    className="w-full py-6 bg-forest-500 text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-forest-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed group shadow-xl shadow-natural-200"
                  >
                    I am ready for payment <ArrowRight className="inline ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-8 pt-8 border-t border-dashed border-natural-200"
                  >
                    <div className="p-8 rounded-[2.5rem] bg-forest-500 text-white text-center shadow-2xl shadow-natural-200 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-br-full" />
                      <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-70 mb-4 relative z-10">Send money to this wallet</p>
                      <p className="text-4xl font-bold tracking-tight font-sans relative z-10">{settings.bKashNumber}</p>
                    </div>
                    
                    <div className="flex items-start space-x-3 text-[10px] font-bold text-forest-500 uppercase tracking-widest italic px-2 leading-relaxed">
                      <CheckCircle2 className="w-5 h-5 text-forest-500 flex-shrink-0" />
                      <p>Verified: Sending ৳{product.price} from wallet {formData.senderNumber}</p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-6 bg-[#1A1C19] text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <>Complete Order Entry <ShieldCheck className="ml-2 w-4 h-4" /></>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
