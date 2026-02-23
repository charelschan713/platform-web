'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Plus, Trash2, CheckCircle } from 'lucide-react';

export default function ApiKeysPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [keyName, setKeyName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await api.get('/api-keys');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/api-keys', {
        key_name: keyName,
        expires_at: expiresAt || undefined,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setNewKey(res.data.api_key);
      setKeyName('');
      setExpiresAt('');
      setShowCreate(false);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api-keys/${id}/revoke`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api-keys/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  const copyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-xl font-bold">API Keys</h1>
          <p className="text-sm text-gray-500">Manage API keys for public booking integration</p>
        </div>
      </div>

      {newKey && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <p className="font-semibold text-green-800">API Key Created</p>
            </div>
            <p className="text-xs text-green-700">Copy this key now. It will not be shown again.</p>
            <div className="flex gap-2">
              <Input value={newKey} readOnly className="font-mono text-sm bg-white" />
              <Button size="sm" onClick={() => copyKey(newKey)}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              </Button>
            </div>
            <Button size="sm" variant="outline" onClick={() => setNewKey('')} className="w-full">
              I&apos;ve saved my key
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">API Keys</CardTitle>
            <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
              <Plus size={14} className="mr-1" /> New Key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showCreate && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border">
              <p className="text-sm font-medium">Create New API Key</p>
              <div className="space-y-1">
                <Label>Key Name *</Label>
                <Input
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Website Integration"
                />
              </div>
              <div className="space-y-1">
                <Label>Expires At (optional)</Label>
                <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={!keyName || createMutation.isPending}
                  onClick={() => createMutation.mutate()}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Key'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-2xl">🔑</p>
              <p className="text-gray-500 text-sm">No API keys yet</p>
              <p className="text-xs text-gray-400">Create a key to integrate booking into your website</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key: any) => (
                <div
                  key={key.id}
                  className={`border rounded-lg p-3 space-y-2 ${!key.is_active ? 'opacity-50 bg-gray-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{key.key_name}</p>
                      <p className="font-mono text-xs text-gray-400">{key.key_prefix}_••••••••••••</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        key.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {key.is_active ? 'Active' : 'Revoked'}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span>Created {formatDate(key.created_at)}</span>
                    {key.last_used_at && <span>Last used {formatDate(key.last_used_at)}</span>}
                    {key.expires_at && <span>Expires {formatDate(key.expires_at)}</span>}
                  </div>
                  {key.is_active && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 border-orange-200"
                        onClick={() => revokeMutation.mutate(key.id)}
                        disabled={revokeMutation.isPending}
                      >
                        Revoke
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => deleteMutation.mutate(key.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={12} className="mr-1" /> Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">📖 Integration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium mb-2">Get a Quote</p>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto">
{`GET /public/quote
x-api-key: ck_live_your_key_here

?service_city_id=xxx
&service_type=POINT_TO_POINT
&pickup_lat=-33.86
&pickup_lng=151.20
&dropoff_lat=-33.87
&dropoff_lng=151.21
&pickup_datetime=2026-03-01T10:00:00`}
            </pre>
          </div>
          <div>
            <p className="font-medium mb-2">Create a Booking</p>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto">
{`POST /public/bookings
x-api-key: ck_live_your_key_here

{
  "service_city_id": "xxx",
  "service_type": "POINT_TO_POINT",
  "vehicle_class": "BUSINESS",
  "pickup_address": "SYD T3",
  "dropoff_address": "CBD Hotel",
  "pickup_datetime": "2026-03-01T10:00:00",
  "passenger_name": "John Smith",
  "passenger_phone": "+61400000000"
}`}
            </pre>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-blue-700 text-xs">
              📚 Full API documentation available at{' '}
              <a
                href="https://chauffeur-saas-production.up.railway.app/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                API Docs →
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
