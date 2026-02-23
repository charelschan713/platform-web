'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Clock, Users, Plane, Plus, X, ArrowRight } from 'lucide-react';
import { ContactSearch } from '@/components/crm/ContactSearch';
import { PassengerSearch } from '@/components/crm/PassengerSearch';

const SERVICE_TYPES = [
  { value: 'POINT_TO_POINT', label: 'Point to Point' },
  { value: 'HOURLY_CHARTER', label: 'Hourly Charter' },
];

const HOURS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function BookPage() {
  const router = useRouter();

  const [service_city_id, setServiceCityId] = useState('');
  const [service_type, setServiceType] = useState('POINT_TO_POINT');
  const [trip_type, setTripType] = useState('ONE_WAY');
  const [pickup_datetime, setPickupDatetime] = useState('');
  const [return_datetime, setReturnDatetime] = useState('');
  const [duration_hours, setDurationHours] = useState(2);
  const [pickup_address, setPickupAddress] = useState('');
  const [pickup_lat] = useState('');
  const [pickup_lng] = useState('');
  const [dropoff_address, setDropoffAddress] = useState('');
  const [dropoff_lat] = useState('');
  const [dropoff_lng] = useState('');
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [passenger_name, setPassengerName] = useState('');
  const [passenger_phone, setPassengerPhone] = useState('');
  const [passenger_count, setPassengerCount] = useState(1);
  const [flight_number, setFlightNumber] = useState('');
  const [special_requests, setSpecialRequests] = useState('');
  const [promo_code, setPromoCode] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<any>(null);
  const [contact_id, setContactId] = useState('');
  const [crm_passenger_id, setCrmPassengerId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: serviceCities = [] } = useQuery({
    queryKey: ['service-cities'],
    queryFn: async () => {
      const res = await api.get('/tenants/me/service-cities');
      return res.data;
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!service_city_id) newErrors.service_city_id = 'Please select a city';
    if (!pickup_datetime) newErrors.pickup_datetime = 'Please select pickup date & time';
    if (!pickup_address) newErrors.pickup_address = 'Please enter pickup address';
    if (service_type === 'POINT_TO_POINT' && !dropoff_address)
      newErrors.dropoff_address = 'Please enter drop-off address';
    if (service_type === 'HOURLY_CHARTER' && !dropoff_address)
      newErrors.dropoff_address = 'Please enter drop-off address (driver needs route)';
    if (!passenger_name) newErrors.passenger_name = 'Please enter passenger name';
    if (!passenger_phone) newErrors.passenger_phone = 'Please enter passenger phone';
    if (trip_type === 'RETURN' && !return_datetime)
      newErrors.return_datetime = 'Please select return date & time';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetQuote = () => {
    if (!validate()) return;

    const city = serviceCities.find((c: any) => c.id === service_city_id);

    const params = new URLSearchParams({
      service_city_id,
      service_type,
      trip_type,
      pickup_datetime,
      pickup_address,
      pickup_lat: pickup_lat || '0',
      pickup_lng: pickup_lng || '0',
      dropoff_address,
      dropoff_lat: dropoff_lat || '0',
      dropoff_lng: dropoff_lng || '0',
      waypoints: JSON.stringify(waypoints),
      passenger_name,
      passenger_phone,
      passenger_count: passenger_count.toString(),
      flight_number,
      special_requests,
      promo_code,
      contact_id,
      crm_passenger_id,
      city_name: city?.city_name ?? '',
      timezone: city?.timezone ?? '',
      currency: city?.currency ?? 'AUD',
    });

    if (service_type === 'HOURLY_CHARTER') {
      params.set('duration_hours', duration_hours.toString());
    }
    if (trip_type === 'RETURN') {
      params.set('return_datetime', return_datetime);
    }

    router.push(`/book/quote?${params.toString()}`);
  };

  const addWaypoint = () => setWaypoints((prev) => [...prev, '']);
  const updateWaypoint = (index: number, value: string) =>
    setWaypoints((prev) => prev.map((w, i) => (i === index ? value : w)));
  const removeWaypoint = (index: number) =>
    setWaypoints((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Book a Ride</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in your trip details to get a quote
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            {/* Service City */}
            <div className="space-y-1">
              <Label>🏙️ Service City *</Label>
              <Select value={service_city_id} onValueChange={setServiceCityId}>
                <SelectTrigger className={errors.service_city_id ? 'border-red-400' : ''}>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCities.map((city: any) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.city_name} ({city.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.service_city_id && (
                <p className="text-xs text-red-500">{errors.service_city_id}</p>
              )}
            </div>

            {/* Service Type */}
            <div className="space-y-1">
              <Label>🚗 Service Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_TYPES.map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setServiceType(st.value)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      service_type === st.value
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trip Type */}
            <div className="space-y-1">
              <Label>🔄 Trip Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                {['ONE_WAY', 'RETURN'].map((tt) => (
                  <button
                    key={tt}
                    type="button"
                    onClick={() => setTripType(tt)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      trip_type === tt
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {tt === 'ONE_WAY' ? 'One Way' : 'Return Trip'}
                  </button>
                ))}
              </div>
            </div>

            {/* Pickup Date & Time */}
            <div className="space-y-1">
              <Label>
                <Clock size={14} className="inline mr-1" />
                Pickup Date & Time *
              </Label>
              <Input
                type="datetime-local"
                value={pickup_datetime}
                onChange={(e) => setPickupDatetime(e.target.value)}
                className={errors.pickup_datetime ? 'border-red-400' : ''}
              />
              {errors.pickup_datetime && (
                <p className="text-xs text-red-500">{errors.pickup_datetime}</p>
              )}
            </div>

            {/* Return Date & Time */}
            {trip_type === 'RETURN' && (
              <div className="space-y-1">
                <Label>
                  <Clock size={14} className="inline mr-1" />
                  Return Date & Time *
                </Label>
                <Input
                  type="datetime-local"
                  value={return_datetime}
                  onChange={(e) => setReturnDatetime(e.target.value)}
                  className={errors.return_datetime ? 'border-red-400' : ''}
                />
                {errors.return_datetime && (
                  <p className="text-xs text-red-500">{errors.return_datetime}</p>
                )}
              </div>
            )}

            {/* Duration Hours */}
            {service_type === 'HOURLY_CHARTER' && (
              <div className="space-y-1">
                <Label>⏱️ Duration *</Label>
                <div className="flex gap-2 flex-wrap">
                  {HOURS_OPTIONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDurationHours(h)}
                      className={`w-12 h-10 rounded-lg border text-sm font-medium transition-all ${
                        duration_hours === h
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {h}hr
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Flight Number */}
            <div className="space-y-1">
              <Label>
                <Plane size={14} className="inline mr-1" />
                Flight Number (optional)
              </Label>
              <Input
                value={flight_number}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                placeholder="QF1"
              />
            </div>

            {/* Pickup Address */}
            <div className="space-y-1">
              <Label>
                <MapPin size={14} className="inline mr-1" />
                Pickup Address *
              </Label>
              <Input
                value={pickup_address}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="SYD Terminal 3"
                className={errors.pickup_address ? 'border-red-400' : ''}
              />
              {errors.pickup_address && (
                <p className="text-xs text-red-500">{errors.pickup_address}</p>
              )}
            </div>

            {/* Waypoints */}
            {waypoints.map((wp, idx) => (
              <div key={idx} className="space-y-1">
                <Label>
                  <MapPin size={14} className="inline mr-1" />
                  Stop {idx + 1}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={wp}
                    onChange={(e) => updateWaypoint(idx, e.target.value)}
                    placeholder={`Waypoint ${idx + 1}`}
                  />
                  <Button size="sm" variant="ghost" onClick={() => removeWaypoint(idx)}>
                    <X size={14} className="text-red-400" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={addWaypoint}
              className="w-full border-dashed"
            >
              <Plus size={14} className="mr-1" />
              Add Stop
            </Button>

            {/* Dropoff Address */}
            <div className="space-y-1">
              <Label>
                <MapPin size={14} className="inline mr-1" />
                Drop-off Address *
              </Label>
              <Input
                value={dropoff_address}
                onChange={(e) => setDropoffAddress(e.target.value)}
                placeholder="Craig Ave, Vaucluse"
                className={errors.dropoff_address ? 'border-red-400' : ''}
              />
              {errors.dropoff_address && (
                <p className="text-xs text-red-500">{errors.dropoff_address}</p>
              )}
            </div>

            {/* CRM Search */}
            <div className="border-t pt-4 space-y-3">
              <div className="space-y-1">
                <Label>Contact (Who's booking)</Label>
                <ContactSearch
                  selected={selectedContact}
                  onSelect={(c) => {
                    setSelectedContact(c);
                    setContactId(c?.id ?? '');
                  }}
                  placeholder="Search existing contacts..."
                />
              </div>
              <div className="space-y-1">
                <Label>Passenger (Who's riding)</Label>
                <PassengerSearch
                  selected={selectedPassenger}
                  onSelect={(p) => {
                    setSelectedPassenger(p);
                    setCrmPassengerId(p?.id ?? '');
                    if (p) {
                      setPassengerName(`${p.first_name} ${p.last_name ?? ''}`.trim());
                      if (p.phone) setPassengerPhone(p.phone);
                    }
                  }}
                  placeholder="Search existing passengers..."
                />
              </div>
            </div>

            {/* Passenger Details */}
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">👤 Passenger Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Name *</Label>
                  <Input
                    value={passenger_name}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="John Smith"
                    className={errors.passenger_name ? 'border-red-400' : ''}
                  />
                  {errors.passenger_name && (
                    <p className="text-xs text-red-500">{errors.passenger_name}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label>Phone *</Label>
                  <Input
                    value={passenger_phone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    placeholder="+61400000000"
                    className={errors.passenger_phone ? 'border-red-400' : ''}
                  />
                  {errors.passenger_phone && (
                    <p className="text-xs text-red-500">{errors.passenger_phone}</p>
                  )}
                </div>
              </div>

              {/* Passenger Count */}
              <div className="space-y-1">
                <Label>
                  <Users size={14} className="inline mr-1" />
                  Passengers
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPassengerCount(n)}
                      className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all ${
                        passenger_count === n
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-1">
                <Label>Special Requests (optional)</Label>
                <Input
                  value={special_requests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Child seat, wheelchair accessible..."
                />
              </div>
            </div>

            {/* Promo Code */}
            <div className="space-y-1">
              <Label>🎟️ Promo Code (optional)</Label>
              <Input
                value={promo_code}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="SUMMER20"
                className="font-mono"
              />
            </div>

            {/* Submit */}
            <Button className="w-full" size="lg" onClick={handleGetQuote}>
              Get Quote
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
