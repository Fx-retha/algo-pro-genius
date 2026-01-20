import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'user';

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setRole(data.role as AppRole);
      } else {
        setRole('user'); // Default role
      }
      setLoading(false);
    };

    fetchRole();
  }, [user, authLoading]);

  const isAdmin = role === 'admin';

  return { role, isAdmin, loading };
}
