'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Play, CheckCircle, XCircle, Clock } from 'lucide-react';

const EVENT_GROUPS: Record<string, string[]> = {
  Booking: [
    'booking.created',
    'booking.confirmed',
    'booking.cancelled',
    'booking.completed',
    'booking.driver_assigned',
    'booking.driver_on_the_way',
    'booking.driver_arrived',
    'booking.no_show',
  ],
  Payment: ['payment.paid', 'payment.refunded'],
  Driver: ['driver.verified'],
};

export default function WebhooksPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [newSecret, setNewSecret] = useState('');

  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const res = await api.get('/webhooks');
      return res.data;
    },
  });

  const { data: deliveryLogs = [] } = useQuery({
    queryKey: ['webhook-deliveries', selectedWebhook?.id],
    queryFn: async () => {
      if (!selectedWebhook) return [];
      const res = await api.get(`/webhooks/${selectedWebhook.id}/deliveries`);
      return res.data;
    },
    enabled: !!selectedWebhook,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/webhooks', {
        webhook_name: webhookName,
        webhook_url: webhookUrl,
        events: selectedEvents,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setNewSecret(res.data.secret_key);
      setShowCreate(false);
      setWebhookName('');
      setWebhookUrl('');
      setSelectedEvents([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/webhooks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setSelectedWebhook(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.patch(`/webhooks/${id}`, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['webhooks'] }),
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => api.post(`/webhooks/${id}/test`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ['webhook-deliveries', selectedWebhook?.id],
      });
      alert(
        res.data.success
          ? `✅ Test delivered! Status: ${res.data.status_code}`
          : `❌ Test failed! Status: ${res.data.status_code}`,
      );
    },
  });

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  const selectAllInGroup = (events: string[]) => {
    const allSelected = events.every((e) => selectedEvents.includes(e));
    if (allSelected) {
      setSelectedEvents((prev) => prev.filter((e) => !events.includes(e)));
    } else {
      setSelectedEvents((prev) => [...new Set([...prev, ...events])]);
    }
  };

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleString('en-AU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Webhooks</h1>
          <p className="text-sm text-gray-500">Receive real-time event notifications</p>
        </div>
      </div>

      {newSecret && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <p className="font-semibold text-green-800">Webhook Created</p>
            </div>
            <p className="text-xs text-green-700">
              Save this secret. Use it to verify webhook signatures. It won&apos;t be shown again.
            </p>
            <div className="flex gap-2">
              <Input value={newSecret} readOnly className="font-mono text-xs bg-card" />
              <Button size="sm" onClick={() => navigator.clipboard.writeText(newSecret)}>
                Copy
              </Button>
            </div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => setNewSecret('')}>
              I&apos;ve saved my secret
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        {/* Left: Webhook List */}
        <div className="w-72 flex-shrink-0 space-y-3">
          <Button className="w-full" size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus size={14} className="mr-1" /> Add Endpoint
          </Button>

          {showCreate && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-bold">New Webhook</p>
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={webhookName}
                    onChange={(e) => setWebhookName(e.target.value)}
                    placeholder="My Webhook"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Endpoint URL</Label>
                  <Input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://myapp.com/webhook"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Events</Label>
                  {Object.entries(EVENT_GROUPS).map(([group, events]) => (
                    <div key={group}>
                      <button
                        type="button"
                        className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 hover:text-gray-800"
                        onClick={() => selectAllInGroup(events)}
                      >
                        {group}
                      </button>
                      <div className="space-y-1 ml-1">
                        {events.map((event) => (
                          <label key={event} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedEvents.includes(event)}
                              onChange={() => toggleEvent(event)}
                              className="rounded"
                            />
                            <span className="text-xs font-mono">{event}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={
                      !webhookName || !webhookUrl || selectedEvents.length === 0 || createMutation.isPending
                    }
                    onClick={() => createMutation.mutate()}
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
          ) : webhooks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 space-y-2">
                <p className="text-2xl">🔗</p>
                <p className="text-sm text-gray-500">No webhooks yet</p>
              </CardContent>
            </Card>
          ) : (
            webhooks.map((wh: any) => (
              <Card
                key={wh.id}
                className={`cursor-pointer transition-all ${
                  selectedWebhook?.id === wh.id ? 'ring-2 ring-gray-900' : 'hover:shadow-md'
                } ${!wh.is_active ? 'opacity-50' : ''}`}
                onClick={() => setSelectedWebhook(wh)}
              >
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{wh.webhook_name}</p>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        wh.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-gray-500'
                      }`}
                    >
                      {wh.is_active ? 'On' : 'Off'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate" title={wh.webhook_url}>
                    {wh.webhook_url}
                  </p>
                  <p className="text-xs text-gray-400">{wh.events.length} events</p>
                  {wh.last_triggered_at && (
                    <p className="text-xs text-gray-400">
                      Last: {wh.last_status_code === 200 ? '✅' : '❌'}{' '}
                      {formatDate(wh.last_triggered_at)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right: Webhook Detail */}
        <div className="flex-1">
          {!selectedWebhook ? (
            <Card>
              <CardContent className="text-center py-16">
                <p className="text-3xl mb-3">🔗</p>
                <p className="text-gray-500">Select a webhook to view details</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{selectedWebhook.webhook_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Endpoint URL</p>
                    <p className="font-mono text-sm break-all">{selectedWebhook.webhook_url}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Subscribed Events</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedWebhook.events.map((e: string) => (
                        <span key={e} className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testMutation.mutate(selectedWebhook.id)}
                      disabled={testMutation.isPending}
                    >
                      <Play size={12} className="mr-1" />
                      {testMutation.isPending ? 'Sending...' : 'Send Test'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toggleMutation.mutate({
                          id: selectedWebhook.id,
                          is_active: !selectedWebhook.is_active,
                        })
                      }
                    >
                      {selectedWebhook.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 ml-auto"
                      onClick={() => {
                        if (confirm('Delete this webhook?')) {
                          deleteMutation.mutate(selectedWebhook.id);
                        }
                      }}
                    >
                      <Trash2 size={12} className="mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                  {deliveryLogs.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No deliveries yet</p>
                  ) : (
                    <div className="space-y-2">
                      {deliveryLogs.map((log: any) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 p-2 rounded-lg bg-muted text-sm"
                        >
                          {log.success ? (
                            <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-medium">{log.event_type}</span>
                              <span
                                className={`text-xs font-mono ${log.success ? 'text-green-600' : 'text-red-500'}`}
                              >
                                {log.response_status || '—'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Clock size={10} className="text-gray-400" />
                              <span className="text-xs text-gray-400">
                                {formatDate(log.delivered_at)}
                              </span>
                              <span className="text-xs text-gray-400">{log.duration_ms}ms</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">📖 Verify Signatures</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-gray-500">Each webhook includes these headers:</p>
                  <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto">
{`X-Webhook-Event: booking.confirmed
X-Webhook-Timestamp: 1708000000000
X-Webhook-Signature: sha256=abc123...`}
                  </pre>
                  <p className="text-gray-500">Verify in Node.js:</p>
                  <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto">
{`const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(\`\${timestamp}.\${rawBody}\`)
  .digest('hex');

const isValid = signature === req.headers['x-webhook-signature']
  .replace('sha256=', '');`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
