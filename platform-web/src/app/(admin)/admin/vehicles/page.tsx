'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Power } from 'lucide-react';

type PlatformVehicle = {
  id: string;
  make: string;
  model: string;
  images: string[];
  is_active: boolean;
  created_at: string;
};

export default function AdminVehiclesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const { data: vehicles = [], isLoading } = useQuery<PlatformVehicle[]>({
    queryKey: ['platform-vehicles-admin', showInactive],
    queryFn: async () => {
      const res = await api.get('/platform-vehicles', {
        params: { include_inactive: showInactive },
      });
      return res.data;
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['vehicle-requests'],
    queryFn: async () => {
      try {
        const res = await api.get('/platform-vehicles/requests');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/platform-vehicles', { make, model }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-vehicles-admin'] });
      setShowForm(false);
      setMake('');
      setModel('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/platform-vehicles/${id}`, { make, model }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-vehicles-admin'] });
      setShowForm(false);
      setEditingId(null);
      setMake('');
      setModel('');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.patch(`/platform-vehicles/${id}`, { is_active }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['platform-vehicles-admin'] }),
  });

  const approveRequestMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/platform-vehicles/requests/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-requests'] });
      queryClient.invalidateQueries({ queryKey: ['platform-vehicles-admin'] });
    },
  });

  const filtered = vehicles.filter((v) =>
    `${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (v: PlatformVehicle) => {
    setEditingId(v.id);
    setMake(v.make);
    setModel(v.model);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Vehicle Library</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the global list of vehicles available to all tenants
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setMake('');
            setModel('');
            setShowForm(true);
          }}
        >
          <Plus size={16} className="mr-1" /> Add Vehicle
        </Button>
      </div>

      {requests.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-base text-orange-800">
              ⏳ Pending Vehicle Requests ({requests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {requests.map((r: any) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-white rounded-lg p-3"
              >
                <div>
                  <p className="font-medium text-sm">
                    {r.make} {r.model}
                  </p>
                  <p className="text-xs text-gray-400">Requested by driver</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveRequestMutation.mutate(r.id)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card className="border-2 border-gray-900">
          <CardContent className="p-4 space-y-3">
            <p className="font-semibold">{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Make *</Label>
                <Input value={make} onChange={(e) => setMake(e.target.value)} placeholder="Mercedes-Benz" />
              </div>
              <div className="space-y-1">
                <Label>Model *</Label>
                <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="S-Class" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={!make || !model}
                onClick={() =>
                  editingId ? updateMutation.mutate(editingId) : createMutation.mutate()
                }
              >
                {editingId ? 'Update' : 'Add Vehicle'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 items-center">
        <Input
          placeholder="Search vehicles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Show inactive
        </label>
        <p className="text-sm text-gray-400 ml-auto">{filtered.length} vehicles</p>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((v) => (
            <Card key={v.id} className={!v.is_active ? 'opacity-50' : ''}>
              <CardContent className="p-3 space-y-2">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  {v.images?.[0] ? (
                    <img
                      src={v.images[0]}
                      alt={`${v.make} ${v.model}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-3xl">🚗</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{v.make}</p>
                  <p className="text-sm text-gray-500">{v.model}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="flex-1" onClick={() => handleEdit(v)}>
                    <Pencil size={12} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`flex-1 ${v.is_active ? 'text-red-400' : 'text-green-500'}`}
                    onClick={() => toggleMutation.mutate({ id: v.id, is_active: !v.is_active })}
                  >
                    <Power size={12} />
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
