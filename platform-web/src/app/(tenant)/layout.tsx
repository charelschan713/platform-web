'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import TenantSidebar from '@/components/layout/TenantSidebar';
import TopBar from '@/components/layout/TopBar';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!['TENANT_ADMIN', 'TENANT_STAFF'].includes(user?.role ?? '')) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <TenantSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
