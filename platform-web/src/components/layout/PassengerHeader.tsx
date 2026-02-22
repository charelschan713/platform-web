'use client';

import { useTenantStore } from '@/store/tenant.store';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function PassengerHeader() {
  const { tenant } = useTenantStore();
  const pathname = usePathname();
  const { clearAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  const navItems = [
    { href: '/book', label: 'Book a Ride' },
    { href: '/my-bookings', label: 'My Bookings' },
  ];

  return (
    <header className="bg-white border-b">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {tenant?.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={tenant.name}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span className="font-bold text-lg">
              {tenant?.name ?? process.env.NEXT_PUBLIC_APP_NAME}
            </span>
          )}
        </div>

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
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Sign Out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
