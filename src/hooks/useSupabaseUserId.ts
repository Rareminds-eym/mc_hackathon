import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUserId(data?.user?.id || null);
      } catch (err) {
        setError(err);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  return { userId, loading, error };
}
