'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
  NO_SHOW: 'bg-orange-100 text-orange-700',
};

const DRIVER_STATUS_LABELS: Record<string, string> = {
  UNASSIGNED: '⏳ Awaiting driver',
  ASSIGNED: '✅ Driver assigned',
  ACCEPTED: '✅ Driver accepted',
  ON_THE_WAY: '🚗 Driver on the way',
  ARRIVED: '📍 Driver arrived',
  PASSENGER_ON_BOARD: '🚗 On the way',
  JOB_DONE: '✅ Trip completed',
};

export default function PassengerBookingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const { data, isLoading } = useQuery({
    queryKey: ['passenger-bookings', tab],
    queryFn: async () => {
      const params: any = { limit: 20 };
      if (tab === 'upcoming') {
        params.booking_status = 'PENDING,CONFIRMED,IN_PROGRESS';
      } else {
        params.booking_status = 'COMPLETED,CANCELLED,NO_SHOW';
      }
      const res = await api.get('/bookings/my', { params });
      return res.data;
    },
    refetchInterval: tab === 'upcoming' ? 15000 : false,
  });

  const bookings = data?.data ?? [];

  const formatDateTime = (dt: string) =>
    new Date(dt).toLocaleString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto py-6 px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <Button size="sm" onClick={() => router.push('/book')}>
            + New Booking
          </Button>
        </div>

        <div className="flex gap-2">
          {(['upcoming', 'past'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border'
              }`}
            >
              {t === 'upcoming' ? 'Upcoming' : 'Past'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 space-y-3">
              <p className="text-3xl">{tab === 'upcoming' ? '🗓️' : '📋'}</p>
              <p className="text-gray-500 font-medium">
                {tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
              </p>
              {tab === 'upcoming' && (
                <Button size="sm" onClick={() => router.push('/book')}>
                  Book a Ride
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b: any) => {
              const status = b.booking_status ?? b.status;
              return (
                <Card
                  key={b.id}
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => router.push(`/my-bookings/${b.id}`)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm">#{b.booking_number}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    {b.driver_status && b.driver_status !== 'UNASSIGNED' && (
                      <div className="bg-blue-50 rounded-lg px-3 py-2">
                        <p className="text-sm text-blue-700 font-medium">
                          {DRIVER_STATUS_LABELS[b.driver_status] ?? b.driver_status}
                        </p>
                        {b.driver_first_name && (
                          <p className="text-xs text-blue-500 mt-0.5">
                            {b.driver_first_name} {b.driver_last_name}
                            {b.plate_number && ` · ${b.plate_number}`}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-1.5 text-sm">
                      <p className="text-gray-600">📅 {formatDateTime(b.pickup_datetime)}</p>
                      <p className="text-gray-600">
                        📍 {b.pickup_address}
                        {b.dropoff_address && (
                          <span className="text-gray-400"> → {b.dropoff_address}</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t">
                      <span className="text-xs text-gray-400">
                        🚗 {b.vehicle_class}
                        {b.flight_number && ` · ✈️ ${b.flight_number}`}
                      </span>
                      <span className="font-bold text-sm">
                        {b.currency} ${b.total_price?.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
