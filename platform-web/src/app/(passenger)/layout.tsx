'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function PassengerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const navItems = [
    { href: '/book', label: 'Book a Ride' },
    { href: '/my-bookings', label: 'My Bookings' },
  ];

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold">{process.env.NEXT_PUBLIC_APP_NAME}</span>
          <nav className="flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm transition-colors',
                  pathname === item.href
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-900',
                )}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
