'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send } from 'lucide-react';

export default function InviteDriverPage() {
  const router = useRouter();
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [invited, setInvited] = useState(false);

  const inviteMutation = useMutation({
    mutationFn: () =>
      api.post('/drivers/invite', {
        first_name,
        last_name,
        phone,
        email,
      }),
    onSuccess: () => setInvited(true),
  });

  if (invited) {
    return (
      <div className="max-w-md mx-auto pt-20 text-center space-y-4">
        <p className="text-5xl">✅</p>
        <h2 className="text-xl font-bold">Invitation Sent!</h2>
        <p className="text-gray-500 text-sm">
          {first_name} {last_name} will receive an SMS with instructions to
          download the driver app and register.
        </p>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => {
              setInvited(false);
              setFirstName('');
              setLastName('');
              setPhone('');
              setEmail('');
            }}
          >
            Invite Another
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push('/drivers')}
          >
            View Drivers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/drivers')}
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Invite Driver</h1>
          <p className="text-sm text-gray-500">Send an invitation via SMS</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Driver Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>First Name *</Label>
              <Input
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
            </div>
            <div className="space-y-1">
              <Label>Last Name *</Label>
              <Input
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Mobile Number *</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+61400000000"
            />
            <p className="text-xs text-gray-400">
              Invitation SMS will be sent to this number
            </p>
          </div>

          <div className="space-y-1">
            <Label>Email (optional)</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          {inviteMutation.isError && (
            <p className="text-sm text-red-500">
              {(inviteMutation.error as any)?.response?.data?.message ??
                'Failed to send invitation'}
            </p>
          )}

          <Button
            className="w-full"
            disabled={
              !first_name ||
              !last_name ||
              !phone ||
              inviteMutation.isPending
            }
            onClick={() => inviteMutation.mutate()}
          >
            <Send size={14} className="mr-2" />
            {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
