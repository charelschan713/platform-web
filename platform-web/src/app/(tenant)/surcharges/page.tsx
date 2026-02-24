'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Clock, Calendar, Zap, Plane } from 'lucide-react';
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

type Tab = 'time' | 'holiday' | 'event' | 'airport';

const TABS = [
  { id: 'time', label: 'Night & Time', icon: Clock },
  { id: 'holiday', label: 'Public Holidays', icon: Calendar },
  { id: 'event', label: 'Special Events', icon: Zap },
  { id: 'airport', label: 'Airport Rules', icon: Plane },
];

const TIME_EMPTY = {
  name: '',
  start_time: '23:00',
  end_time: '05:00',
  surcharge_type: 'PERCENTAGE',
  surcharge_value: 20,
  applies_to: 'ALL',
  is_active: true,
};
const HOLIDAY_EMPTY = {
  name: '',
  date: '',
  is_recurring: true,
  surcharge_type: 'PERCENTAGE',
  surcharge_value: 25,
  is_active: true,
};
const EVENT_EMPTY = {
  name: '',
  start_date: '',
  end_date: '',
  surcharge_type: 'PERCENTAGE',
  surcharge_value: 100,
  one_way_rate: 100,
  return_rate: 50,
  is_active: true,
};
const AIRPORT_EMPTY = {
  name: '',
  place_id: '',
  address_keywords: '',
  terminal_type: 'DOMESTIC',
  parking_fee: 0,
  free_waiting_minutes: 30,
  is_active: true,
};

export default function SurchargesPage() {
  const [tab, setTab] = useState<Tab>('time');
  const [data, setData] = useState<Record<Tab, any[]>>({
    time: [],
    holiday: [],
    event: [],
    airport: [],
  });
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(TIME_EMPTY);
  const [saving, setSaving] = useState(false);

  const emptyForms: Record<Tab, any> = {
    time: TIME_EMPTY,
    holiday: HOLIDAY_EMPTY,
    event: EVENT_EMPTY,
    airport: AIRPORT_EMPTY,
  };

  const fetchTab = async (t: Tab) => {
    setLoading(true);
    try {
      const res = await api.get(`/surcharges/${t}`);
      setData((prev) => ({ ...prev, [t]: Array.isArray(res.data) ? res.data : [] }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTab(tab);
  }, [tab]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForms[tab] });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      ...item,
      address_keywords: Array.isArray(item.address_keywords)
        ? item.address_keywords.join(', ')
        : item.address_keywords ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (tab === 'airport' && typeof payload.address_keywords === 'string') {
        payload.address_keywords = payload.address_keywords
          .split(',')
          .map((k: string) => k.trim())
          .filter(Boolean);
      }

      if (editingId) {
        await api.patch(`/surcharges/${tab}/${editingId}`, payload);
      } else {
        await api.post(`/surcharges/${tab}`, payload);
      }
      setDialogOpen(false);
      await fetchTab(tab);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rule?')) return;
    await api.delete(`/surcharges/${tab}/${id}`);
    await fetchTab(tab);
  };

  const items = data[tab];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Surcharges</h1>
          <p className="text-sm text-gray-500 mt-1">Configure additional fees and surcharges</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add {TABS.find((t) => t.id === tab)?.label}
        </Button>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No {TABS.find((t) => t.id === tab)?.label} configured
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-white border rounded-xl">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {tab === 'time' &&
                    `${item.start_time} – ${item.end_time} · ${item.surcharge_value}${item.surcharge_type === 'PERCENTAGE' ? '%' : ' AUD'}`}
                  {tab === 'holiday' &&
                    `${item.date || '-'} · ${item.surcharge_value}${item.surcharge_type === 'PERCENTAGE' ? '%' : ' AUD'} · ${item.is_recurring ? 'Recurring' : 'One-off'}`}
                  {tab === 'event' &&
                    `${item.start_date} – ${item.end_date} · One-way ${item.one_way_rate}% / Return ${item.return_rate}%`}
                  {tab === 'airport' &&
                    `${item.terminal_type} · Parking $${item.parking_fee} · ${item.free_waiting_minutes}min free`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
                <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit' : 'Add'} {TABS.find((t) => t.id === tab)?.label}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input value={form.name ?? ''} onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))} />
            </div>

            {tab === 'time' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Start Time</Label><Input type="time" value={form.start_time ?? ''} onChange={(e) => setForm((p: any) => ({ ...p, start_time: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>End Time</Label><Input type="time" value={form.end_time ?? ''} onChange={(e) => setForm((p: any) => ({ ...p, end_time: e.target.value }))} /></div>
                </div>
                <div className="space-y-1">
                  <Label>Applies To</Label>
                  <select className="w-full border rounded px-3 py-2 text-sm" value={form.applies_to ?? 'ALL'} onChange={(e) => setForm((p: any) => ({ ...p, applies_to: e.target.value }))}>
                    <option value="ALL">All Services</option>
                    <option value="P2P">Point to Point</option>
                    <option value="AIRPORT">Airport</option>
                    <option value="HOURLY">Hourly Charter</option>
                  </select>
                </div>
              </>
            )}

            {tab === 'holiday' && (
              <>
                <div className="space-y-1"><Label>Date</Label><Input type="date" value={form.date ?? ''} onChange={(e) => setForm((p: any) => ({ ...p, date: e.target.value }))} /></div>
                <div className="flex items-center justify-between">
                  <Label>Recurring Annually</Label>
                  <button type="button" onClick={() => setForm((p: any) => ({ ...p, is_recurring: !p.is_recurring }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_recurring ? 'bg-black' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_recurring ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </>
            )}

            {tab === 'event' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Start Date</Label><Input type="date" value={form.start_date ?? ''} onChange={(e) => setForm((p: any) => ({ ...p, start_date: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>End Date</Label><Input type="date" value={form.end_date ?? ''} onChange={(e) => setForm((p: any) => ({ ...p, end_date: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>One-Way Rate (%)</Label><Input type="number" min={0} value={form.one_way_rate ?? 100} onChange={(e) => setForm((p: any) => ({ ...p, one_way_rate: parseFloat(e.target.value) || 0 }))} /></div>
                  <div className="space-y-1"><Label>Return Rate (%)</Label><Input type="number" min={0} value={form.return_rate ?? 50} onChange={(e) => setForm((p: any) => ({ ...p, return_rate: parseFloat(e.target.value) || 0 }))} /></div>
                </div>
              </>
            )}

            {tab === 'airport' && (
              <>
                <div className="space-y-1">
                  <Label>Terminal Type</Label>
                  <select className="w-full border rounded px-3 py-2 text-sm" value={form.terminal_type ?? 'DOMESTIC'} onChange={(e) => setForm((p: any) => ({ ...p, terminal_type: e.target.value }))}>
                    <option value="DOMESTIC">Domestic</option>
                    <option value="INTERNATIONAL">International</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
                <div className="space-y-1"><Label>Google Place ID</Label><Input value={form.place_id ?? ''} onChange={(e) => setForm((p: any) => ({ ...p, place_id: e.target.value }))} placeholder="ChIJ..." /></div>
                <div className="space-y-1"><Label>Address Keywords (comma separated)</Label><Input value={form.address_keywords ?? ''} onChange={(e) => setForm((p: any) => ({ ...p, address_keywords: e.target.value }))} placeholder="Sydney Airport, SYD, T1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Parking Fee ($)</Label><Input type="number" min={0} step={0.01} value={form.parking_fee ?? 0} onChange={(e) => setForm((p: any) => ({ ...p, parking_fee: parseFloat(e.target.value) || 0 }))} /></div>
                  <div className="space-y-1"><Label>Free Waiting (min)</Label><Input type="number" min={0} value={form.free_waiting_minutes ?? 30} onChange={(e) => setForm((p: any) => ({ ...p, free_waiting_minutes: parseInt(e.target.value, 10) || 0 }))} /></div>
                </div>
              </>
            )}

            {tab !== 'airport' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Type</Label>
                  <select className="w-full border rounded px-3 py-2 text-sm" value={form.surcharge_type ?? 'PERCENTAGE'} onChange={(e) => setForm((p: any) => ({ ...p, surcharge_type: e.target.value }))}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed ($)</option>
                  </select>
                </div>
                <div className="space-y-1"><Label>Value</Label><Input type="number" min={0} step={0.01} value={form.surcharge_value ?? 0} onChange={(e) => setForm((p: any) => ({ ...p, surcharge_value: parseFloat(e.target.value) || 0 }))} /></div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Label>Active</Label>
              <button type="button" onClick={() => setForm((p: any) => ({ ...p, is_active: !p.is_active }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-black' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving || !form.name}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
