'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Edit2, Check } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const PLATFORM_CLASSES = [
  { code: 'BUSINESS', label: 'Business Class', icon: '🚗' },
  { code: 'FIRST', label: 'First Class', icon: '🏆' },
  { code: 'VAN', label: 'Van / MPV', icon: '🚐' },
  { code: 'ELECTRIC', label: 'Electric', icon: '⚡' },
];

interface VehicleType {
  id: string;
  name: string;
  description: string | null;
  allowed_platform_classes: string[];
  sort_order: number;
  is_active: boolean;
}

export default function VehicleTypesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  // 获取平台车型
  const { data: platformClasses = [] } = useQuery({
    queryKey: ['platform-classes'],
    queryFn: async () => {
      const res = await api.get('/tenants/vehicle-classes');
      return res.data;
    },
  });

  // 获取租户自定义车型
  const { data: vehicleTypes = [], isLoading } = useQuery<VehicleType[]>({
    queryKey: ['vehicle-types'],
    queryFn: async () => {
      const res = await api.get('/tenants/me/vehicle-types');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (dto: any) => api.post('/tenants/me/vehicle-types', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      api.patch(`/tenants/me/vehicle-types/${id}`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/tenants/me/vehicle-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
    },
  });

  function resetForm() {
    setDialogOpen(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setSelectedClasses([]);
  }

  function openCreate() {
    resetForm();
    setDialogOpen(true);
  }

  function openEdit(vt: VehicleType) {
    setEditingId(vt.id);
    setName(vt.name);
    setDescription(vt.description ?? '');
    setSelectedClasses(vt.allowed_platform_classes);
    setDialogOpen(true);
  }

  function toggleClass(code: string) {
    setSelectedClasses((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code],
    );
  }

  function handleSubmit() {
    const dto = {
      name,
      description: description || undefined,
      allowed_platform_classes: selectedClasses,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, dto });
    } else {
      createMutation.mutate(dto);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicle Types</h1>
          <p className="text-muted-foreground">
            Define your custom vehicle types and map them to platform classes
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle Type
        </Button>
      </div>

      {/* Platform Classes Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Vehicle Classes</CardTitle>
          <CardDescription>
            Standard classes defined by the platform. Map your custom types to these.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PLATFORM_CLASSES.map((pc) => (
              <div
                key={pc.code}
                className="flex items-center gap-2 rounded-lg border p-3"
              >
                <span className="text-2xl">{pc.icon}</span>
                <div>
                  <p className="font-medium text-sm">{pc.label}</p>
                  <p className="text-xs text-muted-foreground">{pc.code}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tenant Vehicle Types */}
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : vehicleTypes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No custom vehicle types yet. Click &quot;Add Vehicle Type&quot; to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicleTypes.map((vt) => (
            <Card key={vt.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{vt.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(vt)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(vt.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {vt.description && (
                  <CardDescription>{vt.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">
                  Mapped platform classes:
                </p>
                <div className="flex flex-wrap gap-1">
                  {vt.allowed_platform_classes.map((cls) => {
                    const pc = PLATFORM_CLASSES.find((p) => p.code === cls);
                    return (
                      <span
                        key={cls}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs"
                      >
                        {pc?.icon} {pc?.label ?? cls}
                      </span>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Vehicle Type' : 'New Vehicle Type'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mercedes S-Class"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Premium luxury sedan"
              />
            </div>
            <div>
              <Label className="mb-2 block">
                Allowed Platform Classes
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORM_CLASSES.map((pc) => {
                  const selected = selectedClasses.includes(pc.code);
                  return (
                    <button
                      key={pc.code}
                      type="button"
                      onClick={() => toggleClass(pc.code)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {selected && <Check className="h-4 w-4 text-primary" />}
                      <span>{pc.icon}</span>
                      <span className="text-sm">{pc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={
                !name.trim() ||
                selectedClasses.length === 0 ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
