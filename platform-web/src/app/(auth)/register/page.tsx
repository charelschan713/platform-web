'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
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

const schema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, 'Minimum 8 characters'),
  company_name: z.string().min(1),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register/tenant', data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-xl font-bold">Application Submitted!</h2>
            <p className="text-gray-500">
              We'll review your application and notify you within 1-2 business
              days.
            </p>
            <Button variant="outline" onClick={() => router.push('/login')}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join as Fleet Operator</CardTitle>
          <CardDescription>
            Apply to list your fleet on our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name</Label>
                <Input {...register('first_name')} />
                {errors.first_name && (
                  <p className="text-xs text-red-500">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Last Name</Label>
                <Input {...register('last_name')} />
                {errors.last_name && (
                  <p className="text-xs text-red-500">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Company Name</Label>
              <Input {...register('company_name')} placeholder="Acme Limousines" />
              {errors.company_name && (
                <p className="text-xs text-red-500">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Company URL Slug</Label>
              <Input {...register('slug')} placeholder="acme-limousines" />
              <p className="text-xs text-gray-400">
                Lowercase, no spaces (e.g. acme-limousines)
              </p>
              {errors.slug && (
                <p className="text-xs text-red-500">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Password</Label>
              <Input type="password" {...register('password')} />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
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
