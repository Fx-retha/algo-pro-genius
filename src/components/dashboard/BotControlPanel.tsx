import { useState, useEffect } from 'react';
import { TrendingUp, Play, Square, Clock, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import heroRobot from '@/assets/hero-robot.jpeg';
import { supabase } from '@/integrations/supabase/client';

interface BotControlPanelProps {
  botName?: string;
  onPairsClick: () => void;
  onLogsClick: () => void;
}

export function BotControlPanel({ botName = "CODE BASE ALGO PRO", onPairsClick, onLogsClick }: BotControlPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [keyStats, setKeyStats] = useState({ total: 0, used: 0 });

  useEffect(() => {
    const fetchKeyStats = async () => {
      const { data } = await supabase.from('license_keys').select('user_id');
      if (data) {
        setKeyStats({
          total: data.length,
          used: data.filter(k => k.user_id !== null).length,
        });
      }
    };
    fetchKeyStats();
  }, []);

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="flex flex-col items-center space-y-6 py-8">
      {/* Robot Avatar with Glowing Ring */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className={`w-40 h-40 rounded-full p-1 ${isRunning ? 'bg-gradient-to-r from-green-500 via-emerald-400 to-green-500' : 'bg-gradient-to-r from-primary via-purple-400 to-primary'} animate-pulse`}>
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-background">
            <img 
              src={heroRobot} 
              alt="Trading Bot" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {/* Glow Effect */}
        <div className={`absolute inset-0 rounded-full ${isRunning ? 'bg-green-500/20' : 'bg-primary/20'} blur-xl -z-10`} />
      </motion.div>

      {/* Bot Name */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-wider text-foreground">
          {botName}
        </h2>
        <p className="text-muted-foreground mt-2 flex items-center justify-center gap-2">
          Automation is the future 📊📈
        </p>
      </motion.div>

      {/* Control Panel */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className={`relative rounded-full border-2 ${isRunning ? 'border-green-500/50' : 'border-primary/50'} bg-card/80 backdrop-blur-sm p-2 flex items-center justify-between`}>
          {/* Pairs Button */}
          <button
            onClick={onPairsClick}
            className="flex flex-col items-center justify-center w-20 h-16 rounded-full hover:bg-muted/50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-xs mt-1 text-muted-foreground font-medium">PAIRS</span>
          </button>

          {/* Start/Stop Button */}
          <button
            onClick={handleToggle}
            className={`flex flex-col items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
              isRunning 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30' 
                : 'bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/30'
            } hover:scale-105`}
          >
            {isRunning ? (
              <>
                <Square className="h-6 w-6 text-white fill-white" />
                <span className="text-xs mt-1 text-white font-bold">STOP</span>
              </>
            ) : (
              <>
                <Play className="h-6 w-6 text-white fill-white" />
                <span className="text-xs mt-1 text-white font-bold">START</span>
              </>
            )}
          </button>

          {/* Logs Button */}
          <button
            onClick={onLogsClick}
            className="flex flex-col items-center justify-center w-20 h-16 rounded-full hover:bg-muted/50 transition-colors"
          >
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-xs mt-1 text-muted-foreground font-medium">LOGS</span>
          </button>

          {/* Animated border glow */}
          <div className={`absolute inset-0 rounded-full ${isRunning ? 'bg-green-500/10' : 'bg-primary/10'} blur-md -z-10`} />
        </div>
      </motion.div>

      {/* Powered By Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10"
      >
        <span className="text-sm text-muted-foreground">Powered by </span>
        <span className="text-sm font-semibold text-primary">Code Base</span>
      </motion.div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
        <span className={`text-sm ${isRunning ? 'text-green-500' : 'text-muted-foreground'}`}>
          {isRunning ? 'Bot Running' : 'Bot Stopped'}
        </span>
      </div>

      {/* License Key Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-xl border border-border bg-card/60 text-center">
            <Key className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{keyStats.total}</p>
            <p className="text-[10px] text-muted-foreground">Keys Generated</p>
          </div>
          <div className="flex-1 p-3 rounded-xl border border-border bg-card/60 text-center">
            <Key className="h-4 w-4 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{keyStats.used}</p>
            <p className="text-[10px] text-muted-foreground">Keys Used</p>
          </div>
          <div className="flex-1 p-3 rounded-xl border border-border bg-card/60 text-center">
            <Key className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{keyStats.total - keyStats.used}</p>
            <p className="text-[10px] text-muted-foreground">Available</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
