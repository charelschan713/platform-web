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
import { useQueryClient } from '@tanstack/react-query';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit } = useForm();
  const { register: registerDomain, handleSubmit: handleDomainSubmit } = useForm();

  const { data: myTenant } = useQuery({
    queryKey: ['my-tenant'],
    queryFn: async () => {
      const res = await api.get('/tenants/me');
      return res.data;
    },
  });

  const domainMutation = useMutation({
    mutationFn: (data: any) => api.patch('/tenants/me', data),
    onSuccess: () => setSaved(true),
  });

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

      {/* Custom Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Domain</CardTitle>
          <CardDescription>
            Let your passengers book at your own domain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleDomainSubmit((data) => domainMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label>Your Domain</Label>
              <Input
                {...registerDomain('domain')}
                placeholder="rides.yourcompany.com"
                defaultValue={myTenant?.domain ?? ''}
              />
              <p className="text-xs text-gray-400">
                Point your DNS CNAME to: cname.vercel-dns.com
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
              <p className="font-medium text-gray-700">DNS Setup Instructions:</p>
              <p>1. Go to your domain registrar (GoDaddy, Cloudflare, etc.)</p>
              <p>2. Add a CNAME record:</p>
              <p className="font-mono bg-white rounded p-1">
                rides → cname.vercel-dns.com
              </p>
              <p>3. Save your domain below, then contact us to activate</p>
            </div>
            <Button type="submit" disabled={domainMutation.isPending}>
              {domainMutation.isPending ? 'Saving...' : 'Save Domain'}
            </Button>
          </form>
        </CardContent>
      </Card>

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
      {/* API Tokens */}
      <ApiTokensCard />
    </div>
  );
}

function ApiTokensCard() {
  const [newTokenName, setNewTokenName] = useState('');
  const [newToken, setNewToken] = useState('');
  const queryClient = useQueryClient();

  const { data: tokens = [] } = useQuery({
    queryKey: ['api-tokens'],
    queryFn: async () => {
      const res = await api.get('/tenants/me/tokens');
      return res.data;
    },
  });

  const createTokenMutation = useMutation({
    mutationFn: (name: string) => api.post('/tenants/me/tokens', { name }),
    onSuccess: (res) => {
      setNewToken(res.data.token);
      setNewTokenName('');
      queryClient.invalidateQueries({ queryKey: ['api-tokens'] });
    },
  });

  const revokeTokenMutation = useMutation({
    mutationFn: (token_id: string) =>
      api.delete(`/tenants/me/tokens/${token_id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['api-tokens'] }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">API Keys</CardTitle>
        <CardDescription>
          Use these keys to integrate booking into your own website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Key name (e.g. My Website)"
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
          />
          <Button
            onClick={() => createTokenMutation.mutate(newTokenName)}
            disabled={!newTokenName || createTokenMutation.isPending}
          >
            Generate
          </Button>
        </div>

        {newToken && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-3 font-mono text-xs break-all">
            <p className="text-gray-400 mb-1">
              ⚠️ Copy now — won&apos;t be shown again
            </p>
            {newToken}
            <button
              onClick={() => {
                navigator.clipboard.writeText(newToken);
                setNewToken('');
              }}
              className="block mt-2 text-blue-400 hover:underline"
            >
              Copy &amp; Dismiss
            </button>
          </div>
        )}

        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/docs`}
          target="_blank"
          className="text-sm text-blue-600 hover:underline block"
        >
          View API Documentation →
        </a>

        <div className="space-y-2">
          {tokens.map((token: any) => (
            <div
              key={token.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <p className="text-sm font-medium">{token.name}</p>
                <p className="text-xs text-gray-400">
                  {token.last_used_at
                    ? `Last used ${new Date(token.last_used_at).toLocaleDateString()}`
                    : 'Never used'}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => revokeTokenMutation.mutate(token.id)}
                disabled={revokeTokenMutation.isPending}
              >
                <span className="text-red-400 text-xs">Revoke</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
