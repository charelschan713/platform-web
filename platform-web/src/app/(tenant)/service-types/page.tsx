'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Power } from 'lucide-react';

const PLATFORM_TYPES = [
  { id: 'POINT_TO_POINT', name: 'Point to Point', base: 'Per KM' },
  { id: 'HOURLY_CHARTER', name: 'Hourly Charter', base: 'Per Hour' },
  { id: 'AIRPORT_PICKUP', name: 'Airport Pickup', base: 'Per KM' },
  { id: 'AIRPORT_DROPOFF', name: 'Airport Dropoff', base: 'Per KM' },
];

const EMPTY_FORM = {
  name: '',
  description: '',
  base_type: 'POINT_TO_POINT',
  surcharge_type: 'FIXED',
  surcharge_value: 0,
};

export default function ServiceTypesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ['service-types'],
    queryFn: async () => {
      const res = await api.get('/service-types');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/service-types', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-types'] });
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => api.patch(`/service-types/${editingId}`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-types'] });
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.patch(`/service-types/${id}`, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['service-types'] }),
  });

  const handleEdit = (st: any) => {
    setEditingId(st.id);
    setForm({
      name: st.name,
      description: st.description ?? '',
      base_type: st.base_type,
      surcharge_type: st.surcharge_type,
      surcharge_value: st.surcharge_value,
    });
    setShowForm(true);
  };

  const customTypes = data?.custom ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Types</h1>
          <p className="text-sm text-gray-500 mt-1">Platform defaults + your custom service types</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setForm(EMPTY_FORM);
            setShowForm(true);
          }}
        >
          <Plus size={16} className="mr-1" /> New Service Type
        </Button>
      </div>

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Platform Standard</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLATFORM_TYPES.map((pt) => (
            <Card key={pt.id} className="bg-gray-50 border-dashed">
              <CardContent className="p-3">
                <p className="font-semibold text-sm">{pt.name}</p>
                <p className="text-xs text-gray-400 mt-1">{pt.base}</p>
                <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full mt-2 inline-block">
                  Platform
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {showForm && (
        <Card className="border-2 border-gray-900">
          <CardContent className="p-5 space-y-4">
            <p className="font-bold">{editingId ? 'Edit Service Type' : 'New Service Type'}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Wedding, School Run, Road Show"
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
                <Label>Based On *</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.base_type}
                  onChange={(e) => setForm((p) => ({ ...p, base_type: e.target.value }))}
                >
                  <option value="POINT_TO_POINT">Point to Point (Per KM)</option>
                  <option value="HOURLY_CHARTER">Hourly Charter (Per Hour)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label>Surcharge Type</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.surcharge_type}
                  onChange={(e) => setForm((p) => ({ ...p, surcharge_type: e.target.value }))}
                >
                  <option value="FIXED">Fixed Amount ($)</option>
                  <option value="PERCENTAGE">Percentage (%)</option>
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <Label>
                  Surcharge Value{' '}
                  <span className="text-gray-400">({form.surcharge_type === 'FIXED' ? '$' : '%'})</span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={form.surcharge_type === 'FIXED' ? 1 : 0.1}
                  value={form.surcharge_value}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, surcharge_value: parseFloat(e.target.value || '0') }))
                  }
                  placeholder="0 = no surcharge"
                />
                <p className="text-xs text-gray-400">
                  {form.surcharge_type === 'FIXED'
                    ? `A fixed $${form.surcharge_value} will be added on top of the base fare`
                    : `${form.surcharge_value}% will be added on top of the base fare`}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={!form.name}
                onClick={() => (editingId ? updateMutation.mutate() : createMutation.mutate())}
              >
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
          Your Custom Types ({customTypes.length})
        </p>

        {isLoading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : customTypes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 space-y-2">
              <p className="text-3xl">🚗</p>
              <p className="text-gray-500 text-sm">No custom service types yet</p>
              <p className="text-xs text-gray-400">
                Add types like Wedding, School Run, Corporate Events
              </p>
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus size={14} className="mr-1" /> Create First Type
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customTypes.map((st: any) => (
              <Card key={st.id} className={!st.is_active ? 'opacity-50' : ''}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold">{st.name}</p>
                      {st.description && <p className="text-xs text-gray-400">{st.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(st)}>
                        <Pencil size={13} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={st.is_active ? 'text-red-400' : 'text-green-500'}
                        onClick={() => toggleMutation.mutate({ id: st.id, is_active: !st.is_active })}
                      >
                        <Power size={13} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                      Based on {st.base_type === 'POINT_TO_POINT' ? 'P2P' : 'Hourly'}
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      +
                      {st.surcharge_type === 'FIXED'
                        ? `$${st.surcharge_value}`
                        : `${st.surcharge_value}%`}{' '}
                      surcharge
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
