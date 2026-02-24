'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Car,
  Users,
  DollarSign,
  Settings2,
  MapPin,
  Tag,
  Sliders,
  FileText,
  Network,
  BarChart2,
  Percent,
  Settings,
  LogOut,
  ArrowRightLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/drivers', label: 'Drivers', icon: Car },
  { href: '/crm', label: 'CRM', icon: Users },
  { href: '/vehicles', label: 'My Vehicles', icon: Car },
  { href: '/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/vehicle-types', label: 'Vehicle Types', icon: Settings2 },
  { href: '/service-cities', label: 'Service Cities', icon: MapPin },
  { href: '/service-types', label: 'Service Types', icon: Tag },
  { href: '/constants', label: 'Constants', icon: Sliders },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/transfers', label: 'Transfers', icon: ArrowRightLeft },
  { href: '/connections', label: 'Connections', icon: Network },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/surcharges', label: 'Surcharges', icon: Percent },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/settings/airport-fees', label: 'Airport Fees', icon: Settings2 },
  { href: '/settings/compliance', label: 'Compliance', icon: FileText },
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
    <aside
      className="w-64 border-r flex flex-col"
      style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-fg)' }}
    >
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
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white',
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
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white w-full transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
