'use client';

import { useEffect, useState } from 'react';

export default function DiagnosticsPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const res: any = {};

      // 1. Check env vars in browser
      res.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      res.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing';
      res.siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

      // 2. Test health endpoint
      try {
        const healthRes = await fetch('/api/health');
        res.health = await healthRes.json();
      } catch (e: any) {
        res.health = { error: e.message };
      }

      // 3. Test direct Supabase fetch
      try {
        const supabaseRes = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`,
          {
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            },
          }
        );
        res.supabaseFetch = {
          status: supabaseRes.status,
          ok: supabaseRes.ok,
          data: await supabaseRes.json(),
        };
      } catch (e: any) {
        res.supabaseFetch = { error: e.message, cause: e.cause };
      }

      // 4. Test CORS with OPTIONS request
      try {
        const corsRes = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`,
          {
            method: 'OPTIONS',
            headers: {
              'Origin': window.location.origin,
              'Access-Control-Request-Method': 'POST',
            },
          }
        );
        res.corsCheck = {
          status: corsRes.status,
          headers: {
            'access-control-allow-origin': corsRes.headers.get('access-control-allow-origin'),
            'access-control-allow-methods': corsRes.headers.get('access-control-allow-methods'),
          },
        };
      } catch (e: any) {
        res.corsCheck = { error: e.message };
      }

      setResults(res);
      setLoading(false);
    };

    runDiagnostics();
  }, []);

  if (loading) return <div className="p-8">Running diagnostics...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Supabase Diagnostics</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}
