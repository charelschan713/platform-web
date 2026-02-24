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
        const isDark = t.theme_mode === 'dark';
        const primary = t.primary_color ?? '#000000';
        const primaryFg = t.primary_foreground ?? '#FFFFFF';
        const sidebarBg = t.sidebar_bg ?? '#FFFFFF';
        const sidebarFg = t.sidebar_fg ?? '#000000';
        const cardBg = t.card_bg ?? '#FFFFFF';
        const accent = t.accent_color ?? primary;

        root.style.setProperty('--primary', primary);
        root.style.setProperty('--primary-foreground', primaryFg);
        root.style.setProperty('--sidebar-bg', sidebarBg);
        root.style.setProperty('--sidebar-fg', sidebarFg);
        root.style.setProperty('--card-bg', cardBg);
        root.style.setProperty('--accent', accent);
        root.style.setProperty('--background', isDark ? '#0B0F1A' : '#FFFFFF');
        root.style.setProperty('--foreground', isDark ? '#E5E7EB' : '#111827');
        root.style.setProperty('--card', cardBg);
        root.style.setProperty('--card-foreground', sidebarFg);
        root.style.setProperty('--muted', isDark ? '#1A1F2E' : '#F3F4F6');
        root.style.setProperty('--muted-foreground', isDark ? '#9CA3AF' : '#6B7280');
        root.style.setProperty('--input', isDark ? '#1A1F2E' : '#FFFFFF');

        if (isDark) root.classList.add('dark');
        else root.classList.remove('dark');
      } catch {
        // noop
      }
    };

    apply();
  }, []);

  return <>{children}</>;
}
