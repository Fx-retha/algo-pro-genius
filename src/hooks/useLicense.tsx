import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface License {
  id: string;
  key: string;
  user_id: string | null;
  status: 'active' | 'revoked' | 'expired';
  plan: 'basic' | 'pro' | 'enterprise';
  expires_at: string | null;
  activated_at: string | null;
  created_at: string;
}

export function useLicense() {
  const { user } = useAuth();
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLicense = useCallback(async () => {
    if (!user) {
      setLicense(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('license_keys')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      setError(error.message);
    } else {
      setLicense(data as License | null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLicense();
  }, [fetchLicense]);

  const activateLicense = async (licenseKey: string) => {
    if (!user) return { error: 'Not authenticated' };

    setError(null);
    
    const { data, error: rpcError } = await supabase.rpc('activate_license_key', {
      license_key: licenseKey
    });

    if (rpcError) {
      setError(rpcError.message);
      return { error: rpcError.message };
    }

    const result = data as { success: boolean; error?: string };

    if (!result.success) {
      setError(result.error || 'Failed to activate license');
      return { error: result.error || 'Failed to activate license' };
    }

    await fetchLicense();
    return { error: null };
  };

  const hasValidLicense = license && license.status === 'active' && 
    (!license.expires_at || new Date(license.expires_at) > new Date());

  return {
    license,
    loading,
    error,
    activateLicense,
    hasValidLicense,
    refetch: fetchLicense,
  };
}
