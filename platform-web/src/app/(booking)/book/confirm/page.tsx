'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { ArrowLeft, Lock, Clock, MapPin } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({
  onSuccess,
  totalPrice,
  currency,
}: {
  clientSecret: string;
  onSuccess: () => void;
  totalPrice: number;
  currency: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message ?? 'Payment failed');
      setLoading(false);
      return;
    }

    onSuccess();
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        className="w-full"
        size="lg"
        disabled={loading || !stripe}
        onClick={handlePay}
      >
        <Lock size={14} className="mr-2" />
        {loading ? 'Processing...' : `Pay ${currency} $${totalPrice.toFixed(2)}`}
      </Button>
      <p className="text-xs text-center text-gray-400">
        Your card will be saved securely for future bookings. By paying you agree to
        our terms of service.
      </p>
    </div>
  );
}

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<'review' | 'payment' | 'success'>('review');
  const [clientSecret, setClientSecret] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');

  const [booker_name, setBookerName] = useState('');
  const [booker_email, setBookerEmail] = useState('');
  const [booker_phone, setBookerPhone] = useState('');
  const [isBookerDifferent, setIsBookerDifferent] = useState(false);

  const service_city_id = searchParams.get('service_city_id') ?? '';
  const service_type = searchParams.get('service_type') ?? 'POINT_TO_POINT';
  const trip_type = searchParams.get('trip_type') ?? 'ONE_WAY';
  const vehicle_type_id = searchParams.get('vehicle_type_id') ?? '';
  const pickup_datetime = searchParams.get('pickup_datetime') ?? '';
  const return_datetime = searchParams.get('return_datetime') ?? '';
  const pickup_address = searchParams.get('pickup_address') ?? '';
  const dropoff_address = searchParams.get('dropoff_address') ?? '';
  const pickup_lat = searchParams.get('pickup_lat') ?? '0';
  const pickup_lng = searchParams.get('pickup_lng') ?? '0';
  const dropoff_lat = searchParams.get('dropoff_lat') ?? '0';
  const dropoff_lng = searchParams.get('dropoff_lng') ?? '0';
  const waypoints = JSON.parse(searchParams.get('waypoints') ?? '[]');
  const duration_hours = searchParams.get('duration_hours');
  const passenger_name = searchParams.get('passenger_name') ?? '';
  const passenger_phone = searchParams.get('passenger_phone') ?? '';
  const passenger_count = parseInt(searchParams.get('passenger_count') ?? '1');
  const flight_number = searchParams.get('flight_number') ?? '';
  const special_requests = searchParams.get('special_requests') ?? '';
  const promo_code = searchParams.get('promo_code') ?? '';
  const contact_id = searchParams.get('contact_id') ?? '';
  const crm_passenger_id = searchParams.get('crm_passenger_id') ?? '';
  const city_name = searchParams.get('city_name') ?? '';
  const timezone = searchParams.get('timezone') ?? 'Australia/Sydney';
  const currency = searchParams.get('currency') ?? 'AUD';
  const billing_method = searchParams.get('billing_method') ?? 'KM';
  const fare = parseFloat(searchParams.get('fare') ?? '0');
  const surcharge_amount = parseFloat(searchParams.get('surcharge_amount') ?? '0');
  const surcharge_percentage = parseFloat(searchParams.get('surcharge_percentage') ?? '0');
  const discount_type = searchParams.get('discount_type') ?? '';
  const discount_amount = parseFloat(searchParams.get('discount_amount') ?? '0');
  const total_price = parseFloat(searchParams.get('total_price') ?? '0');

  const formatLocalTime = (datetimeStr: string) => {
    if (!datetimeStr) return '';
    return (
      new Date(datetimeStr).toLocaleString('en-AU', {
        timeZone: timezone,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ` (${city_name})`
    );
  };

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const bookingPayload: any = {
        service_city_id,
        service_type,
        trip_type,
        vehicle_type_id,
        pickup_address,
        pickup_lat: parseFloat(pickup_lat),
        pickup_lng: parseFloat(pickup_lng),
        dropoff_address,
        dropoff_lat: parseFloat(dropoff_lat),
        dropoff_lng: parseFloat(dropoff_lng),
        waypoints,
        pickup_datetime,
        pickup_timezone: timezone,
        passenger_name,
        passenger_phone,
        passenger_count,
        flight_number: flight_number || undefined,
        special_requests: special_requests || undefined,
        promo_code: promo_code || undefined,
        billing_method,
        contact_id: contact_id || undefined,
        crm_passenger_id: crm_passenger_id || undefined,
      };

      if (service_type === 'HOURLY_CHARTER' && duration_hours) {
        bookingPayload.duration_hours = parseFloat(duration_hours);
      }
      if (trip_type === 'RETURN' && return_datetime) {
        bookingPayload.return_datetime = return_datetime;
      }

      if (isBookerDifferent) {
        bookingPayload.booker_name = booker_name;
        bookingPayload.booker_email = booker_email;
        bookingPayload.booker_phone = booker_phone;
      }

      const bookingRes = await api.post('/bookings', bookingPayload);
      const booking = bookingRes.data;

      setBookingId(booking.id);
      setBookingNumber(booking.booking_number);

      const intentRes = await api.post(`/payments/intent/${booking.id}`);
      return intentRes.data.client_secret;
    },
    onSuccess: (secret) => {
      setClientSecret(secret);
      setStep('payment');
    },
  });

  const handlePaymentSuccess = () => {
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-10 space-y-4">
            <p className="text-5xl">✅</p>
            <h2 className="text-2xl font-bold">Booking Received!</h2>
            <p className="text-gray-500">
              Your booking <span className="font-mono font-bold">#{bookingNumber}</span> has
              been submitted. We will confirm shortly.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-left space-y-1">
              <p>📅 {formatLocalTime(pickup_datetime)}</p>
              <p>📍 {pickup_address}</p>
              {dropoff_address && <p>📍 {dropoff_address}</p>}
              <p>🚗 {vehicle_type_id}</p>
              <p>💳 {currency} ${total_price.toFixed(2)} pre-authorized</p>
            </div>
            <Button className="w-full" onClick={() => router.push('/bookings')}>
              View My Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (step === 'payment') {
                setStep('review');
              } else {
                router.back();
              }
            }}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{step === 'review' ? 'Confirm Booking' : 'Payment'}</h1>
            <p className="text-sm text-gray-500">Step {step === 'review' ? '1' : '2'} of 2</p>
          </div>
        </div>

        {step === 'review' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Clock size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{formatLocalTime(pickup_datetime)}</p>
                    {trip_type === 'RETURN' && return_datetime && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        🔄 Return: {formatLocalTime(return_datetime)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p>{pickup_address}</p>
                    {waypoints.length > 0 &&
                      waypoints.map((wp: string, i: number) => (
                        <p key={i} className="text-gray-400">
                          ↓ {wp}
                        </p>
                      ))}
                    {dropoff_address && (
                      <>
                        <p className="text-gray-400">↓</p>
                        <p>{dropoff_address}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>🚗 {vehicle_type_id}</span>
                  <span>👥 {passenger_count} pax</span>
                  {flight_number && <span>✈️ {flight_number}</span>}
                </div>
                {special_requests && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">📝 {special_requests}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Passenger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">{passenger_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">{passenger_phone}</span>
                </div>

                <div className="border-t pt-3">
                  <button
                    type="button"
                    onClick={() => setIsBookerDifferent(!isBookerDifferent)}
                    className="text-xs text-gray-400 flex items-center gap-1"
                  >
                    <span>{isBookerDifferent ? '▼' : '▶'}</span>
                    Booking on behalf of someone else?
                  </button>
                  {isBookerDifferent && (
                    <div className="mt-3 space-y-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Your Name</Label>
                        <Input
                          className="h-8 text-sm"
                          value={booker_name}
                          onChange={(e) => setBookerName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Your Email</Label>
                        <Input
                          className="h-8 text-sm"
                          type="email"
                          value={booker_email}
                          onChange={(e) => setBookerEmail(e.target.value)}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Your Phone</Label>
                        <Input
                          className="h-8 text-sm"
                          value={booker_phone}
                          onChange={(e) => setBookerPhone(e.target.value)}
                          placeholder="+61400000000"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fare</span>
                  <span>
                    {currency} ${fare.toFixed(2)}
                  </span>
                </div>
                {surcharge_amount > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Surcharge (+{surcharge_percentage}%)</span>
                    <span>
                      +{currency} ${surcharge_amount.toFixed(2)}
                    </span>
                  </div>
                )}
                {discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discount_type})</span>
                    <span>
                      -{currency} ${discount_amount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>
                    {currency} ${total_price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 pt-1">
                  Toll and extras (if any) will be charged on completion.
                </p>
              </CardContent>
            </Card>

            {createBookingMutation.isError && (
              <p className="text-sm text-red-500 text-center">
                {(createBookingMutation.error as any)?.response?.data?.message ??
                  'Something went wrong. Please try again.'}
              </p>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={createBookingMutation.isPending}
              onClick={() => createBookingMutation.mutate()}
            >
              {createBookingMutation.isPending ? 'Creating booking...' : 'Continue to Payment'}
              <ArrowLeft size={14} className="ml-2 rotate-180" />
            </Button>
          </div>
        )}

        {step === 'payment' && clientSecret && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">💳 Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                <div className="flex justify-between font-bold">
                  <span>Total to Pay</span>
                  <span>
                    {currency} ${total_price.toFixed(2)}
                  </span>
                </div>
              </div>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  totalPrice={total_price}
                  currency={currency}
                />
              </Elements>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
