import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = [
  '/auth/reset-password',
  '/auth/sign-in',
  '/auth/sign-up'
]

const isPublicRoute = (pathname: string) => {
  return publicRoutes.includes(pathname)
}

export async function middleware(request: NextRequest) {
  if (request.method === 'POST') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token && isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  if (token && isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/auth/reset-password',
    '/auth/sign-in',
    '/auth/sign-up',
    '/profile',
    '/registrations',
    '/my-events',
  ],
}
