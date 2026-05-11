import { useState } from 'react';
import {
  Plus, Search, Pencil, Trash2, Package, Image as ImageIcon,
  Save, Loader2, AlertTriangle, Star, DollarSign, Tag, X, Link2
} from 'lucide-react';
import Modal from '../ui/Modal';
import { Product, Category } from '../../types';

interface ProductsPanelProps {
  products: Product[];
  categories: Category[];
  currency: string;
  onAddProduct: (product: Omit<Product, 'id'>) => Product | null;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => boolean;
  onDeleteProduct: (productId: string) => boolean;
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
  const [newImageUrl, setNewImageUrl] = useState('');

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
    setFormData(defaultProduct);
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
    await new Promise(r => setTimeout(r, 500));

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, formData);
    } else {
      onAddProduct(formData);
    }

    setSaving(false);
    setIsModalOpen(false);
    setFormData(defaultProduct);
    setEditingProduct(null);
  };

  const handleDelete = (productId: string) => {
    onDeleteProduct(productId);
    setDeleteConfirm(null);
  };

  const updateField = (field: keyof Omit<Product, 'id'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const addImage = () => {
    if (newImageUrl.trim()) {
      updateField('images', [...(formData.images || []), newImageUrl.trim()]);
      setNewImageUrl('');
    }
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-text-primary">Products</h2>
          <p className="text-sm text-text-secondary mt-1">Manage your digital product catalog</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-forest-green hover:bg-forest-green-dark text-natural-white text-sm font-medium uppercase tracking-elegant transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-natural-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-5 py-3 rounded-full border border-warm-gray text-sm font-medium text-text-primary focus:outline-none focus:border-forest-green bg-natural-white"
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
            className="bg-natural-white rounded-2xl border border-soft-neutral overflow-hidden hover:border-forest-green/30 transition-colors"
          >
            <div className="relative aspect-video bg-soft-neutral">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
              {product.badge && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-forest-green text-natural-white text-xs font-medium">
                  {product.badge}
                </span>
              )}
              {product.featured && (
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-warning text-text-primary text-xs font-medium">
                  Featured
                </span>
              )}
            </div>
            <div className="p-5">
              <p className="text-xs font-medium text-forest-green uppercase tracking-elegant mb-2">
                {product.category}
              </p>
              <h3 className="font-display text-lg font-semibold text-text-primary truncate mb-1">{product.name}</h3>
              <p className="text-xs text-text-secondary line-clamp-2 mb-3">{product.description}</p>
              
              {/* Related products count */}
              {product.relatedProducts && product.relatedProducts.length > 0 && (
                <p className="text-xs text-forest-green mb-3">
                  <Link2 className="w-3 h-3 inline mr-1" />
                  {product.relatedProducts.length} related product{product.relatedProducts.length > 1 ? 's' : ''}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="font-display text-xl font-semibold text-text-primary">{currencySymbol}{product.price.toLocaleString()}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 rounded-full hover:bg-soft-neutral text-text-muted hover:text-forest-green transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="p-2 rounded-full hover:bg-soft-neutral text-text-muted hover:text-danger transition-colors"
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
          <Package className="w-12 h-12 text-warm-gray mx-auto mb-3" />
          <p className="text-sm text-text-muted">No products found</p>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-text-primary uppercase tracking-elegant border-b border-soft-neutral pb-2">
              Basic Information
            </h4>
            
            {/* Image Preview */}
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Main Image</label>
              <div className="flex gap-4">
                <div className="w-28 h-20 rounded-2xl bg-soft-neutral border border-warm-gray flex items-center justify-center overflow-hidden">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-text-muted" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={e => updateField('image', e.target.value)}
                    className="w-full px-4 py-3 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
                  />
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Product Name *</label>
              <input
                type="text"
                placeholder="e.g., Complete Python Course"
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Short Description *</label>
              <textarea
                placeholder="Brief description for product cards..."
                value={formData.description}
                onChange={e => updateField('description', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral resize-none"
              />
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Full Description (Product Page)</label>
              <textarea
                placeholder="Detailed description shown on the product page..."
                value={formData.fullDescription}
                onChange={e => updateField('fullDescription', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral resize-none"
              />
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Price ({currency}) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="999"
                    value={formData.price || ''}
                    onChange={e => updateField('price', parseFloat(e.target.value) || 0)}
                    className="w-full pl-11 pr-4 py-3 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={e => updateField('category', e.target.value)}
                  className="w-full px-4 py-3 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
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
                <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Badge</label>
                <select
                  value={formData.badge}
                  onChange={e => updateField('badge', e.target.value)}
                  className="w-full px-4 py-3 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
                >
                  {badgeOptions.map(badge => (
                    <option key={badge} value={badge}>{badge || 'No Badge'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Rating</label>
                <div className="relative">
                  <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={e => updateField('rating', Math.min(5, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-full pl-11 pr-4 py-3 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
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
                  className="w-5 h-5 rounded border-warm-gray text-forest-green focus:ring-forest-green"
                />
                <span className="text-sm text-text-primary">Available</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={e => updateField('featured', e.target.checked)}
                  className="w-5 h-5 rounded border-warm-gray text-forest-green focus:ring-forest-green"
                />
                <span className="text-sm text-text-primary">Featured</span>
              </label>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-text-primary uppercase tracking-elegant border-b border-soft-neutral pb-2">
              Features / What's Included
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a feature..."
                value={newFeature}
                onChange={e => setNewFeature(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 px-4 py-2.5 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
              />
              <button
                onClick={addFeature}
                className="px-4 py-2.5 rounded-full bg-forest-green text-natural-white text-sm font-medium hover:bg-forest-green-dark transition-colors"
              >
                Add
              </button>
            </div>
            {formData.features && formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, idx) => (
                  <span key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-soft-neutral text-sm text-text-primary">
                    {feature}
                    <button onClick={() => removeFeature(idx)} className="text-text-muted hover:text-danger">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Additional Images Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-text-primary uppercase tracking-elegant border-b border-soft-neutral pb-2">
              Additional Images
            </h4>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Add image URL..."
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
                className="flex-1 px-4 py-2.5 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
              />
              <button
                onClick={addImage}
                className="px-4 py-2.5 rounded-full bg-forest-green text-natural-white text-sm font-medium hover:bg-forest-green-dark transition-colors"
              >
                Add
              </button>
            </div>
            {formData.images && formData.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden bg-soft-neutral">
                    <img src={img} alt={`Additional ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-danger text-natural-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Products Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-text-primary uppercase tracking-elegant border-b border-soft-neutral pb-2">
              Related Products (For Upselling)
            </h4>
            <p className="text-xs text-text-muted">Select products to show in the "You May Also Like" section</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
              {products
                .filter(p => p.id !== editingProduct?.id)
                .map(product => {
                  const isSelected = (formData.relatedProducts || []).includes(product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => toggleRelatedProduct(product.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                        isSelected
                          ? 'border-forest-green bg-forest-green/5'
                          : 'border-warm-gray hover:border-forest-green/50'
                      }`}
                    >
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary truncate">{product.name}</p>
                        <p className="text-xs text-text-muted">{currencySymbol}{product.price}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-forest-green flex items-center justify-center">
                          <Tag className="w-3 h-3 text-natural-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-soft-neutral sticky bottom-0 bg-natural-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-full border border-warm-gray text-sm font-medium text-text-primary hover:bg-soft-neutral transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.price || !formData.image}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-forest-green hover:bg-forest-green-dark disabled:bg-warm-gray text-natural-white text-sm font-medium transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingProduct ? 'Update' : 'Add Product'}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="max-w-sm">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-danger" />
          </div>
          <h3 className="font-display text-xl font-semibold text-text-primary mb-2">Delete Product?</h3>
          <p className="text-sm text-text-secondary mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 rounded-full border border-warm-gray text-sm font-medium text-text-primary hover:bg-soft-neutral">Cancel</button>
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 px-4 py-3 rounded-full bg-danger text-natural-white text-sm font-medium">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
