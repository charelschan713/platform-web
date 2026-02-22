'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Booking, Driver } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  DRIVER_ASSIGNED: 'bg-purple-100 text-purple-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [assignBooking, setAssignBooking] = useState<Booking | null>(null);
  const [selectedDriver, setSelectedDriver] = useState('');

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings');
      return res.data;
    },
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ['drivers-active'],
    queryFn: async () => {
      const res = await api.get('/drivers?status=ACTIVE');
      return res.data;
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ booking_id, driver_id }: { booking_id: string; driver_id: string }) =>
      api.patch(`/bookings/${booking_id}/assign`, { driver_id }),
    onSuccess: () => {
      setAssignBooking(null);
      setSelectedDriver('');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bookings</h1>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-400">No bookings yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-400">
                        #{booking.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]}`}
                      >
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {format(new Date(booking.pickup_datetime), 'MMM d, yyyy HH:mm')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.pickup_address} → {booking.dropoff_address}
                    </p>
                    <p className="text-sm text-gray-400">
                      {booking.vehicle_class} · {booking.passenger_count} pax ·{' '}
                      <span className="font-medium text-gray-700">
                        {booking.currency} {booking.total_price}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                      <Button size="sm" onClick={() => setAssignBooking(booking)}>
                        Assign Driver
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!assignBooking} onOpenChange={() => setAssignBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger>
                <SelectValue placeholder="Select an available driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers
                  .filter((d) => d.is_available && d.status === 'ACTIVE')
                  .map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.profiles?.first_name} {driver.profiles?.last_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              className="w-full"
              disabled={!selectedDriver || assignMutation.isPending}
              onClick={() =>
                assignMutation.mutate({
                  booking_id: assignBooking!.id,
                  driver_id: selectedDriver,
                })
              }
            >
              {assignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
