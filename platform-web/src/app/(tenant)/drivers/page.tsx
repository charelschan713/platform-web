'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Driver } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { UserPlus, Star } from 'lucide-react';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
  SUSPENDED: 'bg-red-100 text-red-700',
};

export default function DriversPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: drivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: async () => {
      const res = await api.get('/drivers');
      return res.data;
    },
  });

  const { register, handleSubmit, reset } = useForm();

  const inviteMutation = useMutation({
    mutationFn: (data: any) => api.post('/auth/invite/driver', data),
    onSuccess: () => {
      setInviteOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ driver_id, status }: { driver_id: string; status: string }) =>
      api.patch(`/drivers/${driver_id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Drivers</h1>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus size={16} className="mr-2" />
              Invite Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a Driver</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit((data) => inviteMutation.mutate(data))}
              className="space-y-4 mt-2"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>First Name</Label>
                  <Input {...register('first_name', { required: true })} />
                </div>
                <div className="space-y-1">
                  <Label>Last Name</Label>
                  <Input {...register('last_name', { required: true })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" {...register('email', { required: true })} />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={inviteMutation.isPending}
              >
                {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : drivers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-400">No drivers yet. Invite your first driver!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {drivers.map((driver) => (
            <Card key={driver.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600">
                    {driver.profiles?.first_name?.[0]}
                    {driver.profiles?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium">
                      {driver.profiles?.first_name} {driver.profiles?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{driver.profiles?.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={14} fill="currentColor" />
                      <span className="font-medium">{driver.rating ?? '—'}</span>
                    </div>
                    <p className="text-gray-400">{driver.total_trips} trips</p>
                  </div>

                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[driver.status]}`}
                  >
                    {driver.status}
                  </span>

                  <div className="flex gap-2">
                    {driver.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            driver_id: driver.id,
                            status: 'ACTIVE',
                          })
                        }
                      >
                        Approve
                      </Button>
                    )}
                    {driver.status === 'ACTIVE' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            driver_id: driver.id,
                            status: 'SUSPENDED',
                          })
                        }
                      >
                        Suspend
                      </Button>
                    )}
                    {driver.status === 'SUSPENDED' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            driver_id: driver.id,
                            status: 'ACTIVE',
                          })
                        }
                      >
                        Reactivate
                      </Button>
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
