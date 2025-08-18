import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function middleware() {
  const session = await auth();
  
  if (!session) {
    return NextResponse.redirect(new URL('/auth/signin', process.env.NEXTAUTH_URL));
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
