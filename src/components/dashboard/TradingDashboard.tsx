import { useState } from 'react';
import { BotControlPanel } from './BotControlPanel';
import { RobotList, type Robot } from './RobotList';
import { BottomNavigation } from './BottomNavigation';
import { PairsModal } from './PairsModal';
import { LogsModal } from './LogsModal';
import { MetatraderSettings } from './MetatraderSettings';
import { BotSettings } from './BotSettings';
import { VoiceAssistant } from './VoiceAssistant';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroRobot from '@/assets/hero-robot.jpeg';
import heroRobot2 from '@/assets/hero-robot-2.jpeg';

type Tab = 'home' | 'metatrader' | 'settings';

export function TradingDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [pairsOpen, setPairsOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [robots, setRobots] = useState<Robot[]>([
    { id: '1', name: 'CODE BASE ALGO PRO', isActive: true, avatar: heroRobot },
    { id: '2', name: 'CODE BASE SCALPER PRO', isActive: true, avatar: heroRobot2 },
  ]);
  const [selectedRobotId, setSelectedRobotId] = useState<string>('1');

  const selectedRobot = robots.find(r => r.id === selectedRobotId) ?? robots[0];

  const handleRemove = (id: string) => {
    setRobots(prev => {
      const next = prev.filter(r => r.id !== id);
      if (id === selectedRobotId && next.length > 0) {
        setSelectedRobotId(next[0].id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background relative">
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
                botName={selectedRobot?.name}
                botAvatar={selectedRobot?.avatar}
                onPairsClick={() => setPairsOpen(true)}
                onLogsClick={() => setLogsOpen(true)}
              />
              <RobotList
                robots={robots}
                selectedId={selectedRobotId}
                onSelect={setSelectedRobotId}
                onRemove={handleRemove}
              />
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
