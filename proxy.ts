import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { checkSession } from './lib/api/serverApi';

const PRIVATE_ROUTES = ['/profile', '/notes'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  let isAuthenticated = Boolean(accessToken);

  if (!accessToken && refreshToken) {
    try {
      const session = await checkSession();

      isAuthenticated = Boolean(session);
    } catch {
      isAuthenticated = false;
    }
  }

  const isPrivateRoute = PRIVATE_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isAuthenticated && isPrivateRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};