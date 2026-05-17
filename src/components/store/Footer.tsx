import { Mail, Phone } from 'lucide-react';

interface FooterProps {
  storeName: string;
  bkashNumber: string;
}

export default function Footer({ storeName, bkashNumber }: FooterProps) {
  return (
    <footer className="bg-text-primary text-natural-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <img
                src="https://i.ibb.co.com/h1K82LNT/file-00000000050471faaf07c29464158bf6.png"
                alt="ASQVI"
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm mb-6">
              Curating premium digital products designed to elevate your creative journey. Quality over quantity, always.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Phone className="w-4 h-4" />
                <span>{bkashNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Mail className="w-4 h-4" />
                <span>support@asqvi.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-elegant text-white/40 mb-6">Navigation</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Home</a></li>
              <li><a href="#story" className="text-sm text-white/60 hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#collection" className="text-sm text-white/60 hover:text-white transition-colors">Collection</a></li>
              <li><a href="#shop" className="text-sm text-white/60 hover:text-white transition-colors">Shop</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-elegant text-white/40 mb-6">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Refund Policy</a></li>
              <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 uppercase tracking-elegant">
            © 2026 {storeName}. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Instant digital delivery worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
