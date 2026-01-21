import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PairsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FOREX_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'CADJPY', 'CHFJPY', 'EURAUD',
  'EURCAD', 'EURCHF', 'EURNZD', 'GBPAUD', 'GBPCAD', 'GBPCHF', 'GBPNZD',
  'AUDCAD', 'AUDCHF', 'AUDNZD', 'CADCHF', 'NZDCAD', 'NZDCHF',
  'XAUUSD', 'XAGUSD', 'US30', 'NAS100', 'SPX500',
];

export function PairsModal({ open, onOpenChange }: PairsModalProps) {
  const [selectedPairs, setSelectedPairs] = useState<string[]>(['EURUSD', 'GBPUSD', 'XAUUSD']);

  const togglePair = (pair: string) => {
    setSelectedPairs(prev => 
      prev.includes(pair) 
        ? prev.filter(p => p !== pair)
        : [...prev, pair]
    );
  };

  const selectAll = () => {
    setSelectedPairs(FOREX_PAIRS);
  };

  const clearAll = () => {
    setSelectedPairs([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">Trading Pairs</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        </div>

        <ScrollArea className="h-80 pr-4">
          <div className="grid grid-cols-2 gap-2">
            {FOREX_PAIRS.map((pair) => (
              <label
                key={pair}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPairs.includes(pair)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Checkbox
                  checked={selectedPairs.includes(pair)}
                  onCheckedChange={() => togglePair(pair)}
                />
                <span className="text-sm font-mono">{pair}</span>
              </label>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">
            {selectedPairs.length} pairs selected
          </span>
          <Button onClick={() => onOpenChange(false)}>
            Save Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
