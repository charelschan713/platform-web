'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

const STATUS_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'WAITING', label: 'Waiting for Actions' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'JOB_DONE', label: 'Job Done' },
  { key: 'FULFILLED', label: 'Fulfilled' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const TAG_STYLES: Record<string, string> = {
  'Card Saved': 'bg-green-100 text-green-700',
  Tomorrow: 'bg-blue-100 text-blue-700',
  Today: 'bg-orange-100 text-orange-700',
  Unassigned: 'bg-red-100 text-red-700',
  Overdue: 'bg-red-100 text-red-700',
};

export default function BookingsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');
  const [subFilter, setSubFilter] = useState<'ALL' | 'UNASSIGNED'>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['tenant-bookings', statusTab],
    queryFn: async () => {
      const params: any = { page: 1, limit: 100 };
      if (statusTab !== 'ALL' && statusTab !== 'WAITING') {
        params.booking_status = statusTab;
      }
      if (statusTab === 'WAITING') {
        params.booking_status = 'PENDING';
      }
      const res = await api.get('/bookings', { params });
      return res.data;
    },
  });

  const bookings = data?.data ?? [];

  const list = useMemo(() => {
    let result = [...bookings];

    if (statusTab === 'WAITING') {
      result = result.filter((b: any) => ['PENDING', 'CONFIRMED'].includes(b.booking_status));
    }

    if (subFilter === 'UNASSIGNED') {
      result = result.filter((b: any) => (b.tags ?? []).includes('Unassigned'));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((b: any) =>
        [
          b.booking_number,
          b.passenger_name,
          b.booker_name,
          b.passenger_phone,
          b.pickup_address,
          b.dropoff_address,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      );
    }

    return result;
  }, [bookings, search, statusTab, subFilter]);

  const countForTab = (key: string) => {
    if (key === 'ALL') return bookings.length;
    if (key === 'WAITING') {
      return bookings.filter((b: any) => ['PENDING', 'CONFIRMED'].includes(b.booking_status)).length;
    }
    return bookings.filter((b: any) => b.booking_status === key).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings Management</h1>
          <p className="text-sm text-gray-500 mt-1">{bookings.length} total</p>
        </div>
        <Button onClick={() => router.push('/bookings/new')}>
          <Plus size={16} className="mr-2" />
          New Booking
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              statusTab === tab.key ? 'bg-black text-white' : 'bg-white text-gray-700'
            }`}
            onClick={() => setStatusTab(tab.key)}
          >
            {tab.label} <span className="ml-1 text-xs opacity-80">{countForTab(tab.key)}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2">
          <button
            className={`px-3 py-1.5 rounded-full text-sm border ${subFilter === 'ALL' ? 'bg-black text-white' : ''}`}
            onClick={() => setSubFilter('ALL')}
          >
            All
          </button>
          <button
            className={`px-3 py-1.5 rounded-full text-sm border ${subFilter === 'UNASSIGNED' ? 'bg-black text-white' : ''}`}
            onClick={() => setSubFilter('UNASSIGNED')}
          >
            Unassigned {bookings.filter((b: any) => (b.tags ?? []).includes('Unassigned')).length}
          </button>
        </div>

        <div className="relative w-full sm:w-96">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Booking #, name, phone, location..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">No bookings found</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((booking: any) => (
            <Card
              key={booking.id}
              className="cursor-pointer hover:shadow-md"
              onClick={() => router.push(`/bookings/${booking.id}`)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">
                      {booking.passenger_name ?? booking.booker_name ?? 'Unknown'}
                      <span className="ml-2 text-xs text-gray-500">#{booking.booking_number}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {booking.pickup_datetime_local ?? new Date(booking.pickup_datetime).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.pickup_address}
                      {booking.dropoff_address ? ` → ${booking.dropoff_address}` : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {booking.service_type} · {booking.vehicle_type_name ?? '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${Number(booking.total_price ?? 0).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{booking.booking_status}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(booking.tags ?? []).map((tag: string) => (
                    <span
                      key={`${booking.id}-${tag}`}
                      className={`text-xs px-2 py-0.5 rounded-full ${TAG_STYLES[tag] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
