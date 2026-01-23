import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Globe, Play } from 'lucide-react';
import { VideoPlayerModal } from '@/components/VideoPlayerModal';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  youtubeId?: string;
  videoUrl?: string;
}

const setupMethods = [
  {
    id: 'desktop',
    title: 'Desktop Installation',
    description: 'Install the EA directly on your Windows PC with MetaTrader 4 or 5',
    icon: Monitor,
    steps: [
      'Download the EA file from the Downloads section',
      'Open MetaTrader and go to File → Open Data Folder',
      'Navigate to MQL4/Experts or MQL5/Experts',
      'Copy the EA file into the Experts folder',
      'Restart MetaTrader and attach EA to a chart',
    ],
    badge: 'Recommended',
    videoTutorial: { id: 'desktop-install', title: 'Desktop Installation Tutorial' } as VideoTutorial,
  },
  {
    id: 'vps',
    title: 'VPS Setup',
    description: 'Run your EA 24/7 on a Virtual Private Server for uninterrupted trading',
    icon: Globe,
    steps: [
      'Choose a reliable Forex VPS provider',
      'Connect to your VPS via Remote Desktop',
      'Install MetaTrader on the VPS',
      'Follow the Desktop Installation steps',
      'Keep VPS running for 24/7 trading',
    ],
    badge: 'Best Performance',
    videoTutorial: { id: 'vps-setup', title: 'VPS Configuration Tutorial' } as VideoTutorial,
  },
  {
    id: 'mobile',
    title: 'Mobile Monitoring',
    description: 'Monitor your trades on the go with the MetaTrader mobile app',
    icon: Smartphone,
    steps: [
      'Download MT4/MT5 app from App Store or Play Store',
      'Login with your broker account credentials',
      'View open trades and account status',
      'Receive push notifications for trade updates',
      'Note: EA execution requires desktop/VPS',
    ],
    badge: 'Monitoring Only',
    videoTutorial: { id: 'mobile-monitor', title: 'Mobile Monitoring Tutorial' } as VideoTutorial,
  },
];

const videoTutorials: VideoTutorial[] = [
  { id: 'getting-started', title: 'Getting Started', description: 'Complete beginner guide' },
  { id: 'vps-config', title: 'VPS Configuration', description: 'Set up your VPS for 24/7 trading' },
  { id: 'optimizing', title: 'Optimizing Settings', description: 'Fine-tune your EA for best results' },
];

export function SetupMethods() {
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Setup Methods</h1>
        <p className="text-muted-foreground">Choose how you want to run your Expert Advisors</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {setupMethods.map((method) => (
          <Card key={method.id} className="bg-card/50 border-border">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <method.icon className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="secondary">{method.badge}</Badge>
              </div>
              <CardTitle className="font-display">{method.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{method.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Setup Steps:</h4>
                <ol className="space-y-2">
                  {method.steps.map((step, index) => (
                    <li key={index} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={() => setSelectedVideo(method.videoTutorial)}
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Tutorial
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Tutorials Section */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Video Tutorials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videoTutorials.map((video) => (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="aspect-video bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/30 transition-colors">
                    <Play className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{video.title}</p>
                  {video.description && (
                    <p className="text-xs text-muted-foreground mt-1">{video.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        title={selectedVideo?.title || ''}
        youtubeId={selectedVideo?.youtubeId}
        videoUrl={selectedVideo?.videoUrl}
      />
    </div>
  );
}
