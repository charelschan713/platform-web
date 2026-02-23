'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Card, CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Car } from 'lucide-react';

type VehicleType = {
  id: string;
  type_name: string;
  description?: string;
  max_luggage: number;
  base_fare: number;
  per_km_rate: number;
  hourly_rate: number;
  minimum_fare: number;
  currency: string;
  is_active?: boolean;
  vehicles: {
    id: string;
    platform_vehicle: {
      id: string;
      make: string;
      model: string;
      images: string[];
    };
  }[];
};

type QuoteResult = {
  vehicle_type_id: string;
  type_name: string;
  estimated_fare: number;
  currency: string;
  base_fare: number;
  per_km_rate: number;
  hourly_rate: number;
  minimum_fare: number;
  max_luggage: number;
};

export default function QuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTypeId, setSelectedTypeId] =
    useState<string>('');
  const [quotes, setQuotes] = useState<QuoteResult[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  // 从 URL 拿参数
  const service_city_id =
    searchParams.get('service_city_id') ?? '';
  const service_type =
    searchParams.get('service_type') ?? '';
  const pickup_address =
    searchParams.get('pickup_address') ?? '';
  const dropoff_address =
    searchParams.get('dropoff_address') ?? '';
  const pickup_datetime =
    searchParams.get('pickup_datetime') ?? '';
  const distance_km =
    parseFloat(searchParams.get('distance_km') ?? '0');
  const duration_hours =
    parseFloat(searchParams.get('duration_hours') ?? '0');
  const tenant_slug =
    searchParams.get('tenant_slug') ?? '';

  // 获取 vehicle types
  const { data: vehicleTypes = [], isLoading } =
    useQuery<VehicleType[]>({
      queryKey: ['public-vehicle-types', service_city_id],
      queryFn: async () => {
        const res = await api.get('/vehicle-types', {
          params: { service_city_id }
        });
        return res.data;
      },
      enabled: !!service_city_id,
    });

  // 拿到 vehicle types 后自动计算报价
  useEffect(() => {
    if (vehicleTypes.length === 0) return;

    setLoadingQuotes(true);
    const calculated: QuoteResult[] = vehicleTypes
      .filter(vt => vt.is_active)
      .map(vt => {
        let fare = vt.base_fare ?? 0;

        if (
          service_type === 'POINT_TO_POINT' &&
          distance_km > 0
        ) {
          fare += distance_km * (vt.per_km_rate ?? 0);
        } else if (
          service_type === 'HOURLY_CHARTER' &&
          duration_hours > 0
        ) {
          fare = duration_hours * (vt.hourly_rate ?? 0);
        }

        if (
          vt.minimum_fare &&
          fare < vt.minimum_fare
        ) {
          fare = vt.minimum_fare;
        }

        return {
          vehicle_type_id: vt.id,
          type_name: vt.type_name,
          estimated_fare: parseFloat(fare.toFixed(2)),
          currency: vt.currency,
          base_fare: vt.base_fare,
          per_km_rate: vt.per_km_rate,
          hourly_rate: vt.hourly_rate,
          minimum_fare: vt.minimum_fare,
          max_luggage: vt.max_luggage,
        };
      });

    setQuotes(calculated);
    setLoadingQuotes(false);
  }, [vehicleTypes, service_type, distance_km, duration_hours]);

  const handleSelect = (quote: QuoteResult) => {
    setSelectedTypeId(quote.vehicle_type_id);
  };

  const handleContinue = () => {
    if (!selectedTypeId) return;
    const selected = quotes.find(
      q => q.vehicle_type_id === selectedTypeId
    );
    if (!selected) return;

    const params = new URLSearchParams({
      service_city_id,
      service_type,
      pickup_address,
      dropoff_address,
      pickup_datetime,
      vehicle_type_id: selected.vehicle_type_id,
      type_name: selected.type_name,
      estimated_fare: selected.estimated_fare.toString(),
      currency: selected.currency,
      distance_km: distance_km.toString(),
      duration_hours: duration_hours.toString(),
      tenant_slug,
    });

    router.push(`/book/confirm?${params.toString()}`);
  };

  // 获取该 vehicle type 的车辆列表
  const getVehiclesForType = (typeId: string) => {
    const vt = vehicleTypes.find(v => v.id === typeId);
    return vt?.vehicles ?? [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              Select Vehicle Type
            </h1>
            <p className="text-sm text-gray-500">
              Choose the service that fits your needs
            </p>
          </div>
        </div>

        {/* Trip Summary */}
        <Card className="bg-gray-900 text-white">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              Your Trip
            </p>
            {pickup_address && (
              <p className="text-sm">
                📍 {pickup_address}
              </p>
            )}
            {dropoff_address && (
              <p className="text-sm">
                🏁 {dropoff_address}
              </p>
            )}
            {distance_km > 0 && (
              <p className="text-xs text-gray-400">
                {distance_km.toFixed(1)} km ·{' '}
                {service_type?.replace(/_/g, ' ')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Type List */}
        {isLoading || loadingQuotes ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-3xl mb-3">🚗</p>
              <p className="text-gray-500">
                No vehicle types available
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Please contact us for assistance
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {quotes.map(quote => {
              const isSelected =
                selectedTypeId === quote.vehicle_type_id;
              const vehicles = getVehiclesForType(
                quote.vehicle_type_id
              );

              return (
                <Card
                  key={quote.vehicle_type_id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-gray-900 shadow-md'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleSelect(quote)}
                >
                  <CardContent className="p-4 space-y-3">

                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg">
                          {quote.type_name}
                        </h3>
                        <p className="text-xs text-gray-400">
                          🧳 Up to {quote.max_luggage} luggage
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {quote.currency} $
                          {quote.estimated_fare.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">
                          estimated
                        </p>
                      </div>
                    </div>

                    {/* Vehicles in this type */}
                    {vehicles.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {vehicles
                          .slice(0, 4)
                          .map(v => (
                            <span
                              key={v.id}
                              className="text-xs bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1"
                            >
                              <Car size={10} />
                              {v.platform_vehicle.make}{' '}
                              {v.platform_vehicle.model}
                            </span>
                          ))
                        }
                        {vehicles.length > 4 && (
                          <span className="text-xs text-gray-400">
                            +{vehicles.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Pricing breakdown */}
                    <div className="text-xs text-gray-400 flex gap-3">
                      {quote.base_fare > 0 && (
                        <span>
                          Base ${quote.base_fare.toFixed(2)}
                        </span>
                      )}
                      {quote.per_km_rate > 0 && (
                        <span>
                          ${quote.per_km_rate.toFixed(2)}/km
                        </span>
                      )}
                      {quote.hourly_rate > 0 && (
                        <span>
                          ${quote.hourly_rate.toFixed(2)}/hr
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="bg-gray-900 text-white text-center rounded-lg py-2 text-sm font-medium">
                        ✓ Selected
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Continue Button */}
        {selectedTypeId && (
          <div className="sticky bottom-4">
            <Button
              className="w-full h-12 text-base"
              onClick={handleContinue}
            >
              Continue →
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
