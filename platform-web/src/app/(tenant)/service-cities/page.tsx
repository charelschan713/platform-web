'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

const CURRENCIES = ['AUD', 'USD', 'GBP', 'EUR', 'SGD', 'HKD', 'NZD'];

export default function ServiceCitiesPage() {
  const queryClient = useQueryClient();
  const [city_name, setCityName] = useState('');
  const [country_code, setCountryCode] = useState('AU');
  const [timezone, setTimezone] = useState('');
  const [currency, setCurrency] = useState('AUD');

  const { data: cities = [] } = useQuery({
    queryKey: ['service-cities'],
    queryFn: async () => {
      const res = await api.get('/tenants/me/service-cities');
      return res.data;
    },
  });

  const { data: timezones = [] } = useQuery({
    queryKey: ['timezones'],
    queryFn: async () => {
      const res = await api.get('/tenants/timezones');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/tenants/me/service-cities', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-cities'] });
      setCityName('');
      setTimezone('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tenants/me/service-cities/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['service-cities'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Service Cities</h1>
        <p className="text-sm text-gray-500 mt-1">
          Define cities where you operate. Timezone is used for all bookings in
          that city.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Service City</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>City Name *</Label>
              <Input
                value={city_name}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g. Sydney"
              />
            </div>
            <div className="space-y-1">
              <Label>Country Code *</Label>
              <Input
                value={country_code}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                placeholder="AU"
                maxLength={2}
              />
            </div>
            <div className="space-y-1">
              <Label>Timezone *</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz: string) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Currency *</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="mt-4"
            disabled={!city_name || !timezone || !country_code || createMutation.isPending}
            onClick={() =>
              createMutation.mutate({ city_name, country_code, timezone, currency })
            }
          >
            <Plus size={16} className="mr-2" />
            {createMutation.isPending ? 'Adding...' : 'Add City'}
          </Button>
        </CardContent>
      </Card>

      {cities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-3xl mb-3">🌏</p>
            <p className="text-gray-500">No service cities yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cities.map((city: any) => (
            <Card key={city.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{city.city_name}</p>
                      <span className="text-xs bg-muted text-gray-600 px-2 py-0.5 rounded">
                        {city.country_code}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                        {city.currency}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">🕐 {city.timezone}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(city.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
