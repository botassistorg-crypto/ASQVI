import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCollection } from '../lib/firestore';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { Filter, Search, LayoutGrid, List as ListIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const catSlug = searchParams.get('cat');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(catSlug || 'all');

  useEffect(() => {
    const fetchData = async () => {
      const [productsData, catsData] = await Promise.all([
        getCollection<Product>('products'),
        getCollection<Category>('categories')
      ]);
      setProducts(productsData);
      setCategories(catsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (catSlug) setActiveCategory(catSlug);
  }, [catSlug]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="shop-page" className="min-h-screen bg-natural-50 pt-20 pb-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-20 text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-forest-500 mb-2 block">Curated Library</span>
          <h1 className="text-5xl font-serif font-bold text-[#1A1C19] mb-4">Digital Assets</h1>
          <p className="text-[#6B7280] font-medium">Refined resources to fuel your intellectual and professional progress.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 space-y-10 shrink-0">
            <div className="bg-natural-100 p-8 rounded-[2.5rem] border border-natural-200">
              <h3 className="text-[10px] font-bold text-forest-500 uppercase tracking-widest mb-6">Search Archive</h3>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500/50 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-natural-200 rounded-2xl focus:ring-1 focus:ring-forest-500 focus:outline-none text-xs font-medium transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="bg-natural-100 p-8 rounded-[2.5rem] border border-natural-200">
              <h3 className="text-[10px] font-bold text-forest-500 uppercase tracking-widest mb-6">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeCategory === 'all' ? 'bg-forest-500 text-white shadow-xl shadow-natural-200' : 'text-[#6B7280] hover:bg-white hover:text-forest-500'
                  }`}
                >
                  All Assets
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeCategory === cat.slug ? 'bg-forest-500 text-white shadow-xl shadow-natural-200' : 'text-[#6B7280] hover:bg-white hover:text-forest-500'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-3xl h-[420px] border border-natural-200" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-[4rem] border border-natural-200 shadow-sm px-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-natural-50 text-natural-200 mb-6 border border-natural-200">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#1A1C19] mb-4">No results found</h3>
                <p className="text-[#6B7280] font-medium max-w-sm mx-auto">We couldn't find any digital assets matching your criteria.</p>
                <button
                  onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                  className="mt-8 px-8 py-3 bg-forest-500 text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-forest-600"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
