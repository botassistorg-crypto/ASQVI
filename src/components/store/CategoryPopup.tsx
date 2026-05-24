import { X, ArrowRight, FolderOpen } from 'lucide-react';

interface CategoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onSelectCategory: (category: string) => void;
}

export default function CategoryPopup({ isOpen, onClose, categories, onSelectCategory }: CategoryPopupProps) {
  if (!isOpen) return null;

  // Filter out "All"
  const cats = categories.filter(c => c !== 'All');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ animation: 'scaleIn 0.3s ease-out' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#4A5D4E]" />
            <h3 className="font-display text-xl font-semibold text-gray-900">Collections</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {cats.length > 0 ? cats.map(cat => (
            <button key={cat} onClick={() => { onSelectCategory(cat); onClose(); }}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gray-50 hover:bg-[#4A5D4E]/5 border border-transparent hover:border-[#4A5D4E]/20 transition-all text-left group">
              <span className="font-medium text-gray-900 group-hover:text-[#4A5D4E]">{cat}</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#4A5D4E] group-hover:translate-x-1 transition-all" />
            </button>
          )) : (
            <p className="text-center text-gray-400 py-8 text-sm">No categories yet</p>
          )}

          {/* All Products */}
          <button onClick={() => { onSelectCategory('All'); onClose(); }}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-[#4A5D4E]/5 border border-[#4A5D4E]/10 hover:bg-[#4A5D4E]/10 transition-all text-left group mt-2">
            <span className="font-medium text-[#4A5D4E]">View All Products</span>
            <ArrowRight className="w-4 h-4 text-[#4A5D4E] group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        <style>{`@keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
      </div>
    </div>
  );
}
