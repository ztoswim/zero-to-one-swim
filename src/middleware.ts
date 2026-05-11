import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

// CRITICAL FIX: Only run middleware on protected routes. 
// This COMPLETELY EXCLUDES /login, favicon, and static files from middleware execution.
export const config = {
  matcher: [
    '/',
    '/schedule/:path*',
    '/students/:path*',
    '/invoices/:path*',
    '/coaches/:path*',
    '/locations/:path*',
    '/packages/:path*',
    '/staff-access/:path*',
    '/payroll/:path*',
    '/fixed-schedule/:path*',
    '/course-advisor/:path*',
    '/create-invoice/:path*',
    '/dashboard/:path*'
  ],
}
