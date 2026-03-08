import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Server, Eye, EyeOff, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function VpsSettings() {
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [config, setConfig] = useState({
    ipAddress: '',
    port: '22',
    username: '',
    password: '',
  });

  const updateConfig = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleConnect = async () => {
    if (!config.ipAddress || !config.username || !config.password) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in IP address, username and password.',
        variant: 'destructive',
      });
      return;
    }

    setConnecting(true);
    // Simulate connection attempt
    await new Promise((r) => setTimeout(r, 2000));
    setConnected(true);
    setConnecting(false);
    toast({ title: 'VPS Connected', description: `Connected to ${config.ipAddress}` });
  };

  const handleDisconnect = () => {
    setConnected(false);
    toast({ title: 'VPS Disconnected' });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between font-display text-lg">
            <span className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              VPS Connection
            </span>
            <Badge
              variant="outline"
              className={
                connected
                  ? 'bg-green-500/20 text-green-500 border-green-500/30'
                  : 'bg-muted text-muted-foreground'
              }
            >
              {connected ? (
                <><Wifi className="h-3 w-3 mr-1" /> Connected</>
              ) : (
                <><WifiOff className="h-3 w-3 mr-1" /> Disconnected</>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>IP Address</Label>
              <Input
                placeholder="192.168.1.100"
                value={config.ipAddress}
                onChange={(e) => updateConfig('ipAddress', e.target.value)}
                disabled={connected}
              />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input
                placeholder="22"
                value={config.port}
                onChange={(e) => updateConfig('port', e.target.value)}
                disabled={connected}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              placeholder="root"
              value={config.username}
              onChange={(e) => updateConfig('username', e.target.value)}
              disabled={connected}
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={config.password}
                onChange={(e) => updateConfig('password', e.target.value)}
                disabled={connected}
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
          </div>

          {connected ? (
            <Button variant="destructive" className="w-full" onClick={handleDisconnect}>
              <WifiOff className="mr-2 h-4 w-4" />
              Disconnect VPS
            </Button>
          ) : (
            <Button className="w-full" onClick={handleConnect} disabled={connecting}>
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wifi className="mr-2 h-4 w-4" />
                  Connect to VPS
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* VPS Info when connected */}
      {connected && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">VPS Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Host</span>
              <span className="font-mono text-sm">{config.ipAddress}:{config.port}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">User</span>
              <span className="text-sm">{config.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Status</span>
              <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">
                Online
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
