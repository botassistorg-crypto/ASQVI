import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Book, Zap, Shield, Users, Briefcase, TrendingUp, ChevronRight } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getCollection } from '../lib/firestore';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const { settings } = useSiteSettings();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [productsData, catsData] = await Promise.all([
        getCollection<Product>('products'),
        getCollection<Category>('categories')
      ]);
      setFeaturedProducts(productsData.slice(0, 4));
      setCategories(catsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const featureHighlights = [
    { icon: <Zap className="w-6 h-6" />, title: 'Instant Delivery', description: 'Access your digital downloads immediately after payment verification.' },
    { icon: <Shield className="w-6 h-6" />, title: 'Secure Payment', description: 'Verified bKash transactions ensuring your money is safe.' },
    { icon: <Users className="w-6 h-6" />, title: 'Expert Support', description: 'Quick assistance via WhatsApp for all your purchase queries.' },
  ];

  return (
    <div id="home-page" className="bg-natural-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden bg-white border-b border-natural-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-natural-100 text-forest-500 text-[10px] font-bold uppercase tracking-widest mb-6">
                Curated Digital Intelligence
              </span>
              <h1 className="text-5xl md:text-7xl font-serif text-[#1A1C19] leading-tight mb-8">
                {settings.heroTitle || "Empowering your journey to Greatness."}
              </h1>
              <p className="text-lg text-[#6B7280] leading-relaxed mb-10 font-medium">
                {settings.heroSubtitle || "Curated digital products designed to help you master business, parenting, economics, and the art of living."}
              </p>
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-10 py-5 bg-forest-500 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-forest-600 transition-all shadow-xl shadow-natural-200 flex items-center justify-center"
                >
                  Purchase Now <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <a
                  href="#categories"
                  className="w-full sm:w-auto px-10 py-5 bg-white text-[#2D3436] border border-natural-200 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-natural-50 transition-all"
                >
                  Explore Categories
                </a>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="w-[480px] h-[520px] bg-natural-100 rounded-[4rem] overflow-hidden border border-natural-200 relative">
                <img
                  src={settings.heroImage || "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80&w=1000"}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-forest-500/10" />
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-natural-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-2 h-2 bg-forest-500 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">New Arrival</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#1A1C19]">Mastering Global Economics</h3>
                  <p className="text-xs text-[#6B7280] mt-1">v4.0 Updated Strategy Guide</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-forest-500 mb-2 block">Premium Assets</span>
              <h2 className="text-4xl font-serif font-bold text-[#1A1C19]">Best Sellers</h2>
            </div>
            <Link to="/shop" className="text-forest-500 text-xs font-bold uppercase tracking-widest flex items-center hover:translate-x-1 transition-transform">
              View All Shop <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-80 border border-natural-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Inner Circle Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="p-12 md:p-20 bg-forest-500 rounded-[4rem] text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-serif-italic italic mb-4">Join the Inner Circle</h2>
            <p className="text-lg opacity-80 mb-10 leading-relaxed font-light">
              Receive weekly lessons on business strategy, economic analysis, and refined parenting directly from our curators.
            </p>
            <button className="px-10 py-4 bg-white text-forest-500 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-natural-50 transition-all">
              Learn More
            </button>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white opacity-5 rounded-full" />
          <div className="absolute top-10 right-20 w-40 h-40 border border-white/20 rounded-full" />
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-24 bg-natural-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-forest-500 mb-2 block">Explore Domains</span>
          <h2 className="text-4xl font-serif font-bold text-[#1A1C19]">Curated Focus Areas</h2>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?cat=${cat.slug}`}
                className="group flex flex-col items-center p-8 bg-white rounded-[2rem] border border-natural-200 hover:border-forest-500 transition-all text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-natural-50 text-forest-500 flex items-center justify-center mb-4 group-hover:bg-forest-500 group-hover:text-white transition-all duration-300">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <span className="font-bold text-[#2D3436] group-hover:text-forest-500 transition-colors uppercase text-[10px] tracking-widest">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {featureHighlights.map((feat, i) => (
              <div key={i} className="flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-natural-100 flex items-center justify-center text-forest-500 mb-6 font-serif italic text-2xl">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-[#1A1C19] mb-4 uppercase tracking-wider">{feat.title}</h3>
                <p className="text-[#6B7280] leading-relaxed text-sm font-medium">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Section - Hidden mostly but good for content */}
      <section className="sr-only">
        <h2>Self Improvement Ebooks and Courses</h2>
        <p>Learn business, parenting, world politics, and economics with ASQVI. We provide the best digital products in Bangladesh.</p>
        <ul>
          <li>How to make money online</li>
          <li>Business strategy for beginners</li>
          <li>Parenting tips and guides</li>
          <li>Global economics and politics analysis</li>
        </ul>
      </section>

      {/* About Section */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-forest-500 mb-4 block">Our Philosophy</span>
            <h2 className="text-5xl font-serif text-[#1A1C19] leading-[1.1] mb-8">
              Knowledge is the Only <br/> <span className="font-serif-italic italic">Truly Scarcest</span> Resource.
            </h2>
            <div className="space-y-6 text-[#6B7280] leading-relaxed text-lg font-medium">
              {settings.homeAboutText ? (
                <div className="whitespace-pre-line">{settings.homeAboutText}</div>
              ) : (
                <>
                  <p>
                    ASQVI was born from a simple observation: most "information" today is noise. We cut through the static by curating only high-impact digital assets that move the needle in your life.
                  </p>
                  <p>
                    Whether you're looking to master world politics, understand complex economics, or become a more mindful parent, our resources are designed for the modern intellectual who values time above all else.
                  </p>
                </>
              )}
              <p className="font-bold text-forest-500">
                Start your transformation today.
              </p>
            </div>
            <div className="mt-12 flex space-x-12">
              <div>
                <span className="block text-4xl font-serif font-bold text-[#1A1C19]">10k+</span>
                <span className="text-[10px] text-[#6B7280] uppercase font-bold tracking-widest">Happy Learners</span>
              </div>
              <div>
                <span className="block text-4xl font-serif font-bold text-[#1A1C19]">500+</span>
                <span className="text-[10px] text-[#6B7280] uppercase font-bold tracking-widest">Digital Assets</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl border-8 border-natural-100">
              <img
                src={settings.homeAboutImage || "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1000"}
                alt="Books and growth"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-forest-500 p-10 rounded-[3rem] shadow-2xl text-white max-w-xs">
              <p className="text-lg font-serif-italic italic leading-tight">
                "ASQVI helped me scale my business knowledge in weeks, not years."
              </p>
              <span className="block mt-6 text-[10px] font-bold tracking-[0.2em] uppercase opacity-60">Admin @ ASQVI Store</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
