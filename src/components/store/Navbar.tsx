import { useState } from 'react';
import { Menu, X, Leaf } from 'lucide-react';

interface NavbarProps {
  onAdminClick: () => void;
  storeName: string;
}

export default function Navbar({ onAdminClick, storeName }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-natural-white/90 backdrop-blur-lg border-b border-soft-neutral">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-forest-green flex items-center justify-center transition-transform group-hover:scale-105">
              <Leaf className="w-5 h-5 text-natural-white" />
            </div>
            <span className="text-xl font-display font-semibold text-text-primary tracking-wide">
              {storeName}
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <a href="#story" className="text-sm font-medium text-text-secondary hover:text-forest-green transition-colors uppercase tracking-elegant">
              Story
            </a>
            <a href="#collection" className="text-sm font-medium text-text-secondary hover:text-forest-green transition-colors uppercase tracking-elegant">
              Collection
            </a>
            <a href="#shop" className="text-sm font-medium text-text-secondary hover:text-forest-green transition-colors uppercase tracking-elegant">
              Shop
            </a>
            <button
              onClick={onAdminClick}
              className="text-sm font-medium text-text-muted hover:text-forest-green transition-colors uppercase tracking-elegant"
            >
              Engine
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full hover:bg-soft-neutral transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6 text-text-primary" /> : <Menu className="w-6 h-6 text-text-primary" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-soft-neutral bg-natural-white animate-slide-down">
          <div className="px-6 py-6 space-y-1">
            <a 
              href="#story" 
              className="block px-4 py-3 rounded-full text-sm font-medium text-text-secondary hover:bg-soft-neutral uppercase tracking-elegant transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Story
            </a>
            <a 
              href="#collection" 
              className="block px-4 py-3 rounded-full text-sm font-medium text-text-secondary hover:bg-soft-neutral uppercase tracking-elegant transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Collection
            </a>
            <a 
              href="#shop" 
              className="block px-4 py-3 rounded-full text-sm font-medium text-text-secondary hover:bg-soft-neutral uppercase tracking-elegant transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Shop
            </a>
            <button
              onClick={() => { onAdminClick(); setMobileOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-full text-sm font-medium text-text-muted hover:bg-soft-neutral uppercase tracking-elegant transition-colors"
            >
              Site Engine
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
