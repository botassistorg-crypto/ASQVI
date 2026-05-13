import { useState, useRef } from 'react';
import {
  Plus, Search, Pencil, Trash2, Package, Image as ImageIcon,
  Save, Loader2, AlertTriangle, Star, DollarSign, X, Link2, Upload, CheckCircle, Download
} from 'lucide-react';
import Modal from '../ui/Modal';
import { Product, Category } from '../../types';
import { uploadImage, isValidImage } from '../../utils/imageUpload';

interface ProductsPanelProps {
  products: Product[];
  categories: Category[];
  currency: string;
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => Promise<boolean>;
  onDeleteProduct: (productId: string) => Promise<boolean>;
}

const defaultProduct: Omit<Product, 'id'> = {
  name: '',
  description: '',
  fullDescription: '',
  price: 0,
  category: 'Courses',
  image: '',
  images: [],
  badge: '',
  rating: 5.0,
  reviews: 0,
  inStock: true,
  featured: false,
  relatedProducts: [],
  features: [],
};

const badgeOptions = ['', 'Best Seller', 'Featured', 'New', 'Popular', 'Premium'];

export default function ProductsPanel({
  products,
  categories,
  currency,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}: ProductsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(defaultProduct);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryImageRef = useRef<HTMLInputElement>(null);

  const categoryNames = ['All', ...categories.map(c => c.name)];
  const currencySymbol = currency === 'BDT' ? '৳' : '$';

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ ...defaultProduct, category: categories[0]?.name || 'Courses' });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      fullDescription: product.fullDescription || '',
      price: product.price,
      category: product.category,
      image: product.image,
      images: product.images || [],
      badge: product.badge || '',
      rating: product.rating,
      reviews: product.reviews,
      inStock: product.inStock,
      featured: product.featured || false,
      relatedProducts: product.relatedProducts || [],
      features: product.features || [],
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.image) return;
    
    setSaving(true);

    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, formData);
    } else {
      await onAddProduct(formData);
    }

    setSaving(false);
    setIsModalOpen(false);
    setFormData(defaultProduct);
    setEditingProduct(null);
  };

  const handleDelete = async (productId: string) => {
    await onDeleteProduct(productId);
    setDeleteConfirm(null);
  };

  const updateField = (field: keyof Omit<Product, 'id'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Main image upload
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidImage(file)) {
      alert('Please select a valid image file (JPG, PNG, GIF, WebP) under 32MB');
      return;
    }

    setUploading(true);
    const result = await uploadImage(file);
    setUploading(false);

    if (result.success && result.url) {
      updateField('image', result.url);
    } else {
      alert('Upload failed: ' + (result.error || 'Unknown error'));
    }

    // Reset input
    if (mainImageRef.current) mainImageRef.current.value = '';
  };

  // Gallery image upload
  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidImage(file)) {
      alert('Please select a valid image file (JPG, PNG, GIF, WebP) under 32MB');
      return;
    }

    setUploadingGallery(true);
    const result = await uploadImage(file);
    setUploadingGallery(false);

    if (result.success && result.url) {
      updateField('images', [...(formData.images || []), result.url]);
    } else {
      alert('Upload failed: ' + (result.error || 'Unknown error'));
    }

    // Reset input
    if (galleryImageRef.current) galleryImageRef.current.value = '';
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      updateField('features', [...(formData.features || []), newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    updateField('features', (formData.features || []).filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    updateField('images', (formData.images || []).filter((_, i) => i !== index));
  };

  const toggleRelatedProduct = (productId: string) => {
    const current = formData.relatedProducts || [];
    if (current.includes(productId)) {
      updateField('relatedProducts', current.filter(id => id !== productId));
    } else {
      updateField('relatedProducts', [...current, productId]);
    }
  };

  const [showExport, setShowExport] = useState(false);

  const handleExport = () => {
    const code = products.map(p => {
      const obj: any = {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        image: p.image,
        rating: p.rating,
        reviews: p.reviews,
        inStock: p.inStock,
      };
      if (p.fullDescription) obj.fullDescription = p.fullDescription;
      if (p.images && p.images.length > 0) obj.images = p.images;
      if (p.badge) obj.badge = p.badge;
      if (p.featured) obj.featured = true;
      if (p.features && p.features.length > 0) obj.features = p.features;
      if (p.relatedProducts && p.relatedProducts.length > 0) obj.relatedProducts = p.relatedProducts;
      return obj;
    });
    const output = JSON.stringify(code, null, 2);
    navigator.clipboard.writeText(output).then(() => {
      setShowExport(true);
      setTimeout(() => setShowExport(false), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your digital product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            {showExport ? (
              <>
                <CheckCircle className="w-4 h-4 text-[#4A5D4E]" />
                Copied!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#4A5D4E] hover:bg-[#3d4e41] text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E] bg-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-5 py-3 rounded-full border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4A5D4E] bg-white"
        >
          {categoryNames.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(product => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-video bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
              {product.badge && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#4A5D4E] text-white text-xs font-medium">
                  {product.badge}
                </span>
              )}
              {product.featured && (
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-medium">
                  Featured
                </span>
              )}
            </div>
            <div className="p-5">
              <p className="text-xs font-medium text-[#4A5D4E] uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h3 className="font-semibold text-gray-900 truncate mb-1">{product.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
              
              {product.relatedProducts && product.relatedProducts.length > 0 && (
                <p className="text-xs text-[#4A5D4E] mb-3 flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  {product.relatedProducts.length} related
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">{currencySymbol}{product.price.toLocaleString()}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#4A5D4E] transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No products found</p>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">
              Basic Information
            </h4>
            
            {/* Main Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Image *</label>
              <div className="flex gap-4 items-start">
                <div className="w-32 h-24 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={mainImageRef}
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => mainImageRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400">Or paste URL below</p>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={e => updateField('image', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
                  />
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                placeholder="e.g., Complete Python Course"
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
              <textarea
                placeholder="Brief description for product cards..."
                value={formData.description}
                onChange={e => updateField('description', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E] resize-none"
              />
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Description (Product Page)</label>
              <textarea
                placeholder="Detailed description shown on the product page..."
                value={formData.fullDescription}
                onChange={e => updateField('fullDescription', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E] resize-none"
              />
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price ({currency}) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="999"
                    value={formData.price || ''}
                    onChange={e => updateField('price', parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={e => updateField('category', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Badge & Rating */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                <select
                  value={formData.badge}
                  onChange={e => updateField('badge', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
                >
                  {badgeOptions.map(badge => (
                    <option key={badge} value={badge}>{badge || 'No Badge'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={e => updateField('rating', Math.min(5, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
                  />
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={e => updateField('inStock', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#4A5D4E] focus:ring-[#4A5D4E]"
                />
                <span className="text-sm text-gray-700">Available for purchase</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={e => updateField('featured', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#4A5D4E] focus:ring-[#4A5D4E]"
                />
                <span className="text-sm text-gray-700">Featured on homepage</span>
              </label>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">
              Features / What's Included
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a feature (e.g., '60+ hours of video')..."
                value={newFeature}
                onChange={e => setNewFeature(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
              />
              <button
                type="button"
                onClick={addFeature}
                disabled={!newFeature.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#4A5D4E] text-white text-sm font-medium hover:bg-[#3d4e41] disabled:opacity-50 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.features && formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, idx) => (
                  <span key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700">
                    <CheckCircle className="w-3 h-3 text-[#4A5D4E]" />
                    {feature}
                    <button onClick={() => removeFeature(idx)} className="text-gray-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Additional Images Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">
              Additional Images (Gallery)
            </h4>
            <input
              type="file"
              ref={galleryImageRef}
              accept="image/*"
              onChange={handleGalleryImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => galleryImageRef.current?.click()}
              disabled={uploadingGallery}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {uploadingGallery ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Gallery Image
                </>
              )}
            </button>
            {formData.images && formData.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 group">
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Products Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">
              Related Products (For Upselling)
            </h4>
            <p className="text-xs text-gray-500">Select products to show in the "You May Also Like" section</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
              {products
                .filter(p => p.id !== editingProduct?.id)
                .map(product => {
                  const isSelected = (formData.relatedProducts || []).includes(product.id);
                  return (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => toggleRelatedProduct(product.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#4A5D4E] bg-[#4A5D4E]/5 ring-1 ring-[#4A5D4E]'
                          : 'border-gray-200 hover:border-[#4A5D4E]/50'
                      }`}
                    >
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{currencySymbol}{product.price}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-[#4A5D4E] shrink-0" />
                      )}
                    </button>
                  );
                })}
            </div>
            {(formData.relatedProducts || []).length > 0 && (
              <p className="text-xs text-[#4A5D4E] font-medium">
                {(formData.relatedProducts || []).length} product(s) selected
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.price || !formData.image}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#4A5D4E] hover:bg-[#3d4e41] disabled:bg-gray-300 text-white text-sm font-medium transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="max-w-sm">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Product?</h3>
          <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => setDeleteConfirm(null)} 
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)} 
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
