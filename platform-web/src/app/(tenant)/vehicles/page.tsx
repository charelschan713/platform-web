'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Car } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

const emptyForm = {
  registration_plate: '',
  make: '',
  model: '',
  year: CURRENT_YEAR,
  color: '',
  seats: 4,
  luggage_capacity: 2,
  notes: '',
};

export default function VehiclesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['tenant-vehicles'],
    queryFn: async () => {
      const res = await api.get('/tenant-vehicles');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/tenant-vehicles', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-vehicles'] });
      setForm(emptyForm);
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => api.patch(`/tenant-vehicles/${editingId}`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-vehicles'] });
      setEditingId(null);
      setShowForm(false);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tenant-vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-vehicles'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/tenant-vehicles/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-vehicles'] });
    },
  });

  const filtered = vehicles.filter(
    (v: any) =>
      !search ||
      `${v.make} ${v.model} ${v.registration_plate} ${v.color}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const handleEdit = (v: any) => {
    setForm({
      registration_plate: v.registration_plate,
      make: v.make,
      model: v.model,
      year: v.year ?? CURRENT_YEAR,
      color: v.color ?? '',
      seats: v.seats ?? 4,
      luggage_capacity: v.luggage_capacity ?? 2,
      notes: v.notes ?? '',
    });
    setEditingId(v.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Vehicles</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your fleet</p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
        >
          <Plus size={16} className="mr-1" /> Add Vehicle
        </Button>
      </div>

      <Input
        placeholder="Search by plate, make, model..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {showForm && (
        <Card className="border-2 border-gray-900">
          <CardContent className="p-6 space-y-4">
            <p className="font-bold text-lg">
              {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Registration Plate *</Label>
                <Input
                  value={form.registration_plate}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      registration_plate: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. ABC123"
                />
              </div>

              <div className="space-y-1">
                <Label>Year</Label>
                <Input
                  type="number"
                  min={2000}
                  max={CURRENT_YEAR + 1}
                  value={form.year}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      year: parseInt(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Make *</Label>
                <Input
                  value={form.make}
                  onChange={(e) => setForm((p) => ({ ...p, make: e.target.value }))}
                  placeholder="e.g. Mercedes-Benz"
                />
              </div>

              <div className="space-y-1">
                <Label>Model *</Label>
                <Input
                  value={form.model}
                  onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
                  placeholder="e.g. V-Class"
                />
              </div>

              <div className="space-y-1">
                <Label>Color</Label>
                <Input
                  value={form.color}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                  placeholder="e.g. Obsidian Black"
                />
              </div>

              <div className="space-y-1">
                <Label>Seats</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={form.seats}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, seats: parseInt(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Luggage Capacity</Label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={form.luggage_capacity}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      luggage_capacity: parseInt(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-1 col-span-2">
                <Label>Notes</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Internal notes (optional)"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={!form.registration_plate || !form.make || !form.model}
                onClick={handleSubmit}
              >
                {editingId ? 'Save Changes' : 'Add Vehicle'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Car size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No vehicles yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Add your first vehicle to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v: any) => (
            <Card key={v.id} className={!v.is_active ? 'opacity-50' : ''}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-lg">
                      {v.make} {v.model}
                    </p>
                    <p className="text-sm text-gray-500">
                      {v.year} • {v.color}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      v.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {v.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded-md font-mono font-bold">
                    {v.registration_plate}
                  </span>
                  <span>👥 {v.seats} seats</span>
                  <span>🧳 {v.luggage_capacity}</span>
                </div>

                {v.notes && <p className="text-xs text-gray-400">{v.notes}</p>}

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(v)}
                  >
                    <Pencil size={12} className="mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleMutation.mutate(v.id)}
                  >
                    {v.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400"
                    onClick={() => deleteMutation.mutate(v.id)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
