import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Use the same secret - hardcoded for Edge runtime
const JWT_SECRET = process.env.JWT_SECRET || 'XCADcjdqB09xayVaRF96Lujn9mwyXK4XXsRD28KDobg=';

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    console.log('🔑 Middleware: Verifying token with jose, length:', token.length);
    
    // Convert secret to Uint8Array for jose
    const secret = new TextEncoder().encode(JWT_SECRET);
    
    const { payload } = await jwtVerify(token, secret);
    console.log('✅ Middleware: Token verified successfully:', payload.email);
    
    // Extract and validate required fields
    if (!payload.id || !payload.email || !payload.name || !payload.role) {
      console.error('❌ Middleware: Token missing required fields');
      return null;
    }
    
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch (error: any) {
    console.error('❌ Middleware: Token verification failed:', error.message);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore browser internals, static assets, API routes
  const shouldSkip =
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(.*)$/); // any file extension

  if (shouldSkip) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;
  const isLoginPage = pathname === '/login';

  // Debug logging (remove after testing)
  console.log('🔍 Middleware:', { pathname, hasToken: !!token, isLoginPage });

  // If no token and not on login page → redirect to login
  if (!token && !isLoginPage) {
    console.log('❌ No token, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists, verify it
  if (token) {
    const session = await verifyToken(token);
    console.log('🔐 Token verification:', { hasSession: !!session, session: session ? session.email : null });
    
    // Invalid token → clear cookie and redirect to login
    if (!session) {
      console.log('❌ Invalid token, clearing and redirecting to login');
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }

    // Valid token on login page → redirect to dashboard
    if (isLoginPage) {
      console.log('✅ Valid token on login page, redirecting to dashboard');
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Role-based access control: /users is SUPER_ADMIN only
    if (pathname.startsWith('/users') && session.role !== 'SUPER_ADMIN') {
      console.log('⛔ Access denied for non-SUPER_ADMIN to /users');
      return NextResponse.redirect(new URL('/', request.url));
    }

    console.log('✅ Allowing access to:', pathname);
  }

  return NextResponse.next();
}

// Only run on page routes — NOT on api/static/assets
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
