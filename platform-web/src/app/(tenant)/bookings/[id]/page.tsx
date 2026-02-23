'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Truck,
  Edit2,
  DollarSign,
} from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
  NO_SHOW: 'bg-orange-100 text-orange-700',
};

const PAYMENT_STYLES: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-600',
  PAID: 'bg-green-100 text-green-700',
  PARTIALLY_REFUNDED: 'bg-yellow-100 text-yellow-700',
  REFUNDED: 'bg-gray-100 text-gray-500',
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showFulfilDialog, setShowFulfilDialog] = useState(false);
  const [showNoShowDialog, setShowNoShowDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showSupplementDialog, setShowSupplementDialog] = useState(false);

  const [declineNote, setDeclineNote] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [driverFare, setDriverFare] = useState('');
  const [driverToll, setDriverToll] = useState('');
  const [driverExtras, setDriverExtras] = useState('0');
  const [supplementAmount, setSupplementAmount] = useState('');
  const [supplementNote, setSupplementNote] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [fulfilSupplement, setFulfilSupplement] = useState('0');
  const [fulfilCredit, setFulfilCredit] = useState('0');
  const [noShowAction, setNoShowAction] = useState<'REFUND' | 'CLOSE'>('CLOSE');
  const [transferTenantId, setTransferTenantId] = useState('');
  const [fromPct, setFromPct] = useState('30');
  const [toPct, setToPct] = useState('70');
  const [transferNote, setTransferNote] = useState('');

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking-detail', id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}`);
      return res.data;
    },
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['available-drivers'],
    queryFn: async () => {
      const res = await api.get('/drivers?status=ACTIVE');
      return res.data?.data ?? [];
    },
    enabled: showAssignDialog,
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['active-connections'],
    queryFn: async () => {
      const res = await api.get('/connections/active');
      return res.data;
    },
    enabled: showTransferDialog,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['booking-detail', id] });
  };

  const confirmMutation = useMutation({
    mutationFn: () => api.patch(`/bookings/${id}/confirm`),
    onSuccess: () => {
      invalidate();
      setShowConfirmDialog(false);
    },
  });

  const declineMutation = useMutation({
    mutationFn: () => api.patch(`/bookings/${id}/decline`, { note: declineNote }),
    onSuccess: () => {
      invalidate();
      setShowDeclineDialog(false);
    },
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      api.patch(`/bookings/${id}/assign`, {
        driver_id: selectedDriver,
        driver_fare: parseFloat(driverFare),
        driver_toll: parseFloat(driverToll),
        driver_extras: parseFloat(driverExtras),
      }),
    onSuccess: () => {
      invalidate();
      setShowAssignDialog(false);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.patch(`/bookings/${id}/cancel`, { reason: cancelReason }),
    onSuccess: () => {
      invalidate();
      setShowCancelDialog(false);
    },
  });

  const fulfilMutation = useMutation({
    mutationFn: () =>
      api.patch(`/bookings/${id}/fulfil`, {
        supplement_amount: parseFloat(fulfilSupplement),
        credit_amount: parseFloat(fulfilCredit),
      }),
    onSuccess: () => {
      invalidate();
      setShowFulfilDialog(false);
    },
  });

  const noShowMutation = useMutation({
    mutationFn: () => api.patch(`/bookings/${id}/no-show`, { action: noShowAction }),
    onSuccess: () => {
      invalidate();
      setShowNoShowDialog(false);
    },
  });

  const supplementMutation = useMutation({
    mutationFn: () =>
      api.post(`/payments/supplement/${id}`, {
        supplement_amount: parseFloat(supplementAmount),
        note: supplementNote,
      }),
    onSuccess: () => {
      invalidate();
      setShowSupplementDialog(false);
    },
  });

  const creditMutation = useMutation({
    mutationFn: () =>
      api.post(`/payments/credit-note/${id}`, {
        credit_amount: parseFloat(creditAmount),
        note: creditNote,
      }),
    onSuccess: () => {
      invalidate();
      setShowSupplementDialog(false);
    },
  });

  const transferMutation = useMutation({
    mutationFn: () =>
      api.post('/connections/transfers', {
        booking_id: id,
        to_tenant_id: transferTenantId,
        from_percentage: parseFloat(fromPct),
        to_percentage: parseFloat(toPct),
        transfer_note: transferNote || undefined,
      }),
    onSuccess: () => {
      invalidate();
      setShowTransferDialog(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Booking not found</p>
        <Button className="mt-4" onClick={() => router.push('/bookings')}>
          Back to Bookings
        </Button>
      </div>
    );
  }

  const bookingStatus = booking.booking_status ?? booking.status;
  const isPending = bookingStatus === 'PENDING';
  const isConfirmed = bookingStatus === 'CONFIRMED';
  const isCompleted = bookingStatus === 'COMPLETED';
  const isCancelled = bookingStatus === 'CANCELLED';
  const isUnassigned = booking.driver_status === 'UNASSIGNED';
  const isJobDone = booking.driver_status === 'JOB_DONE';
  const isPaid = booking.payment_status === 'PAID';

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/bookings')}>
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold font-mono">#{booking.booking_number}</h1>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                STATUS_STYLES[bookingStatus] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {bookingStatus}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                PAYMENT_STYLES[booking.payment_status] ?? 'bg-gray-100 text-gray-500'
              }`}
            >
              {booking.payment_status}
            </span>
            {booking.is_transferred && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                Transferred
              </span>
            )}
          </div>
        </div>
      </div>

      {!isCancelled && !isCompleted && (
        <div className="flex gap-2 flex-wrap">
          {isPending && (
            <>
              <Button size="sm" onClick={() => setShowConfirmDialog(true)}>
                <CheckCircle size={14} className="mr-1" />
                Confirm
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowDeclineDialog(true)}>
                <XCircle size={14} className="mr-1" />
                Decline
              </Button>
            </>
          )}

          {isConfirmed && isUnassigned && (
            <Button size="sm" onClick={() => setShowAssignDialog(true)}>
              <Truck size={14} className="mr-1" />
              Assign Driver
            </Button>
          )}

          {isConfirmed && !isUnassigned && (
            <Button size="sm" variant="outline" onClick={() => setShowAssignDialog(true)}>
              <Truck size={14} className="mr-1" />
              Reassign
            </Button>
          )}

          {isConfirmed && isUnassigned && (
            <Button size="sm" variant="outline" onClick={() => setShowTransferDialog(true)}>
              🔄 Transfer
            </Button>
          )}

          {isJobDone && (
            <Button size="sm" onClick={() => setShowFulfilDialog(true)}>
              <DollarSign size={14} className="mr-1" />
              Fulfil
            </Button>
          )}

          {booking.driver_status === 'ARRIVED' && (
            <Button size="sm" variant="outline" onClick={() => setShowNoShowDialog(true)}>
              ⚠️ No Show
            </Button>
          )}

          {!isCancelled && (
            <Button size="sm" variant="outline" onClick={() => setShowModifyDialog(true)}>
              <Edit2 size={14} className="mr-1" />
              Modify
            </Button>
          )}

          {!isCancelled && (
            <Button size="sm" variant="ghost" onClick={() => setShowCancelDialog(true)}>
              <XCircle size={14} className="mr-1 text-red-400" />
              Cancel
            </Button>
          )}
        </div>
      )}

      {isPaid && !isCancelled && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowSupplementDialog(true)}>
            💳 Supplement / Refund
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">
              Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Date & Time</span>
              <span className="font-medium text-right">
                {booking.pickup_datetime_local ??
                  new Date(booking.pickup_datetime).toLocaleString('en-AU', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service</span>
              <span>{booking.service_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vehicle</span>
              <span>{booking.vehicle_type_name ?? booking.vehicle_type_id ?? "-"}</span>
            </div>
            {booking.flight_number && (
              <div className="flex justify-between">
                <span className="text-gray-500">Flight</span>
                <span>✈️ {booking.flight_number}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Pickup</span>
              <span className="text-right max-w-48">{booking.pickup_address}</span>
            </div>
            {booking.dropoff_address && (
              <div className="flex justify-between">
                <span className="text-gray-500">Drop-off</span>
                <span className="text-right max-w-48">{booking.dropoff_address}</span>
              </div>
            )}
            {booking.duration_hours && (
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span>{booking.duration_hours}hrs</span>
              </div>
            )}
            {booking.special_requests && (
              <div className="flex justify-between">
                <span className="text-gray-500">Requests</span>
                <span className="text-right max-w-48 text-gray-600">{booking.special_requests}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">
              Passenger & Booker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Passenger</span>
              <span className="font-medium">{booking.passenger_name ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Passenger Phone</span>
              <span>{booking.passenger_phone ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pax Count</span>
              <span>{booking.passenger_count}</span>
            </div>
            {booking.booker_name && booking.booker_name !== booking.passenger_name && (
              <>
                <div className="border-t pt-2">
                  <p className="text-xs text-gray-400 mb-1">Booked by</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Booker</span>
                  <span>{booking.booker_name}</span>
                </div>
                {booking.booker_phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span>{booking.booker_phone}</span>
                  </div>
                )}
                {booking.booker_email && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="text-right max-w-48">{booking.booker_email}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">
              Price Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Fare</span>
              <span>
                {booking.currency} ${booking.fare?.toFixed(2)}
              </span>
            </div>
            {booking.toll > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Toll</span>
                <span>
                  {booking.currency} ${booking.toll?.toFixed(2)}
                </span>
              </div>
            )}
            {booking.extras > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Extras</span>
                <span>
                  {booking.currency} ${booking.extras?.toFixed(2)}
                </span>
              </div>
            )}
            {booking.surcharge_amount > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Surcharge (+{booking.surcharge_percentage}%)</span>
                <span>
                  {booking.currency} ${booking.surcharge_amount?.toFixed(2)}
                </span>
              </div>
            )}
            {booking.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>
                  -{booking.currency} ${booking.discount_amount?.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total</span>
              <span>
                {booking.currency} ${booking.total_price?.toFixed(2)}
              </span>
            </div>
            {booking.supplement_amount > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Supplement</span>
                <span>
                  +{booking.currency} ${booking.supplement_amount?.toFixed(2)}
                </span>
              </div>
            )}
            {booking.credit_amount > 0 && (
              <div className="flex justify-between text-purple-600">
                <span>Credit Note</span>
                <span>
                  -{booking.currency} ${booking.credit_amount?.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-400 pt-1 border-t">
              <span>Charged</span>
              <span>
                {booking.currency} ${booking.charged_amount?.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">
              Driver & Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {booking.driver_id ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Driver Status</span>
                  <span className="font-medium">{booking.driver_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span>
                    {booking.driver_first_name} {booking.driver_last_name}
                  </span>
                </div>
                {booking.driver_phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span>{booking.driver_phone}</span>
                  </div>
                )}
                {booking.vehicle_make && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vehicle</span>
                    <span>
                      {booking.vehicle_color} {booking.vehicle_make} {booking.vehicle_model}
                    </span>
                  </div>
                )}
                {booking.plate_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plate</span>
                    <span className="font-mono">{booking.plate_number}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <p className="text-xs text-gray-400 mb-1">Driver Earnings</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Driver Fare</span>
                  <span>
                    {booking.currency} ${booking.driver_fare?.toFixed(2)}
                  </span>
                </div>
                {booking.driver_toll > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Driver Toll</span>
                    <span>
                      {booking.currency} ${booking.driver_toll?.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Driver Total</span>
                  <span>
                    {booking.currency} ${booking.driver_total?.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-center py-4">No driver assigned yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Confirm this booking? The passenger&apos;s card will be charged {booking.currency} ${' '}
            {booking.total_price?.toFixed(2)}.
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              className="flex-1"
              onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? 'Processing...' : 'Confirm & Charge'}
            </Button>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Decline Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Reason (optional)</Label>
              <Input
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
                placeholder="Reason for declining..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="destructive"
                onClick={() => declineMutation.mutate()}
                disabled={declineMutation.isPending}
              >
                {declineMutation.isPending ? 'Declining...' : 'Decline'}
              </Button>
              <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
                Back
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isUnassigned ? 'Assign Driver' : 'Reassign Driver'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Select Driver</Label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.first_name} {d.last_name} {d.plate_number && ` · ${d.plate_number}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
              <p className="text-xs text-gray-500 font-medium mb-2">Customer Paid</p>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold">
                  {booking.currency} ${booking.total_price?.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Driver Earnings</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Fare</Label>
                  <Input
                    type="number"
                    value={driverFare}
                    onChange={(e) => setDriverFare(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Toll</Label>
                  <Input
                    type="number"
                    value={driverToll}
                    onChange={(e) => setDriverToll(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Extras</Label>
                  <Input
                    type="number"
                    value={driverExtras}
                    onChange={(e) => setDriverExtras(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              {driverFare && (
                <div className="bg-gray-50 rounded p-2 text-xs text-gray-600">
                  Driver Total: {booking.currency} ${' '}
                  {(
                    parseFloat(driverFare || '0') +
                    parseFloat(driverToll || '0') +
                    parseFloat(driverExtras || '0')
                  ).toFixed(2)}{' '}
                  · Profit: {booking.currency} ${' '}
                  {(
                    booking.total_price -
                    parseFloat(driverFare || '0') -
                    parseFloat(driverToll || '0') -
                    parseFloat(driverExtras || '0')
                  ).toFixed(2)}
                </div>
              )}
            </div>

            <Button
              className="w-full"
              disabled={!selectedDriver || !driverFare || assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign Driver'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFulfilDialog} onOpenChange={setShowFulfilDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Fulfil Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Original Charge</span>
                <span>
                  {booking.currency} ${booking.charged_amount?.toFixed(2)}
                </span>
              </div>
              {booking.actual_km > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Actual KM</span>
                  <span>{booking.actual_km} km</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Supplement (+)</Label>
                <Input
                  type="number"
                  value={fulfilSupplement}
                  onChange={(e) => setFulfilSupplement(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Credit Note (-)</Label>
                <Input
                  type="number"
                  value={fulfilCredit}
                  onChange={(e) => setFulfilCredit(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded p-2 text-sm">
              Final Amount: {booking.currency} ${' '}
              {(
                booking.charged_amount +
                parseFloat(fulfilSupplement || '0') -
                parseFloat(fulfilCredit || '0')
              ).toFixed(2)}
            </div>

            <Button
              className="w-full"
              onClick={() => fulfilMutation.mutate()}
              disabled={fulfilMutation.isPending}
            >
              {fulfilMutation.isPending ? 'Processing...' : 'Fulfil Booking'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoShowDialog} onOpenChange={setShowNoShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Handle No Show</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Passenger did not show up. Choose action for the {booking.currency} ${' '}
              {booking.charged_amount?.toFixed(2)} charge:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNoShowAction('CLOSE')}
                className={`p-3 rounded-lg border text-sm transition-all ${
                  noShowAction === 'CLOSE'
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200'
                }`}
              >
                💰 Keep Charge
              </button>
              <button
                type="button"
                onClick={() => setNoShowAction('REFUND')}
                className={`p-3 rounded-lg border text-sm transition-all ${
                  noShowAction === 'REFUND'
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200'
                }`}
              >
                ↩️ Full Refund
              </button>
            </div>
            <Button
              className="w-full"
              onClick={() => noShowMutation.mutate()}
              disabled={noShowMutation.isPending}
            >
              {noShowMutation.isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Admin cancellation will issue a full refund.</p>
            <div className="space-y-1">
              <Label>Reason (optional)</Label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="destructive"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Back
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSupplementDialog} onOpenChange={setShowSupplementDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Supplement / Credit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Charged</span>
                <span className="font-bold">
                  {booking.currency} ${booking.charged_amount?.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">💳 Charge Supplement</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={supplementAmount}
                  onChange={(e) => setSupplementAmount(e.target.value)}
                />
                <Input
                  placeholder="Reason"
                  value={supplementNote}
                  onChange={(e) => setSupplementNote(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                disabled={!supplementAmount || supplementMutation.isPending}
                onClick={() => supplementMutation.mutate()}
              >
                {supplementMutation.isPending
                  ? 'Charging...'
                  : `Charge $${supplementAmount || '0'}`}
              </Button>
            </div>

            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-medium">↩️ Issue Credit Note</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                />
                <Input
                  placeholder="Reason"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                variant="outline"
                disabled={!creditAmount || creditMutation.isPending}
                onClick={() => creditMutation.mutate()}
              >
                {creditMutation.isPending ? 'Processing...' : `Refund $${creditAmount || '0'}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Transfer To</Label>
              <Select value={transferTenantId} onValueChange={setTransferTenantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((conn: any) => (
                    <SelectItem key={conn.partner.id} value={conn.partner.id}>
                      {conn.partner.tenant_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Revenue Split</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Your % (Keep)</Label>
                  <Input
                    type="number"
                    value={fromPct}
                    onChange={(e) => {
                      setFromPct(e.target.value);
                      setToPct((100 - parseFloat(e.target.value || '0')).toString());
                    }}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Their % (Receive)</Label>
                  <Input
                    type="number"
                    value={toPct}
                    onChange={(e) => {
                      setToPct(e.target.value);
                      setFromPct((100 - parseFloat(e.target.value || '0')).toString());
                    }}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded p-2 text-xs text-gray-600">
                You keep: {booking.currency} ${' '}
                {((booking.total_price * parseFloat(fromPct || '0')) / 100).toFixed(2)} · They
                receive: {booking.currency} ${' '}
                {((booking.total_price * parseFloat(toPct || '0')) / 100).toFixed(2)}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Note (optional)</Label>
              <Input
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                placeholder="Special instructions..."
              />
            </div>

            <Button
              className="w-full"
              disabled={
                !transferTenantId ||
                parseFloat(fromPct) + parseFloat(toPct) !== 100 ||
                transferMutation.isPending
              }
              onClick={() => transferMutation.mutate()}
            >
              {transferMutation.isPending ? 'Transferring...' : 'Send Transfer Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
