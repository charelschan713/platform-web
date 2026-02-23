'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const vehicleClasses = [
  { value: 'BUSINESS', label: 'Business Class', desc: 'Comfortable sedans' },
  { value: 'FIRST', label: 'First Class', desc: 'Premium vehicles' },
  { value: 'VAN', label: 'Van', desc: 'Up to 8 passengers' },
  { value: 'ELECTRIC', label: 'Electric', desc: 'Eco-friendly vehicles' },
];

export default function BookPage() {
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [booking, setBooking] = useState<any>(null);
  const [vehicleClass, setVehicleClass] = useState('');
  const [tenantId, setTenantId] = useState('');
  const { register, handleSubmit } = useForm();

  const estimateQuery = useQuery({
    queryKey: ['estimate', tenantId, vehicleClass],
    queryFn: async () => {
      if (!tenantId || !vehicleClass) return null;
      const res = await api.get(
        `/tenants/${tenantId}/estimate?vehicle_class=${vehicleClass}&distance_km=10&duration_minutes=20`,
      );
      return res.data;
    },
    enabled: !!tenantId && !!vehicleClass,
  });

  const bookMutation = useMutation({
    mutationFn: (data: any) => api.post('/bookings', data),
    onSuccess: (res) => {
      setBooking(res.data);
      setStep('success');
    },
  });

  const onSubmit = (data: any) => {
    bookMutation.mutate({
      ...data,
      tenant_id: tenantId,
      vehicle_class: vehicleClass,
      pickup_lat: 0,
      pickup_lng: 0,
      dropoff_lat: 0,
      dropoff_lng: 0,
      passenger_count: parseInt(data.passenger_count),
    });
  };

  if (step === 'success') {
    return (
      <Card className="max-w-lg mx-auto text-center">
        <CardContent className="pt-8 pb-8 space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-bold">Booking Received!</h2>
          <p className="text-gray-500">
            Booking ID:{' '}
            <span className="font-mono font-medium">#{booking?.id?.slice(0, 8).toUpperCase()}</span>
          </p>
          <p className="text-gray-500">Complete payment to confirm your ride.</p>
          <p className="text-sm text-yellow-600 bg-yellow-50 rounded-lg p-3">
            Total: {booking?.currency} {booking?.total_price}
          </p>
          <Button
            onClick={() => {
              setStep('form');
              setBooking(null);
            }}
          >
            Book Another Ride
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Book a Ride</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Fleet Provider ID</Label>
              <Input
                placeholder="Paste tenant ID here"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
              />
              <p className="text-xs text-gray-400">Provided by your fleet operator</p>
            </div>

            <div className="space-y-1">
              <Label>Pickup Address</Label>
              <Input
                {...register('pickup_address', { required: true })}
                placeholder="123 Main St, City"
              />
            </div>

            <div className="space-y-1">
              <Label>Dropoff Address</Label>
              <Input
                {...register('dropoff_address', { required: true })}
                placeholder="456 Park Ave, City"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Pickup Date & Time</Label>
                <Input
                  type="datetime-local"
                  {...register('pickup_datetime', { required: true })}
                />
              </div>
              <div className="space-y-1">
                <Label>Passengers</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  defaultValue="1"
                  {...register('passenger_count', { required: true })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Vehicle Class</Label>
              <div className="grid grid-cols-2 gap-2">
                {vehicleClasses.map((vc) => (
                  <button
                    key={vc.value}
                    type="button"
                    onClick={() => setVehicleClass(vc.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      vehicleClass === vc.value
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <p className="font-medium text-sm">{vc.label}</p>
                    <p
                      className={`text-xs mt-0.5 ${
                        vehicleClass === vc.value ? 'text-gray-300' : 'text-gray-400'
                      }`}
                    >
                      {vc.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Flight Number (optional)</Label>
              <Input {...register('flight_number')} placeholder="e.g. BA123" />
            </div>

            <div className="space-y-1">
              <Label>Special Requests (optional)</Label>
              <Input
                {...register('special_requests')}
                placeholder="e.g. Child seat required"
              />
            </div>

            {estimateQuery.data && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                <p className="text-sm font-medium">Estimated Price</p>
                <p className="text-2xl font-bold">
                  {estimateQuery.data.currency} {estimateQuery.data.calculated_price}
                </p>
                <p className="text-xs text-gray-400">Base fare + distance + time estimate</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!vehicleClass || !tenantId || bookMutation.isPending}
            >
              {bookMutation.isPending ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
