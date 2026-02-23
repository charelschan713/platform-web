'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Search, User, Building2, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Contact = {
  id: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  email?: string;
  company_name?: string;
  payment_type: string;
  discount_p2p: number;
  discount_charter: number;
  discount_airport: number;
};

type Props = {
  onSelect: (contact: Contact | null) => void;
  selected?: Contact | null;
  placeholder?: string;
};

export function ContactSearch({
  onSelect,
  selected,
  placeholder = 'Search contacts...',
}: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: contacts = [] } = useQuery({
    queryKey: ['contact-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const res = await api.get('/crm/contacts/search/quick', { params: { q: query } });
      return res.data;
    },
    enabled: query.length >= 2,
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (selected) {
    return (
      <div className="flex items-center justify-between border rounded-lg px-3 py-2 bg-gray-50">
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium">
              {selected.first_name} {selected.last_name}
            </p>
            {selected.phone && <p className="text-xs text-gray-400">{selected.phone}</p>}
          </div>
          {selected.payment_type === 'MONTHLY_ACCOUNT' && (
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Account</span>
          )}
        </div>
        <button onClick={() => onSelect(null)} className="text-xs text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        <Input
          className="pl-8 text-sm"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && contacts.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {contacts.map((c: Contact) => (
            <button
              key={c.id}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-2"
              onClick={() => {
                onSelect(c);
                setQuery('');
                setOpen(false);
              }}
            >
              <User size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  {c.first_name} {c.last_name}
                </p>
                <div className="flex gap-2 text-xs text-gray-400">
                  {c.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={10} /> {c.phone}
                    </span>
                  )}
                  {c.company_name && (
                    <span className="flex items-center gap-1">
                      <Building2 size={10} /> {c.company_name}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
          <button
            className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 border-t"
            onClick={() => {
              onSelect(null);
              setOpen(false);
            }}
          >
            + Create new contact
          </button>
        </div>
      )}
    </div>
  );
}
