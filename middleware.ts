import { auth } from '@/lib/auth'

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/api/auth/signin', '/api/auth/signup']
  
  if (publicRoutes.includes(pathname)) {
    return
  }

  // Protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
    if (!req.auth) {
      const url = new URL('/auth/signin', req.nextUrl.origin)
      return Response.redirect(url)
    }
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|public).*)'],
}