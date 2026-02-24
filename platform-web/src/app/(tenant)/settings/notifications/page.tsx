'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function NotificationsSettingsPage() {
  const queryClient = useQueryClient();
  const [sms_account_sid, setSmsAccountSid] = useState('');
  const [sms_auth_token, setSmsAuthToken] = useState('');
  const [twilio_from_number, setTwilioFromNumber] = useState('');
  const [sms_sender_type, setSmsSenderType] = useState<'PHONE' | 'SENDER_ID'>('PHONE');
  const [sms_sender_id, setSmsSenderId] = useState('');

  const { data } = useQuery({
    queryKey: ['tenant-notifications-settings'],
    queryFn: async () => (await api.get('/tenant-settings/notifications')).data,
  });

  useEffect(() => {
    if (!data) return;
    setSmsAccountSid(data.sms_account_sid ?? '');
    setSmsAuthToken(data.sms_auth_token ?? '');
    setTwilioFromNumber(data.twilio_from_number ?? '');
    setSmsSenderType((data.sms_sender_type ?? 'PHONE') as 'PHONE' | 'SENDER_ID');
    setSmsSenderId(data.sms_sender_id ?? '');
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.patch('/tenant-settings/notifications', {
        sms_account_sid,
        sms_auth_token,
        twilio_from_number,
        sms_sender_type,
        sms_sender_id,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenant-notifications-settings'] }),
  });

  const isPremium = (data?.tenant_type ?? 'STANDARD') === 'PREMIUM';

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Notification Settings</h1>

      {!isPremium ? (
        <Card>
          <CardContent className="p-4 text-green-700 bg-green-50 border border-green-200 rounded-lg">
            ✅ SMS 由平台提供，无需设置
          </CardContent>
        </Card>
      ) : (
        <>
          {(!sms_account_sid || !sms_auth_token) && (
            <Card>
              <CardContent className="p-4 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg">
                ⚠️ 您是 Premium 租户，请填写自己的 SMS 设置
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>SMS (Twilio)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>Account SID *</Label>
                <Input value={sms_account_sid} onChange={(e) => setSmsAccountSid(e.target.value)} />
              </div>

              <div className="space-y-1">
                <Label>Auth Token *</Label>
                <Input type="password" value={sms_auth_token} onChange={(e) => setSmsAuthToken(e.target.value)} />
              </div>

              <div className="space-y-1">
                <Label>Sender Type</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={sms_sender_type}
                  onChange={(e) => setSmsSenderType(e.target.value as 'PHONE' | 'SENDER_ID')}
                >
                  <option value="PHONE">Phone Number</option>
                  <option value="SENDER_ID">Sender ID</option>
                </select>
              </div>

              {sms_sender_type === 'PHONE' ? (
                <div className="space-y-1">
                  <Label>From Number</Label>
                  <Input value={twilio_from_number} onChange={(e) => setTwilioFromNumber(e.target.value)} placeholder="+61400000000" />
                </div>
              ) : (
                <div className="space-y-1">
                  <Label>Sender ID (max 11)</Label>
                  <Input value={sms_sender_id} maxLength={11} onChange={(e) => setSmsSenderId(e.target.value)} placeholder="ASCHAUFFEUR" />
                  <p className="text-xs text-gray-500">需在 Twilio 预先注册 Alphanumeric Sender ID</p>
                </div>
              )}

              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
                {saveMutation.isPending ? 'Saving...' : 'Save SMS Settings'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
