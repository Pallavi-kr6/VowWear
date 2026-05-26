import { createClient } from '@/lib/supabase/server';
import { getAuthErrorResponse } from '../errors';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

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

    // Sign up
    let data;
    let error;

    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
      });

      data = result.data;
      error = result.error;
    } catch (authError) {
      console.error('Supabase signup request failed:', authError);
      const response = getAuthErrorResponse(authError, 'Signup failed');

      return NextResponse.json(
        { error: response.message },
        { status: response.status }
      );
    }

    if (error) {
      const response = getAuthErrorResponse(error, 'Signup failed', 400);

      return NextResponse.json(
        { error: response.message },
        { status: response.status }
      );
    }

    if (data.user) {
      return NextResponse.json({
        success: true,
        user: data.user,
        message: data.user.user_metadata?.email_confirmed
          ? 'Account created successfully! You can now sign in.'
          : 'Account created! Please check your email to verify your account.',
      });
    }

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error('Server signup error:', err);
    const response = getAuthErrorResponse(err, 'Signup failed');

    return NextResponse.json(
      { error: response.message },
      { status: response.status }
    );
  }
}
