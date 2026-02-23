'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
  NO_SHOW: 'bg-orange-100 text-orange-700',
};

const DRIVER_STATUS_STYLES: Record<string, string> = {
  UNASSIGNED: 'bg-gray-100 text-gray-500',
  ASSIGNED: 'bg-blue-100 text-blue-600',
  ACCEPTED: 'bg-indigo-100 text-indigo-600',
  ON_THE_WAY: 'bg-yellow-100 text-yellow-700',
  ARRIVED: 'bg-orange-100 text-orange-700',
  PASSENGER_ON_BOARD: 'bg-purple-100 text-purple-700',
  JOB_DONE: 'bg-green-100 text-green-700',
};

export default function DashboardPage() {
  const router = useRouter();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/bookings/stats/today');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const { data: todayData } = useQuery({
    queryKey: ['today-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings', {
        params: {
          date: new Date().toISOString().slice(0, 10),
          limit: 10,
        },
      });
      return res.data;
    },
    refetchInterval: 30000,
  });

  const { data: pendingData } = useQuery({
    queryKey: ['pending-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings', {
        params: {
          booking_status: 'PENDING',
          limit: 5,
        },
      });
      return res.data;
    },
    refetchInterval: 15000,
  });

  const { data: activeData } = useQuery({
    queryKey: ['active-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings', {
        params: {
          booking_status: 'CONFIRMED',
          limit: 5,
        },
      });
      return res.data;
    },
    refetchInterval: 15000,
  });

  const todayBookings = todayData?.data ?? [];
  const pendingBookings = pendingData?.data ?? [];
  const activeBookings = activeData?.data ?? [];

  const StatCard = ({
    label,
    value,
    sub,
    color = 'gray',
  }: {
    label: string;
    value: string | number;
    sub?: string;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className={`text-2xl font-bold mt-1 text-${color}-600`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );

  const BookingRow = ({ booking }: { booking: any }) => {
    const status = booking.booking_status ?? booking.status;

    return (
      <button
        type="button"
        onClick={() => router.push(`/bookings/${booking.id}`)}
        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold">#{booking.booking_number}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'
                }`}
              >
                {status}
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  DRIVER_STATUS_STYLES[booking.driver_status] ?? 'bg-gray-100 text-gray-400'
                }`}
              >
                {booking.driver_status}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              {booking.passenger_name ?? booking.booker_name ?? 'Unknown'}
              {booking.flight_number && ` · ✈️ ${booking.flight_number}`}
            </p>
            <p className="text-xs text-gray-400">
              {booking.pickup_address}
              {booking.dropoff_address && ` → ${booking.dropoff_address}`}
            </p>
            <p className="text-xs text-gray-400">
              📅{' '}
              {new Date(booking.pickup_datetime).toLocaleString('en-AU', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
          </div>
          <div className="text-right ml-3">
            <p className="text-sm font-bold">
              {booking.currency} ${booking.total_price?.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">{booking.vehicle_type_name ?? booking.vehicle_type_id ?? '-'}</p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('en-AU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Today's Bookings" value={stats?.today_total ?? 0} color="blue" />
        <StatCard
          label="Pending"
          value={stats?.pending ?? 0}
          sub="Needs attention"
          color="yellow"
        />
        <StatCard
          label="In Progress"
          value={stats?.in_progress ?? 0}
          sub="Active now"
          color="green"
        />
        <StatCard
          label="Today's Revenue"
          value={`$${(stats?.today_revenue ?? 0).toFixed(2)}`}
          sub={stats?.currency ?? 'AUD'}
          color="gray"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                ⏳ Pending Approval
                {pendingBookings.length > 0 && (
                  <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {pendingBookings.length}
                  </span>
                )}
              </CardTitle>
              <button
                type="button"
                onClick={() => router.push('/bookings?booking_status=PENDING')}
                className="text-xs text-blue-500"
              >
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            {pendingBookings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">✅ No pending bookings</p>
            ) : (
              <div className="divide-y">
                {pendingBookings.map((b: any) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">🚗 Active Jobs</CardTitle>
              <button
                type="button"
                onClick={() => router.push('/bookings?booking_status=CONFIRMED')}
                className="text-xs text-blue-500"
              >
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            {activeBookings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No active jobs right now</p>
            ) : (
              <div className="divide-y">
                {activeBookings.map((b: any) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">📋 Today's Schedule</CardTitle>
              <button
                type="button"
                onClick={() => router.push('/bookings')}
                className="text-xs text-blue-500"
              >
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            {todayBookings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No bookings scheduled for today
              </p>
            ) : (
              <div className="divide-y">
                {todayBookings.map((b: any) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
