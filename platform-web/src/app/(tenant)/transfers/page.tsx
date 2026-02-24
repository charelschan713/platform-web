'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Check, X } from 'lucide-react';

export default function TransfersPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');

  const { data: incoming = [] } = useQuery({
    queryKey: ['transfers-incoming'],
    queryFn: async () => {
      const res = await api.get('/booking-transfers/incoming');
      return res.data;
    },
  });

  const { data: outgoing = [] } = useQuery({
    queryKey: ['transfers-outgoing'],
    queryFn: async () => {
      const res = await api.get('/booking-transfers/outgoing');
      return res.data;
    },
  });

  const declineMutation = useMutation({
    mutationFn: (transfer_id: string) =>
      api.patch(`/booking-transfers/${transfer_id}/decline`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers-incoming'] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transfers</h1>
        <p className="text-sm text-gray-500 mt-1">Manage booking transfers between operators</p>
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('incoming')}
          className={`px-4 py-1.5 text-sm rounded-md transition-all ${
            tab === 'incoming' ? 'bg-white font-semibold shadow-sm' : 'text-gray-500'
          }`}
        >
          Incoming
          {incoming.length > 0 && (
            <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {incoming.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('outgoing')}
          className={`px-4 py-1.5 text-sm rounded-md transition-all ${
            tab === 'outgoing' ? 'bg-white font-semibold shadow-sm' : 'text-gray-500'
          }`}
        >
          Outgoing
        </button>
      </div>

      {tab === 'incoming' && (
        <div className="space-y-4">
          {incoming.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ArrowRightLeft size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No incoming transfers</p>
              </CardContent>
            </Card>
          ) : (
            incoming.map((t: any) => (
              <IncomingTransferCard
                key={t.id}
                transfer={t}
                onDecline={() => declineMutation.mutate(t.id)}
                onAccepted={() => {
                  queryClient.invalidateQueries({ queryKey: ['transfers-incoming'] });
                }}
              />
            ))
          )}
        </div>
      )}

      {tab === 'outgoing' && (
        <div className="space-y-4">
          {outgoing.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 text-sm">No outgoing transfers</p>
              </CardContent>
            </Card>
          ) : (
            outgoing.map((t: any) => (
              <Card key={t.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{t.booking?.booking_number}</p>
                      <p className="text-xs text-gray-500">→ {t.to_tenant?.name}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        t.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-700'
                          : t.status === 'DECLINED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {t.booking?.pickup_address} → {t.booking?.dropoff_address}
                  </p>
                  {t.transfer_note && (
                    <p className="text-xs text-gray-400 italic">&ldquo;{t.transfer_note}&rdquo;</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function IncomingTransferCard({
  transfer,
  onDecline,
  onAccepted,
}: {
  transfer: any;
  onDecline: () => void;
  onAccepted: () => void;
}) {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');

  const { data: matchingVehicles = [] } = useQuery({
    queryKey: ['matching-vehicles', transfer.booking_id],
    queryFn: async () => {
      const override = transfer.override_platform_vehicle_ids?.length
        ? `?override_ids=${transfer.override_platform_vehicle_ids.join(',')}`
        : '';
      // Use the current tenant's own vehicles that match
      const res = await api.get(`/tenant-vehicles`);
      return res.data ?? [];
    },
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers-for-transfer'],
    queryFn: async () => {
      const res = await api.get('/drivers?status=ACTIVE');
      return res.data?.data ?? [];
    },
  });

  const acceptMutation = useMutation({
    mutationFn: () =>
      api.patch(`/booking-transfers/${transfer.id}/accept`, {
        assigned_vehicle_id: selectedVehicle,
        assigned_driver_id: selectedDriver,
      }),
    onSuccess: onAccepted,
  });

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{transfer.booking?.booking_number}</p>
            <p className="text-xs text-gray-600">From: {transfer.from_tenant?.name}</p>
          </div>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            ${transfer.booking?.estimated_fare}
          </span>
        </div>

        <div className="text-sm text-gray-700">
          <p>📍 {transfer.booking?.pickup_address}</p>
          <p>🏁 {transfer.booking?.dropoff_address}</p>
          <p>
            📅{' '}
            {transfer.booking?.pickup_datetime &&
              new Date(transfer.booking.pickup_datetime).toLocaleString()}
          </p>
        </div>

        {transfer.transfer_note && (
          <p className="text-xs text-gray-500 italic">
            Note: &ldquo;{transfer.transfer_note}&rdquo;
          </p>
        )}

        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-600">Select Vehicle</p>
          {matchingVehicles.length === 0 ? (
            <p className="text-xs text-red-500">No vehicles in your fleet</p>
          ) : (
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="">Select vehicle...</option>
              {matchingVehicles.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} ({v.registration_plate})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-600">Select Driver</p>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
          >
            <option value="">Select driver...</option>
            {drivers.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.first_name} {d.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={!selectedVehicle || !selectedDriver || acceptMutation.isPending}
            onClick={() => acceptMutation.mutate()}
          >
            <Check size={14} className="mr-1" />
            {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
          </Button>
          <Button variant="outline" className="text-red-500" onClick={onDecline}>
            <X size={14} className="mr-1" />
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
