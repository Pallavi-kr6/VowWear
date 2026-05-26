import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Test environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return Response.json({
        status: 'error',
        message: 'Missing Supabase credentials',
        url: supabaseUrl ? 'present' : 'missing',
        key: supabaseKey ? 'present' : 'missing',
      }, { status: 400 });
    }

    // Try to create client and make a simple query
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Simple health check - get your own user
    const { data, error } = await supabase.auth.getUser();

    return Response.json({
      status: 'ok',
      message: 'Supabase connection successful',
      supabaseUrl,
      userExists: !!data?.user,
      error: error?.message || null,
    });
  } catch (err: any) {
    return Response.json({
      status: 'error',
      message: err.message,
      error: err.toString(),
    }, { status: 500 });
  }
}
