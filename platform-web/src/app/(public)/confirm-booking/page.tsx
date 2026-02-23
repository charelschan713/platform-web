'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

function PaymentForm({
  token,
  booking,
  hasSavedCard,
  savedCard,
}: {
  token: string;
  booking: any;
  hasSavedCard: boolean;
  savedCard: any;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      if (hasSavedCard) {
        await api.post(`/payments/confirm/${token}`);
        setConfirmed(true);
      } else {
        if (!stripe || !elements) return;

        const result = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        });

        if (result.error) {
          setError(result.error.message ?? 'Payment failed');
          return;
        }

        const pm = result.paymentIntent?.payment_method as string;
        await api.post(`/payments/confirm/${token}`, {
          payment_method_id: pm,
        });
        setConfirmed(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-4">✅</p>
        <h2 className="text-xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-gray-500">
          Your booking has been confirmed and payment processed. You will
          receive a confirmation email shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Pickup</span>
          <span className="font-medium">{booking.pickup_address}</span>
        </div>
        {booking.dropoff_address && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Drop-off</span>
            <span className="font-medium">{booking.dropoff_address}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Date & Time</span>
          <span className="font-medium">
            {booking.pickup_datetime_local}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Vehicle</span>
          <span className="font-medium">{booking.vehicle_type_id}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold">
          <span>Total</span>
          <span>
            {booking.currency} ${booking.total_price?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment */}
      {hasSavedCard ? (
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-800 mb-1">
            💳 Saved Payment Method
          </p>
          <p className="text-sm text-blue-700">
            {savedCard.brand?.toUpperCase()} ••••{savedCard.last4} expires{' '}
            {savedCard.exp_month}/{savedCard.exp_year}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-3">
            Enter your payment details:
          </p>
          <PaymentElement />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        className="w-full"
        size="lg"
        disabled={loading}
        onClick={handleConfirm}
      >
        {loading
          ? 'Processing...'
          : `Confirm & Pay ${booking.currency} $${booking.total_price?.toFixed(2)}`}
      </Button>

      <p className="text-xs text-center text-gray-400">
        Your payment info is stored securely for future bookings. By
        confirming, you agree to our terms of service.
      </p>
    </div>
  );
}

export default function ConfirmBookingPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [savedCard, setSavedCard] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid confirmation link');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await api.get(`/payments/confirm/${token}`);
        const data = res.data;
        setBooking(data.bookings);

        try {
          const cardRes = await api.get('/payments/payment-method');
          setSavedCard(cardRes.data);
        } catch {
          const intentRes = await api.post(
            `/payments/intent/${data.bookings.id}`,
          );
          setClientSecret(intentRes.data.client_secret);
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message ?? 'Invalid or expired link',
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <p className="text-4xl mb-4">❌</p>
            <h2 className="text-xl font-bold mb-2">Link Invalid</h2>
            <p className="text-gray-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Confirm Your Booking</CardTitle>
        </CardHeader>
        <CardContent>
          {savedCard ? (
            <PaymentForm
              token={token!}
              booking={booking}
              hasSavedCard={true}
              savedCard={savedCard}
            />
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                token={token!}
                booking={booking}
                hasSavedCard={false}
                savedCard={null}
              />
            </Elements>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
