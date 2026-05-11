import { useState } from 'react';
import {
  Save, Globe, Mail, Phone, DollarSign,
  Link2, Store, Loader2, Check, Type, FileText, Heading
} from 'lucide-react';
import { SiteSettings } from '../../types';

interface SettingsPanelProps {
  settings: SiteSettings;
  onSave: (settings: SiteSettings) => boolean;
}

export default function SettingsPanel({ settings, onSave }: SettingsPanelProps) {
  const [form, setForm] = useState<SiteSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateField = (field: keyof SiteSettings, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const success = onSave(form);
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-semibold text-text-primary">Site Configuration</h2>
        <p className="text-sm text-text-secondary mt-1">Manage your store settings and integrations</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Basic Info */}
        <div className="bg-natural-white rounded-2xl border border-soft-neutral p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-soft-neutral flex items-center justify-center">
              <Store className="w-5 h-5 text-forest-green" />
            </div>
            <h3 className="font-display text-lg font-semibold text-text-primary">Basic Information</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Store Name</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={form.storeName}
                  onChange={e => updateField('storeName', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Tagline</label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={form.tagline}
                  onChange={e => updateField('tagline', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={form.adminEmail}
                  onChange={e => updateField('adminEmail', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Currency</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <select
                  value={form.currency}
                  onChange={e => updateField('currency', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral appearance-none"
                >
                  <option value="BDT">BDT (৳)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-natural-white rounded-2xl border border-soft-neutral p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-soft-neutral flex items-center justify-center">
              <Heading className="w-5 h-5 text-forest-green" />
            </div>
            <h3 className="font-display text-lg font-semibold text-text-primary">Hero Section</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Hero Heading</label>
              <input
                type="text"
                value={form.heroHeading}
                onChange={e => updateField('heroHeading', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Hero Subheading</label>
              <textarea
                value={form.heroSubheading}
                onChange={e => updateField('heroSubheading', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral resize-none"
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-natural-white rounded-2xl border border-soft-neutral p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-soft-neutral flex items-center justify-center">
              <FileText className="w-5 h-5 text-forest-green" />
            </div>
            <h3 className="font-display text-lg font-semibold text-text-primary">About Section</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">About Title</label>
              <input
                type="text"
                value={form.aboutTitle}
                onChange={e => updateField('aboutTitle', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">About Text</label>
              <textarea
                value={form.aboutText}
                onChange={e => updateField('aboutText', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral resize-none"
              />
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-natural-white rounded-2xl border border-soft-neutral p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-soft-neutral flex items-center justify-center">
              <Phone className="w-5 h-5 text-forest-green" />
            </div>
            <h3 className="font-display text-lg font-semibold text-text-primary">Payment Settings</h3>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">bKash Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={form.bkashNumber}
                onChange={e => updateField('bkashNumber', e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full pl-11 pr-4 py-3 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
              />
            </div>
            <p className="text-xs text-text-muted mt-2 pl-4">This number will be shown to customers during checkout</p>
          </div>
        </div>

        {/* Integration */}
        <div className="bg-natural-white rounded-2xl border border-soft-neutral p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-soft-neutral flex items-center justify-center">
              <Globe className="w-5 h-5 text-forest-green" />
            </div>
            <h3 className="font-display text-lg font-semibold text-text-primary">Integration</h3>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">Google Apps Script URL</label>
            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="url"
                value={form.scriptUrl}
                onChange={e => updateField('scriptUrl', e.target.value)}
                placeholder="https://script.google.com/..."
                className="w-full pl-11 pr-4 py-3 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green bg-soft-neutral"
              />
            </div>
            <p className="text-xs text-text-muted mt-2 pl-4">Your deployed Apps Script WebApp URL for Google Sheets sync</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium uppercase tracking-elegant transition-all ${
              saved
                ? 'bg-forest-green text-natural-white'
                : 'bg-forest-green hover:bg-forest-green-dark text-natural-white'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
