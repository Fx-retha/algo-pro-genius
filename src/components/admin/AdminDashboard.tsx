import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, CheckCircle, Key, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface LicenseStats {
  total: number;
  active: number;
  revoked: number;
  expired: number;
  available: number;
  limit: number;
}

interface ProfileData {
  mentor_id: string | null;
  full_name: string | null;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<LicenseStats>({ total: 0, active: 0, revoked: 0, expired: 0, available: 0, limit: 500 });
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Admin';
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: licenses } = await supabase
        .from('license_keys')
        .select('status, user_id, expires_at');

      if (licenses) {
        const now = new Date();
        setStats({
          total: licenses.length,
          active: licenses.filter(l => l.status === 'active' && l.user_id !== null).length,
          revoked: licenses.filter(l => l.status === 'revoked').length,
          expired: licenses.filter(l => l.expires_at && new Date(l.expires_at) < now).length,
          available: licenses.filter(l => l.status === 'active' && l.user_id === null).length,
          limit: 500,
        });
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('mentor_id, full_name')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const usedLicenses = stats.total - stats.available;
  const usagePercent = Math.min((usedLicenses / stats.limit) * 100, 100);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {getGreeting()}, {getDisplayName()}
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome to <span className="font-semibold text-foreground">Code Base Portal</span> — All systems are running smoothly. You have{' '}
          <span className="text-primary font-semibold">{stats.active} active licences</span>.
        </p>
      </motion.div>

      {/* Mentor ID Badge */}
      {profile?.mentor_id && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/40 bg-primary/5">
            <Key className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Mentor ID: {profile.mentor_id}</span>
          </div>
        </motion.div>
      )}

      {/* Date Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{getFormattedDate()}</span>
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="rounded-xl border-l-4 border-l-green-500 border border-border bg-card p-5"
      >
        <div className="flex items-start gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 shrink-0 animate-pulse" />
          <div>
            <p className="text-foreground">
              <span className="font-semibold">All systems operational</span>
              <span className="text-muted-foreground"> — Hosting services, licensing engine, and EA delivery are online.</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Licence Usage */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        {/* Progress bar at top */}
        <div className="h-1.5 bg-muted w-full">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-r-full transition-all duration-700"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Licence Usage</p>
            <Key className="h-5 w-5 text-primary/60" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-foreground">{usedLicenses}</span>
            <span className="text-lg text-muted-foreground">/ {stats.limit}</span>
          </div>
          {/* Mini progress bar */}
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.active}</p>
          <p className="text-xs text-muted-foreground mt-1">Active</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="flex justify-center mb-2">
            <Activity className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.revoked}</p>
          <p className="text-xs text-muted-foreground mt-1">Deactivated</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="flex justify-center mb-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.expired}</p>
          <p className="text-xs text-muted-foreground mt-1">Expired</p>
        </div>
      </motion.div>
    </div>
  );
}
