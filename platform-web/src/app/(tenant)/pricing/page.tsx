'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const VEHICLE_CLASSES = ['BUSINESS', 'FIRST', 'VAN', 'ELECTRIC'];
const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

export default function PricingPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('rules');

  // =====================
  // Pricing Rules
  // =====================
  const { data: rules = [] } = useQuery({
    queryKey: ['pricing-rules'],
    queryFn: async () => {
      const res = await api.get('/pricing/rules');
      return res.data;
    },
  });

  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [ruleForm, setRuleForm] = useState({
    vehicle_class: 'BUSINESS',
    service_type: 'POINT_TO_POINT',
    base_fare: '',
    price_per_km: '',
    price_per_minute: '',
    minimum_fare: '',
    hourly_rate: '',
    minimum_hours: '1',
    included_km_per_hour: '',
    extra_km_rate: '',
    surcharge_rules: [] as any[],
  });

  const createRuleMutation = useMutation({
    mutationFn: (data: any) => api.post('/pricing/rules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      setShowRuleForm(false);
      resetRuleForm();
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/pricing/rules/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pricing-rules'] }),
  });

  const resetRuleForm = () => {
    setEditingRule(null);
    setRuleForm({
      vehicle_class: 'BUSINESS',
      service_type: 'POINT_TO_POINT',
      base_fare: '',
      price_per_km: '',
      price_per_minute: '',
      minimum_fare: '',
      hourly_rate: '',
      minimum_hours: '1',
      included_km_per_hour: '',
      extra_km_rate: '',
      surcharge_rules: [],
    });
  };

  const handleSaveRule = () => {
    const payload: any = {
      vehicle_class: ruleForm.vehicle_class,
      service_type: ruleForm.service_type,
      surcharge_rules: ruleForm.surcharge_rules,
    };

    if (ruleForm.service_type === 'POINT_TO_POINT') {
      payload.base_fare = parseFloat(ruleForm.base_fare) || 0;
      payload.price_per_km = parseFloat(ruleForm.price_per_km) || 0;
      payload.price_per_minute = parseFloat(ruleForm.price_per_minute) || 0;
      payload.minimum_fare = parseFloat(ruleForm.minimum_fare) || 0;
    } else {
      payload.hourly_rate = parseFloat(ruleForm.hourly_rate) || 0;
      payload.minimum_hours = parseFloat(ruleForm.minimum_hours) || 1;
      payload.included_km_per_hour = ruleForm.included_km_per_hour
        ? parseFloat(ruleForm.included_km_per_hour)
        : null;
      payload.extra_km_rate = parseFloat(ruleForm.extra_km_rate) || 0;
    }

    createRuleMutation.mutate(payload);
  };

  const addSurchargeRule = () => {
    setRuleForm(prev => ({
      ...prev,
      surcharge_rules: [
        ...prev.surcharge_rules,
        {
          name: '',
          type: 'TIME_RANGE',
          days: [],
          start_time: '20:00',
          end_time: '23:59',
          surcharge_value: 20,
        },
      ],
    }));
  };

  const updateSurchargeRule = (index: number, updates: any) => {
    setRuleForm(prev => ({
      ...prev,
      surcharge_rules: prev.surcharge_rules.map((r, i) =>
        i === index ? { ...r, ...updates } : r
      ),
    }));
  };

  const removeSurchargeRule = (index: number) => {
    setRuleForm(prev => ({
      ...prev,
      surcharge_rules: prev.surcharge_rules.filter((_, i) => i !== index),
    }));
  };

  // =====================
  // Cancellation Policies
  // =====================
  const { data: policies = [] } = useQuery({
    queryKey: ['cancellation-policies'],
    queryFn: async () => {
      const res = await api.get('/pricing/cancellation-policies');
      return res.data;
    },
  });

  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [policyName, setPolicyName] = useState('');
  const [policyTiers, setPolicyTiers] = useState([
    { hours_before: 48, charge_percentage: 0 },
    { hours_before: 24, charge_percentage: 25 },
    { hours_before: 12, charge_percentage: 50 },
    { hours_before: 0, charge_percentage: 100 },
  ]);

  const createPolicyMutation = useMutation({
    mutationFn: (data: any) => api.post('/pricing/cancellation-policies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cancellation-policies'] });
      setShowPolicyForm(false);
    },
  });

  const deletePolicyMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/pricing/cancellation-policies/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cancellation-policies'] }),
  });

  // =====================
  // Promo Codes
  // =====================
  const { data: promos = [] } = useQuery({
    queryKey: ['promo-codes'],
    queryFn: async () => {
      const res = await api.get('/pricing/promo-codes');
      return res.data;
    },
  });

  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    applies_to: 'FARE_ONLY',
    min_order_amount: '',
    max_uses: '',
    valid_until: '',
  });

  const createPromoMutation = useMutation({
    mutationFn: (data: any) => api.post('/pricing/promo-codes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      setShowPromoForm(false);
    },
  });

  const deletePromoMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/pricing/promo-codes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promo-codes'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pricing</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage pricing rules, surcharges, cancellation policies and promo codes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">Pricing Rules</TabsTrigger>
          <TabsTrigger value="cancellation">Cancellation Policy</TabsTrigger>
          <TabsTrigger value="promos">Promo Codes</TabsTrigger>
        </TabsList>

        {/* ===================== */}
        {/* PRICING RULES TAB */}
        {/* ===================== */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowRuleForm(true)}>
              <Plus size={16} className="mr-2" /> Add Pricing Rule
            </Button>
          </div>

          {rules.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-3xl mb-3">💰</p>
                <p className="text-gray-500">No pricing rules yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rules.map((rule: any) => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {rule.vehicle_class}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {rule.service_type === 'POINT_TO_POINT'
                              ? 'Point to Point'
                              : 'Hourly Charter'}
                          </span>
                          {!rule.is_active && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                        </div>

                        {rule.service_type === 'POINT_TO_POINT' ? (
                          <div className="text-sm text-gray-600 space-x-4">
                            <span>Base: ${rule.base_fare}</span>
                            <span>${rule.price_per_km}/km</span>
                            <span>${rule.price_per_minute}/min</span>
                            <span>Min: ${rule.minimum_fare}</span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600 space-x-4">
                            <span>${rule.hourly_rate}/hr</span>
                            <span>Min: {rule.minimum_hours}hrs</span>
                            {rule.included_km_per_hour && (
                              <span>
                                {rule.included_km_per_hour}km/hr included
                              </span>
                            )}
                            {rule.extra_km_rate > 0 && (
                              <span>${rule.extra_km_rate}/km extra</span>
                            )}
                          </div>
                        )}

                        {rule.surcharge_rules?.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {rule.surcharge_rules.map(
                              (sr: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded"
                                >
                                  {sr.name}: +{sr.surcharge_value}%
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteRuleMutation.mutate(rule.id)}
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===================== */}
        {/* CANCELLATION TAB */}
        {/* ===================== */}
        <TabsContent value="cancellation" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowPolicyForm(true)}>
              <Plus size={16} className="mr-2" /> Add Policy
            </Button>
          </div>

          {policies.map((policy: any) => (
            <Card key={policy.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{policy.name}</p>
                      {policy.is_default && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {policy.tiers?.map((tier: any, i: number) => (
                        <div key={i} className="text-sm text-gray-600">
                          {tier.hours_before === 0
                            ? 'Less than any threshold'
                            : `${tier.hours_before}+ hours before`}{' '}
                          → {tier.charge_percentage}% fee
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deletePolicyMutation.mutate(policy.id)}
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ===================== */}
        {/* PROMO CODES TAB */}
        {/* ===================== */}
        <TabsContent value="promos" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowPromoForm(true)}>
              <Plus size={16} className="mr-2" /> Add Promo Code
            </Button>
          </div>

          {promos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-3xl mb-3">🎟️</p>
                <p className="text-gray-500">No promo codes yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {promos.map((promo: any) => (
                <Card key={promo.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold">{promo.code}</p>
                          {!promo.is_active && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {promo.discount_type === 'PERCENTAGE'
                            ? `${promo.discount_value}% off`
                            : `$${promo.discount_value} off`}{' '}
                          {promo.applies_to === 'FARE_ONLY'
                            ? '(fare only)'
                            : '(total)'}
                          {promo.max_uses &&
                            ` · ${promo.used_count}/${promo.max_uses} used`}
                          {promo.valid_until &&
                            ` · Expires ${new Date(
                              promo.valid_until
                            ).toLocaleDateString()}`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePromoMutation.mutate(promo.id)}
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ===================== */}
      {/* ADD RULE DIALOG */}
      {/* ===================== */}
      <Dialog
        open={showRuleForm}
        onOpenChange={(v) => {
          if (!v) {
            setShowRuleForm(false);
            resetRuleForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Pricing Rule</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Vehicle Class</Label>
                <Select
                  value={ruleForm.vehicle_class}
                  onValueChange={(v) =>
                    setRuleForm((prev) => ({ ...prev, vehicle_class: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_CLASSES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Service Type</Label>
                <Select
                  value={ruleForm.service_type}
                  onValueChange={(v) =>
                    setRuleForm((prev) => ({ ...prev, service_type: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POINT_TO_POINT">
                      Point to Point
                    </SelectItem>
                    <SelectItem value="HOURLY_CHARTER">
                      Hourly Charter
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {ruleForm.service_type === 'POINT_TO_POINT' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Base Fare ($)</Label>
                  <Input
                    type="number"
                    value={ruleForm.base_fare}
                    onChange={(e) =>
                      setRuleForm((p) => ({ ...p, base_fare: e.target.value }))
                    }
                    placeholder="15.00"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Price per KM ($)</Label>
                  <Input
                    type="number"
                    value={ruleForm.price_per_km}
                    onChange={(e) =>
                      setRuleForm((p) => ({
                        ...p,
                        price_per_km: e.target.value,
                      }))
                    }
                    placeholder="3.50"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Price per Minute ($)</Label>
                  <Input
                    type="number"
                    value={ruleForm.price_per_minute}
                    onChange={(e) =>
                      setRuleForm((p) => ({
                        ...p,
                        price_per_minute: e.target.value,
                      }))
                    }
                    placeholder="0.80"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Minimum Fare ($)</Label>
                  <Input
                    type="number"
                    value={ruleForm.minimum_fare}
                    onChange={(e) =>
                      setRuleForm((p) => ({
                        ...p,
                        minimum_fare: e.target.value,
                      }))
                    }
                    placeholder="30.00"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Hourly Rate ($)</Label>
                  <Input
                    type="number"
                    value={ruleForm.hourly_rate}
                    onChange={(e) =>
                      setRuleForm((p) => ({
                        ...p,
                        hourly_rate: e.target.value,
                      }))
                    }
                    placeholder="120.00"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Minimum Hours</Label>
                  <Input
                    type="number"
                    value={ruleForm.minimum_hours}
                    onChange={(e) =>
                      setRuleForm((p) => ({
                        ...p,
                        minimum_hours: e.target.value,
                      }))
                    }
                    placeholder="2"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Included KM per Hour (optional)</Label>
                  <Input
                    type="number"
                    value={ruleForm.included_km_per_hour}
                    onChange={(e) =>
                      setRuleForm((p) => ({
                        ...p,
                        included_km_per_hour: e.target.value,
                      }))
                    }
                    placeholder="20"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Extra KM Rate ($/km)</Label>
                  <Input
                    type="number"
                    value={ruleForm.extra_km_rate}
                    onChange={(e) =>
                      setRuleForm((p) => ({
                        ...p,
                        extra_km_rate: e.target.value,
                      }))
                    }
                    placeholder="3.50"
                  />
                </div>
              </div>
            )}

            {/* Surcharge Rules */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Surcharge Rules (叠加计算)</Label>
                <Button size="sm" variant="outline" onClick={addSurchargeRule}>
                  <Plus size={14} className="mr-1" /> Add Surcharge
                </Button>
              </div>
              {ruleForm.surcharge_rules.map((sr, idx) => (
                <Card key={idx} className="bg-gray-50">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Input
                        className="w-40 h-7 text-sm"
                        placeholder="Rule name"
                        value={sr.name}
                        onChange={(e) =>
                          updateSurchargeRule(idx, { name: e.target.value })
                        }
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          className="w-20 h-7 text-sm"
                          type="number"
                          placeholder="%"
                          value={sr.surcharge_value}
                          onChange={(e) =>
                            updateSurchargeRule(idx, {
                              surcharge_value: parseFloat(e.target.value),
                            })
                          }
                        />
                        <span className="text-sm text-gray-500">%</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSurchargeRule(idx)}
                        >
                          <Trash2 size={12} className="text-red-400" />
                        </Button>
                      </div>
                    </div>
                    <Select
                      value={sr.type}
                      onValueChange={(v) =>
                        updateSurchargeRule(idx, { type: v })
                      }
                    >
                      <SelectTrigger className="h-7 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TIME_RANGE">Time Range</SelectItem>
                        <SelectItem value="DAY_TYPE">Day Type</SelectItem>
                        <SelectItem value="SPECIAL_DATE">
                          Special Date
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {sr.type === 'TIME_RANGE' && (
                      <div className="flex items-center gap-2">
                        <Input
                          className="w-24 h-7 text-sm"
                          type="time"
                          value={sr.start_time}
                          onChange={(e) =>
                            updateSurchargeRule(idx, {
                              start_time: e.target.value,
                            })
                          }
                        />
                        <span className="text-sm">to</span>
                        <Input
                          className="w-24 h-7 text-sm"
                          type="time"
                          value={sr.end_time}
                          onChange={(e) =>
                            updateSurchargeRule(idx, {
                              end_time: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}

                    {(sr.type === 'TIME_RANGE' || sr.type === 'DAY_TYPE') && (
                      <div className="flex gap-1 flex-wrap">
                        {DAYS.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const days = sr.days?.includes(day)
                                ? sr.days.filter((d: string) => d !== day)
                                : [...(sr.days ?? []), day];
                              updateSurchargeRule(idx, { days });
                            }}
                            className={`text-xs px-2 py-0.5 rounded border ${
                              sr.days?.includes(day)
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'border-gray-300'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    )}

                    {sr.type === 'SPECIAL_DATE' && (
                      <Input
                        className="h-7 text-sm"
                        placeholder="Dates: 2026-12-25,2026-01-01"
                        value={sr.dates?.join(',') ?? ''}
                        onChange={(e) =>
                          updateSurchargeRule(idx, {
                            dates: e.target.value
                              .split(',')
                              .map((d: string) => d.trim()),
                          })
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              className="w-full"
              onClick={handleSaveRule}
              disabled={createRuleMutation.isPending}
            >
              {createRuleMutation.isPending
                ? 'Saving...'
                : 'Create Pricing Rule'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================== */}
      {/* ADD POLICY DIALOG */}
      {/* ===================== */}
      <Dialog open={showPolicyForm} onOpenChange={setShowPolicyForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Cancellation Policy</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Policy Name</Label>
              <Input
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder="Standard Policy"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Cancellation Tiers</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPolicyTiers((prev) => [
                      ...prev,
                      { hours_before: 0, charge_percentage: 0 },
                    ])
                  }
                >
                  <Plus size={14} />
                </Button>
              </div>
              {policyTiers.map((tier, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-20"
                    placeholder="Hours"
                    value={tier.hours_before}
                    onChange={(e) =>
                      setPolicyTiers((prev) =>
                        prev.map((t, i) =>
                          i === idx
                            ? { ...t, hours_before: parseInt(e.target.value) }
                            : t
                        )
                      )
                    }
                  />
                  <span className="text-sm text-gray-500">hrs before →</span>
                  <Input
                    type="number"
                    className="w-20"
                    placeholder="%"
                    value={tier.charge_percentage}
                    onChange={(e) =>
                      setPolicyTiers((prev) =>
                        prev.map((t, i) =>
                          i === idx
                            ? {
                                ...t,
                                charge_percentage: parseInt(e.target.value),
                              }
                            : t
                        )
                      )
                    }
                  />
                  <span className="text-sm text-gray-500">% fee</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setPolicyTiers((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              disabled={!policyName || createPolicyMutation.isPending}
              onClick={() =>
                createPolicyMutation.mutate({
                  name: policyName,
                  tiers: policyTiers,
                  is_default: policies.length === 0,
                })
              }
            >
              {createPolicyMutation.isPending ? 'Saving...' : 'Create Policy'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================== */}
      {/* ADD PROMO DIALOG */}
      {/* ===================== */}
      <Dialog open={showPromoForm} onOpenChange={setShowPromoForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Promo Code</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Code *</Label>
              <Input
                value={promoForm.code}
                onChange={(e) =>
                  setPromoForm((p) => ({
                    ...p,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="SUMMER20"
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Discount Type</Label>
                <Select
                  value={promoForm.discount_type}
                  onValueChange={(v) =>
                    setPromoForm((p) => ({ ...p, discount_type: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>
                  {promoForm.discount_type === 'PERCENTAGE'
                    ? 'Discount %'
                    : 'Discount $'}
                </Label>
                <Input
                  type="number"
                  value={promoForm.discount_value}
                  onChange={(e) =>
                    setPromoForm((p) => ({
                      ...p,
                      discount_value: e.target.value,
                    }))
                  }
                  placeholder={
                    promoForm.discount_type === 'PERCENTAGE' ? '20' : '50'
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Applies To</Label>
              <Select
                value={promoForm.applies_to}
                onValueChange={(v) =>
                  setPromoForm((p) => ({ ...p, applies_to: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FARE_ONLY">Fare Only</SelectItem>
                  <SelectItem value="TOTAL">Total Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Max Uses (optional)</Label>
                <Input
                  type="number"
                  value={promoForm.max_uses}
                  onChange={(e) =>
                    setPromoForm((p) => ({ ...p, max_uses: e.target.value }))
                  }
                  placeholder="100"
                />
              </div>
              <div className="space-y-1">
                <Label>Expires (optional)</Label>
                <Input
                  type="date"
                  value={promoForm.valid_until}
                  onChange={(e) =>
                    setPromoForm((p) => ({
                      ...p,
                      valid_until: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <Button
              className="w-full"
              disabled={
                !promoForm.code ||
                !promoForm.discount_value ||
                createPromoMutation.isPending
              }
              onClick={() =>
                createPromoMutation.mutate({
                  code: promoForm.code,
                  discount_type: promoForm.discount_type,
                  discount_value: parseFloat(promoForm.discount_value),
                  applies_to: promoForm.applies_to,
                  max_uses: promoForm.max_uses
                    ? parseInt(promoForm.max_uses)
                    : undefined,
                  valid_until: promoForm.valid_until || undefined,
                })
              }
            >
              {createPromoMutation.isPending
                ? 'Creating...'
                : 'Create Promo Code'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
