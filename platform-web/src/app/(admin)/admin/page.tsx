'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  XCircle,
  Search,
  Users,
  Building2,
  AlertTriangle,
} from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-600',
};

export default function SuperAdminPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [declineNote, setDeclineNote] = useState('');
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendNote, setSuspendNote] = useState('');

  const { data: tenantsData, isLoading } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: async () => {
      const res = await api.get('/admin/tenants');
      return res.data;
    },
  });

  const { data: platformStats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data;
    },
  });

  const tenants = tenantsData?.data ?? [];
  const pendingTenants = tenants.filter(
    (t: any) => t.tenant_status === 'PENDING',
  );
  const activeTenants = tenants.filter(
    (t: any) => t.tenant_status === 'ACTIVE',
  );

  const filtered = search
    ? tenants.filter(
        (t: any) =>
          t.tenant_name?.toLowerCase().includes(search.toLowerCase()) ||
          t.tenant_slug?.toLowerCase().includes(search.toLowerCase()) ||
          t.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : tenants;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
    queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
  };

  const approveMutation = useMutation({
    mutationFn: (tenant_id: string) =>
      api.patch(`/admin/tenants/${tenant_id}/approve`),
    onSuccess: () => {
      invalidate();
      setSelectedTenant(null);
    },
  });

  const declineMutation = useMutation({
    mutationFn: (tenant_id: string) =>
      api.patch(`/admin/tenants/${tenant_id}/decline`, {
        note: declineNote,
      }),
    onSuccess: () => {
      invalidate();
      setSelectedTenant(null);
      setShowDeclineDialog(false);
      setDeclineNote('');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (tenant_id: string) =>
      api.patch(`/admin/tenants/${tenant_id}/suspend`, {
        note: suspendNote,
      }),
    onSuccess: () => {
      invalidate();
      setSelectedTenant((prev: any) => ({
        ...prev,
        tenant_status: 'SUSPENDED',
      }));
      setShowSuspendDialog(false);
      setSuspendNote('');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (tenant_id: string) =>
      api.patch(`/admin/tenants/${tenant_id}/reactivate`),
    onSuccess: () => {
      invalidate();
      setSelectedTenant((prev: any) => ({
        ...prev,
        tenant_status: 'ACTIVE',
      }));
    },
  });

  const StatCard = ({
    label,
    value,
    icon,
    color = 'gray',
  }: {
    label: string;
    value: number;
    icon: any;
    color?: string;
  }) => {
    const Icon = icon;
    return (
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-100`}
          >
            <Icon size={18} className={`text-${color}-600`} />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
            SUPER ADMIN
          </span>
        </div>
        <h1 className="text-2xl font-bold">SuperAdmin Console</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage all tenants on the platform
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Tenants"
          value={platformStats?.total_tenants ?? 0}
          icon={Building2}
          color="blue"
        />
        <StatCard
          label="Pending Approval"
          value={pendingTenants.length}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatCard
          label="Active Tenants"
          value={activeTenants.length}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Total Bookings"
          value={platformStats?.total_bookings ?? 0}
          icon={Users}
          color="gray"
        />
      </div>

      <div className="flex gap-6">
        <div className="w-96 flex-shrink-0 space-y-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              className="pl-8 h-9"
              placeholder="Search tenants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Tabs defaultValue="all">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All ({tenants.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex-1">
                Pending ({pendingTenants.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex-1">
                Active ({activeTenants.length})
              </TabsTrigger>
            </TabsList>

            {['all', 'pending', 'active'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-2 mt-2">
                {isLoading ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    Loading...
                  </p>
                ) : (
                  (tab === 'all'
                    ? filtered
                    : tab === 'pending'
                      ? pendingTenants
                      : activeTenants
                  ).map((tenant: any) => (
                    <Card
                      key={tenant.id}
                      className={`cursor-pointer transition-all ${
                        selectedTenant?.id === tenant.id
                          ? 'ring-2 ring-gray-900'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedTenant(tenant)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">
                              {tenant.tenant_name}
                            </p>
                            <p className="text-xs text-gray-400">
                              @{tenant.tenant_slug}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {tenant.email}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              STATUS_STYLES[tenant.tenant_status] ??
                              'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {tenant.tenant_status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="flex-1">
          {!selectedTenant ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-4">🏢</p>
                <p className="text-gray-500">Select a tenant to view details</p>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedTenant.tenant_name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-0.5">
                      @{selectedTenant.tenant_slug}
                    </p>
                  </div>
                  <span
                    className={`text-sm px-3 py-1 rounded-full font-medium ${
                      STATUS_STYLES[selectedTenant.tenant_status] ??
                      'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {selectedTenant.tenant_status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-medium">
                      {selectedTenant.email ?? 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="font-medium">
                      {selectedTenant.phone ?? 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Domain</p>
                    <p className="font-medium">
                      {selectedTenant.tenant_domain ?? 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Created</p>
                    <p className="font-medium">
                      {selectedTenant.created_at?.slice(0, 10)}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-3 gap-3 text-center text-sm">
                  <div>
                    <p className="text-2xl font-bold">
                      {selectedTenant.booking_count ?? 0}
                    </p>
                    <p className="text-xs text-gray-400">Bookings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {selectedTenant.driver_count ?? 0}
                    </p>
                    <p className="text-xs text-gray-400">Drivers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      ${selectedTenant.total_revenue?.toFixed(0) ?? 0}
                    </p>
                    <p className="text-xs text-gray-400">Revenue</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedTenant.tenant_status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() =>
                          approveMutation.mutate(selectedTenant.id)
                        }
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle size={14} className="mr-2" />
                        {approveMutation.isPending ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowDeclineDialog(true)}
                      >
                        <XCircle size={14} className="mr-2" />
                        Decline
                      </Button>
                    </div>
                  )}

                  {selectedTenant.tenant_status === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setShowSuspendDialog(true)}
                    >
                      <AlertTriangle size={14} className="mr-2" />
                      Suspend Tenant
                    </Button>
                  )}

                  {selectedTenant.tenant_status === 'SUSPENDED' && (
                    <Button
                      className="w-full"
                      onClick={() =>
                        reactivateMutation.mutate(selectedTenant.id)
                      }
                      disabled={reactivateMutation.isPending}
                    >
                      {reactivateMutation.isPending
                        ? 'Reactivating...'
                        : 'Reactivate Tenant'}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full text-gray-400"
                    disabled
                  >
                    🔍 View as Tenant (coming soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Decline Tenant Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Declining{' '}
              <span className="font-semibold">
                {selectedTenant?.tenant_name}
              </span>
              . They will receive an email notification.
            </p>
            <Input
              value={declineNote}
              onChange={(e) => setDeclineNote(e.target.value)}
              placeholder="Reason for declining (optional)"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="destructive"
                onClick={() => declineMutation.mutate(selectedTenant.id)}
                disabled={declineMutation.isPending}
              >
                {declineMutation.isPending ? 'Declining...' : 'Decline'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeclineDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Suspend Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Suspending{' '}
              <span className="font-semibold">
                {selectedTenant?.tenant_name}
              </span>
              . They will lose access to the platform.
            </p>
            <Input
              value={suspendNote}
              onChange={(e) => setSuspendNote(e.target.value)}
              placeholder="Reason for suspension (optional)"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="destructive"
                onClick={() => suspendMutation.mutate(selectedTenant.id)}
                disabled={suspendMutation.isPending}
              >
                {suspendMutation.isPending ? 'Suspending...' : 'Suspend'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSuspendDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
