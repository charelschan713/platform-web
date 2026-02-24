'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  SUSPENDED: 'bg-red-100 text-red-700',
};

const subscriptionColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAST_DUE: 'bg-orange-100 text-orange-700',
  CANCELLED: 'bg-red-100 text-red-700',
  TRIAL: 'bg-blue-100 text-blue-700',
};

export default function AdminTenantsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: async () => {
      const res = await api.get('/admin/tenants');
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/tenants/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tenants'] }),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/tenants/${id}/suspend`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tenants'] }),
  });

  const tenantTypeMutation = useMutation({
    mutationFn: ({ id, tenant_type }: { id: string; tenant_type: 'STANDARD' | 'PREMIUM' }) =>
      api.patch(`/admin/tenants/${id}/type`, { tenant_type }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tenants'] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tenants</h1>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="space-y-3">
          {(data?.data ?? []).map((tenant: any) => (
            <Card key={tenant.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{tenant.name}</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[tenant.status]}`}
                    >
                      {tenant.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {tenant.tenant_type ?? 'STANDARD'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${subscriptionColors[tenant.subscription_status ?? 'ACTIVE'] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {tenant.subscription_status ?? 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    slug: {tenant.slug} · commission: {tenant.commission_rate}%
                  </p>
                  <p className="text-xs text-gray-400">
                    Joined {new Date(tenant.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = `/admin/tenants/${tenant.id}/theme`}
                  >
                    Theme
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      tenantTypeMutation.mutate({
                        id: tenant.id,
                        tenant_type: (tenant.tenant_type ?? 'STANDARD') === 'PREMIUM' ? 'STANDARD' : 'PREMIUM',
                      })
                    }
                    disabled={tenantTypeMutation.isPending}
                  >
                    Type: {(tenant.tenant_type ?? 'STANDARD') === 'PREMIUM' ? 'Set Standard' : 'Set Premium'}
                  </Button>
                  {tenant.status === 'PENDING' && (
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(tenant.id)}
                      disabled={approveMutation.isPending}
                    >
                      Approve
                    </Button>
                  )}
                  {tenant.status === 'ACTIVE' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => suspendMutation.mutate(tenant.id)}
                      disabled={suspendMutation.isPending}
                    >
                      Suspend
                    </Button>
                  )}
                  {tenant.status === 'SUSPENDED' && (
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(tenant.id)}
                      disabled={approveMutation.isPending}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
