'use client';

import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/badge';

export default function TopBar() {
  const { user } = useAuthStore();

  return (
    <header className="h-14 bg-white border-b px-6 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-xs">
          {user?.role?.replace('_', ' ')}
        </Badge>
        <span className="text-sm text-gray-600">{user?.email}</span>
      </div>
    </header>
  );
}
