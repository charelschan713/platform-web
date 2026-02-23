'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const DRIVER_STATUS_STEPS = [
  { key: 'ASSIGNED', label: 'Driver Assigned', icon: '✅' },
  { key: 'ACCEPTED', label: 'Driver Accepted', icon: '👍' },
  { key: 'ON_THE_WAY', label: 'Driver On The Way', icon: '🚗' },
  { key: 'ARRIVED', label: 'Driver Arrived', icon: '📍' },
  { key: 'PASSENGER_ON_BOARD', label: 'On The Way', icon: '🛣️' },
  { key: 'JOB_DONE', label: 'Trip Completed', icon: '✅' },
];

export default function PassengerBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['passenger-booking', id],
    queryFn: async () => {
      const res = await api.get(`/bookings/my/${id}`);
      return res.data;
    },
    refetchInterval: 15000,
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.patch(`/bookings/my/${id}/cancel`),
    onSuccess: () => {
      router.push('/my-bookings');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Booking not found</p>
      </div>
    );
  }

  const status = booking.booking_status ?? booking.status;
  const driverStatus = booking.driver_status;
  const isActive = ['PENDING', 'CONFIRMED'].includes(status);
  const isCompleted = status === 'COMPLETED';
  const isCancelled = status === 'CANCELLED';

  const currentStepIndex = DRIVER_STATUS_STEPS.findIndex((s) => s.key === driverStatus);

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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/my-bookings')}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-mono">#{booking.booking_number}</h1>
            <p className="text-sm text-gray-500">
              {status}
              {isCancelled && ' · Refund issued'}
            </p>
          </div>
        </div>

        {status === 'CONFIRMED' && driverStatus !== 'UNASSIGNED' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-bold text-blue-800">🔴 Live Status</p>

              <div className="space-y-2">
                {DRIVER_STATUS_STEPS.map((step, idx) => {
                  const isPast = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className={`flex items-center gap-3 ${isPast || isCurrent ? 'opacity-100' : 'opacity-30'}`}
                    >
                      <span className="text-lg">{step.icon}</span>
                      <span
                        className={`text-sm ${
                          isCurrent
                            ? 'font-bold text-blue-800'
                            : isPast
                              ? 'text-blue-600 line-through'
                              : 'text-blue-400'
                        }`}
                      >
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span className="ml-auto text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                          Now
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {booking.driver_first_name && (
                <div className="bg-white rounded-lg p-3 space-y-1">
                  <p className="text-xs text-gray-400 font-medium">YOUR DRIVER</p>
                  <p className="font-bold">
                    {booking.driver_first_name} {booking.driver_last_name}
                  </p>
                  {booking.vehicle_make && (
                    <p className="text-sm text-gray-500">
                      {booking.vehicle_color} {booking.vehicle_make} {booking.vehicle_model}
                    </p>
                  )}
                  {booking.plate_number && (
                    <p className="text-sm font-mono font-bold">🚗 {booking.plate_number}</p>
                  )}
                  {booking.driver_phone && (
                    <a
                      href={`tel:${booking.driver_phone}`}
                      className="block mt-2 text-center text-sm text-blue-600 font-medium bg-blue-50 rounded-lg py-2"
                    >
                      📞 Call Driver
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isCompleted && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center space-y-2">
              <p className="text-3xl">✅</p>
              <p className="font-bold text-green-800">Trip Completed</p>
              <p className="text-sm text-green-600">Thank you for riding with us!</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">
              Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Date & Time</span>
              <span className="font-medium text-right">{formatDateTime(booking.pickup_datetime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service</span>
              <span>{booking.service_type?.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vehicle</span>
              <span>{booking.vehicle_class}</span>
            </div>
            {booking.flight_number && (
              <div className="flex justify-between">
                <span className="text-gray-500">Flight</span>
                <span>✈️ {booking.flight_number}</span>
              </div>
            )}
            <div className="flex flex-col gap-1 pt-1 border-t">
              <div className="flex gap-2">
                <span className="text-green-500">●</span>
                <span className="text-gray-700">{booking.pickup_address}</span>
              </div>
              {booking.dropoff_address && (
                <div className="flex gap-2">
                  <span className="text-red-500">●</span>
                  <span className="text-gray-700">{booking.dropoff_address}</span>
                </div>
              )}
            </div>
            {booking.special_requests && (
              <div className="bg-yellow-50 rounded p-2 text-xs text-yellow-700">📝 {booking.special_requests}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Fare</span>
              <span>
                {booking.currency} ${booking.fare?.toFixed(2)}
              </span>
            </div>
            {booking.surcharge_amount > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Surcharge</span>
                <span>
                  +{booking.currency} ${booking.surcharge_amount?.toFixed(2)}
                </span>
              </div>
            )}
            {booking.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>
                  -{booking.currency} ${booking.discount_amount?.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total</span>
              <span>
                {booking.currency} ${booking.total_price?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Payment Status</span>
              <span>{booking.payment_status}</span>
            </div>
          </CardContent>
        </Card>

        {isActive && driverStatus === 'UNASSIGNED' && (
          <div>
            {!showCancelConfirm ? (
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-500"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel Booking
              </Button>
            ) : (
              <Card className="border-red-200">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-red-600 font-medium">Are you sure you want to cancel?</p>
                  <p className="text-xs text-gray-500">
                    A full refund will be issued to your original payment method.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() => cancelMutation.mutate()}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCancelConfirm(false)}
                    >
                      Keep Booking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Button className="w-full" onClick={() => router.push('/book')}>
          + Book Another Ride
        </Button>
      </div>
    </div>
  );
}
