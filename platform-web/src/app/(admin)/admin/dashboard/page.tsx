'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Calendar, DollarSign } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data;
    },
  });

  const stats = [
    {
      label: 'Total Tenants',
      value: data?.tenants.total ?? 0,
      sub: `${data?.tenants.by_status?.PENDING ?? 0} pending approval`,
      icon: Building2,
    },
    {
      label: 'Total Users',
      value: data?.users.total ?? 0,
      sub: 'Across all tenants',
      icon: Users,
    },
    {
      label: 'Total Bookings',
      value: data?.bookings.total ?? 0,
      sub: `${data?.bookings.by_status?.COMPLETED ?? 0} completed`,
      icon: Calendar,
    },
    {
      label: 'Platform Revenue',
      value: `$${(data?.revenue.total_platform_fee ?? 0).toLocaleString()}`,
      sub: `$${(data?.revenue.total_gmv ?? 0).toLocaleString()} GMV`,
      icon: DollarSign,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{stat.label}</CardTitle>
                <Icon size={18} className="text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tenants by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data?.tenants.by_status ?? {}).map(([status, count]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className="text-gray-500 capitalize">{status.toLowerCase()}</span>
                <span className="font-medium">{count as number}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bookings by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data?.bookings.by_status ?? {}).map(([status, count]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className="text-gray-500 capitalize">
                  {status.replace('_', ' ').toLowerCase()}
                </span>
                <span className="font-medium">{count as number}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
