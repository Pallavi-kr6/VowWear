import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('Missing Supabase credentials:', { 
      url: url ? 'present' : 'missing',
      key: key ? 'present' : 'missing'
    })
  }

  const client = createBrowserClient(url!, key!)
  
  console.log('Supabase client initialized:', { url })
  
  return client
}
