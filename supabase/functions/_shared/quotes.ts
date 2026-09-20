// Live quotes for forex, metals and crypto from Coinbase's public spot endpoint.
// No API key, no broker credentials.
const cache = new Map<string, { price: number; at: number }>();
const TTL_MS = 15_000;

export function normalizeSymbol(symbol: string) {
  return String(symbol ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function toPair(symbol: string): string | null {
  const s = normalizeSymbol(symbol);
  if (s.includes("-")) return s;
  if (s.length === 6) return `${s.slice(0, 3)}-${s.slice(3)}`;
  if (s.length === 7) return `${s.slice(0, 4)}-${s.slice(4)}`; // e.g. USDTUSD
  return null;
}

export async function getQuote(symbol: string): Promise<number | null> {
  const s = normalizeSymbol(symbol);
  const hit = cache.get(s);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.price;

  const pair = toPair(s);
  if (!pair) return null;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`https://api.coinbase.com/v2/prices/${pair}/spot`, { signal: ctrl.signal });
    if (!res.ok) return null;
    const body = await res.json();
    const price = Number(body?.data?.amount);
    if (!Number.isFinite(price) || price <= 0) return null;
    cache.set(s, { price, at: Date.now() });
    return price;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}
