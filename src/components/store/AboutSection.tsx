import { Sparkles } from 'lucide-react';
import { SiteSettings } from '../../types';

interface AboutSectionProps {
  settings: SiteSettings;
}

export default function AboutSection({ settings }: AboutSectionProps) {
  return (
    <section id="story" className="py-24 sm:py-32 bg-soft-neutral">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-natural-white flex items-center justify-center mx-auto mb-8 animate-fade-in">
          <Sparkles className="w-7 h-7 text-forest-green" />
        </div>

        {/* Title */}
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-text-primary mb-8 animate-fade-in stagger-1">
          {settings.aboutTitle}
        </h2>

        {/* Decorative Line */}
        <div className="w-16 h-0.5 bg-forest-green mx-auto mb-8 animate-fade-in stagger-2" />

        {/* Text */}
        <p className="text-lg sm:text-xl text-text-secondary leading-relaxed max-w-3xl mx-auto animate-fade-in stagger-3">
          {settings.aboutText}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 animate-fade-in stagger-4">
          <div>
            <p className="font-display text-3xl sm:text-4xl font-semibold text-forest-green">50+</p>
            <p className="text-xs text-text-muted uppercase tracking-elegant mt-2">Products</p>
          </div>
          <div>
            <p className="font-display text-3xl sm:text-4xl font-semibold text-forest-green">10k+</p>
            <p className="text-xs text-text-muted uppercase tracking-elegant mt-2">Customers</p>
          </div>
          <div>
            <p className="font-display text-3xl sm:text-4xl font-semibold text-forest-green">4.9</p>
            <p className="text-xs text-text-muted uppercase tracking-elegant mt-2">Rating</p>
          </div>
        </div>
      </div>
    </section>
  );
}
