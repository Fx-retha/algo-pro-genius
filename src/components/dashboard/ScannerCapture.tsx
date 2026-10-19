import { Camera, Upload, Activity, Crosshair, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import robot from '@/assets/hero-robot-2.jpeg';

interface ScannerCaptureProps {
  image: string | null;
  busy: boolean;
  confidence: number;
  onShoot: () => void;
  onImport: () => void;
  onClear: () => void;
}

export function ScannerCapture({ image, busy, confidence, onShoot, onImport, onClear }: ScannerCaptureProps) {
  return (
    <>
      <div className="scanner-capture">
        <div className="relative flex min-h-64 flex-col items-center justify-center gap-5 overflow-hidden rounded-xl border border-border/50 bg-background/60 p-6">
          {image ? (
            <>
              <img src={image} alt="Selected trading chart" className="h-64 w-full object-contain" />
              <Button variant="outline" size="icon" aria-label="Remove chart" title="Remove chart" onClick={onClear} disabled={busy} className="absolute right-3 top-3 bg-background">
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="scanner-orbit">
              <div className="scanner-avatar"><img src={robot} alt="Code Base scanner robot" className="h-full w-full rounded-full object-cover" /></div>
            </div>
          )}
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-5 py-2 font-display text-xs font-bold text-primary">
            <Crosshair className="h-4 w-4" /> {image ? 'CHART LOADED' : 'CHART LOCK'}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onShoot} disabled={busy} className="scanner-source border-primary/40 bg-primary/10 hover:bg-primary/20">
            <Camera className="h-6 w-6 shrink-0 text-primary" />
            <span className="text-left"><span className="block font-display text-sm font-bold">SHOOT</span><span className="block text-xs font-normal text-muted-foreground">Live camera</span></span>
          </Button>
          <Button variant="outline" onClick={onImport} disabled={busy} className="scanner-source border-2 border-dashed bg-background/50">
            <Upload className="h-6 w-6 shrink-0" />
            <span className="text-left"><span className="block font-display text-sm font-bold">IMPORT</span><span className="block text-xs font-normal text-muted-foreground">From gallery</span></span>
          </Button>
        </div>
      </div>
      <div className="scanner-engine flex items-center gap-4 p-4" role="status">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-4 border-accent/30 bg-background font-display font-bold">
          <span className="text-xl">{confidence}</span><span className="text-xs">%</span>
        </div>
        <div className="min-w-0 flex-1"><p className="font-display text-xs font-bold text-accent">TRADING ENGINE</p><p className="mt-1 text-sm font-semibold">{busy ? 'Analyzing chart' : confidence ? 'Analysis ready' : 'Awaiting chart'}</p></div>
        <Activity className={`h-8 w-8 shrink-0 text-accent ${busy ? 'motion-safe:animate-pulse' : ''}`} />
      </div>
    </>
  );
}