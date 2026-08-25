import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, Link2, Unlink, Play, Square, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type Platform = 'mt4' | 'mt5';

interface MtAccount {
  id: string;
  label: string;
  meta_account_id: string;
  broker: string | null;
  platform: string;
  login: string | null;
  connection_status: string;
  robot_status: string;
  last_synced_at: string | null;
  last_error: string | null;
}

interface Position {
  id: string;
  symbol: string;
  type: string;
  volume: number;
  openPrice: number;
  currentPrice?: number;
  profit?: number;
}

const statusVariant = (status: string) =>
  status === 'connected' || status === 'running'
    ? 'default'
    : status === 'error'
      ? 'destructive'
      : 'secondary';

const money = (n: unknown) =>
  typeof n === 'number' ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

export default function ConnectAccount() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [account, setAccount] = useState<MtAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<Platform>('mt5');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [server, setServer] = useState('');
  const [broker, setBroker] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/mentor-auth?next=/connect-account');
  }, [user, authLoading, navigate]);

  const patchAccount = useCallback(async (id: string, patch: Partial<MtAccount>) => {
    await supabase.from('mt_accounts').update(patch).eq('id', id);
    setAccount((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  }, []);

  const syncLive = useCallback(
    async (acct: MtAccount) => {
      setRefreshing(true);
      try {
        const [metricsRes, positionsRes, infoRes] = await Promise.all([
          supabase.functions.invoke('metaapi-trade', {
            body: { action: 'get_account_metrics', accountId: acct.meta_account_id },
          }),
          supabase.functions.invoke('metaapi-trade', {
            body: { action: 'get_positions', accountId: acct.meta_account_id },
          }),
          supabase.functions.invoke('metaapi-trade', {
            body: { action: 'get_account_info', accountId: acct.meta_account_id },
          }),
        ]);

        const m = metricsRes.data;
        const p = positionsRes.data;
        const info = infoRes.data;

        const failure = m?.error || info?.error;
        if (failure) {
          setMetrics(null);
          await patchAccount(acct.id, { connection_status: 'error', last_error: String(failure) });
          return;
        }

        setMetrics(m ?? null);
        setPositions(Array.isArray(p) ? (p as Position[]) : []);

        const state = String(info?.state ?? '');
        const connStatus =
          state === 'DEPLOYED' && typeof m?.balance === 'number'
            ? 'connected'
            : state === 'DEPLOYING' || state === 'UNDEPLOYING'
              ? 'deploying'
              : 'disconnected';

        await patchAccount(acct.id, {
          connection_status: connStatus,
          last_error: null,
          last_synced_at: new Date().toISOString(),
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to refresh account');
      } finally {
        setRefreshing(false);
      }
    },
    [patchAccount],
  );

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('mt_accounts')
        .select('id, label, meta_account_id, broker, platform, login, connection_status, robot_status, last_synced_at, last_error')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setLoading(false);
      if (data) {
        const acct = data as MtAccount;
        setAccount(acct);
        syncLive(acct);
      }
    })();
  }, [user, syncLive]);

  // Keep live data fresh while an account is linked
  useEffect(() => {
    if (!account) return;
    const timer = setInterval(() => syncLive(account), 30000);
    return () => clearInterval(timer);
  }, [account, syncLive]);

  const handleConnect = async () => {
    if (!user) return;
    if (!login || !password || !server) {
      toast.error('Account number, password and server are required');
      return;
    }
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('metaapi-trade', {
        body: {
          action: 'provision_account',
          login,
          password,
          server,
          platform,
          name: `${broker || 'Broker'} ${login}`,
        },
      });
      if (error) throw new Error(error.message);
      if (!data?.accountId) throw new Error(data?.error || 'Broker rejected these credentials');

      const { data: row, error: dbError } = await supabase
        .from('mt_accounts')
        .insert({
          user_id: user.id,
          label: `${broker || 'Broker'} ${login}`,
          meta_account_id: data.accountId,
          broker: broker || null,
          platform,
          login,
          is_active: true,
          connection_status: 'deploying',
          robot_status: 'stopped',
        })
        .select('id, label, meta_account_id, broker, platform, login, connection_status, robot_status, last_synced_at, last_error')
        .single();
      if (dbError) throw dbError;

      setPassword('');
      const acct = row as MtAccount;
      setAccount(acct);
      toast.success('Account linked — connecting to your broker');
      setTimeout(() => syncLive(acct), 10000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to connect account');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!account) return;
    await supabase.functions.invoke('metaapi-trade', {
      body: { action: 'remove_account', accountId: account.meta_account_id },
    });
    await supabase.from('mt_accounts').update({ is_active: false, connection_status: 'disconnected', robot_status: 'stopped' }).eq('id', account.id);
    setAccount(null);
    setMetrics(null);
    setPositions([]);
    toast.success('Account disconnected');
  };

  const toggleRobot = async () => {
    if (!account) return;
    const next = account.robot_status === 'running' ? 'stopped' : 'running';
    await patchAccount(account.id, { robot_status: next });
    await supabase
      .from('bot_configs')
      .upsert(
        { user_id: user!.id, mt_account_id: account.id, enabled: next === 'running' },
        { onConflict: 'user_id' },
      );
    toast.success(next === 'running' ? 'Robot started' : 'Robot stopped');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Trading account</h1>
          <p className="text-sm text-muted-foreground">
            Link your MT4 or MT5 account. Credentials are sent straight to the secure backend — no broker or API keys
            ever live in this page.
          </p>
        </header>

        {!account ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-4 w-4" /> Connect MT4 / MT5
              </CardTitle>
              <CardDescription>Use the credentials your broker issued for the trading terminal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mt5">MetaTrader 5</TabsTrigger>
                  <TabsTrigger value="mt4">MetaTrader 4</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="login">Account number</Label>
                  <Input id="login" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="12345678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="broker">Broker</Label>
                  <Input id="broker" value={broker} onChange={(e) => setBroker(e.target.value)} placeholder="Razor Markets" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="server">Server</Label>
                  <Input id="server" value={server} onChange={(e) => setServer(e.target.value)} placeholder="RazorMarkets-Live" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button onClick={handleConnect} disabled={connecting} className="w-full">
                {connecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                Connect account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>{account.label}</CardTitle>
                  <CardDescription>
                    {account.platform.toUpperCase()} · login {account.login ?? '—'}
                    {account.last_synced_at && ` · synced ${new Date(account.last_synced_at).toLocaleTimeString()}`}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant(account.connection_status)}>{account.connection_status}</Badge>
                  <Badge variant={statusVariant(account.robot_status)}>robot: {account.robot_status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {account.last_error && <p className="text-sm text-destructive">{account.last_error}</p>}

                <div className="grid gap-4 sm:grid-cols-4">
                  {[
                    ['Balance', money(metrics?.balance)],
                    ['Equity', money(metrics?.equity)],
                    ['Margin', money(metrics?.margin)],
                    ['Free margin', money(metrics?.freeMargin)],
                  ].map(([label, value]) => (
                    <div key={label as string} className="rounded-lg border border-border p-3">
                      <p className="text-xs uppercase text-muted-foreground">{label}</p>
                      <p className="text-lg font-semibold">{value as string}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => syncLive(account)} disabled={refreshing}>
                    {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Refresh
                  </Button>
                  <Button variant={account.robot_status === 'running' ? 'secondary' : 'default'} onClick={toggleRobot}>
                    {account.robot_status === 'running' ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {account.robot_status === 'running' ? 'Stop robot' : 'Start robot'}
                  </Button>
                  <Button variant="destructive" onClick={handleDisconnect}>
                    <Unlink className="mr-2 h-4 w-4" /> Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open positions</CardTitle>
                <CardDescription>Live from your broker via the secure backend.</CardDescription>
              </CardHeader>
              <CardContent>
                {positions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No open positions.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>Open</TableHead>
                        <TableHead>Current</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positions.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.symbol}</TableCell>
                          <TableCell>{String(p.type ?? '').replace('POSITION_TYPE_', '')}</TableCell>
                          <TableCell>{p.volume}</TableCell>
                          <TableCell>{p.openPrice}</TableCell>
                          <TableCell>{p.currentPrice ?? '—'}</TableCell>
                          <TableCell
                            className={`text-right ${(p.profit ?? 0) >= 0 ? 'text-primary' : 'text-destructive'}`}
                          >
                            {money(p.profit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
