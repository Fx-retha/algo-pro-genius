import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, CalendarDays } from 'lucide-react';

interface EventRow {
  id: string;
  event_time: string;
  country: string | null;
  currency: string | null;
  title: string;
  impact: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
}

const IMPACTS = ['all', 'high', 'medium', 'low'] as const;

function impactColor(impact: string) {
  if (impact === 'high') return 'destructive';
  if (impact === 'medium') return 'default';
  return 'secondary';
}

export function EconomicCalendar({ compact = false }: { compact?: boolean }) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [impact, setImpact] = useState<(typeof IMPACTS)[number]>(compact ? 'high' : 'all');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.functions.invoke('economic-calendar', { body: { action: 'list' } });
    setEvents((data?.events ?? []) as EventRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const list = impact === 'all' ? events : events.filter((e) => e.impact === impact);
    return compact ? list.slice(0, 6) : list;
  }, [events, impact, compact]);

  const grouped = useMemo(() => {
    const map = new Map<string, EventRow[]>();
    for (const e of filtered) {
      const day = new Date(e.event_time).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
      map.set(day, [...(map.get(day) ?? []), e]);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" /> Economic calendar
        </CardTitle>
        <Button size="icon" variant="ghost" onClick={load} aria-label="Refresh calendar">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!compact && (
          <div className="flex gap-2 flex-wrap">
            {IMPACTS.map((i) => (
              <Button key={i} size="sm" variant={impact === i ? 'default' : 'outline'} onClick={() => setImpact(i)}>
                {i === 'all' ? 'All' : i.charAt(0).toUpperCase() + i.slice(1)}
              </Button>
            ))}
          </div>
        )}

        {loading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
        {!loading && filtered.length === 0 && <p className="text-sm text-muted-foreground">No events for this filter.</p>}

        {grouped.map(([day, rows]) => (
          <div key={day} className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{day}</p>
            {rows.map((e) => (
              <div key={e.id} className="rounded-lg border border-border p-3 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {e.currency ?? e.country}
                    </p>
                  </div>
                  <Badge variant={impactColor(e.impact) as 'default' | 'secondary' | 'destructive'}>{e.impact}</Badge>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Actual: {e.actual ?? '—'}</span>
                  <span>Forecast: {e.forecast ?? '—'}</span>
                  <span>Previous: {e.previous ?? '—'}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
