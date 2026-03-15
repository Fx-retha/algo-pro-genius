import { useState } from 'react';
import { BotControlPanel } from './BotControlPanel';
import { RobotList } from './RobotList';
import { BottomNavigation } from './BottomNavigation';
import { PairsModal } from './PairsModal';
import { LogsModal } from './LogsModal';
import { MetatraderSettings } from './MetatraderSettings';
import { BotSettings } from './BotSettings';
import { useNavigate } from 'react-router-dom';
import { Info, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type Tab = 'home' | 'metatrader' | 'settings';

export function TradingDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [pairsOpen, setPairsOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);

  const handleBackHome = () => {
    localStorage.removeItem('validated_license_key');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Header removed per user request */}

      {/* Main Content */}
      <main className="pb-20">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="px-4"
        >
          {activeTab === 'home' && (
            <div className="space-y-6">
              <BotControlPanel 
                onPairsClick={() => setPairsOpen(true)}
                onLogsClick={() => setLogsOpen(true)}
              />
              <RobotList />
            </div>
          )}

          {activeTab === 'metatrader' && (
            <div className="py-6">
              <MetatraderSettings />
            </div>
          )}




          {activeTab === 'settings' && (
            <div className="py-6">
              <BotSettings />
            </div>
          )}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      <PairsModal open={pairsOpen} onOpenChange={setPairsOpen} />
      <LogsModal open={logsOpen} onOpenChange={setLogsOpen} />
    </div>
  );
}
