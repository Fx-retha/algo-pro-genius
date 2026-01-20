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
    
    // First, find the license
    const { data: existingLicense, error: findError } = await supabase
      .from('license_keys')
      .select('*')
      .eq('key', licenseKey.toUpperCase())
      .single();

    if (findError || !existingLicense) {
      setError('Invalid license key');
      return { error: 'Invalid license key' };
    }

    if (existingLicense.user_id) {
      setError('License key already activated');
      return { error: 'License key already activated' };
    }

    if (existingLicense.status !== 'active') {
      setError('License key is not active');
      return { error: 'License key is not active' };
    }

    // Activate the license
    const { error: updateError } = await supabase
      .from('license_keys')
      .update({
        user_id: user.id,
        activated_at: new Date().toISOString(),
      })
      .eq('id', existingLicense.id);

    if (updateError) {
      setError(updateError.message);
      return { error: updateError.message };
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
