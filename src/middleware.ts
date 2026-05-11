import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. FAST PATH: Ignore static files and images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // 2. INITIAL RESPONSE
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 3. IF LOGIN PAGE: Just allow it (prevent loop)
  if (pathname === '/login') {
    return response
  }

  // 4. SUPABASE CLIENT
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase env vars are missing')
      return response
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    })

    // 5. CHECK AUTH
    const { data: { user } } = await supabase.auth.getUser()

    // 6. REDIRECT IF NOT LOGGED IN
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
  } catch (e) {
    console.error('Middleware error:', e)
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
