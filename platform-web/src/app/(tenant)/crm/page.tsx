'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Phone, Mail, Building2, Users } from 'lucide-react';

const TABS = ['Contacts', 'Passengers'] as const;
type Tab = (typeof TABS)[number];

const EMPTY_CONTACT = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  company_name: '',
  customer_type: 'INDIVIDUAL',
  payment_type: 'PREPAID',
  credit_limit: 0,
  payment_terms: 'NET_7',
  discount_p2p: 0,
  discount_charter: 0,
  discount_airport: 0,
  tags: [] as string[],
  notes: '',
  internal_notes: '',
};

const EMPTY_PASSENGER = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  company_name: '',
  preferred_temperature: '',
  preferred_music: '',
  preferred_language: '',
  allergies: '',
  special_requirements: '',
  notes: '',
};

export default function CrmPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('Contacts');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState(EMPTY_CONTACT);
  const [passengerForm, setPassengerForm] = useState(EMPTY_PASSENGER);

  const { data: contacts = [], isLoading: loadingContacts } = useQuery({
    queryKey: ['contacts', search],
    queryFn: async () => {
      const res = await api.get('/crm/contacts', {
        params: { search: search || undefined },
      });
      return res.data;
    },
  });

  const { data: passengers = [], isLoading: loadingPassengers } = useQuery({
    queryKey: ['passengers', search],
    queryFn: async () => {
      const res = await api.get('/crm/passengers', {
        params: { search: search || undefined },
      });
      return res.data;
    },
  });

  const { data: selectedContact } = useQuery({
    queryKey: ['contact', selectedId],
    queryFn: async () => {
      const res = await api.get(`/crm/contacts/${selectedId}`);
      return res.data;
    },
    enabled: !!selectedId && tab === 'Contacts',
  });

  const { data: selectedPassenger } = useQuery({
    queryKey: ['passenger', selectedId],
    queryFn: async () => {
      const res = await api.get(`/crm/passengers/${selectedId}`);
      return res.data;
    },
    enabled: !!selectedId && tab === 'Passengers',
  });

  const createContactMutation = useMutation({
    mutationFn: () => api.post('/crm/contacts', contactForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setShowForm(false);
      setContactForm(EMPTY_CONTACT);
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: () => api.patch(`/crm/contacts/${editingId}`, contactForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', editingId] });
      setShowForm(false);
      setEditingId(null);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/crm/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setSelectedId(null);
    },
  });

  const createPassengerMutation = useMutation({
    mutationFn: () => api.post('/crm/passengers', passengerForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      setShowForm(false);
      setPassengerForm(EMPTY_PASSENGER);
    },
  });

  const updatePassengerMutation = useMutation({
    mutationFn: () => api.patch(`/crm/passengers/${editingId}`, passengerForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      queryClient.invalidateQueries({ queryKey: ['passenger', editingId] });
      setShowForm(false);
      setEditingId(null);
    },
  });

  const deletePassengerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/crm/passengers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      setSelectedId(null);
    },
  });

  const handleEditContact = (c: any) => {
    setEditingId(c.id);
    setContactForm({
      first_name: c.first_name ?? '',
      last_name: c.last_name ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      company_name: c.company_name ?? '',
      customer_type: c.customer_type ?? 'INDIVIDUAL',
      payment_type: c.payment_type ?? 'PREPAID',
      credit_limit: c.credit_limit ?? 0,
      payment_terms: c.payment_terms ?? 'NET_7',
      discount_p2p: c.discount_p2p ?? 0,
      discount_charter: c.discount_charter ?? 0,
      discount_airport: c.discount_airport ?? 0,
      tags: c.tags ?? [],
      notes: c.notes ?? '',
      internal_notes: c.internal_notes ?? '',
    });
    setShowForm(true);
  };

  const handleEditPassenger = (p: any) => {
    setEditingId(p.id);
    setPassengerForm({
      first_name: p.first_name ?? '',
      last_name: p.last_name ?? '',
      phone: p.phone ?? '',
      email: p.email ?? '',
      company_name: p.company_name ?? '',
      preferred_temperature: p.preferred_temperature ?? '',
      preferred_music: p.preferred_music ?? '',
      preferred_language: p.preferred_language ?? '',
      allergies: p.allergies ?? '',
      special_requirements: p.special_requirements ?? '',
      notes: p.notes ?? '',
    });
    setShowForm(true);
  };

  return (
    <div className="flex h-full gap-4">
      <div className="w-80 shrink-0 space-y-3">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setSelectedId(null);
                setShowForm(false);
                setSearch('');
              }}
              className={`flex-1 py-1.5 text-sm rounded-md transition-all ${
                tab === t ? 'bg-white font-semibold shadow-sm' : 'text-gray-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            <Input
              className="pl-8 text-sm"
              placeholder={`Search ${tab.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingId(null);
              setContactForm(EMPTY_CONTACT);
              setPassengerForm(EMPTY_PASSENGER);
              setShowForm(true);
            }}
          >
            <Plus size={14} />
          </Button>
        </div>

        <div className="space-y-1.5 max-h-[calc(100vh-220px)] overflow-y-auto">
          {tab === 'Contacts' ? (
            loadingContacts ? (
              <p className="text-center text-gray-400 py-8 text-sm">Loading...</p>
            ) : contacts.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No contacts yet</p>
            ) : (
              contacts.map((c: any) => (
                <Card
                  key={c.id}
                  className={`cursor-pointer transition-all ${
                    selectedId === c.id ? 'ring-2 ring-gray-900' : 'hover:shadow-sm'
                  }`}
                  onClick={() => {
                    setSelectedId(c.id);
                    setShowForm(false);
                  }}
                >
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">
                        {c.first_name} {c.last_name}
                      </p>
                      {c.payment_type === 'MONTHLY_ACCOUNT' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                          Account
                        </span>
                      )}
                    </div>
                    {c.company_name && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Building2 size={10} /> {c.company_name}
                      </p>
                    )}
                    {c.phone && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Phone size={10} /> {c.phone}
                      </p>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      {(c.tags ?? []).map((tag: string) => (
                        <span
                          key={tag}
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            tag === 'VIP'
                              ? 'bg-yellow-100 text-yellow-700'
                              : tag === 'BLACKLIST'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          ) : loadingPassengers ? (
            <p className="text-center text-gray-400 py-8 text-sm">Loading...</p>
          ) : passengers.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No passengers yet</p>
          ) : (
            passengers.map((p: any) => (
              <Card
                key={p.id}
                className={`cursor-pointer transition-all ${
                  selectedId === p.id ? 'ring-2 ring-gray-900' : 'hover:shadow-sm'
                }`}
                onClick={() => {
                  setSelectedId(p.id);
                  setShowForm(false);
                }}
              >
                <CardContent className="p-3 space-y-1">
                  <p className="font-medium text-sm">
                    {p.first_name} {p.last_name}
                  </p>
                  {p.phone && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Phone size={10} /> {p.phone}
                    </p>
                  )}
                  {p.total_rides > 0 && <p className="text-xs text-gray-400">{p.total_rides} rides</p>}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showForm && tab === 'Contacts' && (
          <Card>
            <CardContent className="p-5 space-y-5">
              <p className="font-bold text-lg">{editingId ? 'Edit Contact' : 'New Contact'}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>First Name *</Label>
                  <Input
                    value={contactForm.first_name}
                    onChange={(e) => setContactForm((p) => ({ ...p, first_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Last Name</Label>
                  <Input
                    value={contactForm.last_name}
                    onChange={(e) => setContactForm((p) => ({ ...p, last_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input
                    value={contactForm.phone}
                    onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    value={contactForm.email}
                    onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label>Company</Label>
                  <Input
                    value={contactForm.company_name}
                    onChange={(e) =>
                      setContactForm((p) => ({ ...p, company_name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Type</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={contactForm.customer_type}
                    onChange={(e) =>
                      setContactForm((p) => ({ ...p, customer_type: e.target.value }))
                    }
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="CORPORATE">Corporate</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Tags</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      setContactForm((p) => ({
                        ...p,
                        tags: p.tags.includes(val)
                          ? p.tags.filter((t) => t !== val)
                          : [...p.tags, val],
                      }));
                    }}
                  >
                    <option value="">Add tag...</option>
                    <option value="VIP">VIP</option>
                    <option value="REGULAR">Regular</option>
                    <option value="BLACKLIST">Blacklist</option>
                  </select>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {contactForm.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 px-2 py-0.5 rounded-full cursor-pointer"
                        onClick={() =>
                          setContactForm((p) => ({
                            ...p,
                            tags: p.tags.filter((t) => t !== tag),
                          }))
                        }
                      >
                        {tag} ×
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-3">Account Settings</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Payment Type</Label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={contactForm.payment_type}
                      onChange={(e) =>
                        setContactForm((p) => ({ ...p, payment_type: e.target.value }))
                      }
                    >
                      <option value="PREPAID">Prepaid</option>
                      <option value="MONTHLY_ACCOUNT">Monthly Account</option>
                    </select>
                  </div>
                  {contactForm.payment_type === 'MONTHLY_ACCOUNT' && (
                    <>
                      <div className="space-y-1">
                        <Label>Payment Terms</Label>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          value={contactForm.payment_terms}
                          onChange={(e) =>
                            setContactForm((p) => ({ ...p, payment_terms: e.target.value }))
                          }
                        >
                          <option value="NET_7">NET 7</option>
                          <option value="NET_14">NET 14</option>
                          <option value="NET_30">NET 30</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label>Credit Limit ($)</Label>
                        <Input
                          type="number"
                          value={contactForm.credit_limit}
                          onChange={(e) =>
                            setContactForm((p) => ({
                              ...p,
                              credit_limit: parseFloat(e.target.value || '0'),
                            }))
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-3">Discounts (%)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>P2P</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={contactForm.discount_p2p}
                      onChange={(e) =>
                        setContactForm((p) => ({
                          ...p,
                          discount_p2p: parseFloat(e.target.value || '0'),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Charter</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={contactForm.discount_charter}
                      onChange={(e) =>
                        setContactForm((p) => ({
                          ...p,
                          discount_charter: parseFloat(e.target.value || '0'),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Airport</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={contactForm.discount_airport}
                      onChange={(e) =>
                        setContactForm((p) => ({
                          ...p,
                          discount_airport: parseFloat(e.target.value || '0'),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Notes</Label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 text-sm h-20 resize-none"
                    value={contactForm.notes}
                    onChange={(e) => setContactForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Visible notes..."
                  />
                </div>
                <div className="space-y-1">
                  <Label>Internal Notes</Label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 text-sm h-20 resize-none"
                    value={contactForm.internal_notes}
                    onChange={(e) =>
                      setContactForm((p) => ({ ...p, internal_notes: e.target.value }))
                    }
                    placeholder="Staff only..."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={!contactForm.first_name}
                  onClick={() =>
                    editingId ? updateContactMutation.mutate() : createContactMutation.mutate()
                  }
                >
                  {editingId ? 'Update' : 'Create Contact'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showForm && tab === 'Passengers' && (
          <Card>
            <CardContent className="p-5 space-y-5">
              <p className="font-bold text-lg">{editingId ? 'Edit Passenger' : 'New Passenger'}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>First Name *</Label>
                  <Input
                    value={passengerForm.first_name}
                    onChange={(e) =>
                      setPassengerForm((p) => ({ ...p, first_name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Last Name</Label>
                  <Input
                    value={passengerForm.last_name}
                    onChange={(e) =>
                      setPassengerForm((p) => ({ ...p, last_name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input
                    value={passengerForm.phone}
                    onChange={(e) => setPassengerForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    value={passengerForm.email}
                    onChange={(e) => setPassengerForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label>Company</Label>
                  <Input
                    value={passengerForm.company_name}
                    onChange={(e) =>
                      setPassengerForm((p) => ({ ...p, company_name: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-3">Passenger Preferences</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Preferred Temperature</Label>
                    <Input
                      value={passengerForm.preferred_temperature}
                      onChange={(e) =>
                        setPassengerForm((p) => ({
                          ...p,
                          preferred_temperature: e.target.value,
                        }))
                      }
                      placeholder="e.g. 22°C, Cool"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Preferred Music</Label>
                    <Input
                      value={passengerForm.preferred_music}
                      onChange={(e) =>
                        setPassengerForm((p) => ({ ...p, preferred_music: e.target.value }))
                      }
                      placeholder="e.g. Jazz, Classical"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Preferred Language</Label>
                    <Input
                      value={passengerForm.preferred_language}
                      onChange={(e) =>
                        setPassengerForm((p) => ({ ...p, preferred_language: e.target.value }))
                      }
                      placeholder="e.g. English, Mandarin"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Allergies / Health Notes</Label>
                    <Input
                      value={passengerForm.allergies}
                      onChange={(e) =>
                        setPassengerForm((p) => ({ ...p, allergies: e.target.value }))
                      }
                      placeholder="e.g. Nut allergy"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label>Special Requirements</Label>
                    <textarea
                      className="w-full border rounded-md px-3 py-2 text-sm h-16 resize-none"
                      value={passengerForm.special_requirements}
                      onChange={(e) =>
                        setPassengerForm((p) => ({
                          ...p,
                          special_requirements: e.target.value,
                        }))
                      }
                      placeholder="Wheelchair, child seat, etc."
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label>Notes</Label>
                    <textarea
                      className="w-full border rounded-md px-3 py-2 text-sm h-16 resize-none"
                      value={passengerForm.notes}
                      onChange={(e) => setPassengerForm((p) => ({ ...p, notes: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={!passengerForm.first_name}
                  onClick={() =>
                    editingId ? updatePassengerMutation.mutate() : createPassengerMutation.mutate()
                  }
                >
                  {editingId ? 'Update' : 'Create Passenger'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!showForm && selectedId && tab === 'Contacts' && selectedContact && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedContact.first_name} {selectedContact.last_name}
                    </h2>
                    {selectedContact.company_name && (
                      <p className="text-gray-500 text-sm">{selectedContact.company_name}</p>
                    )}
                    <div className="flex gap-1 mt-1">
                      {(selectedContact.tags ?? []).map((tag: string) => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            tag === 'VIP'
                              ? 'bg-yellow-100 text-yellow-700'
                              : tag === 'BLACKLIST'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditContact(selectedContact)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500"
                      onClick={() => {
                        if (confirm('Delete this contact?')) {
                          deleteContactMutation.mutate(selectedContact.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedContact.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} /> {selectedContact.phone}
                    </div>
                  )}
                  {selectedContact.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={14} /> {selectedContact.email}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Total Bookings</p>
                    <p className="font-bold">{selectedContact.total_bookings ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Spent</p>
                    <p className="font-bold">${(selectedContact.total_spent ?? 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Payment</p>
                    <p className="font-bold">
                      {selectedContact.payment_type === 'MONTHLY_ACCOUNT' ? 'Monthly Account' : 'Prepaid'}
                    </p>
                  </div>
                </div>

                {selectedContact.payment_type === 'MONTHLY_ACCOUNT' && (
                  <div className="grid grid-cols-3 gap-3 text-sm border rounded-lg p-3">
                    <div>
                      <p className="text-xs text-gray-400">Credit Limit</p>
                      <p className="font-semibold">${selectedContact.credit_limit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Balance</p>
                      <p className="font-semibold text-red-500">${selectedContact.current_balance}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Terms</p>
                      <p className="font-semibold">{selectedContact.payment_terms}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">P2P Discount</p>
                    <p className="font-semibold">{selectedContact.discount_p2p ?? 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Charter Discount</p>
                    <p className="font-semibold">{selectedContact.discount_charter ?? 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Airport Discount</p>
                    <p className="font-semibold">{selectedContact.discount_airport ?? 0}%</p>
                  </div>
                </div>

                {selectedContact.notes && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Notes</p>
                    <p className="text-sm bg-gray-50 rounded p-2">{selectedContact.notes}</p>
                  </div>
                )}

                {selectedContact.internal_notes && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Internal Notes (Staff Only)</p>
                    <p className="text-sm bg-yellow-50 rounded p-2">{selectedContact.internal_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedContact.bookings?.length > 0 && (
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold text-sm">Booking History</p>
                  {selectedContact.bookings.map((b: any) => (
                    <div key={b.id} className="flex justify-between text-sm border-b pb-2">
                      <div>
                        <p className="font-medium">{b.booking_number}</p>
                        <p className="text-xs text-gray-400">{b.pickup_address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${b.total_price}</p>
                        <p className="text-xs text-gray-400">{b.status}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!showForm && selectedId && tab === 'Passengers' && selectedPassenger && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedPassenger.first_name} {selectedPassenger.last_name}
                    </h2>
                    {selectedPassenger.company_name && (
                      <p className="text-gray-500 text-sm">{selectedPassenger.company_name}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPassenger(selectedPassenger)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500"
                      onClick={() => {
                        if (confirm('Delete this passenger?')) {
                          deletePassengerMutation.mutate(selectedPassenger.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedPassenger.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} /> {selectedPassenger.phone}
                    </div>
                  )}
                  {selectedPassenger.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={14} /> {selectedPassenger.email}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Total Rides</p>
                    <p className="font-bold">{selectedPassenger.total_rides ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Last Ride</p>
                    <p className="font-bold">
                      {selectedPassenger.last_ride_at
                        ? new Date(selectedPassenger.last_ride_at).toLocaleDateString()
                        : '-'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Preferences</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {selectedPassenger.preferred_temperature && (
                      <div>
                        <p className="text-xs text-gray-400">🌡️ Temperature</p>
                        <p>{selectedPassenger.preferred_temperature}</p>
                      </div>
                    )}
                    {selectedPassenger.preferred_music && (
                      <div>
                        <p className="text-xs text-gray-400">🎵 Music</p>
                        <p>{selectedPassenger.preferred_music}</p>
                      </div>
                    )}
                    {selectedPassenger.preferred_language && (
                      <div>
                        <p className="text-xs text-gray-400">🗣️ Language</p>
                        <p>{selectedPassenger.preferred_language}</p>
                      </div>
                    )}
                    {selectedPassenger.allergies && (
                      <div>
                        <p className="text-xs text-gray-400">⚠️ Allergies</p>
                        <p className="text-red-600">{selectedPassenger.allergies}</p>
                      </div>
                    )}
                  </div>

                  {selectedPassenger.special_requirements && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400">Special Requirements</p>
                      <p className="text-sm bg-gray-50 rounded p-2 mt-1">
                        {selectedPassenger.special_requirements}
                      </p>
                    </div>
                  )}

                  {selectedPassenger.notes && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400">Notes</p>
                      <p className="text-sm bg-gray-50 rounded p-2 mt-1">{selectedPassenger.notes}</p>
                    </div>
                  )}
                </div>

                {selectedPassenger.rides?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Ride History</p>
                    {selectedPassenger.rides.map((r: any) => (
                      <div key={r.id} className="flex justify-between text-sm border-b pb-2">
                        <div>
                          <p className="font-medium">{r.booking_number}</p>
                          <p className="text-xs text-gray-400">{r.pickup_address}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${r.total_price}</p>
                          <p className="text-xs text-gray-400">{r.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!showForm && !selectedId && (
          <div className="flex items-center justify-center h-64 text-center">
            <div className="space-y-2">
              <p className="text-4xl">{tab === 'Contacts' ? '👤' : '🧳'}</p>
              <p className="text-gray-500 font-medium">
                Select a {tab === 'Contacts' ? 'contact' : 'passenger'} to view details
              </p>
              <p className="text-sm text-gray-400">or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
