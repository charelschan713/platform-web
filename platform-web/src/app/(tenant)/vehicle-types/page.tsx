'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PLATFORM_CLASSES = [
  { code: 'BUSINESS', label: 'Business Class', icon: '🚗' },
  { code: 'FIRST', label: 'First Class', icon: '🏆' },
  { code: 'VAN', label: 'Van / MPV', icon: '🚐' },
  { code: 'ELECTRIC', label: 'Electric', icon: '⚡' },
];

export default function VehicleTypesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const { data: types = [] } = useQuery({
    queryKey: ['vehicle-types'],
    queryFn: async () => {
      const res = await api.get('/tenants/me/vehicle-types');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/tenants/me/vehicle-types', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/tenants/me/vehicle-types/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tenants/me/vehicle-types/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicle-types'] }),
  });

  const resetForm = () => {
    setOpen(false);
    setEditing(null);
    setName('');
    setDescription('');
    setSelectedClasses([]);
  };

  const openEdit = (type: any) => {
    setEditing(type);
    setName(type.name);
    setDescription(type.description ?? '');
    setSelectedClasses(type.allowed_platform_classes);
    setOpen(true);
  };

  const toggleClass = (code: string) => {
    setSelectedClasses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const handleSave = () => {
    const payload = {
      name,
      description,
      allowed_platform_classes: selectedClasses,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicle Types</h1>
          <p className="text-sm text-gray-500 mt-1">
            Define your service categories and map to platform vehicle classes
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} className="mr-2" /> Add Vehicle Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">
            Platform Standard Classes
          </CardTitle>
          <CardDescription>
            These are the platform&apos;s standard vehicle categories. Map your custom
            types to these.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PLATFORM_CLASSES.map((pc) => (
              <div key={pc.code} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                <span className="text-xl">{pc.icon}</span>
                <div>
                  <p className="text-xs font-semibold">{pc.code}</p>
                  <p className="text-xs text-gray-400">{pc.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {types.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <p className="text-4xl mb-4">🚗</p>
            <p className="font-medium text-gray-600">No vehicle types yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first vehicle type to start accepting bookings
            </p>
            <Button className="mt-4" onClick={() => setOpen(true)}>
              <Plus size={16} className="mr-2" /> Add Vehicle Type
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {types.map((type: any) => (
            <Card key={type.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{type.name}</h3>
                      {!type.is_active && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    {type.description && (
                      <p className="text-sm text-gray-500">{type.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400">Served by:</span>
                      {type.allowed_platform_classes.map((cls: string) => {
                        const pc = PLATFORM_CLASSES.find((p) => p.code === cls);
                        return (
                          <span
                            key={cls}
                            className="flex items-center gap-1 text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full"
                          >
                            {pc?.icon} {cls}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(type)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(type.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) resetForm();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Vehicle Type' : 'Add Vehicle Type'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Luxury Sedan, Airport Transfer"
              />
            </div>
            <div className="space-y-1">
              <Label>Description (optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Premium door-to-door service"
              />
            </div>
            <div className="space-y-2">
              <Label>
                Served by Platform Classes *
                <span className="text-gray-400 font-normal ml-1">(select all that apply)</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORM_CLASSES.map((pc) => {
                  const selected = selectedClasses.includes(pc.code);
                  return (
                    <button
                      key={pc.code}
                      type="button"
                      onClick={() => toggleClass(pc.code)}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                        selected
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 hover:border-gray-400 bg-white'
                      }`}
                    >
                      <span className="text-lg">{pc.icon}</span>
                      <div>
                        <p className="text-xs font-semibold">{pc.code}</p>
                        <p className={`text-xs ${selected ? 'text-gray-300' : 'text-gray-400'}`}>
                          {pc.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedClasses.length === 0 && (
                <p className="text-xs text-red-500">⚠️ Select at least one platform class</p>
              )}
            </div>
            <Button
              className="w-full"
              disabled={
                !name ||
                selectedClasses.length === 0 ||
                createMutation.isPending ||
                updateMutation.isPending
              }
              onClick={handleSave}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editing
                ? 'Save Changes'
                : 'Create Vehicle Type'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
