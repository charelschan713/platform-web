'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminAirportsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', city: '', google_place_id: '', keywords: '' });

  const { data: airports = [] } = useQuery({
    queryKey: ['admin-airports'],
    queryFn: async () => (await api.get('/admin/airports?includeInactive=true')).data,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/admin/airports', {
      ...form,
      keywords: form.keywords.split(',').map((x) => x.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      setForm({ name: '', city: '', google_place_id: '', keywords: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-airports'] });
    },
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, payload }: any) => api.patch(`/admin/airports/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-airports'] }),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Platform Airports</h1>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Add Airport</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Input placeholder="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
          <Input placeholder="Place ID" value={form.google_place_id} onChange={(e) => setForm((p) => ({ ...p, google_place_id: e.target.value }))} />
          <Input placeholder="Keywords (comma)" value={form.keywords} onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))} />
          <Button onClick={() => createMutation.mutate()}>Add</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Airports</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {airports.map((a: any) => (
            <div key={a.id} className="border rounded-lg p-3 grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
              <Input defaultValue={a.name} onBlur={(e) => patchMutation.mutate({ id: a.id, payload: { name: e.target.value } })} />
              <Input defaultValue={a.city} onBlur={(e) => patchMutation.mutate({ id: a.id, payload: { city: e.target.value } })} />
              <Input defaultValue={a.google_place_id || ''} onBlur={(e) => patchMutation.mutate({ id: a.id, payload: { google_place_id: e.target.value } })} />
              <Input defaultValue={(a.keywords || []).join(', ')} onBlur={(e) => patchMutation.mutate({ id: a.id, payload: { keywords: e.target.value.split(',').map((x:string)=>x.trim()).filter(Boolean) } })} />
              <label className="text-sm"><input type="checkbox" defaultChecked={a.is_active} onChange={(e) => patchMutation.mutate({ id: a.id, payload: { is_active: e.target.checked } })} /> Active</label>
              <div className="text-xs text-gray-500">{a.country_code}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
