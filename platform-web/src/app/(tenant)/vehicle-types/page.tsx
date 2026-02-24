'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import platformApi from '@/lib/platformApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2 } from 'lucide-react';

type PlatformVehicle = {
  id: string;
  make: string;
  model: string;
  images?: string[];
};

type VehicleTypeExtra = {
  id: string;
  name: string;
  description?: string;
  category: 'BABY_SEAT' | 'AMENITY' | 'OTHER';
  price: number;
  max_quantity: number;
};

type VehicleType = {
  include_tolls?: boolean;
  id: string;
  type_name: string;
  description?: string;
  max_luggage: number;
  max_passengers?: number;
  base_fare: number;
  per_km_rate: number;
  per_minute_rate?: number;
  pricing_model?: 'STRAIGHT' | 'INCLUDED';
  included_km?: number;
  included_minutes?: number;
  extra_km_rate?: number;
  extra_minute_rate?: number;
  waiting_rate?: number;
  hourly_included_km?: number;
  min_booking_hours?: number;
  free_waiting_standard?: number;
  free_waiting_domestic?: number;
  free_waiting_international?: number;
  waypoint_fee?: number;
  waypoint_fee_type?: 'FIXED' | 'PERCENTAGE';
  baby_seat_infant_fee?: number;
  baby_seat_convertible_fee?: number;
  baby_seat_booster_fee?: number;
  max_baby_seats?: number | null;
  hourly_rate: number;
  minimum_fare: number;
  currency: string;
  is_active: boolean;
  requirements?: {
    id: string;
    platform_vehicle: PlatformVehicle;
  }[];
};

const EMPTY_FORM = {
  type_name: '',
  description: '',
  max_luggage: 2,
  max_passengers: 4,
  base_fare: 0,
  per_km_rate: 0,
  per_minute_rate: 0,
  pricing_model: 'STRAIGHT' as 'STRAIGHT' | 'INCLUDED',
  included_km: 10,
  included_minutes: 30,
  extra_km_rate: 0,
  extra_minute_rate: 0,
  waiting_rate: 0,
  hourly_rate: 0,
  hourly_included_km: 20,
  min_booking_hours: 1,
  free_waiting_standard: 15,
  free_waiting_domestic: 30,
  free_waiting_international: 60,
  waypoint_fee: 0,
  waypoint_fee_type: 'FIXED' as 'FIXED' | 'PERCENTAGE',
  baby_seat_infant_fee: 0,
  baby_seat_convertible_fee: 0,
  baby_seat_booster_fee: 0,
  max_baby_seats: '',
  minimum_fare: 0,
  currency: 'AUD',
  include_tolls: true,
  required_platform_vehicle_ids: [] as string[],
};

export default function VehicleTypesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [extraForm, setExtraForm] = useState({
    name: '',
    description: '',
    category: 'OTHER',
    price: 0,
    max_quantity: 1,
  });

  const { data: vehicleTypes = [], isLoading } = useQuery<VehicleType[]>({
    queryKey: ['vehicle-types'],
    queryFn: async () => {
      const res = await api.get('/vehicle-types');
      return res.data;
    },
  });

  const { data: platformVehicles = [] } = useQuery<PlatformVehicle[]>({
    queryKey: ['platform-vehicles'],
    queryFn: async () => {
      const res = await platformApi.get('/platform-vehicles');
      return res.data;
    },
  });

  const { data: extras = [] } = useQuery<VehicleTypeExtra[]>({
    queryKey: ['vehicle-type-extras', selectedTypeId],
    queryFn: async () => {
      if (!selectedTypeId) return [];
      const res = await api.get(`/vehicle-types/${selectedTypeId}/extras`);
      return res.data;
    },
    enabled: !!selectedTypeId,
  });

  const toPayload = () => ({
    ...form,
    max_baby_seats:
      form.max_baby_seats === '' || form.max_baby_seats === null
        ? null
        : parseInt(String(form.max_baby_seats), 10) || 0,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/vehicle-types', toPayload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => api.patch(`/vehicle-types/${editingId}`, toPayload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicle-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
    },
  });

  const createExtraMutation = useMutation({
    mutationFn: () => api.post(`/vehicle-types/${selectedTypeId}/extras`, extraForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-type-extras', selectedTypeId] });
      setExtraForm({
        name: '',
        description: '',
        category: 'OTHER',
        price: 0,
        max_quantity: 1,
      });
    },
  });

  const deleteExtraMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicle-types/extras/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-type-extras', selectedTypeId] });
    },
  });

  const handleEdit = (vt: VehicleType) => {
    setEditingId(vt.id);
    setForm({
      type_name: vt.type_name,
      description: vt.description ?? '',
      max_luggage: vt.max_luggage,
      max_passengers: vt.max_passengers ?? 4,
      base_fare: vt.base_fare,
      per_km_rate: vt.per_km_rate,
      per_minute_rate: vt.per_minute_rate ?? 0,
      pricing_model: vt.pricing_model ?? 'STRAIGHT',
      included_km: vt.included_km ?? 10,
      included_minutes: vt.included_minutes ?? 30,
      extra_km_rate: vt.extra_km_rate ?? 0,
      extra_minute_rate: vt.extra_minute_rate ?? 0,
      waiting_rate: vt.waiting_rate ?? 0,
      hourly_rate: vt.hourly_rate ?? 0,
      hourly_included_km: vt.hourly_included_km ?? 20,
      min_booking_hours: vt.min_booking_hours ?? 1,
      free_waiting_standard: vt.free_waiting_standard ?? 15,
      free_waiting_domestic: vt.free_waiting_domestic ?? 30,
      free_waiting_international: vt.free_waiting_international ?? 60,
      waypoint_fee: vt.waypoint_fee ?? 0,
      waypoint_fee_type: vt.waypoint_fee_type ?? 'FIXED',
      baby_seat_infant_fee: vt.baby_seat_infant_fee ?? 0,
      baby_seat_convertible_fee: vt.baby_seat_convertible_fee ?? 0,
      baby_seat_booster_fee: vt.baby_seat_booster_fee ?? 0,
      max_baby_seats:
        vt.max_baby_seats === null || vt.max_baby_seats === undefined
          ? ''
          : String(vt.max_baby_seats),
      minimum_fare: vt.minimum_fare,
      currency: vt.currency,
      include_tolls: vt.include_tolls ?? true,
      required_platform_vehicle_ids: (vt.requirements ?? []).map(
        (r) => r.platform_vehicle.id,
      ),
    });
    setShowForm(true);
  };

  const togglePlatformVehicle = (id: string) => {
    setForm((p) => ({
      ...p,
      required_platform_vehicle_ids: p.required_platform_vehicle_ids.includes(id)
        ? p.required_platform_vehicle_ids.filter((v) => v !== id)
        : [...p.required_platform_vehicle_ids, id],
    }));
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicle Types</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create service tiers based on platform vehicle standards
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setForm(EMPTY_FORM);
            setShowForm(true);
          }}
        >
          <Plus size={16} className="mr-1" /> New Type
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-gray-900">
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Edit Vehicle Type' : 'New Vehicle Type'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <Label>Type Name *</Label>
                <Input
                  value={form.type_name}
                  onChange={(e) => setForm((p) => ({ ...p, type_name: e.target.value }))}
                  placeholder="e.g. Premium, Business, Standard"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
              <div className="space-y-1">
                <Label>Max Luggage *</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.max_luggage}
                  onChange={(e) => setForm((p) => ({ ...p, max_luggage: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Max Passengers *</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={form.max_passengers ?? 4}
                  onChange={(e) => setForm((p) => ({ ...p, max_passengers: parseInt(e.target.value) || 4 }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Currency</Label>
                <Input
                  value={form.currency}
                  onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                  placeholder="AUD"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-3">Pricing</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Base Fare</Label>
                  <Input type="number" min={0} step={0.01} value={form.base_fare} onChange={(e) => setForm((p) => ({ ...p, base_fare: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-1">
                  <Label>Per KM Rate ($)</Label>
                  <Input type="number" min={0} step={0.1} value={form.per_km_rate} onChange={(e) => setForm((p) => ({ ...p, per_km_rate: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-1">
                  <Label>Per Minute Rate ($)</Label>
                  <Input type="number" min={0} step={0.01} value={form.per_minute_rate ?? 0} onChange={(e) => setForm((p) => ({ ...p, per_minute_rate: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-1">
                  <Label>Minimum Fare</Label>
                  <Input type="number" min={0} step={0.01} value={form.minimum_fare} onChange={(e) => setForm((p) => ({ ...p, minimum_fare: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <p className="text-sm font-bold">Pricing Model</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="STRAIGHT" checked={form.pricing_model === 'STRAIGHT'} onChange={() => setForm((p) => ({ ...p, pricing_model: 'STRAIGHT' }))} />
                  <div><p className="text-sm font-medium">Straight</p><p className="text-xs text-gray-400">Per km/min from start</p></div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="INCLUDED" checked={form.pricing_model === 'INCLUDED'} onChange={() => setForm((p) => ({ ...p, pricing_model: 'INCLUDED' }))} />
                  <div><p className="text-sm font-medium">Included</p><p className="text-xs text-gray-400">Base includes X km + X min</p></div>
                </label>
              </div>

              {form.pricing_model === 'INCLUDED' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-muted rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-xs">Included KM</Label>
                    <Input type="number" min={0} value={form.included_km} onChange={(e) => setForm((p) => ({ ...p, included_km: parseInt(e.target.value, 10) || 0 }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Included Minutes</Label>
                    <Input type="number" min={0} value={form.included_minutes} onChange={(e) => setForm((p) => ({ ...p, included_minutes: parseInt(e.target.value, 10) || 0 }))} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Extra KM Rate ($)</Label>
                  <Input type="number" min={0} step={0.01} value={form.extra_km_rate} onChange={(e) => setForm((p) => ({ ...p, extra_km_rate: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Extra Min Rate ($)</Label>
                  <Input type="number" min={0} step={0.01} value={form.extra_minute_rate} onChange={(e) => setForm((p) => ({ ...p, extra_minute_rate: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Waiting Rate ($/min)</Label>
                  <Input type="number" min={0} step={0.01} value={form.waiting_rate} onChange={(e) => setForm((p) => ({ ...p, waiting_rate: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-bold">Hourly Charter</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">Hourly Rate ($)</Label><Input type="number" min={0} step={0.01} value={form.hourly_rate} onChange={(e) => setForm((p) => ({ ...p, hourly_rate: parseFloat(e.target.value) || 0 }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Included KM/Hour</Label><Input type="number" min={0} value={form.hourly_included_km} onChange={(e) => setForm((p) => ({ ...p, hourly_included_km: parseInt(e.target.value, 10) || 0 }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Min Booking Hours</Label><Input type="number" min={1} value={form.min_booking_hours} onChange={(e) => setForm((p) => ({ ...p, min_booking_hours: parseInt(e.target.value, 10) || 1 }))} /></div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-bold">Free Waiting Time</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">Standard (min)</Label><Input type="number" min={0} value={form.free_waiting_standard} onChange={(e) => setForm((p) => ({ ...p, free_waiting_standard: parseInt(e.target.value, 10) || 0 }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Domestic Airport (min)</Label><Input type="number" min={0} value={form.free_waiting_domestic} onChange={(e) => setForm((p) => ({ ...p, free_waiting_domestic: parseInt(e.target.value, 10) || 0 }))} /></div>
                <div className="space-y-1"><Label className="text-xs">International Airport (min)</Label><Input type="number" min={0} value={form.free_waiting_international} onChange={(e) => setForm((p) => ({ ...p, free_waiting_international: parseInt(e.target.value, 10) || 0 }))} /></div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-bold">Baby Seat Fees</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">Infant 0-12m ($)</Label><Input type="number" min={0} step={0.01} value={form.baby_seat_infant_fee} onChange={(e) => setForm((p) => ({ ...p, baby_seat_infant_fee: parseFloat(e.target.value) || 0 }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Convertible 1-4y ($)</Label><Input type="number" min={0} step={0.01} value={form.baby_seat_convertible_fee} onChange={(e) => setForm((p) => ({ ...p, baby_seat_convertible_fee: parseFloat(e.target.value) || 0 }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Booster 4-8y ($)</Label><Input type="number" min={0} step={0.01} value={form.baby_seat_booster_fee} onChange={(e) => setForm((p) => ({ ...p, baby_seat_booster_fee: parseFloat(e.target.value) || 0 }))} /></div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max Baby Seats (empty = max_passengers - 1)</Label>
                <Input type="number" min={0} value={form.max_baby_seats} onChange={(e) => setForm((p) => ({ ...p, max_baby_seats: e.target.value }))} placeholder="Auto" className="max-w-32" />
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-bold">Waypoint Fee</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Fee per Stop</Label>
                  <Input type="number" min={0} step={0.01} value={form.waypoint_fee} onChange={(e) => setForm((p) => ({ ...p, waypoint_fee: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fee Type</Label>
                  <select value={form.waypoint_fee_type} onChange={(e) => setForm((p) => ({ ...p, waypoint_fee_type: e.target.value as 'FIXED' | 'PERCENTAGE' }))} className="w-full border rounded px-3 py-2 text-sm">
                    <option value="FIXED">Fixed ($)</option>
                    <option value="PERCENTAGE">% of Base Fare</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-sm font-medium">Include Tolls in Quote</p>
                <p className="text-xs text-gray-400">
                  Show estimated toll charges to customers
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, include_tolls: !p.include_tolls }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.include_tolls ? 'bg-black' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${
                    form.include_tolls ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <Label>
                Accepted Vehicle Models
                <span className="text-xs text-gray-400 ml-2">
                  Select which platform vehicles can fulfil this type
                </span>
              </Label>

              {form.required_platform_vehicle_ids.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2 border-b">
                  {form.required_platform_vehicle_ids.map((id: string) => {
                    const pv = platformVehicles.find((v: any) => v.id === id);
                    if (!pv) return null;
                    return (
                      <span
                        key={id}
                        className="flex items-center gap-1 bg-gray-900 text-white text-xs px-2 py-1 rounded-full"
                      >
                        🚗 {pv.make} {pv.model}
                        <button
                          type="button"
                          onClick={() => togglePlatformVehicle(id)}
                          className="ml-1 hover:text-gray-300"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <Input
                placeholder="Search vehicle models..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
              />

              <div className="max-h-64 overflow-y-auto space-y-3 border rounded-lg p-3">
                {(() => {
                  const groupedByMake = platformVehicles.reduce((acc: any, pv: any) => {
                    if (!acc[pv.make]) acc[pv.make] = [];
                    acc[pv.make].push(pv);
                    return acc;
                  }, {});
                  const makes = Object.keys(groupedByMake).sort();
                  return makes
                    .filter(
                      (make) =>
                        !vehicleSearch ||
                        make.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                        groupedByMake[make].some((pv: any) =>
                          pv.model.toLowerCase().includes(vehicleSearch.toLowerCase()),
                        ),
                    )
                    .map((make) => {
                      const vehicles = groupedByMake[make].filter(
                        (pv: any) =>
                          !vehicleSearch ||
                          make.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                          pv.model.toLowerCase().includes(vehicleSearch.toLowerCase()),
                      );
                      return (
                        <div key={make} className="space-y-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            {make}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {vehicles.map((pv: any) => {
                              const isSelected =
                                form.required_platform_vehicle_ids.includes(pv.id);
                              return (
                                <button
                                  key={pv.id}
                                  type="button"
                                  onClick={() => togglePlatformVehicle(pv.id)}
                                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                                    isSelected
                                      ? 'bg-gray-900 text-white border-gray-900'
                                      : 'border-gray-200 hover:border-gray-400 text-gray-700'
                                  }`}
                                >
                                  {pv.model}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>

              {form.required_platform_vehicle_ids.length > 0 && (
                <p className="text-xs text-gray-400">
                  {form.required_platform_vehicle_ids.length} model(s) selected
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!form.type_name || isPending}
              >
                {isPending ? 'Saving...' : editingId ? 'Update Type' : 'Create Type'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : vehicleTypes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16 space-y-3">
            <p className="text-4xl">🚗</p>
            <p className="font-semibold text-gray-600">No vehicle types yet</p>
            <p className="text-sm text-gray-400">
              Create your first vehicle type to start taking bookings
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus size={14} className="mr-1" /> Create Vehicle Type
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicleTypes.map((vt) => (
            <Card key={vt.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{vt.type_name}</h3>
                    {vt.description && (
                      <p className="text-sm text-gray-500">{vt.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(vt)}>
                      <Pencil size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400"
                      onClick={() => {
                        if (confirm(`Delete ${vt.type_name}?`)) {
                          deleteMutation.mutate(vt.id);
                        }
                      }}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm bg-muted rounded-lg p-3">
                  <div>
                    <p className="text-xs text-gray-400">Base Fare</p>
                    <p className="font-semibold">{vt.currency} ${vt.base_fare?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Per KM</p>
                    <p className="font-semibold">{vt.currency} ${vt.per_km_rate?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Hourly</p>
                    <p className="font-semibold">{vt.currency} ${vt.hourly_rate?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Min Fare</p>
                    <p className="font-semibold">{vt.currency} ${vt.minimum_fare?.toFixed(2)}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-500">👥 Max {vt.max_passengers ?? 4} passengers · 🧳 Max {vt.max_luggage} luggage</p>

                {vt.requirements && vt.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {vt.requirements.map((r: any) => (
                      <span
                        key={r.id}
                        className="text-xs bg-muted px-2 py-0.5 rounded-full"
                      >
                        🚗 {r.platform_vehicle.make} {r.platform_vehicle.model}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 border-t pt-3">
                  <button
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    onClick={() =>
                      setSelectedTypeId(selectedTypeId === vt.id ? null : vt.id)
                    }
                  >
                    <Plus size={12} /> Manage Extras {selectedTypeId === vt.id ? ' ▲' : ' ▼'}
                  </button>

                  {selectedTypeId === vt.id && (
                    <div className="mt-3 space-y-3">
                      {extras.length > 0 && (
                        <div className="space-y-2">
                          {extras.map((e: any) => (
                            <div
                              key={e.id}
                              className="flex items-center justify-between text-sm bg-muted px-3 py-2 rounded-lg"
                            >
                              <div>
                                <span className="font-medium">{e.name}</span>
                                <span
                                  className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                                    e.category === 'BABY_SEAT'
                                      ? 'bg-blue-100 text-blue-700'
                                      : e.category === 'AMENITY'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-muted text-gray-600'
                                  }`}
                                >
                                  {e.category}
                                </span>
                                {e.max_quantity > 1 && (
                                  <span className="ml-1 text-xs text-gray-400">
                                    max {e.max_quantity}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">+${e.price}</span>
                                <button
                                  className="text-red-400 hover:text-red-600"
                                  onClick={() => deleteExtraMutation.mutate(e.id)}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="border rounded-lg p-3 space-y-2 bg-card">
                        <p className="text-xs font-medium text-gray-600">Add Extra Option</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Name *"
                            className="text-xs h-8"
                            value={extraForm.name}
                            onChange={(e) =>
                              setExtraForm((p: any) => ({ ...p, name: e.target.value }))
                            }
                          />
                          <select
                            className="border rounded-md px-2 py-1 text-xs"
                            value={extraForm.category}
                            onChange={(e) =>
                              setExtraForm((p: any) => ({ ...p, category: e.target.value }))
                            }
                          >
                            <option value="BABY_SEAT">Baby Seat</option>
                            <option value="AMENITY">Amenity</option>
                            <option value="OTHER">Other</option>
                          </select>
                          <Input
                            type="number"
                            placeholder="Price $"
                            className="text-xs h-8"
                            min={0}
                            value={extraForm.price}
                            onChange={(e) =>
                              setExtraForm((p: any) => ({
                                ...p,
                                price: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Max qty"
                            className="text-xs h-8"
                            min={1}
                            value={extraForm.max_quantity}
                            onChange={(e) =>
                              setExtraForm((p: any) => ({
                                ...p,
                                max_quantity: parseInt(e.target.value) || 1,
                              }))
                            }
                          />
                          <Input
                            placeholder="Description (optional)"
                            className="text-xs h-8 col-span-2"
                            value={extraForm.description}
                            onChange={(e) =>
                              setExtraForm((p: any) => ({
                                ...p,
                                description: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <Button
                          size="sm"
                          className="w-full h-8 text-xs"
                          disabled={!extraForm.name}
                          onClick={() => createExtraMutation.mutate()}
                        >
                          Add Extra
                        </Button>
                      </div>
                    </div>
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
