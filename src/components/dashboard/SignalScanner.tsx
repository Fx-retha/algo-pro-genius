import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Signal {
  pair: string;
  signal: 'buy' | 'sell' | 'neutral';
  strength: number; // 0-100
  price: string;
  change: string;
}

const generateSignals = (): Signal[] => {
  const pairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD',
    'USD/CAD', 'NZD/USD', 'EUR/GBP', 'USD/CHF',
    'EUR/JPY', 'GBP/JPY', 'XAU/USD', 'BTC/USD',
  ];

  return pairs.map(pair => {
    const rand = Math.random();
    const signal: Signal['signal'] = rand > 0.6 ? 'buy' : rand > 0.3 ? 'sell' : 'neutral';
    const strength = Math.floor(Math.random() * 60) + 40;
    const basePrice = 1 + Math.random() * 2;
    const change = (Math.random() * 2 - 1).toFixed(2);

    return {
      pair,
      signal,
      strength,
      price: pair.includes('JPY') ? (130 + Math.random() * 20).toFixed(3) :
             pair.includes('XAU') ? (1900 + Math.random() * 100).toFixed(2) :
             pair.includes('BTC') ? (40000 + Math.random() * 5000).toFixed(0) :
             basePrice.toFixed(5),
      change: `${parseFloat(change) >= 0 ? '+' : ''}${change}%`,
    };
  });
};

export function SignalScanner() {
  const [signals, setSignals] = useState<Signal[]>(generateSignals());
  const [scanning, setScanning] = useState(false);

  const rescan = () => {
    setScanning(true);
    setTimeout(() => {
      setSignals(generateSignals());
      setScanning(false);
    }, 1500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(generateSignals());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSignalColor = (signal: Signal['signal']) => {
    switch (signal) {
      case 'buy': return 'text-green-500';
      case 'sell': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSignalBg = (signal: Signal['signal']) => {
    switch (signal) {
      case 'buy': return 'bg-green-500/10 border-green-500/30 text-green-500';
      case 'sell': return 'bg-red-500/10 border-red-500/30 text-red-500';
      default: return 'bg-muted/50 border-border text-muted-foreground';
    }
  };

  const getSignalIcon = (signal: Signal['signal']) => {
    switch (signal) {
      case 'buy': return <TrendingUp className="h-4 w-4" />;
      case 'sell': return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-semibold text-foreground">Signal Scanner</h3>
        <button
          onClick={rescan}
          disabled={scanning}
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scanning...' : 'Rescan'}
        </button>
      </div>

      <div className="grid gap-2">
        {signals.map((s, i) => (
          <motion.div
            key={s.pair}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center justify-between p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${getSignalBg(s.signal)}`}>
                {getSignalIcon(s.signal)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{s.pair}</p>
                <p className="text-xs text-muted-foreground">{s.price}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${parseFloat(s.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {s.change}
              </span>
              <Badge variant="outline" className={`text-xs uppercase font-bold ${getSignalBg(s.signal)}`}>
                {s.signal}
              </Badge>
              <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${s.signal === 'buy' ? 'bg-green-500' : s.signal === 'sell' ? 'bg-red-500' : 'bg-muted-foreground'}`}
                  style={{ width: `${s.strength}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
