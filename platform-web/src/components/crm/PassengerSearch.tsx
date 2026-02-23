'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Search, User, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Passenger = {
  id: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  preferred_temperature?: string;
  preferred_music?: string;
  preferred_language?: string;
  allergies?: string;
  special_requirements?: string;
  notes?: string;
};

type Props = {
  onSelect: (passenger: Passenger | null) => void;
  selected?: Passenger | null;
  placeholder?: string;
};

export function PassengerSearch({
  onSelect,
  selected,
  placeholder = 'Search passengers...',
}: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: passengers = [] } = useQuery({
    queryKey: ['passenger-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const res = await api.get('/crm/passengers/search/quick', { params: { q: query } });
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
      <div className="border rounded-lg px-3 py-2 bg-gray-50 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium">
                {selected.first_name} {selected.last_name}
              </p>
              {selected.phone && <p className="text-xs text-gray-400">{selected.phone}</p>}
            </div>
          </div>
          <button onClick={() => onSelect(null)} className="text-xs text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {(selected.preferred_temperature || selected.preferred_music || selected.allergies) && (
          <div className="text-xs text-gray-500 bg-white rounded p-2 space-y-0.5">
            {selected.preferred_temperature && <p>🌡️ {selected.preferred_temperature}</p>}
            {selected.preferred_music && <p>🎵 {selected.preferred_music}</p>}
            {selected.allergies && <p className="text-red-500">⚠️ {selected.allergies}</p>}
            {selected.special_requirements && <p>♿ {selected.special_requirements}</p>}
          </div>
        )}
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
      {open && passengers.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {passengers.map((p: Passenger) => (
            <button
              key={p.id}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-2"
              onClick={() => {
                onSelect(p);
                setQuery('');
                setOpen(false);
              }}
            >
              <User size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  {p.first_name} {p.last_name}
                </p>
                {p.phone && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Phone size={10} /> {p.phone}
                  </p>
                )}
                {p.allergies && <p className="text-xs text-red-500">⚠️ {p.allergies}</p>}
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
            + Create new passenger
          </button>
        </div>
      )}
    </div>
  );
}
