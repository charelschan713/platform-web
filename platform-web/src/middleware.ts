import { NextRequest, NextResponse } from 'next/server';

const PLATFORM_DOMAINS = [
  'platform-web-rho.vercel.app',
  'localhost:3000',
  'localhost',
];

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0];

  const isCustomDomain = !PLATFORM_DOMAINS.some(
    (d) => hostname === d || hostname.endsWith(`.${d}`),
  );

  if (isCustomDomain) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-domain', hostname);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
