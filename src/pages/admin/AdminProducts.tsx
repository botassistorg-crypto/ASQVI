import { useState, useEffect } from 'react';
import { getCollection, createDocument, updateDocument, upsertDocument } from '../../lib/firestore';
import { Product, Category } from '../../types';
import { uploadImage } from '../../services/imageService';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: '',
    perks: [] as string[],
    contentLink: ''
  });
  const [perkInput, setPerkInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [pData, cData] = await Promise.all([
      getCollection<Product>('products'),
      getCollection<Category>('categories')
    ]);
    setProducts(pData);
    setCategories(cData);
    setLoading(false);
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        perks: product.perks || [],
        contentLink: product.contentLink || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        imageUrl: '',
        category: categories[0]?.slug || '',
        perks: [],
        contentLink: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData({ ...formData, imageUrl: url });
    } catch (error) {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...formData,
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
      };

      if (editingProduct) {
        await updateDocument('products', editingProduct.id, data);
      } else {
        await createDocument('products', data);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
      fetchData();
    }
  };

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div id="admin-products">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Products Catalog</h1>
          <p className="text-xs text-gray-400 font-bold tracking-widest mt-1">Manage your digital assets and pricing</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                <th className="px-8 py-4">Product</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Price</th>
                <th className="px-8 py-4">Featured</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border shrink-0">
                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 line-clamp-1">{product.title}</div>
                        <div className="text-[10px] uppercase font-black text-gray-400 tracking-widest">ID: {product.id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-8 py-4 font-black text-gray-900 italic">৳{product.price}</td>
                  <td className="px-8 py-4">
                    <div className="w-8 h-4 rounded-full bg-indigo-100 relative cursor-pointer">
                      <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-indigo-600" />
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-grow overflow-y-auto p-8 pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
                  {/* Left Column: Media & Meta */}
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Product Image</label>
                      <div className="aspect-[4/3] rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50 group hover:border-indigo-300 transition-all">
                        {formData.imageUrl ? (
                          <>
                            <img src={formData.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <label className="cursor-pointer bg-white px-4 py-2 rounded-xl font-bold text-xs">Change Image</label>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            {uploading ? (
                              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-2" />
                            ) : (
                              <>
                                <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-400 font-bold mb-4">PNG, JPG up to 10MB</p>
                                <label className="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-xs hover:bg-indigo-700">Upload</label>
                              </>
                            )}
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Inside the Bundle <span className="italic">(Perks)</span></label>
                      <div className="space-y-4">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={perkInput}
                            onChange={(e) => setPerkInput(e.target.value)}
                            placeholder="Add a benefit (e.g. 50+ Ebooks)"
                            className="flex-grow px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), setFormData({ ...formData, perks: [...formData.perks, perkInput] }), setPerkInput(''))}
                          />
                          <button
                            type="button"
                            onClick={() => { if (perkInput) { setFormData({ ...formData, perks: [...formData.perks, perkInput] }); setPerkInput(''); } }}
                            className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.perks.map((perk, i) => (
                            <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black flex items-center">
                              {perk}
                              <button onClick={() => setFormData({ ...formData, perks: formData.perks.filter((_, idx) => idx !== i) })} className="ml-2 hover:text-red-500">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Digital Content Link</label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={formData.contentLink}
                        onChange={(e) => setFormData({ ...formData, contentLink: e.target.value })}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Info */}
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Product Identity</label>
                      <div className="space-y-4">
                        <input
                          required
                          type="text"
                          placeholder="Product Title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                        />
                        <textarea
                          required
                          rows={6}
                          placeholder="Describe the value of this product..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Price (BDT)</label>
                        <input
                          required
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Category</label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
                        >
                          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-8">
                      <button
                        type="submit"
                        disabled={saving || uploading}
                        className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : (editingProduct ? 'Update Product' : 'Launch Product')}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
