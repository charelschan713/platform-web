'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, Clock, FileText } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-muted text-gray-600',
  SENT: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
};

const STATUS_ICONS: Record<string, any> = {
  DRAFT: FileText,
  SENT: Clock,
  PAID: CheckCircle,
};

export default function TenantInvoicesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['tenant-invoices', statusFilter],
    queryFn: async () => {
      const params: any = { limit: 50 };
      if (statusFilter && statusFilter !== 'ALL') {
        params.invoice_status = statusFilter;
      }
      const res = await api.get('/invoices/tenant', { params });
      return res.data;
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (invoice_id: string) =>
      api.patch(`/invoices/tenant/${invoice_id}/paid`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-invoices'] });
      if (selected) {
        setSelected((prev: any) => ({
          ...prev,
          invoice_status: 'PAID',
        }));
      }
    },
  });

  const invoices = data?.data ?? [];

  return (
    <div className="flex h-full gap-6">
      <div className="w-96 flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Driver Invoices</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="SENT">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-3xl mb-3">🧾</p>
              <p className="text-sm text-gray-500">No invoices yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {invoices.map((inv: any) => {
              const driver = inv.drivers;
              const driverName = driver?.profiles
                ? `${driver.profiles.first_name} ${driver.profiles.last_name}`
                : 'Unknown Driver';
              const Icon = STATUS_ICONS[inv.invoice_status] ?? FileText;

              return (
                <Card
                  key={inv.id}
                  className={`cursor-pointer transition-all ${
                    selected?.id === inv.id
                      ? 'ring-2 ring-gray-900'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelected(inv)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-sm font-semibold">
                          {inv.invoice_number}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">{driverName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {inv.invoice_period_from && inv.invoice_period_to
                            ? `${inv.invoice_period_from} → ${inv.invoice_period_to}`
                            : inv.created_at?.slice(0, 10)}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold text-sm">
                          {inv.currency} ${inv.invoice_total?.toFixed(2)}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[inv.invoice_status]}`}
                        >
                          <Icon size={10} />
                          {inv.invoice_status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1">
        {!selected ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl mb-4">🧾</p>
              <p className="text-gray-500">Select an invoice to view details</p>
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-mono text-lg">
                    {selected.invoice_number}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {selected.invoice_period_from && selected.invoice_period_to
                      ? `Period: ${selected.invoice_period_from} to ${selected.invoice_period_to}`
                      : `Created: ${selected.created_at?.slice(0, 10)}`}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full font-medium ${STATUS_STYLES[selected.invoice_status]}`}
                >
                  {selected.invoice_status}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {selected.drivers && (
                <div className="grid grid-cols-2 gap-4 bg-muted rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Driver</p>
                    <p className="font-medium">
                      {selected.drivers.profiles?.first_name}{' '}
                      {selected.drivers.profiles?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selected.drivers.profiles?.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selected.drivers.profiles?.phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 mb-1">ABN Details</p>
                    <p className="font-medium text-sm">{selected.drivers.abn_name}</p>
                    <p className="text-sm text-gray-500 font-mono">
                      ABN: {selected.drivers.abn}
                    </p>
                    {selected.drivers.is_gst_registered && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        GST Registered
                      </span>
                    )}
                  </div>

                  {selected.drivers.bank_account && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 mb-1">Bank Details</p>
                      <p className="text-sm text-gray-600">
                        {selected.drivers.bank_name} · BSB:{' '}
                        {selected.drivers.bank_bsb} · Acc:{' '}
                        {selected.drivers.bank_account}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Invoice Items
                </p>
                <div className="space-y-2">
                  {selected.driver_invoice_items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.description}</p>
                        <p className="text-xs text-gray-400">
                          {item.service_date}
                          {item.driver_toll > 0 &&
                            ` · Toll: $${item.driver_toll.toFixed(2)}`}
                          {item.driver_extras > 0 &&
                            ` · Extras: $${item.driver_extras.toFixed(2)}`}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        {selected.currency} ${item.driver_subtotal?.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>
                    {selected.currency} ${selected.invoice_subtotal?.toFixed(2)}
                  </span>
                </div>
                {selected.invoice_gst > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">GST (10%)</span>
                    <span>
                      {selected.currency} ${selected.invoice_gst?.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>
                    {selected.currency} ${selected.invoice_total?.toFixed(2)}
                  </span>
                </div>
              </div>

              {selected.invoice_status === 'PAID' && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
                  <CheckCircle size={16} />
                  <p className="text-sm font-medium">
                    Paid on {selected.paid_at?.slice(0, 10)}
                  </p>
                </div>
              )}

              {selected.invoice_status === 'SENT' && (
                <Button
                  className="w-full"
                  onClick={() => markPaidMutation.mutate(selected.id)}
                  disabled={markPaidMutation.isPending}
                >
                  <CheckCircle size={16} className="mr-2" />
                  {markPaidMutation.isPending ? 'Processing...' : 'Mark as Paid'}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
