import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        }
      }
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (currentUser) {
          const res = await fetch('/api/user/profile');
          if (res.ok) {
            const data = await res.json();
            setProfile(data.profile);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async (updates: any) => {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (res.ok) {
      setProfile(data.profile);
    }
    return { data: data.profile, error: data.error };
  };

  return { user, profile, loading, updateProfile };
}
