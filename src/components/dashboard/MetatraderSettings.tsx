import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Link2, CheckCircle2, XCircle, Eye, EyeOff, Lock, Check, ChevronsUpDown, Terminal, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

type BrokerOption = { value: string; label: string; group: string; servers?: string[] };

const BROKERS: BrokerOption[] = [
  // South African brokers
  { value: "razormarkets", label: "Razor Markets", group: "South Africa", servers: ["RazorMarkets-Live", "RazorMarkets-Demo", "RazorMarkets-Server"] },
  { value: "trive-sa", label: "Trive South Africa", group: "South Africa", servers: ["TriveSouthAfrica-Live", "TriveSouthAfrica-Demo"] },
  { value: "blackstonefutures", label: "Blackstone Futures", group: "South Africa", servers: ["BlackstoneFutures-Live", "BlackstoneFutures-Demo"] },
  { value: "khwezitrade", label: "Khwezi Trade", group: "South Africa", servers: ["KhweziTrade-Live", "KhweziTrade-Demo"] },
  { value: "cmtrading", label: "CM Trading", group: "South Africa", servers: ["CMTrading-Live", "CMTrading-Demo"] },
  { value: "scopemarkets-sa", label: "Scope Markets SA", group: "South Africa", servers: ["ScopeMarkets-Live", "ScopeMarkets-Demo"] },
  { value: "ig-sa", label: "IG South Africa", group: "South Africa", servers: ["IG-Live", "IG-Demo"] },
  { value: "sasfin", label: "Sasfin Securities", group: "South Africa", servers: ["Sasfin-Live", "Sasfin-Demo"] },
  { value: "fnb-globaltrader", label: "FNB Global Trader", group: "South Africa", servers: ["FNB-Live", "FNB-Demo"] },
  { value: "standardbank", label: "Standard Bank Webtrader", group: "South Africa", servers: ["StandardBank-Live", "StandardBank-Demo"] },
  { value: "absa", label: "Absa Stockbrokers", group: "South Africa", servers: ["Absa-Live", "Absa-Demo"] },
  { value: "purple-sa", label: "Purple Group / EasyEquities", group: "South Africa", servers: ["PurpleGroup-Live"] },
  { value: "tickmill-sa", label: "Tickmill South Africa", group: "South Africa", servers: ["TickmillSA-Live", "TickmillSA-Demo"] },
  { value: "hfm-sa", label: "HFM South Africa", group: "South Africa", servers: ["HFMarketsSA-Live", "HFMarketsSA-Demo"] },
  { value: "exness-sa", label: "Exness South Africa", group: "South Africa", servers: ["Exness-MT5Real", "Exness-MT5Trial", "Exness-Real", "Exness-Trial"] },
  { value: "fxtm-sa", label: "FXTM South Africa", group: "South Africa", servers: ["ForexTime-Live", "ForexTime-Demo"] },
  { value: "plus500-sa", label: "Plus500 SA", group: "South Africa" },
  { value: "chartwell-sa", label: "Chartwell Trading SA", group: "South Africa" },

  // International
  { value: "exness", label: "Exness", group: "International", servers: ["Exness-MT5Real", "Exness-MT5Trial", "Exness-Real", "Exness-Trial"] },
  { value: "xm", label: "XM", group: "International", servers: ["XMGlobal-MT5", "XMGlobal-MT5 2", "XMGlobal-Real", "XMGlobal-Demo"] },
  { value: "icmarkets", label: "IC Markets", group: "International", servers: ["ICMarketsSC-MT5", "ICMarkets-Live01", "ICMarkets-Demo"] },
  { value: "fxpro", label: "FXPro", group: "International" },
  { value: "pepperstone", label: "Pepperstone", group: "International", servers: ["Pepperstone-MT5-Live01", "Pepperstone-Demo"] },
  { value: "deriv", label: "Deriv", group: "International", servers: ["Deriv-Server", "Deriv-Demo"] },
  { value: "fbs", label: "FBS", group: "International" },
  { value: "octafx", label: "OctaFX", group: "International" },
  { value: "fxtm", label: "FXTM", group: "International" },
  { value: "hotforex", label: "HFM (HotForex)", group: "International" },
  { value: "tickmill", label: "Tickmill", group: "International" },
  { value: "roboforex", label: "RoboForex", group: "International" },
  { value: "avatrade", label: "AvaTrade", group: "International" },
  { value: "admiralmarkets", label: "Admiral Markets", group: "International" },
  { value: "oanda", label: "OANDA", group: "International" },
  { value: "fxcm", label: "FXCM", group: "International" },
  { value: "saxobank", label: "Saxo Bank", group: "International" },
  { value: "igmarkets", label: "IG Markets", group: "International" },
  { value: "cmcmarkets", label: "CMC Markets", group: "International" },
  { value: "plus500", label: "Plus500", group: "International" },
  { value: "etoro", label: "eToro", group: "International" },
  { value: "fpmarkets", label: "FP Markets", group: "International" },
  { value: "bdswiss", label: "BDSwiss", group: "International" },
  { value: "instaforex", label: "InstaForex", group: "International" },
  { value: "liteforex", label: "LiteFinance", group: "International" },
  { value: "justmarkets", label: "JustMarkets", group: "International" },
  { value: "alpari", label: "Alpari", group: "International" },
  { value: "vantage", label: "Vantage", group: "International" },
  { value: "axi", label: "Axi", group: "International" },
  { value: "blackbull", label: "BlackBull Markets", group: "International" },
  { value: "eightcap", label: "Eightcap", group: "International" },
  { value: "other", label: "Other broker", group: "International" },
];

const BROKER_GROUPS = ["South Africa", "International"];

type Platform = 'mt4' | 'mt5';

export function MetatraderSettings() {
  const [platform, setPlatform] = useState<Platform>('mt5');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [server, setServer] = useState('');
  const [broker, setBroker] = useState('');
  const [brokerOpen, setBrokerOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [savedAccount, setSavedAccount] = useState<{ id: string; meta_account_id: string; label: string } | null>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);

  const selectedBroker = BROKERS.find((b) => b.value === broker);

  // Load an existing linked account
  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase
        .from('mt_accounts')
        .select('id, meta_account_id, label, broker')
        .eq('user_id', auth.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setSavedAccount(data as any);
        setConnected(true);
        if ((data as any).broker) setBroker((data as any).broker);
        loadAccountInfo((data as any).meta_account_id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAccountInfo = async (metaAccountId: string) => {
    const { data, error } = await supabase.functions.invoke('metaapi-trade', {
      body: { action: 'get_account_metrics', accountId: metaAccountId },
    });
    if (!error && data && !data.error) setAccountInfo(data);
  };

  const handleConnect = async () => {
    if (!accountNumber || !server || !password) {
      toast.error('Please fill in all required fields including password');
      return;
    }
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      toast.error('Please sign in before linking a live trading account');
      return;
    }

    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('metaapi-trade', {
        body: {
          action: 'provision_account',
          login: accountNumber,
          password,
          server,
          platform,
          name: `${selectedBroker?.label ?? 'Broker'} ${accountNumber}`,
        },
      });
      if (error) throw new Error(error.message);
      if (!data?.accountId) throw new Error(data?.error || 'Broker rejected the credentials');

      const { data: row, error: dbError } = await supabase
        .from('mt_accounts')
        .insert({
          user_id: auth.user.id,
          label: `${selectedBroker?.label ?? 'Broker'} ${accountNumber}`,
          meta_account_id: data.accountId,
          broker: broker || null,
          is_active: true,
        })
        .select('id, meta_account_id, label')
        .single();
      if (dbError) throw dbError;

      setSavedAccount(row as any);
      setConnected(true);
      setPassword('');
      toast.success('Account linked — trades will now execute on your broker');
      setTimeout(() => loadAccountInfo(data.accountId), 8000);
    } catch (e: any) {
      toast.error(e.message || 'Failed to connect account');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (savedAccount) {
      await supabase.functions.invoke('metaapi-trade', {
        body: { action: 'remove_account', accountId: savedAccount.meta_account_id },
      });
      await supabase.from('mt_accounts').delete().eq('id', savedAccount.id);
    }
    setSavedAccount(null);
    setAccountInfo(null);
    setConnected(false);
    setPassword('');
    toast.info('Disconnected from MetaTrader');
  };


  return (
    <div className="space-y-6 pb-20">
      {/* Platform Selection */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Select Platform</CardTitle>
          <CardDescription>Choose your MetaTrader version</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mt4" className="font-semibold">
                MetaTrader 4
              </TabsTrigger>
              <TabsTrigger value="mt5" className="font-semibold">
                MetaTrader 5
              </TabsTrigger>
            </TabsList>
            <TabsContent value="mt4">
              <div className="pt-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Connect your MT4 account for legacy broker support
                </p>
              </div>
            </TabsContent>
            <TabsContent value="mt5">
              <div className="pt-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Connect your MT5 account for advanced trading features
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Connection Card */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display">
                  {platform === 'mt5' ? 'MT5' : 'MT4'} Connection
                </CardTitle>
                <CardDescription>Link your {platform === 'mt5' ? 'MetaTrader 5' : 'MetaTrader 4'} account</CardDescription>
              </div>
            </div>
            <Badge variant={connected ? 'default' : 'secondary'} className={connected ? 'bg-green-500' : ''}>
              {connected ? (
                <><CheckCircle2 className="h-3 w-3 mr-1" /> Connected</>
              ) : (
                <><XCircle className="h-3 w-3 mr-1" /> Disconnected</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="broker">Broker</Label>
            <Popover open={brokerOpen} onOpenChange={setBrokerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={brokerOpen}
                  className="w-full justify-between font-normal"
                >
                  {broker
                    ? BROKERS.find((b) => b.value === broker)?.label
                    : "Search or select your broker..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search broker..." />
                  <CommandList>
                    <CommandEmpty>No broker found.</CommandEmpty>
                    {BROKER_GROUPS.map((group) => (
                      <CommandGroup key={group} heading={group}>
                        {BROKERS.filter((b) => b.group === group).map((b) => (
                          <CommandItem
                            key={b.value}
                            value={`${b.label} ${b.group}`}
                            onSelect={() => {
                              setBroker(b.value);
                              if (b.servers?.length) setServer(b.servers[0]);
                              setBrokerOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                broker === b.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {b.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}

                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Account Number</Label>
            <Input
              id="account"
              placeholder={`Enter your ${platform === 'mt5' ? 'MT5' : 'MT4'} account number`}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Password
              </div>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your trading password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Your trading account password (not investor password)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="server">Server</Label>
            <Input
              id="server"
              placeholder={platform === 'mt5' ? 'e.g., RazorMarkets-Live' : 'e.g., RazorMarkets-Server'}
              value={server}
              onChange={(e) => setServer(e.target.value)}
            />
            {selectedBroker?.servers?.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedBroker.servers.map((s) => (
                  <Badge
                    key={s}
                    variant={server === s ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => setServer(s)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Exact server name from your MT{platform === 'mt5' ? '5' : '4'} terminal (Tools → Options → Server).
            </p>
          </div>

          {connected ? (
            <Button variant="destructive" className="w-full" onClick={handleDisconnect}>
              <Link2 className="h-4 w-4 mr-2" />
              Disconnect Account
            </Button>
          ) : (
            <Button className="w-full" onClick={handleConnect} disabled={connecting}>
              {connecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
              {connecting ? 'Linking account…' : 'Connect Account'}
            </Button>
          )}

          <Button variant="outline" className="w-full" onClick={handleTestApi} disabled={testing}>
            {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {testing ? 'Testing API…' : 'Test API connection'}
          </Button>

        </CardContent>
      </Card>

      {connected && (
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Account Info</CardTitle>
                <CardDescription>{savedAccount?.label ?? 'Live account'}</CardDescription>
              </div>
              {savedAccount && (
                <Button variant="outline" size="sm" onClick={() => loadAccountInfo(savedAccount.meta_account_id)}>
                  Refresh
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {accountInfo ? (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Balance', value: accountInfo.balance },
                  { label: 'Equity', value: accountInfo.equity },
                  { label: 'Margin Used', value: accountInfo.margin },
                  { label: 'Free Margin', value: accountInfo.freeMargin },
                ].map((m) => (
                  <div key={m.label} className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-lg font-semibold text-foreground">
                      {typeof m.value === 'number'
                        ? `${accountInfo.currency ?? '$'} ${m.value.toFixed(2)}`
                        : '—'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Account is deploying on the broker server. Tap Refresh in a moment to load live balances.
              </p>
            )}
          </CardContent>
        </Card>
      )}


      {/* Code Base EA API endpoint — wire this URL into your MT4/MT5 EA */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Terminal className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display">Code Base EA API</CardTitle>
              <CardDescription>Paste this URL into your MT4/MT5 EA settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Base URL', value: 'https://vdjckpwwqqcqavrucndh.supabase.co/functions/v1/code-base-api' },
            { label: 'Validate license', value: 'https://vdjckpwwqqcqavrucndh.supabase.co/functions/v1/code-base-api?endpoint=validate_license' },
            { label: 'Get signals', value: 'https://vdjckpwwqqcqavrucndh.supabase.co/functions/v1/code-base-api?endpoint=get_signals' },
            { label: 'Log trade', value: 'https://vdjckpwwqqcqavrucndh.supabase.co/functions/v1/code-base-api?endpoint=trading_activity' },
          ].map((row) => (
            <div key={row.label} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{row.label}</Label>
              <div className="flex gap-2">
                <Input readOnly value={row.value} className="font-mono text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(row.value);
                    toast.success('Copied');
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Endpoints: <span className="font-mono">validate_license, register_instance, instance_status, trading_activity, get_signals, get_symbols, get_product_images, check_app_version, activate_email_device</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
