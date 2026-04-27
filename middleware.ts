import { NextRequest, NextResponse } from 'next/server';

type AuthUserCookie = {
  role?: string;
  role_label?: string;
};

function getAuthUser(req: NextRequest): AuthUserCookie | null {
  const raw = req.cookies.get('auth_user')?.value;
  if (!raw) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    return parsed && typeof parsed === 'object' ? (parsed as AuthUserCookie) : null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Keep login page public.
  if (pathname === '/') {
    return NextResponse.next();
  }

  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (pathname.startsWith('/admin')) {
    const user = getAuthUser(req);
    const role = (user?.role || user?.role_label || '').toLowerCase();
    if (role !== 'admin' && role !== 'guru') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
};
