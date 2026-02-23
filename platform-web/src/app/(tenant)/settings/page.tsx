'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState('');

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant-me'],
    queryFn: async () => {
      const res = await api.get('/tenants/me');
      return res.data;
    },
  });

  const [tenant_name, setTenantName] = useState('');
  const [tenant_domain, setTenantDomain] = useState('');
  const [support_email, setSupportEmail] = useState('');
  const [support_phone, setSupportPhone] = useState('');
  const [logo_url, setLogoUrl] = useState('');

  const [resend_api_key, setResendApiKey] = useState('');
  const [resend_from_email, setResendFromEmail] = useState('');
  const [twilio_account_sid, setTwilioAccountSid] = useState('');
  const [twilio_auth_token, setTwilioAuthToken] = useState('');
  const [twilio_from_number, setTwilioFromNumber] = useState('');

  const [stripe_publishable_key, setStripePublishableKey] = useState('');
  const [stripe_secret_key, setStripeSecretKey] = useState('');
  const [stripe_webhook_secret, setStripeWebhookSecret] = useState('');

  useEffect(() => {
    if (!tenant) return;
    setTenantName(tenant.tenant_name ?? tenant.name ?? '');
    setTenantDomain(tenant.tenant_domain ?? tenant.domain ?? '');
    setSupportEmail(tenant.support_email ?? '');
    setSupportPhone(tenant.support_phone ?? '');
    setLogoUrl(tenant.logo_url ?? '');

    setResendApiKey(tenant.resend_api_key ?? '');
    setResendFromEmail(tenant.resend_from_email ?? '');
    setTwilioAccountSid(tenant.twilio_account_sid ?? '');
    setTwilioAuthToken(tenant.twilio_auth_token ?? '');
    setTwilioFromNumber(tenant.twilio_from_number ?? '');

    setStripePublishableKey(tenant.stripe_publishable_key ?? '');
    setStripeSecretKey(tenant.stripe_secret_key ?? '');
    setStripeWebhookSecret(tenant.stripe_webhook_secret ?? '');
  }, [tenant]);

  const saveProfileMutation = useMutation({
    mutationFn: () =>
      api.patch('/tenants/me', {
        tenant_name,
        tenant_domain,
        support_email,
        support_phone,
        logo_url,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-me'] });
      setSaved('profile');
      setTimeout(() => setSaved(''), 3000);
    },
  });

  const saveNotificationsMutation = useMutation({
    mutationFn: () =>
      api.patch('/tenants/me/integrations', {
        resend_api_key,
        resend_from_email,
        twilio_account_sid,
        twilio_auth_token,
        twilio_from_number,
      }),
    onSuccess: () => {
      setSaved('notifications');
      setTimeout(() => setSaved(''), 3000);
    },
  });

  const savePaymentsMutation = useMutation({
    mutationFn: () =>
      api.patch('/tenants/me/integrations', {
        stripe_publishable_key,
        stripe_secret_key,
        stripe_webhook_secret,
      }),
    onSuccess: () => {
      setSaved('payments');
      setTimeout(() => setSaved(''), 3000);
    },
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaved('password');
      setTimeout(() => setSaved(''), 3000);
    },
  });

  const handleChangePassword = () => {
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    changePasswordMutation.mutate();
  };

  const SavedBadge = ({ section }: { section: string }) => {
    if (saved !== section) return null;
    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <CheckCircle size={12} />
        Saved!
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your account and integrations
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="flex-1">
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex-1">
            Payments
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1">
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Business Profile</CardTitle>
                <SavedBadge section="profile" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Business Name</Label>
                <Input
                  value={tenant_name}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="My Chauffeur Co."
                />
              </div>

              <div className="space-y-1">
                <Label>Custom Domain</Label>
                <Input
                  value={tenant_domain}
                  onChange={(e) => setTenantDomain(e.target.value)}
                  placeholder="book.mycompany.com"
                />
                <p className="text-xs text-gray-400">White-label booking portal domain</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    value={support_email}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@mycompany.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Support Phone</Label>
                  <Input
                    value={support_phone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="+61 2 9000 0000"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Logo URL</Label>
                <Input
                  value={logo_url}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://mycompany.com/logo.png"
                />
                {logo_url && (
                  <img
                    src={logo_url}
                    alt="Logo preview"
                    className="h-12 mt-2 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tenant ID</span>
                  <span className="font-mono text-xs">{tenant?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Slug</span>
                  <span className="font-mono">@{tenant?.tenant_slug ?? tenant?.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-600 font-medium">
                    {tenant?.tenant_status ?? tenant?.status}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => saveProfileMutation.mutate()}
                disabled={saveProfileMutation.isPending}
              >
                {saveProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">📧 Email (Resend)</CardTitle>
                  <SavedBadge section="notifications" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-500">
                  Used for booking confirmations, receipts, and payment links. Get your API
                  key at{' '}
                  <a
                    href="https://resend.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    resend.com
                  </a>
                </p>
                <div className="space-y-1">
                  <Label>Resend API Key</Label>
                  <Input
                    type="password"
                    value={resend_api_key}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    placeholder="re_xxxxxxxxxxxx"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label>From Email Address</Label>
                  <Input
                    type="email"
                    value={resend_from_email}
                    onChange={(e) => setResendFromEmail(e.target.value)}
                    placeholder="noreply@mycompany.com"
                  />
                  <p className="text-xs text-gray-400">
                    Must be verified in your Resend domain settings
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">📱 SMS (Twilio)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-500">
                  Used for driver on-the-way and arrival SMS to passengers. Get credentials at{' '}
                  <a
                    href="https://twilio.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    twilio.com
                  </a>
                </p>
                <div className="space-y-1">
                  <Label>Account SID</Label>
                  <Input
                    value={twilio_account_sid}
                    onChange={(e) => setTwilioAccountSid(e.target.value)}
                    placeholder="ACxxxxxxxxxxxx"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Auth Token</Label>
                  <Input
                    type="password"
                    value={twilio_auth_token}
                    onChange={(e) => setTwilioAuthToken(e.target.value)}
                    placeholder="xxxxxxxxxxxx"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label>From Number</Label>
                  <Input
                    value={twilio_from_number}
                    onChange={(e) => setTwilioFromNumber(e.target.value)}
                    placeholder="+61400000000"
                    className="font-mono"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full"
              onClick={() => saveNotificationsMutation.mutate()}
              disabled={saveNotificationsMutation.isPending}
            >
              {saveNotificationsMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">💳 Stripe Configuration</CardTitle>
                <SavedBadge section="payments" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-gray-500">
                Configure your own Stripe account to receive payments directly. Get your keys at{' '}
                <a
                  href="https://dashboard.stripe.com/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  dashboard.stripe.com
                </a>
              </p>

              <div className="space-y-1">
                <Label>Publishable Key</Label>
                <Input
                  value={stripe_publishable_key}
                  onChange={(e) => setStripePublishableKey(e.target.value)}
                  placeholder="pk_live_xxxxxxxxxxxx"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label>Secret Key</Label>
                <Input
                  type="password"
                  value={stripe_secret_key}
                  onChange={(e) => setStripeSecretKey(e.target.value)}
                  placeholder="sk_live_xxxxxxxxxxxx"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label>Webhook Secret</Label>
                <Input
                  type="password"
                  value={stripe_webhook_secret}
                  onChange={(e) => setStripeWebhookSecret(e.target.value)}
                  placeholder="whsec_xxxxxxxxxxxx"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-400">
                  Webhook endpoint:
                  <span className="font-mono ml-1 bg-gray-100 px-1 rounded">/payments/webhook</span>
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-yellow-700">
                    Secret key is encrypted before storage. If left blank, the platform's
                    default Stripe account will be used.
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => savePaymentsMutation.mutate()}
                disabled={savePaymentsMutation.isPending}
              >
                {savePaymentsMutation.isPending ? 'Saving...' : 'Save Payment Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">🔒 Change Password</CardTitle>
                <SavedBadge section="password" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-1">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                />
              </div>
              <div className="space-y-1">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle size={14} />
                  <p className="text-sm">{passwordError}</p>
                </div>
              )}

              {changePasswordMutation.isError && (
                <p className="text-sm text-red-500">
                  {(changePasswordMutation.error as any)?.response?.data?.message ??
                    'Failed to change password'}
                </p>
              )}

              <Button
                className="w-full"
                onClick={handleChangePassword}
                disabled={
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  changePasswordMutation.isPending
                }
              >
                {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
