import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';

const PRIVATE_ROUTES = ['/profile', '/notes'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookies = request.headers.get('cookie') || '';
  const parsedCookies = parse(cookies);

  const isAuthenticated = Boolean(parsedCookies['token']);


  if (
    PRIVATE_ROUTES.some((route) => pathname.startsWith(route)) &&
    !isAuthenticated
  ) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (
    AUTH_ROUTES.some((route) => pathname.startsWith(route)) &&
    isAuthenticated
  ) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}