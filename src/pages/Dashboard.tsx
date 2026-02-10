import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TradingDashboard } from '@/components/dashboard/TradingDashboard';

export default function Dashboard() {
  const navigate = useNavigate();
  const validLicense = localStorage.getItem('validated_license_key');

  useEffect(() => {
    if (!validLicense) {
      navigate('/license-auth');
    }
  }, [validLicense, navigate]);

  if (!validLicense) return null;

  return <TradingDashboard />;
}
