'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TenantThemePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tenantId = params.id;
  const [form, setForm] = useState<any>(null);

  useQuery({
    queryKey: ['tenant-theme', tenantId],
    queryFn: async () => {
      const res = await api.get('/tenant-settings/theme', { params: { tenant_id: tenantId } });
      setForm(res.data);
      return res.data;
    },
  });

  const save = async () => {
    await api.patch('/tenant-settings/theme', { ...form, tenant_id: tenantId });
    alert('Theme saved');
  };

  if (!form) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tenant Theme</h1>
      <Card>
        <CardContent className="p-4 space-y-3">
          <label className="text-sm">Theme Mode</label>
          <select
            className="border rounded px-2 py-1"
            value={form.theme_mode}
            onChange={(e) => setForm((p: any) => ({ ...p, theme_mode: e.target.value }))}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['primary_color', 'Primary Color'],
              ['sidebar_bg', 'Sidebar Background'],
              ['card_bg', 'Card Background'],
              ['sidebar_fg', 'Sidebar Foreground'],
              ['primary_foreground', 'Primary Foreground'],
              ['accent_color', 'Accent Color'],
            ].map(([key, label]) => (
              <div key={key} className="space-y-1">
                <label className="text-sm">{label}</label>
                <Input
                  type="color"
                  value={form[key]}
                  onChange={(e) => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <div className="border rounded p-4" style={{ backgroundColor: form.card_bg, color: form.sidebar_fg }}>
            <p className="font-semibold">Preview Panel</p>
            <Button className="mt-3" style={{ backgroundColor: form.primary_color, color: form.primary_foreground }}>
              Primary Button
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => router.back()}>Back</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
