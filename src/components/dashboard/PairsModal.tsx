import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ChevronRight, Settings } from 'lucide-react';

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
  const [step, setStep] = useState<'pairs' | 'config'>('pairs');
  
  // Trading config
  const [lotSize, setLotSize] = useState('0.01');
  const [riskLevel, setRiskLevel] = useState('2');
  const [stopLoss, setStopLoss] = useState('50');
  const [takeProfit, setTakeProfit] = useState('100');
  const [maxTrades, setMaxTrades] = useState('5');
  const [autoTrade, setAutoTrade] = useState(true);

  const togglePair = (pair: string) => {
    setSelectedPairs(prev =>
      prev.includes(pair)
        ? prev.filter(p => p !== pair)
        : [...prev, pair]
    );
  };

  const selectAll = () => setSelectedPairs(FOREX_PAIRS);
  const clearAll = () => setSelectedPairs([]);

  const handleSave = () => {
    const lot = parseFloat(lotSize);
    const risk = parseFloat(riskLevel);
    if (isNaN(lot) || lot < 0.01 || lot > 100) {
      toast.error('Lot size must be between 0.01 and 100');
      return;
    }
    if (isNaN(risk) || risk < 0.5 || risk > 10) {
      toast.error('Risk level must be between 0.5% and 10%');
      return;
    }
    toast.success(`Saved settings for ${selectedPairs.length} pairs`);
    onOpenChange(false);
    setStep('pairs');
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) setStep('pairs');
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">
            {step === 'pairs' ? 'Select Trading Pairs' : 'Configure Bot Settings'}
          </DialogTitle>
        </DialogHeader>

        {step === 'pairs' ? (
          <>
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
              <Button variant="outline" size="sm" onClick={clearAll}>Clear All</Button>
            </div>

            <ScrollArea className="h-72 pr-4">
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
              <Button
                onClick={() => {
                  if (selectedPairs.length === 0) {
                    toast.error('Select at least one pair');
                    return;
                  }
                  setStep('config');
                }}
                className="gap-1"
              >
                Configure
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Selected pairs summary */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {selectedPairs.slice(0, 6).map(p => (
                <span key={p} className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-mono">
                  {p}
                </span>
              ))}
              {selectedPairs.length > 6 && (
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                  +{selectedPairs.length - 6} more
                </span>
              )}
            </div>

            <ScrollArea className="h-72 pr-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Risk Level (%)</Label>
                    <Input type="number" value={riskLevel} onChange={e => setRiskLevel(e.target.value)} min="0.5" max="10" step="0.5" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Lot Size</Label>
                    <Input type="number" value={lotSize} onChange={e => setLotSize(e.target.value)} min="0.01" max="100" step="0.01" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Stop Loss (pips)</Label>
                    <Input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)} min="5" max="500" step="5" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Take Profit (pips)</Label>
                    <Input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} min="5" max="1000" step="5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Max Open Trades</Label>
                  <Input type="number" value={maxTrades} onChange={e => setMaxTrades(e.target.value)} min="1" max="50" step="1" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Auto Trading</Label>
                    <p className="text-[10px] text-muted-foreground">Execute trades automatically</p>
                  </div>
                  <Switch checked={autoTrade} onCheckedChange={setAutoTrade} />
                </div>
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-4 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={() => setStep('pairs')}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                Save & Apply
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
