import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listLicensesTool from "./tools/list-licenses";
import listTradesTool from "./tools/list-trades";
import listSignalsTool from "./tools/list-signals";
import accountSummaryTool from "./tools/account-summary";

// Build the OAuth issuer from the project ref (Vite inlines this at build time,
// so the entry stays import-safe). Never derive from SUPABASE_URL — Cloud may
// proxy through .lovable.cloud and mcp-js verifies against the direct
// supabase.co issuer published in the discovery document.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "code-base-mcp",
  title: "Code Base",
  version: "0.1.0",
  instructions:
    "Tools for the Code Base copy-trading app. Read the signed-in user's licence keys, connected MetaTrader accounts, bot configurations, recent AI trading signals, and recent trades.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [accountSummaryTool, listLicensesTool, listTradesTool, listSignalsTool],
});
