import { createClient } from '@/lib/supabase/server';
import { getAuthErrorResponse } from '../errors';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError: unknown) {
      console.error('Failed to create Supabase client:', clientError);
      const message = clientError instanceof Error
        ? clientError.message
        : 'Failed to initialize authentication service';

      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }

    let data;
    let error;

    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      data = result.data;
      error = result.error;
    } catch (authError) {
      console.error('Supabase login request failed:', authError);
      const response = getAuthErrorResponse(authError, 'Authentication failed');

      return NextResponse.json(
        { error: response.message },
        { status: response.status }
      );
    }

    if (error) {
      const response = getAuthErrorResponse(error, 'Authentication failed', 400);

      return NextResponse.json(
        { error: response.message },
        { status: response.status }
      );
    }

    if (data.session) {
      const response = NextResponse.json({ success: true, session: data.session });
      
      // Set auth cookie
      response.cookies.set('sb-auth-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json({ error: 'No session created' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Server auth error:', err);
    const response = getAuthErrorResponse(err, 'Authentication failed');

    return NextResponse.json(
      { error: response.message },
      { status: response.status }
    );
  }
}
