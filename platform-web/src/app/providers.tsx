'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useTenantStore } from '@/store/tenant.store';
import { TenantBrand } from '@/types';

interface ProvidersProps {
  children: React.ReactNode;
  initialTenant?: TenantBrand | null;
}

export function Providers({ children, initialTenant }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  );

  const setTenant = useTenantStore((s) => s.setTenant);

  useEffect(() => {
    if (initialTenant) setTenant(initialTenant);
  }, [initialTenant, setTenant]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
