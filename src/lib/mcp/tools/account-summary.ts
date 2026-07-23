import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_account_summary",
  title: "Get my Code Base account summary",
  description: "Return the signed-in user's profile, connected MetaTrader accounts, bot configs, and counts of licences/trades/signals.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const uid = ctx.getUserId();

    const [profile, mtAccounts, botConfigs, licenses, trades, signals] = await Promise.all([
      sb.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
      sb.from("mt_accounts").select("id, broker, server, account_number, platform, is_active").eq("user_id", uid),
      sb.from("bot_configs").select("*").eq("user_id", uid),
      sb.from("license_keys").select("id", { count: "exact", head: true }).eq("user_id", uid),
      sb.from("trades").select("id", { count: "exact", head: true }).eq("user_id", uid),
      sb.from("signals").select("id", { count: "exact", head: true }).eq("user_id", uid),
    ]);

    const summary = {
      user: { id: uid, email: ctx.getUserEmail() },
      profile: profile.data ?? null,
      mt_accounts: mtAccounts.data ?? [],
      bot_configs: botConfigs.data ?? [],
      counts: {
        licenses: licenses.count ?? 0,
        trades: trades.count ?? 0,
        signals: signals.count ?? 0,
      },
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
