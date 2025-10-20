import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge-compatible middleware without Prisma
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute) {
    // Check for NextAuth session token (JWT)
    const token = request.cookies.get('authjs.session-token') ||
                  request.cookies.get('__Secure-authjs.session-token');

    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // For admin routes, add additional checks here
    // NOTE: Full session data requires server-side auth() call
    if (pathname.startsWith('/admin')) {
      // Admin role checking should be done in the actual page/API route
      // where you have access to the full session
    }
  }

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
