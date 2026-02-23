'use client';

import { useEffect, useState } from 'react';
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

const CATEGORY_LABELS: Record<string, string> = {
  VEHICLE_CLASS: '🚗 Vehicle Classes',
  SERVICE_TYPE: '🗺️ Service Types',
  TRIP_TYPE: '🔄 Trip Types',
  BOOKING_STATUS: '📋 Booking Status',
  DRIVER_STATUS: '👤 Driver Status',
  PAYMENT_STATUS: '💳 Payment Status',
};

export default function ConstantsPage() {
  const queryClient = useQueryClient();
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: constants = {} } = useQuery({
    queryKey: ['system-constants'],
    queryFn: async () => {
      const res = await api.get('/constants');
      return res.data;
    },
  });

  const { data: labels = [] } = useQuery({
    queryKey: ['tenant-labels'],
    queryFn: async () => {
      const res = await api.get('/constants/me/labels');
      return res.data;
    },
  });

  useEffect(() => {
    const map: Record<string, string> = {};
    (labels as any[]).forEach((l: any) => {
      map[l.system_constants?.id ?? l.constant_id] = l.custom_name;
    });
    setCustomNames(map);
  }, [labels]);

  const saveMutation = useMutation({
    mutationFn: (labels: any[]) => api.post('/constants/me/labels', { labels }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-labels'] });
      setSaving(false);
    },
    onError: () => setSaving(false),
  });

  const handleSave = () => {
    setSaving(true);
    const labelsToSave = Object.entries(customNames)
      .filter(([_, name]) => name.trim())
      .map(([constant_id, custom_name]) => ({
        constant_id,
        custom_name: custom_name.trim(),
      }));

    saveMutation.mutate(labelsToSave);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Dictionary</h1>
          <p className="text-sm text-gray-500 mt-1">
            Customize how platform terms appear to your customers
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      {Object.entries(constants).map(([category, items]: any) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">
              {CATEGORY_LABELS[category] ?? category}
            </CardTitle>
            <CardDescription>
              Leave blank to use the platform default name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-32 shrink-0">
                    <p className="text-xs font-mono font-semibold text-gray-500">
                      {item.code}
                    </p>
                    <p className="text-xs text-gray-400">{item.default_name}</p>
                  </div>
                  <span className="text-gray-300">→</span>
                  <Input
                    className="flex-1"
                    placeholder={`Default: ${item.default_name}`}
                    value={customNames[item.id] ?? ''}
                    onChange={(e) =>
                      setCustomNames((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
