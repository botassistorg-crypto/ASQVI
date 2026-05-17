import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onAdminClick: () => void;
  storeName: string;
}

export default function Navbar({ onAdminClick }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-natural-white/90 backdrop-blur-lg border-b border-soft-neutral">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="block">
            <img
              src="https://i.ibb.co.com/h1K82LNT/file-00000000050471faaf07c29464158bf6.png"
              alt="ASQVI"
              className="h-14 sm:h-16 w-auto"
            />
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
            <a href="#story" className="block px-4 py-3 rounded-full text-sm font-medium text-text-secondary hover:bg-soft-neutral uppercase tracking-elegant transition-colors" onClick={() => setMobileOpen(false)}>Story</a>
            <a href="#collection" className="block px-4 py-3 rounded-full text-sm font-medium text-text-secondary hover:bg-soft-neutral uppercase tracking-elegant transition-colors" onClick={() => setMobileOpen(false)}>Collection</a>
            <a href="#shop" className="block px-4 py-3 rounded-full text-sm font-medium text-text-secondary hover:bg-soft-neutral uppercase tracking-elegant transition-colors" onClick={() => setMobileOpen(false)}>Shop</a>
            <button onClick={() => { onAdminClick(); setMobileOpen(false); }} className="w-full text-left px-4 py-3 rounded-full text-sm font-medium text-text-muted hover:bg-soft-neutral uppercase tracking-elegant transition-colors">Site Engine</button>
          </div>
        </div>
      )}
    </nav>
  );
}
