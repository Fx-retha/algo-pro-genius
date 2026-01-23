import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl?: string;
  youtubeId?: string;
}

export function VideoPlayerModal({ isOpen, onClose, title, videoUrl, youtubeId }: VideoPlayerModalProps) {
  const renderVideoContent = () => {
    if (youtubeId) {
      return (
        <iframe
          className="w-full aspect-video rounded-lg"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    if (videoUrl) {
      return (
        <video
          className="w-full aspect-video rounded-lg bg-black"
          controls
          autoPlay
          src={videoUrl}
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Video coming soon</p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display">{title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="p-4 pt-2">
          {renderVideoContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
