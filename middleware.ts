import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/', 
    '/auth/signin', 
    '/auth/signup', 
    '/api/auth/signin', 
    '/api/auth/signup',
    '/api/auth/callback',
    '/api/auth/session',
    '/api/auth/providers',
    '/api/auth/csrf'
  ]
  
  // Skip middleware for public routes and auth API routes
  if (publicRoutes.some(route => pathname === route) || pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // For now, allow all other routes to pass through
  // Authentication will be handled at the page/API route level
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)',
  ],
}