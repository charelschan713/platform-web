import { TenantSidebar } from '@/components/layout/TenantSidebar';
import { TopBar } from '@/components/layout/TopBar';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex">
        <TenantSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
