'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';

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

const PAYMENT_STYLES: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-600',
  PAID: 'bg-green-100 text-green-700',
  PARTIALLY_REFUNDED: 'bg-yellow-100 text-yellow-700',
  REFUNDED: 'bg-gray-100 text-gray-500',
};

export default function BookingsPage() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [driverStatusFilter, setDriverStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: [
      'admin-bookings',
      statusFilter,
      driverStatusFilter,
      paymentFilter,
      page,
    ],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (statusFilter !== 'ALL') params.booking_status = statusFilter;
      if (driverStatusFilter !== 'ALL') params.driver_status = driverStatusFilter;
      if (paymentFilter !== 'ALL') params.payment_status = paymentFilter;
      const res = await api.get('/bookings', { params });
      return res.data;
    },
  });

  const bookings = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const filtered = search
    ? bookings.filter(
        (b: any) =>
          b.booking_number?.toLowerCase().includes(search.toLowerCase()) ||
          b.passenger_name?.toLowerCase().includes(search.toLowerCase()) ||
          b.booker_name?.toLowerCase().includes(search.toLowerCase()) ||
          b.pickup_address?.toLowerCase().includes(search.toLowerCase()),
      )
    : bookings;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total bookings</p>
        </div>
        <Button onClick={() => router.push('/bookings/new')}>
          <Plus size={16} className="mr-2" />
          New Booking
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            className="pl-8 h-9"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="NO_SHOW">No Show</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={driverStatusFilter}
          onValueChange={(v) => {
            setDriverStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Driver</SelectItem>
            <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
            <SelectItem value="ASSIGNED">Assigned</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="ON_THE_WAY">On The Way</SelectItem>
            <SelectItem value="ARRIVED">Arrived</SelectItem>
            <SelectItem value="JOB_DONE">Job Done</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentFilter}
          onValueChange={(v) => {
            setPaymentFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Payment</SelectItem>
            <SelectItem value="UNPAID">Unpaid</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-gray-500 font-medium">No bookings found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((booking: any) => (
            <Card
              key={booking.id}
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => router.push(`/bookings/${booking.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm">#{booking.booking_number}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          STATUS_STYLES[booking.booking_status] ??
                          STATUS_STYLES[booking.status] ??
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {booking.booking_status ?? booking.status}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          DRIVER_STATUS_STYLES[booking.driver_status] ??
                          'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {booking.driver_status}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          PAYMENT_STYLES[booking.payment_status] ??
                          'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {booking.payment_status}
                      </span>
                      {booking.is_transferred && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          Transferred
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">
                      📅{' '}
                      {booking.pickup_datetime_local ??
                        new Date(booking.pickup_datetime).toLocaleString('en-AU', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      {booking.city_name && ` (${booking.city_name})`}
                    </p>

                    <p className="text-sm text-gray-600">
                      📍 {booking.pickup_address}
                      {booking.dropoff_address && (
                        <span className="text-gray-400"> → {booking.dropoff_address}</span>
                      )}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>👤 {booking.passenger_name ?? booking.booker_name ?? 'No name'}</span>
                      <span>🚗 {booking.vehicle_class}</span>
                      {booking.flight_number && <span>✈️ {booking.flight_number}</span>}
                    </div>

                    {booking.driver_first_name && (
                      <p className="text-xs text-gray-500">
                        🧑‍✈️ {booking.driver_first_name} {booking.driver_last_name}
                        {booking.plate_number && ` · ${booking.plate_number}`}
                      </p>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <p className="font-bold">
                      {booking.currency} ${booking.total_price?.toFixed(2)}
                    </p>
                    {booking.service_type && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {booking.service_type === 'HOURLY_CHARTER'
                          ? `${booking.duration_hours}hr Charter`
                          : 'P2P'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} · {total} bookings
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
