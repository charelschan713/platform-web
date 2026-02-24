'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Phone, Mail, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import api from '@/lib/api';

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  license_number: '',
  is_active: true,
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/drivers');
      const payload = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setDrivers(payload);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const filtered = drivers.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.first_name?.toLowerCase().includes(q) ||
      d.last_name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.phone?.includes(q) ||
      d.license_number?.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (driver: any) => {
    setEditingId(driver.id);
    setForm({
      first_name: driver.first_name ?? '',
      last_name: driver.last_name ?? '',
      email: driver.email ?? '',
      phone: driver.phone ?? '',
      license_number: driver.license_number ?? '',
      is_active: driver.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/drivers/${editingId}`, form);
      } else {
        await api.post('/drivers', form);
      }
      setDialogOpen(false);
      await fetchDrivers();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete driver? This action cannot be undone.')) return;
    await api.delete(`/drivers/${id}`);
    await fetchDrivers();
  };

  const handleToggle = async (driver: any) => {
    await api.patch(`/drivers/${driver.id}`, { is_active: !driver.is_active });
    await fetchDrivers();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {drivers.length} driver{drivers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Driver
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, phone..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          {search ? 'No drivers found' : 'No drivers yet'}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((driver) => (
            <div
              key={driver.id}
              className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-600">
                  {driver.first_name?.[0] ?? '?'}
                  {driver.last_name?.[0] ?? ''}
                </div>
                <div>
                  <p className="font-medium">
                    {driver.first_name} {driver.last_name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {driver.email && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="w-3 h-3" />
                        {driver.email}
                      </span>
                    )}
                    {driver.phone && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        {driver.phone}
                      </span>
                    )}
                    {driver.license_number && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Car className="w-3 h-3" />
                        {driver.license_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(driver)}
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    driver.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {driver.is_active ? 'Active' : 'Inactive'}
                </button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(driver)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(driver.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name *</Label>
                <Input
                  value={form.first_name}
                  onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div className="space-y-1">
                <Label>Last Name *</Label>
                <Input
                  value={form.last_name}
                  onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
                  placeholder="Smith"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+61400000000"
              />
            </div>
            <div className="space-y-1">
              <Label>License Number</Label>
              <Input
                value={form.license_number}
                onChange={(e) => setForm((p) => ({ ...p, license_number: e.target.value }))}
                placeholder="DL12345"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label>Active</Label>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.is_active ? 'bg-black' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={saving || !form.first_name || !form.last_name}
              >
                {saving ? 'Saving...' : 'Save Driver'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
