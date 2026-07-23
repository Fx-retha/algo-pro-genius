import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";

// Local typed shim for the beta supabase.auth.oauth namespace.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/mentor-auth?next=" + encodeURIComponent(next);
        return;
      }
      try {
        const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) return setError(error.message ?? String(error));
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load authorization details");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    try {
      const { data, error } = approve
        ? await oauth.approveAuthorization(authorizationId)
        : await oauth.denyAuthorization(authorizationId);
      if (error) {
        setBusy(false);
        return setError(error.message ?? String(error));
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        return setError("No redirect returned by the authorization server.");
      }
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? "Authorization failed");
    }
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full glass-card rounded-2xl p-8 border border-destructive/40 text-center space-y-3">
          <h1 className="font-display text-xl font-bold">Authorization error</h1>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </main>
    );
  }

  const clientName = details.client?.name ?? details.client?.client_name ?? "an app";
  const redirectUri = details.client?.redirect_uris?.[0] ?? details.redirect_uri;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 border border-border/50 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Connect {clientName} to Code Base</h1>
            <p className="text-xs text-muted-foreground">Authorize access to your account</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">{clientName}</span> will be able to call this app's
            enabled tools while you are signed in.
          </p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>Read your licence keys, trades, signals, and connected MetaTrader accounts</li>
            <li>Read your Code Base profile and bot configuration</li>
          </ul>
          {redirectUri && (
            <p className="text-xs text-muted-foreground break-all">
              Redirect: <span className="font-mono">{redirectUri}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            This does not bypass Code Base's permissions or backend policies.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            disabled={busy}
            onClick={() => decide(false)}
          >
            Cancel connection
          </Button>
          <Button variant="hero" className="flex-1" disabled={busy} onClick={() => decide(true)}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve"}
          </Button>
        </div>
      </div>
    </main>
  );
}
