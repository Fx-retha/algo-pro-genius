import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Link2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function MetatraderSettings() {
  const [accountNumber, setAccountNumber] = useState('');
  const [server, setServer] = useState('');
  const [broker, setBroker] = useState('');
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    if (!accountNumber || !server) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Simulate connection
    setConnected(true);
    toast.success('Connected to MetaTrader successfully!');
  };

  const handleDisconnect = () => {
    setConnected(false);
    toast.info('Disconnected from MetaTrader');
  };

  return (
    <div className="space-y-6 pb-20">
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display">MetaTrader Connection</CardTitle>
                <CardDescription>Link your MT4/MT5 account</CardDescription>
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
            <Select value={broker} onValueChange={setBroker}>
              <SelectTrigger>
                <SelectValue placeholder="Select your broker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exness">Exness</SelectItem>
                <SelectItem value="xm">XM</SelectItem>
                <SelectItem value="icmarkets">IC Markets</SelectItem>
                <SelectItem value="fxpro">FXPro</SelectItem>
                <SelectItem value="pepperstone">Pepperstone</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Account Number</Label>
            <Input
              id="account"
              placeholder="Enter your MT4/MT5 account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="server">Server</Label>
            <Input
              id="server"
              placeholder="e.g., Exness-MT5Real"
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
