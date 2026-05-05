import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 极简模式：不查 Auth，不查数据库，直接通行
  // 如果这还报错，说明是 Vercel 环境问题
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
