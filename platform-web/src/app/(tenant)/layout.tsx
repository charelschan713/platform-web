'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import TenantSidebar from '@/components/layout/TenantSidebar';
import TopBar from '@/components/layout/TopBar';
import ThemeProvider from '@/components/ThemeProvider';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const restoreSession = async () => {
      if (isAuthenticated && ['TENANT_ADMIN', 'TENANT_STAFF'].includes(user?.role ?? '')) {
        setChecking(false);
        return;
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        clearAuth();
        router.push('/login');
        return;
      }

      try {
        const res = await api.get('/auth/me');
        const restoredUser = res.data?.user ?? res.data;

        if (!restoredUser || !['TENANT_ADMIN', 'TENANT_STAFF'].includes(restoredUser.role ?? '')) {
          clearAuth();
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          router.push('/login');
          return;
        }

        setAuth(restoredUser, token, localStorage.getItem('refresh_token') ?? '');
        setChecking(false);
      } catch {
        clearAuth();
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.push('/login');
      }
    };

    restoreSession();
  }, [isAuthenticated, user, setAuth, clearAuth, router]);

  if (checking) {
    return <div className="p-6 text-sm text-gray-500">Loading...</div>;
  }

  return (
    <ThemeProvider>
      <div className="tenant-theme flex h-screen bg-gray-100">
        <TenantSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
