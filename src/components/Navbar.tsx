import { Link, useNavigate } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth, signInWithPasscode } from '../lib/firebase';
import { ADMIN_EMAIL } from '../types';
import { Menu, X, ShoppingBag, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  user: User | null;
  isAdmin: boolean;
}

export default function Navbar({ user, isAdmin }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u && u.email !== ADMIN_EMAIL) {
        await signOut(auth);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      console.log("Login button clicked");
      const passcode = prompt("Enter Admin Passcode:");
      if (!passcode) return;
      
      const user = await signInWithPasscode(passcode);
      if (user && user.email !== ADMIN_EMAIL) {
        await auth.signOut();
        alert('Access Denied: Only the assigned admin can access the backend.');
      }
    } catch (error: any) {
      console.error("Login component error:", error);
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
  ];

  return (
    <nav id="navbar" className="bg-white border-b border-natural-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <div className="w-10 h-10 bg-forest-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">A</div>
              <span className="text-3xl font-serif font-bold tracking-tight text-forest-500">ASQVI</span>
            </Link>
            <div className="hidden sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium uppercase tracking-widest text-[#2D3436] hover:text-forest-500 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-forest-500 hover:text-forest-700 transition-colors uppercase tracking-widest"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center px-4 py-2 bg-natural-100 rounded-full">
                  <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-natural-200" />
                  <span className="ml-3 text-xs font-semibold uppercase tracking-wider text-forest-500 hidden lg:block">{user.displayName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="inline-flex items-center px-6 py-2.5 border border-transparent text-xs font-bold uppercase tracking-widest rounded-full text-white bg-forest-500 hover:bg-forest-600 focus:outline-none transition-all shadow-sm"
              >
                Login
              </button>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden bg-white border-b border-natural-200 overflow-hidden"
          >
            <div className="pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-natural-50 hover:border-forest-500 hover:text-forest-500"
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block pl-3 pr-4 py-2 border-l-4 border-forest-500 text-base font-medium text-forest-500 bg-natural-100"
                >
                  Admin Panel
                </Link>
              )}
            </div>
            <div className="pt-4 pb-3 border-t border-natural-200 px-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-full border border-natural-200" />
                  <div>
                    <div className="text-base font-medium text-gray-800">{user.displayName}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-auto p-2 text-gray-400 hover:text-red-500"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-xs font-bold uppercase tracking-widest text-white bg-forest-500 hover:bg-forest-600"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
