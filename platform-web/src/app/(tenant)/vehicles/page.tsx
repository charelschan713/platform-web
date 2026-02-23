'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VehiclesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await api.get('/drivers/vehicles');
      return res.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.patch(`/drivers/vehicles/${id}`, { is_active }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const vehicles = data ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          All registered vehicles on your platform
        </p>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-3xl mb-3">🚗</p>
            <p className="text-gray-500">No vehicles registered yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Vehicles are added when drivers register
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vehicles.map((v: any) => (
            <Card key={v.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">
                      {v.color} {v.make} {v.model}
                    </p>
                    <p className="text-sm text-gray-500">
                      {v.year} · {v.plate_number}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      👤 {v.driver_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      🚗 {v.platform_class} · {v.capacity} seats
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        v.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {v.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toggleMutation.mutate({
                          id: v.id,
                          is_active: !v.is_active,
                        })
                      }
                      disabled={toggleMutation.isPending}
                    >
                      {v.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
