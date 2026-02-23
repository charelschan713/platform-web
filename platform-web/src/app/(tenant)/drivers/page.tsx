'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Search, Plus, CheckCircle, XCircle } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  UNVERIFIED: 'bg-gray-100 text-gray-500',
  VERIFIED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

export default function DriversPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['drivers', statusFilter],
    queryFn: async () => {
      const params: any = { limit: 50 };
      if (statusFilter) params.platform_verified = statusFilter;
      const res = await api.get('/drivers', { params });
      return res.data;
    },
  });

  const drivers = data?.data ?? [];
  const filtered = search
    ? drivers.filter((d: any) => {
        const name = `${d.first_name} ${d.last_name}`.toLowerCase();
        return (
          name.includes(search.toLowerCase()) ||
          d.phone?.includes(search) ||
          d.plate_number?.toLowerCase().includes(search.toLowerCase())
        );
      })
    : drivers;

  const verifyMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      api.patch(`/drivers/${id}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {drivers.length} total drivers
          </p>
        </div>
        <Button onClick={() => router.push('/drivers/invite')}>
          <Plus size={16} className="mr-2" />
          Invite Driver
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            className="pl-8 h-9"
            placeholder="Search drivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {['', 'UNVERIFIED', 'VERIFIED', 'REJECTED'].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => setStatusFilter(s)}
            >
              {s === '' ? 'All' : s}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-3xl mb-3">🧑‍✈️</p>
            <p className="text-gray-500">No drivers found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((driver: any) => (
            <Card
              key={driver.id}
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => router.push(`/drivers/${driver.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                      {driver.first_name?.[0]}
                      {driver.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {driver.first_name} {driver.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{driver.phone}</p>
                      {driver.plate_number && (
                        <p className="text-xs text-gray-400 font-mono">
                          {driver.plate_number} · {driver.vehicle_make}{' '}
                          {driver.vehicle_model}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        STATUS_STYLES[driver.platform_verified] ??
                        'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {driver.platform_verified}
                    </span>
                    {driver.platform_verified === 'UNVERIFIED' && (
                      <div
                        className="flex gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          onClick={() =>
                            verifyMutation.mutate({
                              id: driver.id,
                              action: 'approve',
                            })
                          }
                          disabled={verifyMutation.isPending}
                        >
                          <CheckCircle size={12} className="mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            verifyMutation.mutate({
                              id: driver.id,
                              action: 'reject',
                            })
                          }
                          disabled={verifyMutation.isPending}
                        >
                          <XCircle size={12} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
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
