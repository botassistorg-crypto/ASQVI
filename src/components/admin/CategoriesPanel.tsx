import { useState } from 'react';
import { Plus, Pencil, Trash2, FolderOpen, Save, Loader2, AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import { Category } from '../../types';

interface CategoriesPanelProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => Category | null;
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => boolean;
  onDeleteCategory: (categoryId: string) => boolean;
}

export default function CategoriesPanel({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoriesPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    
    if (editingCategory) {
      onUpdateCategory(editingCategory.id, { name, description });
    } else {
      onAddCategory({ name, description });
    }
    
    setSaving(false);
    setIsModalOpen(false);
    setName('');
    setDescription('');
    setEditingCategory(null);
  };

  const handleDelete = (categoryId: string) => {
    onDeleteCategory(categoryId);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-text-primary">Categories</h2>
          <p className="text-sm text-text-secondary mt-1">Organize your products into collections</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-forest-green hover:bg-forest-green-dark text-natural-white text-sm font-medium uppercase tracking-elegant transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => (
          <div
            key={category.id}
            className="bg-natural-white rounded-2xl border border-soft-neutral p-5 hover:border-forest-green/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-soft-neutral flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-forest-green" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-text-primary">{category.name}</h3>
                  {category.description && (
                    <p className="text-xs text-text-muted mt-0.5">{category.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(category)}
                  className="p-2 rounded-full hover:bg-soft-neutral text-text-muted hover:text-forest-green transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(category.id)}
                  className="p-2 rounded-full hover:bg-soft-neutral text-text-muted hover:text-danger transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 text-warm-gray mx-auto mb-3" />
          <p className="text-sm text-text-muted">No categories yet</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Category Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Online Courses"
              className="w-full px-4 py-3 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this category..."
              rows={2}
              className="w-full px-4 py-3 rounded-2xl border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral resize-none"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-soft-neutral">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-full border border-warm-gray text-sm font-medium text-text-primary hover:bg-soft-neutral transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
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
                  {editingCategory ? 'Update' : 'Add'}
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
          <h3 className="font-display text-xl font-semibold text-text-primary mb-2">Delete Category?</h3>
          <p className="text-sm text-text-secondary mb-6">Products in this category won't be deleted.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 rounded-full border border-warm-gray text-sm font-medium text-text-primary hover:bg-soft-neutral">Cancel</button>
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 px-4 py-3 rounded-full bg-danger text-natural-white text-sm font-medium">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
