import { Home, Database, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

type Tab = 'home' | 'metatrader' | 'settings';

interface BottomNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'home' as Tab, label: 'Home', icon: Home },
    { id: 'metatrader' as Tab, label: 'Metatrader', icon: Database },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-col items-center justify-center flex-1 h-full"
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-x-4 top-0 h-0.5 bg-primary rounded-full"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <tab.icon 
              className={`h-5 w-5 transition-colors ${
                activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
            <span 
              className={`text-xs mt-1 transition-colors ${
                activeTab === tab.id ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
      {/* Safe area padding for mobile */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </div>
  );
}
