import { TenantBrand } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getTenantByDomain(
  domain: string,
): Promise<TenantBrand | null> {
  try {
    const res = await fetch(`${API_URL}/tenants/by-domain/${domain}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getTenantBySlug(
  slug: string,
): Promise<TenantBrand | null> {
  try {
    const res = await fetch(`${API_URL}/tenants/by-slug/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
