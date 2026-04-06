import { useState } from 'react';
import { X, Plus, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import heroRobot from '@/assets/hero-robot.jpeg';
import heroRobot2 from '@/assets/hero-robot-2.jpeg';

interface Robot {
  id: string;
  name: string;
  isActive: boolean;
  avatar?: string;
}

export function RobotList() {
  const [robots, setRobots] = useState<Robot[]>([
    { id: '1', name: 'CODE BASE ALGO PRO', isActive: true, avatar: heroRobot },
    { id: '2', name: 'CODE BASE SCALPER PRO', isActive: true, avatar: heroRobot2 },
  ]);

  const toggleRobot = (id: string) => {
    setRobots(robots.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const removeRobot = (id: string) => {
    setRobots(robots.filter(r => r.id !== id));
  };

  return (
    <div className="w-full space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Robot List
      </h3>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {robots.map((robot) => (
            <motion.div
              key={robot.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                {robot.avatar ? (
                  <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
                    robot.isActive ? 'border-green-500/50' : 'border-muted'
                  }`}>
                    <img src={robot.avatar} alt={robot.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    robot.isActive ? 'bg-green-500/20' : 'bg-muted'
                  }`}>
                    <Bot className={`h-5 w-5 ${robot.isActive ? 'text-green-500' : 'text-muted-foreground'}`} />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{robot.name}</p>
                  <p className={`text-xs font-medium ${robot.isActive ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {robot.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeRobot(robot.id)}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-muted hover:bg-destructive/20 hover:text-destructive transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add New Bot Button */}
        <Button
          variant="outline"
          className="w-full border-dashed border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Trading Bot
        </Button>
      </div>
    </div>
  );
}
