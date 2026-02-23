'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBookingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/book');
  }, [router]);

  return null;
}
