import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Key, CheckCircle, XCircle, Clock } from 'lucide-react';

interface LicenseStats {
  total: number;
  active: number;
  revoked: number;
  expired: number;
  available: number;
}

interface ProfileData {
  mentor_id: string | null;
  full_name: string | null;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<LicenseStats>({ total: 0, active: 0, revoked: 0, expired: 0, available: 0 });
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Admin';
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch license stats
      const { data: licenses } = await supabase
        .from('license_keys')
        .select('status, user_id, expires_at');

      if (licenses) {
        const now = new Date();
        const stats: LicenseStats = {
          total: licenses.length,
          active: licenses.filter(l => l.status === 'active' && l.user_id !== null).length,
          revoked: licenses.filter(l => l.status === 'revoked').length,
          expired: licenses.filter(l => l.expires_at && new Date(l.expires_at) < now).length,
          available: licenses.filter(l => l.status === 'active' && l.user_id === null).length,
        };
        setStats(stats);
      }

      // Fetch profile with mentor_id
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {getDisplayName()}</p>
      </div>

      {/* Mentor ID Badge */}
      {profile?.mentor_id && (
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="px-4 py-2 text-base font-mono">
            Mentor ID: {profile.mentor_id}
          </Badge>
          <span className="text-sm text-muted-foreground">Your unique mentor identification</span>
        </div>
      )}

      {/* License Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Key className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Used Licenses</span>
            </div>
            <p className="text-3xl font-bold font-display">{stats.total - stats.available}</p>
            <p className="text-xs text-muted-foreground mt-1">Total active and deactivated licenses</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Available Licenses</span>
            </div>
            <p className="text-3xl font-bold font-display">
              {stats.available > 100 ? 'Unlimited' : stats.available}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Mentors now have unlimited licenses</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Active Licenses</span>
            </div>
            <p className="text-3xl font-bold font-display">{stats.active}</p>
            <p className="text-xs text-muted-foreground mt-1">Currently active licenses</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-muted-foreground">Deactivated</span>
            </div>
            <p className="text-3xl font-bold font-display">{stats.revoked}</p>
            <p className="text-xs text-muted-foreground mt-1">Revoked or expired licenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Additional Stats */}
      <Card className="bg-card/50 border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold">Quick Stats</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Licenses Created</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold">{stats.expired}</p>
              <p className="text-sm text-muted-foreground">Expired Licenses</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold">{Math.round((stats.active / (stats.total || 1)) * 100)}%</p>
              <p className="text-sm text-muted-foreground">Activation Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
