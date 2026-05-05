import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect routes
  const path = request.nextUrl.pathname

  if (!user && path !== '/login' && !path.startsWith('/_next') && path !== '/unauthorized') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // If logged in and on login page, redirect to home
    if (path === '/login') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Role-based protection
    // We fetch the profile from Supabase Database (Public schema)
    // Note: This requires RLS to be set up or using service role (not recommended in middleware)
    // For now, we fetch using the user's own session
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (path.startsWith('/coach') && role !== 'coach') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (path.startsWith('/parent') && role !== 'parent') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
