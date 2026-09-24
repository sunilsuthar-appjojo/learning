import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

// Load JWT_SECRET with fallback
const JWT_SECRET = process.env.JWT_SECRET || 'XCADcjdqB09xayVaRF96Lujn9mwyXK4XXsRD28KDobg=';

// Log the secret being used (only first few chars for security)
console.log('🔐 JWT_SECRET loaded:', JWT_SECRET.substring(0, 15) + '...');
console.log('🔐 JWT_SECRET length:', JWT_SECRET.length);

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Create JWT token using jose (Edge compatible)
export async function createToken(user: SessionUser): Promise<string> {
  console.log('🔐 Creating token for user:', user.email);
  
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const token = await new SignJWT({ 
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  
  console.log('✅ Token created, length:', token.length);
  return token;
}

// Verify JWT token using jose (Edge compatible)
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    console.log('🔑 Verifying token, length:', token.length);
    
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    console.log('✅ Token verified successfully:', payload.email);
    
    // Extract and validate required fields
    if (!payload.id || !payload.email || !payload.name || !payload.role) {
      console.error('❌ Token missing required fields');
      return null;
    }
    
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch (error: any) {
    console.error('❌ Token verification failed:', error.message);
    return null;
  }
}

// Get session from cookies
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) return null;
  
  return verifyToken(token);
}

// Set session cookie
export async function setSession(user: SessionUser): Promise<void> {
  const token = await createToken(user);
  const cookieStore = await cookies();
  
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Clear session cookie
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

// Check if user has required role
export async function hasRole(requiredRole: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  
  // Role hierarchy: SUPER_ADMIN > ADMIN > USER
  if (session.role === 'SUPER_ADMIN') return true;
  if (requiredRole === 'ADMIN' && session.role === 'ADMIN') return true;
  if (requiredRole === 'USER') return true;
  
  return false;
}
