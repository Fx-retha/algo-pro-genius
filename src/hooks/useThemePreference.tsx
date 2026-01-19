import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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
  const updateTheme = async (newTheme: string) => {
    setTheme(newTheme);

    if (user) {
      await supabase
        .from('profiles')
        .update({ theme_preference: newTheme })
        .eq('user_id', user.id);
    }
  };

  return {
    theme,
    setTheme: updateTheme,
    isLoading,
  };
}
