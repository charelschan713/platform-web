import { create } from 'zustand';
import { TenantBrand } from '@/types';

interface TenantState {
  tenant: TenantBrand | null;
  setTenant: (tenant: TenantBrand | null) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenant: null,
  setTenant: (tenant) => set({ tenant }),
}));
