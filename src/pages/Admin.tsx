import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { LicenseManagement } from '@/components/admin/LicenseManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { ManageEAs } from '@/components/admin/ManageEAs';
import { SetupMethods } from '@/components/admin/SetupMethods';
import { ProfileSettings } from '@/components/admin/ProfileSettings';
import { AppearanceSettings } from '@/components/admin/AppearanceSettings';
import { MyWebsite } from '@/components/admin/MyWebsite';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin && user) {
      navigate('/dashboard');
    }
  }, [isAdmin, roleLoading, navigate, user]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'manage-eas':
        return <ManageEAs />;
      case 'licenses':
        return <LicenseManagement />;
      case 'setup-methods':
        return <SetupMethods />;
      case 'profile':
        return <ProfileSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'my-website':
        return <MyWebsite />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-6 pt-20 lg:pt-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
