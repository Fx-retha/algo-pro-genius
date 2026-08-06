import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { TradingDashboard } from '@/components/dashboard/TradingDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useLicense } from '@/hooks/useLicense';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasValidLicense, loading: licenseLoading } = useLicense();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/mentor-auth?next=/dashboard');
      return;
    }
    if (!licenseLoading && !hasValidLicense) {
      navigate('/license-auth');
    }
  }, [user, authLoading, hasValidLicense, licenseLoading, navigate]);

  if (authLoading || (user && licenseLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !hasValidLicense) return null;

  return <TradingDashboard />;
}
