import { ArrowDown } from 'lucide-react';
import { SiteSettings } from '../../types';

interface HeroProps {
  settings: SiteSettings;
}

export default function Hero({ settings }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-natural-white overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #4A5D4E 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-forest-green/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-soft-neutral rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* Tagline */}
        <p className="text-xs font-medium text-forest-green uppercase tracking-elegant mb-8 animate-fade-in">
          {settings.tagline}
        </p>

        {/* Main Heading */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-text-primary leading-tight mb-8 animate-fade-in stagger-1">
          {settings.heroHeading}
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-in stagger-2">
          {settings.heroSubheading}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in stagger-3">
          <a
            href="#shop"
            className="px-10 py-4 rounded-full bg-forest-green text-natural-white text-sm font-medium uppercase tracking-elegant hover:bg-forest-green-dark transition-all hover:shadow-lg hover:shadow-forest-green/20"
          >
            Explore Collection
          </a>
          <a
            href="#story"
            className="px-10 py-4 rounded-full bg-transparent border border-warm-gray text-text-primary text-sm font-medium uppercase tracking-elegant hover:bg-soft-neutral transition-all"
          >
            Our Story
          </a>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <a href="#story" className="flex flex-col items-center gap-2 text-text-muted hover:text-forest-green transition-colors">
            <span className="text-xs uppercase tracking-elegant">Scroll</span>
            <ArrowDown className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
