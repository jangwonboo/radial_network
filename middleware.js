import { jwtVerify } from 'jose';

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Pass through: login page, API routes, static assets
  if (
    path === '/login' ||
    path === '/login.html' ||
    path.startsWith('/api/') ||
    path === '/favicon.ico'
  ) {
    return;
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/)?.[1];

  if (!token) {
    return Response.redirect(new URL('/login', url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    // Valid session — pass through
  } catch {
    return Response.redirect(new URL('/login', url));
  }
}

export const config = {
  matcher: ['/((?!login|api|favicon\\.ico).*)'],
};
