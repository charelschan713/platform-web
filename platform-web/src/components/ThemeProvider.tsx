'use client';

import { useEffect } from 'react';
import api from '@/lib/api';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apply = async () => {
      try {
        const res = await api.get('/tenant-settings/theme');
        const t = res.data ?? {};
        const root = document.documentElement;
        root.style.setProperty('--primary', t.primary_color ?? '#000000');
        root.style.setProperty('--primary-foreground', t.primary_foreground ?? '#FFFFFF');
        root.style.setProperty('--sidebar-bg', t.sidebar_bg ?? '#FFFFFF');
        root.style.setProperty('--sidebar-fg', t.sidebar_fg ?? '#000000');
        root.style.setProperty('--card-bg', t.card_bg ?? '#FFFFFF');
        root.style.setProperty('--accent', t.accent_color ?? '#000000');

        if (t.theme_mode === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
      } catch {
        // noop
      }
    };

    apply();
  }, []);

  return <>{children}</>;
}
