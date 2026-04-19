import { X, Plus, Bot, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export interface Robot {
  id: string;
  name: string;
  isActive: boolean;
  avatar?: string;
}

interface RobotListProps {
  robots: Robot[];
  selectedId: string;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export function RobotList({ robots, selectedId, onSelect, onRemove }: RobotListProps) {
  return (
    <div className="w-full space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Robot List
      </h3>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {robots.map((robot) => {
            const isSelected = robot.id === selectedId;
            return (
              <motion.div
                key={robot.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                onClick={() => onSelect(robot.id)}
                className={`flex items-center justify-between p-4 rounded-xl border bg-card/50 backdrop-blur-sm cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/10'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  {robot.avatar ? (
                    <div className={`relative w-10 h-10 rounded-full overflow-hidden border-2 ${
                      robot.isActive ? 'border-green-500/50' : 'border-muted'
                    }`}>
                      <img src={robot.avatar} alt={robot.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                          <Check className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
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
                    <p className={`text-xs font-medium ${
                      isSelected ? 'text-primary' : robot.isActive ? 'text-green-500' : 'text-muted-foreground'
                    }`}>
                      {isSelected ? 'SELECTED' : robot.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(robot.id);
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-muted hover:bg-destructive/20 hover:text-destructive transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            );
          })}
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
