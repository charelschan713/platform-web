'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
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
  Link2,
  Link2Off,
  Clock,
  CheckCircle,
  Search,
} from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  TERMINATED: 'bg-gray-100 text-gray-500',
};

const STATUS_ICONS: Record<string, any> = {
  PENDING: Clock,
  ACTIVE: CheckCircle,
  TERMINATED: Link2Off,
};

export default function ConnectionsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('connections');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [inviteNote, setInviteNote] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const res = await api.get('/connections');
      return res.data;
    },
  });

  const { data: transfers = [] } = useQuery({
    queryKey: ['transfers'],
    queryFn: async () => {
      const res = await api.get('/connections/transfers?type=all');
      return res.data;
    },
  });

  const pendingReceived = connections.filter(
    (c: any) => c.connection_status === 'PENDING' && !c.is_requester,
  );

  const pendingTransfers = transfers.filter(
    (t: any) => t.transfer_status === 'PENDING',
  );

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    const res = await api.get('/connections/search', {
      params: { keyword: searchKeyword },
    });
    setSearchResults(res.data);
  };

  const requestMutation = useMutation({
    mutationFn: (dto: any) => api.post('/connections/request', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      setShowInviteDialog(false);
      setSelectedTenant(null);
      setInviteNote('');
      setSearchResults([]);
      setSearchKeyword('');
    },
  });

  const acceptConnMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/connections/${id}/accept`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['connections'] }),
  });

  const rejectConnMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/connections/${id}/reject`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['connections'] }),
  });

  const terminateMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/connections/${id}/terminate`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['connections'] }),
  });

  const acceptTransferMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/connections/transfers/${id}/accept`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfers'] }),
  });

  const rejectTransferMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/connections/transfers/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfers'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Network & Transfers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Connect with other operators and manage job transfers
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <Link2 size={16} className="mr-2" />
          Connect Operator
        </Button>
      </div>

      {(pendingReceived.length > 0 || pendingTransfers.length > 0) && (
        <div className="flex gap-3">
          {pendingReceived.length > 0 && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <Clock size={14} className="text-yellow-600" />
              <p className="text-sm text-yellow-700">
                {pendingReceived.length} connection request
                {pendingReceived.length > 1 ? 's' : ''} pending
              </p>
            </div>
          )}
          {pendingTransfers.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <Clock size={14} className="text-blue-600" />
              <p className="text-sm text-blue-700">
                {pendingTransfers.length} transfer request
                {pendingTransfers.length > 1 ? 's' : ''} pending
              </p>
            </div>
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="connections">
            Connections
            {pendingReceived.length > 0 && (
              <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {pendingReceived.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="transfers">
            Transfers
            {pendingTransfers.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {pendingTransfers.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
          ) : connections.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-4xl mb-3">🤝</p>
                <p className="text-gray-500 font-medium">No connections yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Connect with other operators to start transferring jobs
                </p>
                <Button className="mt-4" onClick={() => setShowInviteDialog(true)}>
                  Connect Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            connections.map((conn: any) => {
              const Icon = STATUS_ICONS[conn.connection_status] ?? Link2;
              return (
                <Card key={conn.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                          {conn.partner?.tenant_name?.[0] ?? '?'}
                        </div>
                        <div>
                          <p className="font-semibold">{conn.partner?.tenant_name}</p>
                          <p className="text-xs text-gray-400">
                            @{conn.partner?.tenant_slug}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[conn.connection_status]}`}
                        >
                          <Icon size={10} />
                          {conn.connection_status}
                        </span>

                        {conn.connection_status === 'PENDING' && !conn.is_requester && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => acceptConnMutation.mutate(conn.id)}
                              disabled={acceptConnMutation.isPending}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectConnMutation.mutate(conn.id)}
                              disabled={rejectConnMutation.isPending}
                            >
                              Decline
                            </Button>
                          </div>
                        )}

                        {conn.connection_status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => terminateMutation.mutate(conn.id)}
                            disabled={terminateMutation.isPending}
                          >
                            <Link2Off size={14} className="text-red-400" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {conn.requester_note && (
                      <p className="text-xs text-gray-400 mt-2">Note: {conn.requester_note}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="transfers" className="space-y-3">
          {transfers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-4xl mb-3">🔄</p>
                <p className="text-gray-500 font-medium">No transfers yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Transfer jobs to connected operators from the booking detail page
                </p>
              </CardContent>
            </Card>
          ) : (
            transfers.map((transfer: any) => {
              const booking = transfer.bookings;
              const isPending = transfer.transfer_status === 'PENDING';

              return (
                <Card key={transfer.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm font-semibold">
                            {booking?.booking_number}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              transfer.transfer_status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : transfer.transfer_status === 'ACCEPTED'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {transfer.transfer_status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {booking?.pickup_address}
                          {booking?.dropoff_address && ` → ${booking.dropoff_address}`}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>From: {transfer.from_tenant?.tenant_name}</span>
                          <span>→</span>
                          <span>To: {transfer.to_tenant?.tenant_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-gray-100 px-2 py-0.5 rounded">
                            Split: {transfer.from_percentage}% / {transfer.to_percentage}%
                          </span>
                          {booking?.total_price && (
                            <span className="text-gray-500">
                              Total: {booking.currency} ${booking.total_price?.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {transfer.transfer_note && (
                          <p className="text-xs text-gray-400 italic">
                            "{transfer.transfer_note}"
                          </p>
                        )}
                      </div>

                      {isPending && (
                        <div className="flex gap-1 ml-4">
                          <Button
                            size="sm"
                            onClick={() => acceptTransferMutation.mutate(transfer.id)}
                            disabled={acceptTransferMutation.isPending}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectTransferMutation.mutate(transfer.id)}
                            disabled={rejectTransferMutation.isPending}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={showInviteDialog}
        onOpenChange={(v) => {
          if (!v) {
            setShowInviteDialog(false);
            setSelectedTenant(null);
            setSearchResults([]);
            setSearchKeyword('');
            setInviteNote('');
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect with Operator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search by operator name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              <Button size="sm" variant="outline" onClick={handleSearch}>
                <Search size={14} />
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((tenant: any) => (
                  <button
                    key={tenant.id}
                    type="button"
                    onClick={() => setSelectedTenant(tenant)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedTenant?.id === tenant.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <p className="font-medium text-sm">{tenant.tenant_name}</p>
                    <p className="text-xs text-gray-400">@{tenant.tenant_slug}</p>
                  </button>
                ))}
              </div>
            )}

            {searchResults.length === 0 && searchKeyword && (
              <p className="text-sm text-gray-400 text-center py-4">No operators found</p>
            )}

            {selectedTenant && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">Selected</p>
                <p className="font-semibold">{selectedTenant.tenant_name}</p>
              </div>
            )}

            <div>
              <Input
                value={inviteNote}
                onChange={(e) => setInviteNote(e.target.value)}
                placeholder="Add a note (optional)"
              />
            </div>

            <Button
              className="w-full"
              disabled={!selectedTenant || requestMutation.isPending}
              onClick={() =>
                requestMutation.mutate({
                  receiver_tenant_id: selectedTenant.id,
                  requester_note: inviteNote || undefined,
                })
              }
            >
              {requestMutation.isPending
                ? 'Sending...'
                : 'Send Connection Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
