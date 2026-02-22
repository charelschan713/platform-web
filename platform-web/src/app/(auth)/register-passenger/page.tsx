'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
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

export default function PassengerRegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register/passenger', data);
      const loginRes = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });
      const { user, access_token, refresh_token } = loginRes.data;
      setAuth(user, access_token, refresh_token);
      router.push('/book');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Passenger Account</CardTitle>
          <CardDescription>Book rides with our platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name</Label>
                <Input {...register('first_name', { required: true })} />
              </div>
              <div className="space-y-1">
                <Label>Last Name</Label>
                <Input {...register('last_name', { required: true })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" {...register('email', { required: true })} />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input type="tel" {...register('phone')} />
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input type="password" {...register('password', { required: true })} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
