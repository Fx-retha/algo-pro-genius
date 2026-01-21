import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface LogsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'trade' | 'signal' | 'error' | 'info';
  message: string;
  pair?: string;
  profit?: number;
}

const MOCK_LOGS: LogEntry[] = [
  { id: '1', timestamp: '2026-01-21 09:15:32', type: 'trade', message: 'Buy order opened', pair: 'EURUSD', profit: 0 },
  { id: '2', timestamp: '2026-01-21 09:14:28', type: 'signal', message: 'Bullish signal detected', pair: 'EURUSD' },
  { id: '3', timestamp: '2026-01-21 09:12:45', type: 'trade', message: 'Sell order closed', pair: 'GBPUSD', profit: 45.50 },
  { id: '4', timestamp: '2026-01-21 09:10:12', type: 'info', message: 'Bot started successfully' },
  { id: '5', timestamp: '2026-01-21 09:08:33', type: 'signal', message: 'Analyzing market conditions', pair: 'XAUUSD' },
  { id: '6', timestamp: '2026-01-21 09:05:18', type: 'trade', message: 'Buy order closed', pair: 'USDJPY', profit: 28.30 },
  { id: '7', timestamp: '2026-01-21 09:02:44', type: 'error', message: 'Connection timeout - retrying' },
  { id: '8', timestamp: '2026-01-21 09:00:00', type: 'info', message: 'Session initialized' },
];

export function LogsModal({ open, onOpenChange }: LogsModalProps) {
  const getTypeBadge = (type: LogEntry['type']) => {
    const variants: Record<LogEntry['type'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      trade: { variant: 'default', label: 'TRADE' },
      signal: { variant: 'secondary', label: 'SIGNAL' },
      error: { variant: 'destructive', label: 'ERROR' },
      info: { variant: 'outline', label: 'INFO' },
    };
    return variants[type];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">Trading Logs</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-96">
          <div className="space-y-3 pr-4">
            {MOCK_LOGS.map((log) => {
              const badgeInfo = getTypeBadge(log.type);
              return (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{log.message}</p>
                  {log.pair && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-primary font-mono">{log.pair}</span>
                      {log.profit !== undefined && log.profit !== 0 && (
                        <span className={`text-xs font-semibold ${log.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {log.profit > 0 ? '+' : ''}{log.profit.toFixed(2)} USD
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
