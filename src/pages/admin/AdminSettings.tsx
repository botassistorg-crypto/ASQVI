import { useState, useEffect } from 'react';
import { getDocument } from '../../lib/firestore';
import { proxyWrite } from '../../lib/adminProxy';
import { SiteSettings } from '../../types';
import { uploadImage } from '../../services/imageService';
import { 
  Save, 
  Globe, 
  Smartphone, 
  Layout, 
  Image as ImageIcon,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    bKashNumber: '',
    siteName: '',
    heroTitle: '',
    heroSubtitle: '',
    checkoutRules: '',
    appsScriptUrl: '',
    announcement: '',
    homeAboutText: '',
    homeAboutImage: '',
    heroImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const data = await getDocument<SiteSettings>('settings', 'general');
    if (data) setSettings(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await proxyWrite('settings', 'general', settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Failed to save settings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (e.target.name === 'heroImage') {
        setSettings({ ...settings, heroImage: url });
      } else {
        setSettings({ ...settings, homeAboutImage: url });
      }
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div id="admin-settings" className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Site Engine</h1>
          <p className="text-xs text-gray-400 font-bold tracking-widest mt-1">Configure your store settings and identity</p>
        </div>
        {showSuccess && (
          <div className="flex items-center text-green-600 font-bold text-sm animate-pulse">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Settings Saved
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Core Settings */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-50">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Payments & Identity</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">bKash Active Number</label>
              <input
                required
                type="text"
                value={settings.bKashNumber}
                onChange={(e) => setSettings({ ...settings, bKashNumber: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-2 italic">* Use this if your limit is crossed on the primary number.</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Site Brand Name</label>
              <input
                required
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-50">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">G-Apps Script WebApp URL</label>
            <input
              type="text"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={settings.appsScriptUrl || ''}
              onChange={(e) => setSettings({ ...settings, appsScriptUrl: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="text-[10px] text-gray-400 mt-2 italic">* Optional: Connect to Google Sheets for automated order tracking.</p>
          </div>
        </div>

        {/* Home Design Settings */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-50">
            <Layout className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Homepage & Content</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Hero Heading</label>
              <input
                required
                type="text"
                value={settings.heroTitle}
                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-2xl tracking-tighter focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Hero Sub-text</label>
              <textarea
                required
                rows={3}
                value={settings.heroSubtitle}
                onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Checkout Policy / Rules</label>
              <textarea
                required
                rows={4}
                value={settings.checkoutRules}
                onChange={(e) => setSettings({ ...settings, checkoutRules: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm italic focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">About Us Section Text</label>
              <textarea
                rows={5}
                value={settings.homeAboutText || ''}
                onChange={(e) => setSettings({ ...settings, homeAboutText: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                placeholder="Describe your site mission..."
              />
            </div>
          </div>
        </div>

          {/* Images CMS */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-50">
              <Globe className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Site Imagery</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Hero Background Image</label>
                <div className="aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group hover:border-indigo-300">
                  {settings.heroImage ? (
                    <>
                      <img src={settings.heroImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <label className="cursor-pointer bg-white px-4 py-2 rounded-xl font-bold text-xs">Update Image</label>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      {uploading ? <Loader2 className="animate-spin w-8 h-8 text-indigo-600 mx-auto" /> : (
                        <>
                          <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <label className="cursor-pointer text-indigo-600 font-bold text-xs uppercase tracking-widest">Upload Hero Image</label>
                        </>
                      )}
                    </div>
                  )}
                  <input type="file" name="heroImage" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">About Us Image</label>
                <div className="aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group hover:border-indigo-300">
                  {settings.homeAboutImage ? (
                    <>
                      <img src={settings.homeAboutImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <label className="cursor-pointer bg-white px-4 py-2 rounded-xl font-bold text-xs">Update Image</label>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      {uploading ? <Loader2 className="animate-spin w-8 h-8 text-indigo-600 mx-auto" /> : (
                        <>
                          <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <label className="cursor-pointer text-indigo-600 font-bold text-xs uppercase tracking-widest">Upload Header Image</label>
                        </>
                      )}
                    </div>
                  )}
                  <input type="file" name="homeAboutImage" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>
            </div>
          </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center"
        >
          {saving ? <Loader2 className="animate-spin w-8 h-8" /> : (
            <>Save Site Configuration <Save className="ml-3 w-6 h-6" /></>
          )}
        </button>
      </form>
    </div>
  );
}
