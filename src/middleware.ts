import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Edge-compatible middleware without Prisma
export async function middleware(_request: NextRequest) {
  // Let the actual page layouts handle auth checks with auth()
  // This middleware just does basic routing logic
  // The dashboard/layout.tsx and other layouts will handle proper auth validation

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
