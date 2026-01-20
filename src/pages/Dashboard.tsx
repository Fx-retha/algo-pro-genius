import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useLicense } from '@/hooks/useLicense';
import NavBar from '@/components/NavBar';
import { LicenseActivation } from '@/components/dashboard/LicenseActivation';
import { LicenseStatus } from '@/components/dashboard/LicenseStatus';
import { DownloadArea } from '@/components/dashboard/DownloadArea';
import { TradeStats } from '@/components/dashboard/TradeStats';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { license, hasValidLicense, loading: licenseLoading, activateLicense, error } = useLicense();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, roleLoading, navigate]);

  if (authLoading || roleLoading || licenseLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-display font-bold mb-8">Dashboard</h1>
        
        {!hasValidLicense ? (
          <LicenseActivation onActivate={activateLicense} error={error} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <LicenseStatus license={license} />
            <DownloadArea license={license} />
            <TradeStats />
          </div>
        )}
      </div>
    </div>
  );
}
