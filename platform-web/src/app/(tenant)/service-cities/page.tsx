'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus, MapPin } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface ServiceCity {
  id: string;
  city_name: string;
  country_code: string;
  timezone: string;
  currency: string;
  is_active: boolean;
}

export default function ServiceCitiesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cityName, setCityName] = useState('');
  const [countryCode, setCountryCode] = useState('AU');
  const [timezone, setTimezone] = useState('');
  const [currency, setCurrency] = useState('AUD');

  const { data: cities = [], isLoading } = useQuery<ServiceCity[]>({
    queryKey: ['service-cities'],
    queryFn: async () => {
      const res = await api.get('/tenants/me/service-cities');
      return res.data;
    },
  });

  const { data: timezones = [] } = useQuery<string[]>({
    queryKey: ['timezones'],
    queryFn: async () => {
      const res = await api.get('/tenants/timezones');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (dto: any) => api.post('/tenants/me/service-cities', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-cities'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/tenants/me/service-cities/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-cities'] });
    },
  });

  function resetForm() {
    setDialogOpen(false);
    setCityName('');
    setCountryCode('AU');
    setTimezone('');
    setCurrency('AUD');
  }

  function handleSubmit() {
    createMutation.mutate({
      city_name: cityName,
      country_code: countryCode,
      timezone,
      currency,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Cities</h1>
          <p className="text-muted-foreground">
            Manage the cities where your service operates
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add City
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : cities.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No service cities configured. Click &quot;Add City&quot; to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Card key={city.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{city.city_name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(city.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Country:</span>{' '}
                  {city.country_code}
                </p>
                <p>
                  <span className="text-muted-foreground">Timezone:</span>{' '}
                  {city.timezone}
                </p>
                <p>
                  <span className="text-muted-foreground">Currency:</span>{' '}
                  {city.currency}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add City Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Service City</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>City Name</Label>
              <Input
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g. Sydney"
              />
            </div>
            <div>
              <Label>Country Code</Label>
              <Input
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                placeholder="AU"
                maxLength={2}
              />
            </div>
            <div>
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Currency</Label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="AUD"
                maxLength={3}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={
                !cityName.trim() ||
                !timezone ||
                createMutation.isPending
              }
            >
              Add City
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
