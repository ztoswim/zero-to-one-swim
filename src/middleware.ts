import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. FAST PATH: Extremely simple skip for login and static files
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // 2. Simple Supabase check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // Skip setting/removing in middleware to avoid hang/loop issues
        set() {},
        remove() {},
      },
    }
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()

    // 3. Redirect to login if not authenticated
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } catch (e) {
    // If anything fails, just let it through to avoid a total site hang
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
