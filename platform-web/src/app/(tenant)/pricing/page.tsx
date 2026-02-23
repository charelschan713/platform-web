'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

const SERVICE_TYPES = [
  'POINT_TO_POINT',
  'HOURLY_CHARTER',
  'AIRPORT_PICKUP',
  'AIRPORT_DROPOFF',
];

const EMPTY_FORM = {
  vehicle_type_id: '',
  service_city_id: '',
  service_type: 'POINT_TO_POINT',
  surge_multiplier: 1.0,
  is_active: true,
};

export default function PricingPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [ruleForm, setRuleForm] = useState(EMPTY_FORM);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['pricing-rules'],
    queryFn: async () => {
      const res = await api.get('/tenants/pricing-rules');
      return res.data;
    },
  });

  const { data: vehicleTypes = [] } = useQuery({
    queryKey: ['vehicle-types'],
    queryFn: async () => {
      const res = await api.get('/vehicle-types');
      return res.data;
    },
  });

  const { data: serviceCities = [] } = useQuery({
    queryKey: ['service-cities'],
    queryFn: async () => {
      const res = await api.get('/tenants/service-cities');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/tenants/pricing-rules', ruleForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      setShowForm(false);
      setRuleForm(EMPTY_FORM);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tenants/pricing-rules/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pricing-rules'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pricing Rules</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure surge pricing by vehicle type and city
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-1" /> Add Rule
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-700">
            💡 Base pricing (base fare, per km, hourly rate) is set per Vehicle Type in{' '}
            <a href="/vehicle-types" className="underline font-medium">
              Vehicle Types →
            </a>
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Use Pricing Rules to add surge multipliers for specific cities or service types.
          </p>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border-2 border-gray-900">
          <CardHeader>
            <CardTitle className="text-base">New Pricing Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Vehicle Type *</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={ruleForm.vehicle_type_id}
                  onChange={(e) => setRuleForm((p) => ({ ...p, vehicle_type_id: e.target.value }))}
                >
                  <option value="">Select type...</option>
                  {vehicleTypes.map((vt: any) => (
                    <option key={vt.id} value={vt.id}>
                      {vt.type_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Service City</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={ruleForm.service_city_id}
                  onChange={(e) => setRuleForm((p) => ({ ...p, service_city_id: e.target.value }))}
                >
                  <option value="">All cities</option>
                  {serviceCities.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.city_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Service Type</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={ruleForm.service_type}
                  onChange={(e) => setRuleForm((p) => ({ ...p, service_type: e.target.value }))}
                >
                  {SERVICE_TYPES.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Surge Multiplier</Label>
                <Input
                  type="number"
                  min={1}
                  step={0.1}
                  value={ruleForm.surge_multiplier}
                  onChange={(e) => setRuleForm((p) => ({ ...p, surge_multiplier: parseFloat(e.target.value) }))}
                  placeholder="1.0 = no surge"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={!ruleForm.vehicle_type_id || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? 'Saving...' : 'Create Rule'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 space-y-2">
            <p className="text-3xl">💰</p>
            <p className="text-gray-500">No pricing rules yet</p>
            <p className="text-xs text-gray-400">
              Base pricing is inherited from Vehicle Types. Add surge rules here if needed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {rules.map((rule: any) => (
            <Card key={rule.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold">
                      {rule.vehicle_type_name ?? rule.vehicle_type_id}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {rule.service_type?.replace(/_/g, ' ')}
                    </span>
                    {rule.city_name && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        📍 {rule.city_name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Surge: ×{rule.surge_multiplier ?? 1.0}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400"
                  onClick={() => deleteMutation.mutate(rule.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
