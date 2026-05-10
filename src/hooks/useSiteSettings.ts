import { useState, useEffect } from 'react';
import { getDocument } from '../lib/firestore';
import { SiteSettings } from '../types';

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    bKashNumber: '01628164979',
    siteName: 'ASQVI',
    heroTitle: 'Transform Your Life with ASQVI',
    heroSubtitle: 'Premium digital products, ebooks, and services curated for the modern achiever.',
    checkoutRules: 'Please send the exact amount to our bKash number before filling the form.',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getDocument<SiteSettings>('settings', 'general');
      if (data) {
        setSettings(data);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  return { settings, loading };
};
