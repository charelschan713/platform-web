'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role === 'SUPER_ADMIN') router.push('/admin/dashboard');
    else if (['TENANT_ADMIN', 'TENANT_STAFF'].includes(user?.role ?? ''))
      router.push('/dashboard');
    else if (user?.role === 'PASSENGER') router.push('/book');
    else router.push('/login');
  }, [isAuthenticated, user, router]);

  return null;
}
