import { useState, useEffect } from 'react';

export function usePreferences(userId?: string) {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      setLoading(true);
      const res = await fetch('/api/user/preferences');
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences);
      }
      setLoading(false);
    };

    fetchPreferences();
  }, [userId]);

  const updatePreferences = async (updates: any) => {
    const res = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    const data = await res.json();
    if (res.ok) {
      setPreferences(data.preferences);
    }
    return { data: data.preferences, error: data.error };
  };

  return { preferences, loading, updatePreferences };
}
