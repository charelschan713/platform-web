'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { ApiKeysStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit } = useForm();

  const { data: status } = useQuery<ApiKeysStatus>({
    queryKey: ['keys-status'],
    queryFn: async () => {
      const res = await api.get('/tenants/me/keys/status');
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => api.post('/tenants/me/keys', data),
    onSuccess: () => setSaved(true),
  });

  const StatusIcon = ({ ok }: { ok?: boolean }) =>
    ok ? (
      <CheckCircle size={18} className="text-green-500" />
    ) : (
      <XCircle size={18} className="text-gray-300" />
    );

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integration Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Stripe (Payments)', key: 'stripe' },
            { label: 'Resend (Email)', key: 'resend' },
            { label: 'Twilio (SMS)', key: 'twilio' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.label}</span>
              <StatusIcon ok={status?.[item.key as keyof ApiKeysStatus]} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Keys</CardTitle>
          <CardDescription>
            Keys are encrypted and stored securely. Leave blank to keep existing
            values.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => saveMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label>Stripe Secret Key</Label>
              <Input
                type="password"
                placeholder="sk_live_..."
                {...register('stripe_secret_key')}
              />
            </div>
            <div className="space-y-1">
              <Label>Stripe Webhook Secret</Label>
              <Input
                type="password"
                placeholder="whsec_..."
                {...register('stripe_webhook_secret')}
              />
              <p className="text-xs text-gray-400">
                Webhook URL: {process.env.NEXT_PUBLIC_API_URL}/payments/webhook/YOUR_TENANT_ID
              </p>
            </div>
            <div className="space-y-1">
              <Label>Resend API Key</Label>
              <Input
                type="password"
                placeholder="re_..."
                {...register('resend_api_key')}
              />
            </div>
            <div className="space-y-1">
              <Label>Twilio Account SID</Label>
              <Input
                type="password"
                placeholder="AC..."
                {...register('twilio_account_sid')}
              />
            </div>
            <div className="space-y-1">
              <Label>Twilio Auth Token</Label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('twilio_auth_token')}
              />
            </div>
            <div className="space-y-1">
              <Label>Twilio From Number</Label>
              <Input placeholder="+1234567890" {...register('twilio_from_number')} />
            </div>

            {saved && <p className="text-sm text-green-600">✓ Keys saved successfully</p>}

            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Keys'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
