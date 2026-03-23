import { useState } from 'react';
import { BotControlPanel } from './BotControlPanel';
import { RobotList } from './RobotList';
import { BottomNavigation } from './BottomNavigation';
import { PairsModal } from './PairsModal';
import { LogsModal } from './LogsModal';
import { MetatraderSettings } from './MetatraderSettings';
import { BotSettings } from './BotSettings';
import { SignalScanner } from './SignalScanner';
import { VoiceAssistant } from './VoiceAssistant';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

type Tab = 'home' | 'metatrader' | 'settings';

export function TradingDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [pairsOpen, setPairsOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-background/80 z-0" />

      {/* Main Content */}
      <main className="pb-20 relative z-10">
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
              <SignalScanner />
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

      {/* AI Voice Assistant */}
      <VoiceAssistant />

      {/* Modals */}
      <PairsModal open={pairsOpen} onOpenChange={setPairsOpen} />
      <LogsModal open={logsOpen} onOpenChange={setLogsOpen} />
    </div>
  );
}
