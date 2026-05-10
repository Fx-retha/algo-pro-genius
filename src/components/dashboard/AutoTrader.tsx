import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, Loader2, History, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface BotConfig {
  id?: string;
  enabled: boolean;
  symbols: string[];
  min_confidence: number;
  volume: number;
  max_open_trades: number;
  mt_account_id: string | null;
  last_run_at: string | null;
}

interface MtAccount { id: string; label: string; meta_account_id: string; }
interface Trade {
  id: string; symbol: string; side: string; volume: number;
  status: string; profit: number | null; created_at: string;
  error_message: string | null;
}

const DEFAULT: BotConfig = {
  enabled: false, symbols: ['EURUSD', 'GBPUSD', 'XAUUSD'],
  min_confidence: 70, volume: 0.01, max_open_trades: 3,
  mt_account_id: null, last_run_at: null,
};

export function AutoTrader() {
  const { user } = useAuth();
  const [cfg, setCfg] = useState<BotConfig>(DEFAULT);
  const [accounts, setAccounts] = useState<MtAccount[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [symbolsText, setSymbolsText] = useState('EURUSD,GBPUSD,XAUUSD');

  // Quick-add MT account
  const [newLabel, setNewLabel] = useState('My MT Account');
  const [newMetaId, setNewMetaId] = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const [{ data: cfgData }, { data: accData }, { data: tradeData }] = await Promise.all([
        supabase.from('bot_configs').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('mt_accounts').select('id,label,meta_account_id').eq('user_id', user.id),
        supabase.from('trades').select('id,symbol,side,volume,status,profit,created_at,error_message').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      ]);
      if (cfgData) {
        setCfg(cfgData as BotConfig);
        setSymbolsText((cfgData.symbols as string[]).join(','));
      }
      setAccounts((accData as MtAccount[]) ?? []);
      setTrades((tradeData as Trade[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const saveAccount = async () => {
    if (!user || !newMetaId.trim()) return;
    const { data, error } = await supabase.from('mt_accounts').insert({
      user_id: user.id, label: newLabel, meta_account_id: newMetaId.trim(),
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setAccounts([...accounts, data as MtAccount]);
    setNewMetaId('');
    toast.success('MT account added');
  };

  const saveConfig = async () => {
    if (!user) return;
    setSaving(true);
    const symbols = symbolsText.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    const payload = { ...cfg, symbols, user_id: user.id };
    delete (payload as any).last_run_at;
    const { error } = await supabase.from('bot_configs').upsert(payload, { onConflict: 'user_id' });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success('Bot config saved'); setCfg({ ...cfg, symbols }); }
  };

  const runNow = async () => {
    if (!user) return;
    setRunning(true);
    const { data, error } = await supabase.functions.invoke('trading-bot-worker', { body: { userId: user.id } });
    setRunning(false);
    if (error) { toast.error(error.message); return; }
    const r = data?.results?.[0];
    if (r) toast.success(`Processed ${r.processed} • Executed ${r.executed}${r.errors?.length ? ` • ${r.errors[0]}` : ''}`);
    else toast.info('Bot ran. Enable it and add symbols.');
    // refresh trades
    const { data: t } = await supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
    setTrades((t as Trade[]) ?? []);
  };

  if (!user) {
    return (
      <Card className="border-border bg-card/50">
        <CardContent className="p-6 text-center space-y-3">
          <AlertCircle className="h-8 w-8 mx-auto text-primary" />
          <p className="text-sm">Sign in to use the auto-trader. Trade history and bot configs are stored per account.</p>
          <Button onClick={() => (window.location.href = '/mentor-auth')}>Sign in</Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" /> Auto-Trader
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{cfg.enabled ? 'ON' : 'OFF'}</span>
              <Switch checked={cfg.enabled} onCheckedChange={(v) => setCfg({ ...cfg, enabled: v })} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>MetaTrader account</Label>
            <select
              className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm"
              value={cfg.mt_account_id ?? ''}
              onChange={(e) => setCfg({ ...cfg, mt_account_id: e.target.value || null })}
            >
              <option value="">— Auto-pick active —</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.label} ({a.meta_account_id})</option>)}
            </select>
            <div className="flex gap-2 mt-2">
              <Input placeholder="Label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
              <Input placeholder="MetaAPI account ID" value={newMetaId} onChange={(e) => setNewMetaId(e.target.value)} />
              <Button variant="outline" onClick={saveAccount}>Add</Button>
            </div>
          </div>

          <div>
            <Label>Symbols (comma separated)</Label>
            <Input value={symbolsText} onChange={(e) => setSymbolsText(e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Min confidence (%)</Label>
              <Input type="number" min={0} max={100} value={cfg.min_confidence}
                onChange={(e) => setCfg({ ...cfg, min_confidence: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Lot size</Label>
              <Input type="number" step="0.01" value={cfg.volume}
                onChange={(e) => setCfg({ ...cfg, volume: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Max open trades</Label>
              <Input type="number" min={1} value={cfg.max_open_trades}
                onChange={(e) => setCfg({ ...cfg, max_open_trades: Number(e.target.value) })} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveConfig} disabled={saving} className="flex-1">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Config'}
            </Button>
            <Button onClick={runNow} disabled={running} variant="secondary" className="flex-1">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="h-4 w-4 mr-2" />Run Now</>}
            </Button>
          </div>

          {cfg.last_run_at && (
            <p className="text-xs text-muted-foreground">Last cron run: {new Date(cfg.last_run_at).toLocaleString()}</p>
          )}
          <p className="text-[11px] text-muted-foreground">
            The bot runs every minute when enabled, asks the AI for a signal on each symbol, and places a real MetaTrader trade when confidence ≥ threshold.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="font-display text-base flex items-center gap-2">
            <History className="h-4 w-4 text-primary" /> Recent Trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No trades yet.</p>
          ) : (
            <div className="space-y-2">
              {trades.map(t => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    {t.side === 'buy'
                      ? <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />
                      : <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />}
                    <span className="text-sm font-semibold truncate">{t.symbol}</span>
                    <Badge variant="outline" className="text-[10px]">{t.volume}</Badge>
                    <Badge variant={t.status === 'opened' ? 'default' : t.status === 'failed' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {t.status}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
