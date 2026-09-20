import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Copy, Loader2, Plug, RefreshCw } from 'lucide-react';

interface Bridge {
  id: string;
  label: string;
  status: string;
  account_login: string | null;
  balance: number | null;
  equity: number | null;
  last_seen_at: string | null;
  last_error: string | null;
  token_prefix: string;
}

const BRIDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mt5-bridge`;

const PYTHON_TEMPLATE = (token: string) => `# Code Base MT5 bridge - run this on your Windows PC
# pip install MetaTrader5 requests
import time, requests, MetaTrader5 as mt5

BRIDGE_URL = "${BRIDGE_URL}"
TOKEN = "${token}"   # keep this private

mt5.initialize()   # uses the MT5 terminal already logged in on this PC

def post(payload):
    payload["token"] = TOKEN
    return requests.post(BRIDGE_URL, json=payload, timeout=15).json()

while True:
    info = mt5.account_info()
    post({"action": "heartbeat",
          "account_login": str(info.login) if info else None,
          "balance": info.balance if info else None,
          "equity": info.equity if info else None})

    for order in post({"action": "pull_orders"}).get("orders", []):
        tick = mt5.symbol_info_tick(order["symbol"])
        req = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": order["symbol"],
            "volume": float(order["volume"]),
            "type": mt5.ORDER_TYPE_BUY if order["side"] == "buy" else mt5.ORDER_TYPE_SELL,
            "price": tick.ask if order["side"] == "buy" else tick.bid,
            "deviation": 20,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }
        if order.get("stop_loss"):   req["sl"] = float(order["stop_loss"])
        if order.get("take_profit"): req["tp"] = float(order["take_profit"])
        res = mt5.order_send(req)
        post({"action": "report_fill",
              "position_id": order["id"],
              "status": "filled" if res and res.retcode == mt5.TRADE_RETCODE_DONE else "failed",
              "fill_price": getattr(res, "price", None),
              "message": getattr(res, "comment", "")})

    time.sleep(5)
`;

export function BridgeSetup() {
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.functions.invoke('bridge-admin', { body: { action: 'status' } });
    setBridges((data?.bridges ?? []) as Bridge[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (body: Record<string, unknown>, successMsg: string) => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('bridge-admin', { body });
    setBusy(false);
    if (error || data?.error) {
      toast({ title: 'Something went wrong', description: data?.error ?? error?.message, variant: 'destructive' });
      return;
    }
    if (data.token) setToken(data.token);
    toast({ title: successMsg });
    load();
  };

  const copy = (text: string, what: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${what} copied` });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Plug className="h-4 w-4 text-primary" /> Connect your Windows PC (optional)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Trades run on the demo engine by default. If you run the helper script on your own PC, your trades are also
          placed in the MetaTrader 5 terminal already open there. Your broker login and password stay on your PC.
        </p>

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
          <>
            {bridges.map((b) => (
              <div key={b.id} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{b.label}</span>
                  <Badge variant={b.status === 'online' ? 'default' : 'secondary'}>{b.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Key {b.token_prefix}… · {b.last_seen_at ? `last seen ${new Date(b.last_seen_at).toLocaleString()}` : 'never connected'}
                </p>
                {b.account_login && (
                  <p className="text-xs text-muted-foreground">Account {b.account_login} · balance {b.balance ?? '—'} · equity {b.equity ?? '—'}</p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => run({ action: 'rotate', bridge_id: b.id }, 'New key created')} disabled={busy}>
                    New key
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => run({ action: 'delete', bridge_id: b.id }, 'Removed')} disabled={busy}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button size="sm" onClick={() => run({ action: 'create' }, 'Bridge created')} disabled={busy}>
                Add a PC
              </Button>
              <Button size="sm" variant="outline" onClick={load} disabled={busy}>
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </div>
          </>
        )}

        {token && (
          <div className="rounded-lg border border-primary/40 p-3 space-y-2">
            <p className="text-sm font-medium">Your key (shown once)</p>
            <code className="block text-xs break-all bg-muted p-2 rounded">{token}</code>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => copy(token, 'Key')}>
                <Copy className="h-4 w-4 mr-1" /> Copy key
              </Button>
              <Button size="sm" variant="outline" onClick={() => copy(PYTHON_TEMPLATE(token), 'Script')}>
                <Copy className="h-4 w-4 mr-1" /> Copy PC script
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
