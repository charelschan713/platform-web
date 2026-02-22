'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { PricingRule } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

const vehicleClasses = ['BUSINESS', 'FIRST', 'VAN', 'ELECTRIC'];

export default function PricingPage() {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('');
  const { register, handleSubmit, reset } = useForm();

  const { data: rules = [] } = useQuery<PricingRule[]>({
    queryKey: ['pricing'],
    queryFn: async () => {
      const res = await api.get('/tenants/me/pricing');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/tenants/me/pricing', data),
    onSuccess: () => {
      reset();
      setSelectedClass('');
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (rule_id: string) => api.delete(`/tenants/me/pricing/${rule_id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pricing'] }),
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({
      ...data,
      vehicle_class: selectedClass,
      base_fare: parseFloat(data.base_fare),
      price_per_km: parseFloat(data.price_per_km),
      price_per_minute: parseFloat(data.price_per_minute),
      minimum_fare: parseFloat(data.minimum_fare),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pricing Rules</h1>

      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="grid grid-cols-5 gap-6 flex-1 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Class</p>
                  <p className="font-medium">{rule.vehicle_class}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Base Fare</p>
                  <p className="font-medium">
                    {rule.currency} {rule.base_fare}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Per KM</p>
                  <p className="font-medium">
                    {rule.currency} {rule.price_per_km}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Per Min</p>
                  <p className="font-medium">
                    {rule.currency} {rule.price_per_minute}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Minimum</p>
                  <p className="font-medium">
                    {rule.currency} {rule.minimum_fare}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteMutation.mutate(rule.id)}
              >
                <Trash2 size={16} className="text-red-400" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Pricing Rule</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Vehicle Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleClasses.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Base Fare</Label>
                <Input type="number" step="0.01" {...register('base_fare')} />
              </div>
              <div className="space-y-1">
                <Label>Per KM</Label>
                <Input type="number" step="0.01" {...register('price_per_km')} />
              </div>
              <div className="space-y-1">
                <Label>Per Minute</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('price_per_minute')}
                />
              </div>
              <div className="space-y-1">
                <Label>Minimum Fare</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('minimum_fare')}
                />
              </div>
              <div className="space-y-1">
                <Label>Currency</Label>
                <Input {...register('currency')} defaultValue="USD" />
              </div>
            </div>
            <Button type="submit" disabled={!selectedClass || createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Add Rule'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
