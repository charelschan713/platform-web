'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Booking } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  DRIVER_ASSIGNED: 'bg-purple-100 text-purple-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function MyBookingsPage() {
  const queryClient = useQueryClient();
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/my');
      return res.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (booking_id: string) => api.patch(`/bookings/my/${booking_id}/cancel`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Bookings</h1>
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-400">No bookings yet.</p>
            <a href="/book" className="text-blue-600 text-sm hover:underline mt-2 block">
              Book your first ride →
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-400">
                    #{booking.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]}`}
                  >
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    {format(new Date(booking.pickup_datetime), 'MMM d, yyyy · HH:mm')}
                  </p>
                  <p className="text-gray-500">From: {booking.pickup_address}</p>
                  <p className="text-gray-500">To: {booking.dropoff_address}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold">
                    {booking.currency} {booking.total_price}
                  </span>
                  {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelMutation.mutate(booking.id)}
                      disabled={cancelMutation.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
