import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { headers } from 'next/headers';
import { getTenantByDomain } from '@/lib/tenant';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const domain = headersList.get('x-tenant-domain');

  if (domain) {
    const tenant = await getTenantByDomain(domain);
    if (tenant) {
      return {
        title: tenant.name,
        description: `Book a ride with ${tenant.name}`,
        icons: tenant.logo_url ? [{ url: tenant.logo_url }] : [],
      };
    }
  }

  return {
    title: process.env.NEXT_PUBLIC_APP_NAME ?? 'Chauffeur Platform',
    description: 'Professional chauffeur booking platform',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const domain = headersList.get('x-tenant-domain');
  let tenantBrand = null;

  if (domain) {
    tenantBrand = await getTenantByDomain(domain);
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers initialTenant={tenantBrand}>{children}</Providers>
      </body>
    </html>
  );
}
