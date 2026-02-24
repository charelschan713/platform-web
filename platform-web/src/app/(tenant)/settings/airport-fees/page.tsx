'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AirportFeesPage() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Record<string, { parking_fee: number; is_active: boolean }>>({});

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['tenant-airport-fees'],
    queryFn: async () => (await api.get('/tenant-airport-fees')).data,
  });

  const saveMutation = useMutation({
    mutationFn: ({ airport_id, parking_fee, is_active }: any) =>
      api.patch(`/tenant-airport-fees/${airport_id}`, { parking_fee, is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenant-airport-fees'] }),
  });

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Airport Fees</h1>
        <p className="text-sm text-gray-500">Set airport parking fee per airport</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Airports</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p className="text-sm text-gray-400">Loading...</p> : rows.map((r: any) => {
            const airport = r.airport;
            const d = draft[airport?.id] ?? { parking_fee: Number(r.parking_fee ?? 0), is_active: !!r.is_active };
            return (
              <div key={r.id || airport?.id} className="border rounded-lg p-3 grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                <div className="md:col-span-2">
                  <p className="font-medium">{airport?.name}</p>
                  <p className="text-xs text-gray-500">{airport?.city}</p>
                </div>
                <Input
                  type="number"
                  step={0.01}
                  value={d.parking_fee}
                  onChange={(e) => setDraft((p) => ({ ...p, [airport.id]: { ...d, parking_fee: parseFloat(e.target.value) || 0 } }))}
                />
                <label className="text-sm flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={d.is_active}
                    onChange={(e) => setDraft((p) => ({ ...p, [airport.id]: { ...d, is_active: e.target.checked } }))}
                  /> Active
                </label>
                <Button
                  onClick={() => saveMutation.mutate({ airport_id: airport.id, parking_fee: d.parking_fee, is_active: d.is_active })}
                >Save</Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
