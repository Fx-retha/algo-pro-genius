import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useLicense } from '@/hooks/useLicense';
import NavBar from '@/components/NavBar';
import { LicenseActivation } from '@/components/dashboard/LicenseActivation';
import { TradingDashboard } from '@/components/dashboard/TradingDashboard';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { hasValidLicense, loading: licenseLoading, activateLicense, error } = useLicense();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/license-auth');
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

  // Show full trading dashboard after license activation
  if (hasValidLicense) {
    return <TradingDashboard />;
  }

  // Show license activation screen
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <LicenseActivation onActivate={activateLicense} error={error} />
      </div>
    </div>
  );
}
