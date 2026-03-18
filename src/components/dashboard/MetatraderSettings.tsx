import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Link2, CheckCircle2, XCircle, Eye, EyeOff, Lock, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const BROKERS = [
  { value: "exness", label: "Exness" },
  { value: "xm", label: "XM" },
  { value: "icmarkets", label: "IC Markets" },
  { value: "fxpro", label: "FXPro" },
  { value: "pepperstone", label: "Pepperstone" },
  { value: "deriv", label: "Deriv" },
  { value: "fbs", label: "FBS" },
  { value: "octafx", label: "OctaFX" },
  { value: "fxtm", label: "FXTM" },
  { value: "hotforex", label: "HFM (HotForex)" },
  { value: "tickmill", label: "Tickmill" },
  { value: "roboforex", label: "RoboForex" },
  { value: "avatrade", label: "AvaTrade" },
  { value: "admiralmarkets", label: "Admiral Markets" },
  { value: "oanda", label: "OANDA" },
  { value: "fxcm", label: "FXCM" },
  { value: "saxobank", label: "Saxo Bank" },
  { value: "igmarkets", label: "IG Markets" },
  { value: "cmcmarkets", label: "CMC Markets" },
  { value: "plus500", label: "Plus500" },
  { value: "etoro", label: "eToro" },
  { value: "fpmarkets", label: "FP Markets" },
  { value: "bdswiss", label: "BDSwiss" },
  { value: "instaforex", label: "InstaForex" },
  { value: "liteforex", label: "LiteFinance" },
  { value: "justmarkets", label: "JustMarkets" },
  { value: "alpari", label: "Alpari" },
  { value: "vantage", label: "Vantage" },
  { value: "axi", label: "Axi" },
  { value: "blackbull", label: "BlackBull Markets" },
  { value: "eightcap", label: "Eightcap" },
  { value: "other", label: "Other" },
];

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

  const handleConnect = () => {
    if (!accountNumber || !server || !password) {
      toast.error('Please fill in all required fields including password');
      return;
    }
    setConnected(true);
    toast.success(`Connected to MetaTrader ${platform === 'mt5' ? '5' : '4'} successfully!`);
  };

  const handleDisconnect = () => {
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
                    <CommandGroup>
                      {BROKERS.map((b) => (
                        <CommandItem
                          key={b.value}
                          value={b.label}
                          onSelect={() => {
                            setBroker(b.value);
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
              placeholder={platform === 'mt5' ? 'e.g., Exness-MT5Real' : 'e.g., Exness-Real'}
              value={server}
              onChange={(e) => setServer(e.target.value)}
            />
          </div>

          {connected ? (
            <Button variant="destructive" className="w-full" onClick={handleDisconnect}>
              <Link2 className="h-4 w-4 mr-2" />
              Disconnect Account
            </Button>
          ) : (
            <Button className="w-full" onClick={handleConnect}>
              <Link2 className="h-4 w-4 mr-2" />
              Connect Account
            </Button>
          )}
        </CardContent>
      </Card>

      {connected && (
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Account Info</CardTitle>
            <CardDescription>Connected via {platform === 'mt5' ? 'MetaTrader 5' : 'MetaTrader 4'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-lg font-semibold text-foreground">$10,245.50</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Equity</p>
                <p className="text-lg font-semibold text-foreground">$10,312.80</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Margin Used</p>
                <p className="text-lg font-semibold text-foreground">$1,024.00</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Free Margin</p>
                <p className="text-lg font-semibold text-foreground">$9,288.80</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
