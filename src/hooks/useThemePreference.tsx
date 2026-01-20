import { useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type ThemeOption = 'light' | 'dark' | 'system' | 'cyberpunk' | 'minimal' | 'minimal-dark';

export const themeOptions: { value: ThemeOption; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'monitor' },
  { value: 'cyberpunk', label: 'Cyberpunk', icon: 'zap' },
  { value: 'minimal', label: 'Minimal', icon: 'minus' },
  { value: 'minimal-dark', label: 'Minimal Dark', icon: 'circle' },
];

export function useThemePreference() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from database when user logs in
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadThemePreference = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('theme_preference')
        .eq('user_id', user.id)
        .single();

      if (!error && data?.theme_preference) {
        setTheme(data.theme_preference);
      }
      setIsLoading(false);
    };

    loadThemePreference();
  }, [user, setTheme]);

  // Save theme preference to database when it changes
  const updateTheme = useCallback(async (newTheme: ThemeOption) => {
    setTheme(newTheme);

    if (user) {
      await supabase
        .from('profiles')
        .update({ theme_preference: newTheme })
        .eq('user_id', user.id);
    }
  }, [user, setTheme]);

  return {
    theme: theme as ThemeOption,
    setTheme: updateTheme,
    isLoading,
  };
}
