import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, TrendingDown, TrendingUp, RotateCcw } from 'lucide-react';

interface PaperAccount {
  id: string;
  label: string;
  currency: string;
  balance: number;
  equity: number;
  starting_balance: number;
  leverage: number;
  max_open_trades: number;
  max_volume: number;
}

interface Position {
  id: string;
  symbol: string;
  side: string;
  volume: number;
  open_price: number;
  close_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  profit: number;
  status: string;
  execution_mode: string;
  bridge_status: string | null;
  opened_at: string;
  closed_at: string | null;
  note: string | null;
}

const SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'XAGUSD', 'BTCUSD', 'ETHUSD'];

function money(v: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(v ?? 0);
}

export function DemoTrading() {
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [open, setOpen] = useState<Position[]>([]);
  const [closed, setClosed] = useState<Position[]>([]);
  const [floating, setFloating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [symbol, setSymbol] = useState('EURUSD');
  const [volume, setVolume] = useState('0.10');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await supabase.functions.invoke('paper-trade', { body: { action: 'get_state' } });
    if (error || data?.error) {
      if (!silent) toast({ title: 'Could not load your demo account', description: data?.error ?? error?.message, variant: 'destructive' });
    } else {
      setAccount(data.account);
      setOpen(data.open ?? []);
      setClosed(data.closed ?? []);
      setFloating(data.floating ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 20000);
    return () => clearInterval(t);
  }, [load]);

  const placeTrade = async (side: 'buy' | 'sell') => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('paper-trade', {
      body: {
        action: 'open_trade',
        symbol,
        side,
        volume: Number(volume),
        stop_loss: stopLoss ? Number(stopLoss) : null,
        take_profit: takeProfit ? Number(takeProfit) : null,
      },
    });
    setBusy(false);
    if (error || data?.error) {
      toast({ title: 'Trade rejected', description: data?.error ?? error?.message, variant: 'destructive' });
      return;
    }
    toast({ title: `Demo ${side.toUpperCase()} placed`, description: `${symbol} at ${data.position.open_price}` });
    setStopLoss(''); setTakeProfit('');
    load(true);
  };

  const closeTrade = async (id: string) => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('paper-trade', { body: { action: 'close_trade', position_id: id } });
    setBusy(false);
    if (error || data?.error) {
      toast({ title: 'Could not close', description: data?.error ?? error?.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Trade closed', description: `Result: ${money(data.profit)}` });
    load(true);
  };

  const resetAccount = async () => {
    setBusy(true);
    await supabase.functions.invoke('paper-trade', { body: { action: 'reset_account' } });
    setBusy(false);
    toast({ title: 'Demo account reset' });
    load(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Demo account</CardTitle>
          <Badge variant="secondary">Practice money</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="font-semibold">{money(Number(account?.balance ?? 0), account?.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Equity</p>
              <p className="font-semibold">{money(Number(account?.equity ?? 0), account?.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Floating</p>
              <p className={`font-semibold ${floating >= 0 ? 'text-primary' : 'text-destructive'}`}>{money(floating, account?.currency)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => load()} disabled={busy}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={resetAccount} disabled={busy}>
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">New trade</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Market</Label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {SYMBOLS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Lot size</Label>
              <Input value={volume} onChange={(e) => setVolume(e.target.value)} inputMode="decimal" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Stop loss (optional)</Label>
              <Input value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} inputMode="decimal" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Take profit (optional)</Label>
              <Input value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} inputMode="decimal" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => placeTrade('buy')} disabled={busy}>
              <TrendingUp className="h-4 w-4 mr-1" /> Buy
            </Button>
            <Button className="flex-1" variant="destructive" onClick={() => placeTrade('sell')} disabled={busy}>
              <TrendingDown className="h-4 w-4 mr-1" /> Sell
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Open trades ({open.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {open.length === 0 && <p className="text-sm text-muted-foreground">No open trades yet.</p>}
          {open.map((p) => (
            <div key={p.id} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={p.side === 'buy' ? 'default' : 'destructive'}>{p.side.toUpperCase()}</Badge>
                  <span className="font-medium">{p.symbol}</span>
                  <span className="text-xs text-muted-foreground">{p.volume} lots</span>
                </div>
                <span className={`font-semibold ${Number(p.profit) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {money(Number(p.profit))}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Entry {p.open_price}</span>
                <span>{p.execution_mode === 'bridge' ? `PC bridge: ${p.bridge_status}` : 'Demo fill'}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => closeTrade(p.id)} disabled={busy}>
                Close trade
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {closed.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {closed.slice(0, 15).map((p, i) => (
              <div key={p.id}>
                {i > 0 && <Separator className="mb-2" />}
                <div className="flex items-center justify-between text-sm">
                  <span>{p.side.toUpperCase()} {p.symbol} · {p.volume}</span>
                  <span className={Number(p.profit) >= 0 ? 'text-primary' : 'text-destructive'}>{money(Number(p.profit))}</span>
                </div>
                <p className="text-xs text-muted-foreground">{p.note ?? ''} {p.closed_at ? new Date(p.closed_at).toLocaleString() : ''}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
