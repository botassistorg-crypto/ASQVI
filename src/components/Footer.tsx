import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="footer" className="bg-white border-t border-natural-200 text-[#6B7280]">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-forest-500 rounded flex items-center justify-center text-white font-bold text-sm">A</div>
              <span className="text-2xl font-serif font-bold tracking-tight text-forest-500">ASQVI</span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed font-medium">
              Curated digital products designed to help you master business, parenting, economics, and the art of living. Our library is carefully indexed across critical domains of human intelligence.
            </p>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-forest-500 tracking-[0.2em] uppercase">Quick Links</h3>
            <ul className="mt-6 space-y-4 font-medium text-xs uppercase tracking-widest">
              <li><Link to="/shop" className="hover:text-forest-500 transition-colors">All Products</Link></li>
              <li><Link to="/shop?cat=books" className="hover:text-forest-500 transition-colors">E-Books</Link></li>
              <li><Link to="/shop?cat=courses" className="hover:text-forest-500 transition-colors">Courses</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-forest-500 tracking-[0.2em] uppercase">Legal</h3>
            <ul className="mt-6 space-y-4 font-medium text-xs uppercase tracking-widest">
              <li><Link to="/" className="hover:text-forest-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-forest-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-forest-500 transition-colors text-forest-500 font-bold">SEO Optimized</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 border-t border-natural-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] uppercase font-bold tracking-widest">&copy; {new Date().getFullYear()} ASQVI Digital Store. All rights reserved.</p>
          <div className="flex space-x-8">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#2D3436]">Safe bKash Payments</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#2D3436]">Instant Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
