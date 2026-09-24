import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get cookies from server-side
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const authToken = cookieStore.get('auth-token');

    // Get cookies from request
    const requestCookies = request.cookies.getAll();

    return NextResponse.json({
      serverSideCookies: allCookies,
      authToken: authToken ? { name: authToken.name, hasValue: !!authToken.value, valueLength: authToken.value.length } : null,
      requestCookies,
      hasCookie: !!authToken,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
