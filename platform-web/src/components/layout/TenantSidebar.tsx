'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Car,
  Users,
  Truck,
  DollarSign,
  Settings2,
  MapPin,
  Sliders,
  FileText,
  Network,
  BarChart2,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/drivers', label: 'Drivers', icon: Car },
  { href: '/crm', label: 'CRM', icon: Users },
  { href: '/vehicles', label: 'Vehicles', icon: Truck },
  { href: '/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/vehicle-types', label: 'Vehicle Types', icon: Settings2 },
  { href: '/service-cities', label: 'Service Cities', icon: MapPin },
  { href: '/constants', label: 'Constants', icon: Sliders },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/connections', label: 'Connections', icon: Network },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function TenantSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth, user } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <h1 className="font-bold text-lg">{process.env.NEXT_PUBLIC_APP_NAME}</h1>
        <p className="text-xs text-gray-500 mt-1 truncate">
          {user?.first_name} {user?.last_name}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 w-full transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
