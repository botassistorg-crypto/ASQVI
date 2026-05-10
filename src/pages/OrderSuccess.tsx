import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { PartyPopper, CheckCircle2, ArrowRight, MessageSquare, ExternalLink } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const { orderId, bKashSender, bKashReceiver } = location.state || {};

  if (!orderId) {
    return <Navigate to="/" />;
  }

  return (
    <div id="order-success-page" className="min-h-screen bg-natural-50 flex flex-col items-center justify-center py-24 px-4">
      <div className="max-w-xl w-full text-center">
        <motion.div
          initial={{ scale: 0.0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white border border-natural-200 text-forest-500 mb-10 shadow-xl shadow-natural-200"
        >
          <CheckCircle2 className="w-14 h-14" />
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#1A1C19] leading-tight mb-8">
          Order Entered.
        </h1>
        
        <p className="text-lg text-[#6B7280] leading-relaxed mb-12 font-medium">
          Registry ID: <span className="font-bold text-forest-500">#{orderId.slice(-6).toUpperCase()}</span>. 
          <br />Verified Sender: <span className="font-bold text-[#1A1C19]">{bKashSender}</span>
        </p>

        <div className="bg-white border border-natural-200 p-10 rounded-[3rem] text-left mb-12 space-y-8 shadow-sm">
          <h3 className="text-[10px] font-bold text-forest-500 uppercase tracking-[0.3em] px-1">Verification Pipeline</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-5">
              <div className="w-8 h-8 rounded-xl bg-natural-100 text-forest-500 flex items-center justify-center text-xs font-bold shrink-0 border border-natural-200">01</div>
              <p className="text-xs text-[#2D3436] leading-relaxed font-bold uppercase tracking-widest">Our network will verify the transfer from <span className="text-forest-500 underline">{bKashSender}</span> to the treasury.</p>
            </div>
            <div className="flex items-start space-x-5">
              <div className="w-8 h-8 rounded-xl bg-natural-100 text-forest-500 flex items-center justify-center text-xs font-bold shrink-0 border border-natural-200">02</div>
              <p className="text-xs text-[#2D3436] leading-relaxed font-bold uppercase tracking-widest">Upon successful sync, your digital assets will be dispatched via WhatsApp/Email.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link
            to="/shop"
            className="w-full sm:w-auto px-10 py-5 bg-forest-500 text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-forest-600 transition-all flex items-center justify-center shadow-xl shadow-natural-200"
          >
            Continue Exploring <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <a
            href="https://wa.me/01628164979"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-10 py-5 bg-white text-forest-500 border border-natural-200 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-natural-50 transition-all flex items-center justify-center"
          >
            Lodge Support <ExternalLink className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
