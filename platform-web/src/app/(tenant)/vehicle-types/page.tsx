'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Car } from 'lucide-react';

type TenantVehicle = {
  id: string;
  registration_plate: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  seats?: number;
  luggage_capacity?: number;
  is_active?: boolean;
};

type VehicleType = {
  id: string;
  type_name: string;
  description?: string;
  max_luggage: number;
  max_passengers?: number;
  base_fare: number;
  per_km_rate: number;
  per_minute_rate?: number;
  included_km_per_hour?: number;
  extra_km_rate?: number;
  hourly_rate: number;
  minimum_fare: number;
  currency: string;
  is_active: boolean;
  vehicles: {
    id: string;
    platform_vehicle: TenantVehicle;
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
  included_km_per_hour: 0,
  extra_km_rate: 0,
  hourly_rate: 0,
  minimum_fare: 0,
  currency: 'AUD',
  vehicle_ids: [] as string[],
};

export default function VehicleTypesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [vehicleSearch, setVehicleSearch] = useState('');

  const { data: vehicleTypes = [], isLoading } = useQuery<VehicleType[]>({
    queryKey: ['vehicle-types'],
    queryFn: async () => {
      const res = await api.get('/vehicle-types');
      return res.data;
    },
  });

  const { data: tenantVehicles = [] } = useQuery<TenantVehicle[]>({
    queryKey: ['tenant-vehicles'],
    queryFn: async () => {
      const res = await api.get('/tenant-vehicles');
      return res.data;
    },
  });

  const { data: assignedIds = [] } = useQuery<string[]>({
    queryKey: ['assigned-vehicle-ids'],
    queryFn: async () => {
      const res = await api.get('/vehicle-types/assigned-vehicles');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/vehicle-types', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
      queryClient.invalidateQueries({ queryKey: ['assigned-vehicle-ids'] });
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => api.patch(`/vehicle-types/${editingId}`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
      queryClient.invalidateQueries({ queryKey: ['assigned-vehicle-ids'] });
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicle-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
      queryClient.invalidateQueries({ queryKey: ['assigned-vehicle-ids'] });
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
      included_km_per_hour: vt.included_km_per_hour ?? 0,
      extra_km_rate: vt.extra_km_rate ?? 0,
      hourly_rate: vt.hourly_rate,
      minimum_fare: vt.minimum_fare,
      currency: vt.currency,
      vehicle_ids: vt.vehicles.map((v) => v.platform_vehicle.id),
    });
    setShowForm(true);
  };

  const toggleVehicle = (id: string) => {
    setForm((prev) => ({
      ...prev,
      vehicle_ids: prev.vehicle_ids.includes(id)
        ? prev.vehicle_ids.filter((v) => v !== id)
        : [...prev.vehicle_ids, id],
    }));
  };

  const eligibleVehicles = tenantVehicles.filter(
    (v: any) =>
      v.is_active &&
      (v.seats ?? 0) >= (form.max_passengers ?? 1) &&
      (v.luggage_capacity ?? 0) >= (form.max_luggage ?? 0),
  );

  const ineligibleVehicles = tenantVehicles.filter(
    (v: any) =>
      v.is_active &&
      ((v.seats ?? 0) < (form.max_passengers ?? 1) ||
        (v.luggage_capacity ?? 0) < (form.max_luggage ?? 0)),
  );

  const assignedVehicleIds = new Set(assignedIds);

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
            Create service tiers and assign vehicles from the platform library
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
                  onChange={(e) => setForm((p) => ({ ...p, max_luggage: parseInt(e.target.value) }))}
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
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.base_fare}
                    onChange={(e) => setForm((p) => ({ ...p, base_fare: parseFloat(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>
                    Per KM Rate ($)
                    <span className="text-xs text-gray-400 ml-1">0 = disabled</span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={form.per_km_rate}
                    onChange={(e) => setForm((p) => ({ ...p, per_km_rate: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label>
                    Per Minute Rate ($)
                    <span className="text-xs text-gray-400 ml-1">0 = disabled</span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.per_minute_rate ?? 0}
                    onChange={(e) => setForm((p) => ({ ...p, per_minute_rate: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label>
                    Included KM per Hour
                    <span className="text-xs text-gray-400 ml-1">0 = unlimited</span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={form.included_km_per_hour ?? 0}
                    onChange={(e) => setForm((p) => ({ ...p, included_km_per_hour: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Extra KM Rate ($)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={form.extra_km_rate ?? 0}
                    onChange={(e) => setForm((p) => ({ ...p, extra_km_rate: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Hourly Rate</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.hourly_rate}
                    onChange={(e) => setForm((p) => ({ ...p, hourly_rate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Minimum Fare</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.minimum_fare}
                    onChange={(e) => setForm((p) => ({ ...p, minimum_fare: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Assign Vehicles</p>
              <p className="text-xs text-gray-400 mb-1">
                Each vehicle can only belong to one type. Greyed out vehicles are already assigned.
              </p>
              <p className="text-xs text-gray-400 mb-3">
                ⚠️ Set Max Passengers and Max Luggage first to filter eligible vehicles
              </p>
              <Input
                placeholder="Search vehicles..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                className="mb-3"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {eligibleVehicles.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">
                    No vehicles match the requirements ({form.max_passengers}{' '}
                    passengers, {form.max_luggage} luggage)
                  </p>
                ) : (
                  eligibleVehicles
                    .filter(
                      (v: any) =>
                        !vehicleSearch ||
                        `${v.make} ${v.model} ${v.registration_plate}`
                          .toLowerCase()
                          .includes(vehicleSearch.toLowerCase()),
                    )
                    .map((v: any) => {
                      const isAssigned =
                        assignedVehicleIds.has(v.id) &&
                        !form.vehicle_ids?.includes(v.id);
                      const isSelected = form.vehicle_ids?.includes(v.id);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={isAssigned}
                          onClick={() => toggleVehicle(v.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                            isSelected
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : isAssigned
                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <span>🚗</span>
                          <span>
                            {v.make} {v.model}
                          </span>
                          <span className="text-xs opacity-60">
                            {v.registration_plate}
                          </span>
                          <span className="text-xs opacity-60">
                            👥{v.seats} 🧳{v.luggage_capacity}
                          </span>
                        </button>
                      );
                    })
                )}
              </div>
              {ineligibleVehicles.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-gray-400 mb-1">
                    Not eligible (insufficient seats or luggage):
                  </p>
                  {ineligibleVehicles.map((v: any) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-300"
                    >
                      <span>🚗</span>
                      <span>
                        {v.make} {v.model}
                      </span>
                      <span>{v.registration_plate}</span>
                      <span className="text-red-300">
                        👥{v.seats} 🧳{v.luggage_capacity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {form.vehicle_ids.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {form.vehicle_ids.length} vehicle(s) selected
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

                <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 rounded-lg p-3">
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

                <div>
                  <p className="text-xs text-gray-400 mb-2">VEHICLES ({vt.vehicles.length})</p>
                  {vt.vehicles.length === 0 ? (
                    <p className="text-xs text-gray-300">No vehicles assigned</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {vt.vehicles.map((v) => (
                        <span
                          key={v.id}
                          className="text-xs bg-gray-100 px-2 py-0.5 rounded-full"
                        >
                          {v.platform_vehicle.make} {v.platform_vehicle.model}
                        </span>
                      ))}
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
