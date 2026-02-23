'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Clock, MapPin } from 'lucide-react';

const CLASS_ICONS: Record<string, string> = {
  BUSINESS: '🚗',
  FIRST: '🏆',
  VAN: '🚐',
  ELECTRIC: '⚡',
};

export default function QuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedClass, setSelectedClass] = useState('');

  const service_city_id = searchParams.get('service_city_id') ?? '';
  const service_type = searchParams.get('service_type') ?? 'POINT_TO_POINT';
  const trip_type = searchParams.get('trip_type') ?? 'ONE_WAY';
  const pickup_datetime = searchParams.get('pickup_datetime') ?? '';
  const pickup_address = searchParams.get('pickup_address') ?? '';
  const pickup_lat = searchParams.get('pickup_lat') ?? '0';
  const pickup_lng = searchParams.get('pickup_lng') ?? '0';
  const dropoff_address = searchParams.get('dropoff_address') ?? '';
  const dropoff_lat = searchParams.get('dropoff_lat') ?? '0';
  const dropoff_lng = searchParams.get('dropoff_lng') ?? '0';
  const duration_hours = searchParams.get('duration_hours');
  const flight_number = searchParams.get('flight_number') ?? '';
  const city_name = searchParams.get('city_name') ?? '';
  const timezone = searchParams.get('timezone') ?? '';
  const currency = searchParams.get('currency') ?? 'AUD';
  const return_datetime = searchParams.get('return_datetime') ?? '';
  const promo_code = searchParams.get('promo_code') ?? '';

  const {
    data: quoteData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['quotes', service_city_id, service_type, pickup_datetime],
    queryFn: async () => {
      const params: any = {
        service_city_id,
        service_type,
        pickup_lat,
        pickup_lng,
        dropoff_lat,
        dropoff_lng,
        pickup_datetime,
      };
      if (duration_hours) params.duration_hours = duration_hours;
      if (promo_code) params.promo_code = promo_code;

      const res = await api.get('/pricing/quote', { params });
      return res.data;
    },
    enabled: !!service_city_id && !!pickup_datetime,
  });

  const quotes = quoteData?.quotes ?? [];

  const formatLocalTime = (datetimeStr: string) => {
    if (!datetimeStr) return '';
    const dt = new Date(datetimeStr);
    return (
      dt.toLocaleString('en-AU', {
        timeZone: timezone || 'Australia/Sydney',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ` (${city_name})`
    );
  };

  const handleSelect = (quote: any) => {
    setSelectedClass(quote.vehicle_class);

    const params = new URLSearchParams(searchParams.toString());
    params.set('vehicle_class', quote.vehicle_class);
    params.set('fare', quote.fare.toString());
    params.set('surcharge_amount', quote.surcharge_amount.toString());
    params.set('surcharge_percentage', quote.surcharge_percentage.toString());
    params.set('discount_type', quote.discount_type ?? '');
    params.set('discount_amount', quote.discount_amount.toString());
    params.set('subtotal', quote.subtotal.toString());
    params.set('total_price', quote.total_price.toString());
    params.set('distance_km', quote.distance_km?.toString() ?? '0');
    params.set('duration_minutes', quote.duration_minutes?.toString() ?? '0');

    router.push(`/book/confirm?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Select Vehicle</h1>
            <p className="text-sm text-gray-500">Choose your preferred vehicle class</p>
          </div>
        </div>

        {/* Trip Summary */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Clock size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{formatLocalTime(pickup_datetime)}</p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p>{pickup_address}</p>
                {dropoff_address && (
                  <>
                    <p className="text-gray-400 my-0.5">↓</p>
                    <p>{dropoff_address}</p>
                  </>
                )}
              </div>
            </div>
            {service_type === 'POINT_TO_POINT' &&
              quoteData?.quotes?.[0]?.distance_km > 0 && (
                <p className="text-xs text-gray-400 pl-5">
                  ~{quoteData.quotes[0].distance_km} km · ~
                  {quoteData.quotes[0].duration_minutes} min
                </p>
              )}
            {service_type === 'HOURLY_CHARTER' && (
              <p className="text-xs text-gray-400 pl-5">
                {duration_hours} hour
                {parseInt(duration_hours ?? '1') > 1 ? 's' : ''} charter
              </p>
            )}
            {flight_number && (
              <p className="text-xs text-gray-400 pl-5">✈️ {flight_number}</p>
            )}
          </CardContent>
        </Card>

        {/* Quote Cards */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-500 text-sm">
                Failed to load quotes. Please try again.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        ) : quotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 text-sm">
                No vehicles available for this route.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote: any) => (
              <Card
                key={quote.vehicle_class}
                className={`cursor-pointer transition-all ${
                  selectedClass === quote.vehicle_class
                    ? 'ring-2 ring-gray-900'
                    : 'hover:shadow-md'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {CLASS_ICONS[quote.vehicle_class] ?? '🚗'}
                      </span>
                      <div>
                        <p className="font-bold">{quote.vehicle_class}</p>
                        <p className="text-xs text-gray-400">
                          {service_type === 'POINT_TO_POINT'
                            ? `${quote.distance_km} km`
                            : `${duration_hours}hr charter`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {currency} ${quote.total_price.toFixed(2)}
                      </p>
                      {quote.discount_amount > 0 && (
                        <p className="text-xs text-green-600">
                          -{currency} ${quote.discount_amount.toFixed(2)} off
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 价格明细 */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1 mb-3">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {service_type === 'POINT_TO_POINT'
                          ? 'Base + Distance + Time'
                          : `${quote.hourly_rate}/hr × ${duration_hours}hr`}
                      </span>
                      <span>
                        {currency} ${quote.fare.toFixed(2)}
                      </span>
                    </div>

                    {quote.surcharge_breakdown?.map((sr: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs text-orange-600">
                        <span>
                          {sr.name} (+{sr.percentage}%)
                        </span>
                        <span>
                          +{currency} ${sr.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}

                    {quote.discount_amount > 0 && (
                      <div className="flex justify-between text-xs text-green-600">
                        <span>{quote.discount_label}</span>
                        <span>
                          -{currency} ${quote.discount_amount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {service_type === 'HOURLY_CHARTER' && quote.included_km_per_hour && (
                      <div className="text-xs text-gray-400 pt-1 border-t">
                        Includes{' '}
                        {quote.included_km_per_hour * parseInt(duration_hours ?? '1')} km ·
                        Extra km: {currency} ${quote.extra_km_rate}/km
                      </div>
                    )}
                  </div>

                  <Button className="w-full" onClick={() => handleSelect(quote)}>
                    Select
                    <ArrowRight size={14} className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Return Trip提示 */}
        {trip_type === 'RETURN' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <p className="text-xs text-blue-700">
                🔄 Return trip: {formatLocalTime(return_datetime)}
                <br />A separate booking will be created for the return leg with the same
                pricing.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
