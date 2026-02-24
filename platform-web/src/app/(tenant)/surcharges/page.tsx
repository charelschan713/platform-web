'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

const TABS = ['Time Surcharges', 'Holidays', 'Promo Codes'] as const;
type Tab = (typeof TABS)[number];

export default function SurchargesPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('Time Surcharges');
  const [showForm, setShowForm] = useState(false);

  const [timeForm, setTimeForm] = useState({
    name: '',
    day_type: 'ALL',
    start_time: '00:00',
    end_time: '06:00',
    surcharge_type: 'PERCENTAGE',
    surcharge_value: 25,
  });

  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    recurring: true,
    surcharge_type: 'PERCENTAGE',
    surcharge_value: 30,
  });

  const [promoForm, setPromoForm] = useState({
    code: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    min_fare: 0,
    max_uses: null as number | null,
    valid_from: '',
    valid_until: '',
  });

  const { data: timeSurcharges = [] } = useQuery({
    queryKey: ['time-surcharges'],
    queryFn: async () => (await api.get('/surcharges/time')).data,
  });

  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays'],
    queryFn: async () => (await api.get('/surcharges/holidays')).data,
  });

  const { data: promoCodes = [] } = useQuery({
    queryKey: ['promo-codes'],
    queryFn: async () => (await api.get('/surcharges/promo-codes')).data,
  });

  const createTimeMutation = useMutation({
    mutationFn: () => api.post('/surcharges/time', timeForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-surcharges'] });
      setShowForm(false);
    },
  });

  const createHolidayMutation = useMutation({
    mutationFn: () => api.post('/surcharges/holidays', holidayForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      setShowForm(false);
    },
  });

  const createPromoMutation = useMutation({
    mutationFn: () =>
      api.post('/surcharges/promo-codes', {
        ...promoForm,
        code: promoForm.code.toUpperCase(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }: { type: string; id: string }) =>
      api.delete(`/surcharges/${type}/${id}`),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({
        queryKey: [
          type === 'time' ? 'time-surcharges' : type === 'holidays' ? 'holidays' : 'promo-codes',
        ],
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Surcharges & Promotions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage time surcharges, holidays and promo codes</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-1" /> Add New
        </Button>
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setShowForm(false);
            }}
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${
              tab === t ? 'bg-white font-semibold shadow-sm' : 'text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Time Surcharges' && (
        <div className="space-y-4">
          {showForm && (
            <Card className="border-2 border-gray-900">
              <CardContent className="p-4 space-y-4">
                <p className="font-bold">New Time Surcharge</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2"><Label>Name *</Label><Input value={timeForm.name} onChange={(e) => setTimeForm((p) => ({ ...p, name: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Day Type</Label><select className="w-full border rounded-md px-3 py-2 text-sm" value={timeForm.day_type} onChange={(e) => setTimeForm((p) => ({ ...p, day_type: e.target.value }))}><option value="ALL">All Days</option><option value="WEEKDAY">Weekdays</option><option value="WEEKEND">Weekends</option></select></div>
                  <div className="space-y-1"><Label>Surcharge Type</Label><select className="w-full border rounded-md px-3 py-2 text-sm" value={timeForm.surcharge_type} onChange={(e) => setTimeForm((p) => ({ ...p, surcharge_type: e.target.value }))}><option value="PERCENTAGE">Percentage (%)</option><option value="FIXED">Fixed ($)</option></select></div>
                  <div className="space-y-1"><Label>Start Time</Label><Input type="time" value={timeForm.start_time} onChange={(e) => setTimeForm((p) => ({ ...p, start_time: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>End Time</Label><Input type="time" value={timeForm.end_time} onChange={(e) => setTimeForm((p) => ({ ...p, end_time: e.target.value }))} /></div>
                  <div className="space-y-1 col-span-2"><Label>Surcharge Value</Label><Input type="number" min={0} value={timeForm.surcharge_value} onChange={(e) => setTimeForm((p) => ({ ...p, surcharge_value: parseFloat(e.target.value) }))} /></div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" disabled={!timeForm.name} onClick={() => createTimeMutation.mutate()}>Create</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {timeSurcharges.length === 0 ? (
            <Card><CardContent className="text-center py-12">No time surcharges yet</CardContent></Card>
          ) : (
            timeSurcharges.map((ts: any) => (
              <Card key={ts.id}><CardContent className="p-4 flex items-center justify-between"><div><p className="font-semibold">{ts.name}</p></div><Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteMutation.mutate({ type: 'time', id: ts.id })}><Trash2 size={14} /></Button></CardContent></Card>
            ))
          )}
        </div>
      )}

      {tab === 'Holidays' && (
        <div className="space-y-4">
          {showForm && (
            <Card className="border-2 border-gray-900">
              <CardContent className="p-4 space-y-4">
                <p className="font-bold">New Holiday</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2"><Label>Name *</Label><Input value={holidayForm.name} onChange={(e) => setHolidayForm((p) => ({ ...p, name: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Date *</Label><Input type="date" value={holidayForm.date} onChange={(e) => setHolidayForm((p) => ({ ...p, date: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Surcharge Type</Label><select className="w-full border rounded-md px-3 py-2 text-sm" value={holidayForm.surcharge_type} onChange={(e) => setHolidayForm((p) => ({ ...p, surcharge_type: e.target.value }))}><option value="PERCENTAGE">Percentage (%)</option><option value="FIXED">Fixed ($)</option></select></div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" disabled={!holidayForm.name || !holidayForm.date} onClick={() => createHolidayMutation.mutate()}>Create</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {holidays.length === 0 ? <Card><CardContent className="text-center py-12">No holidays configured</CardContent></Card> : holidays.map((h: any) => (<Card key={h.id}><CardContent className="p-4 flex items-center justify-between"><p className="font-semibold">{h.name}</p><Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteMutation.mutate({ type: 'holidays', id: h.id })}><Trash2 size={14} /></Button></CardContent></Card>))}
        </div>
      )}

      {tab === 'Promo Codes' && (
        <div className="space-y-4">
          {showForm && (
            <Card className="border-2 border-gray-900">
              <CardContent className="p-4 space-y-4">
                <p className="font-bold">New Promo Code</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Code *</Label><Input value={promoForm.code} onChange={(e) => setPromoForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} /></div>
                  <div className="space-y-1"><Label>Discount Type</Label><select className="w-full border rounded-md px-3 py-2 text-sm" value={promoForm.discount_type} onChange={(e) => setPromoForm((p) => ({ ...p, discount_type: e.target.value }))}><option value="PERCENTAGE">Percentage (%)</option><option value="FIXED">Fixed ($)</option></select></div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" disabled={!promoForm.code || !promoForm.discount_value} onClick={() => createPromoMutation.mutate()}>Create</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {promoCodes.length === 0 ? <Card><CardContent className="text-center py-12">No promo codes yet</CardContent></Card> : promoCodes.map((p: any) => (<Card key={p.id}><CardContent className="p-4 flex items-center justify-between"><p className="font-mono font-bold">{p.code}</p><Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteMutation.mutate({ type: 'promo-codes', id: p.id })}><Trash2 size={14} /></Button></CardContent></Card>))}
        </div>
      )}
    </div>
  );
}
