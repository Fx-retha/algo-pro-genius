import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Code, Plus, Download, Trash2, Edit, ExternalLink } from 'lucide-react';

interface EA {
  id: string;
  name: string;
  version: string;
  platform: 'MT4' | 'MT5' | 'Both';
  downloads: number;
  status: 'active' | 'inactive';
}

const demoEAs: EA[] = [
  { id: '1', name: 'Code Base Pro EA', version: '2.5.1', platform: 'Both', downloads: 1247, status: 'active' },
  { id: '2', name: 'Scalper Master', version: '1.3.0', platform: 'MT5', downloads: 892, status: 'active' },
  { id: '3', name: 'Grid Trader', version: '3.0.2', platform: 'MT4', downloads: 456, status: 'inactive' },
];

export function ManageEAs() {
  const [eas, setEAs] = useState<EA[]>(demoEAs);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Manage EAs</h1>
          <p className="text-muted-foreground">Manage your Expert Advisors and trading bots</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add EA
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expert Advisor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>EA Name</Label>
                <Input placeholder="Enter EA name" />
              </div>
              <div className="space-y-2">
                <Label>Version</Label>
                <Input placeholder="1.0.0" />
              </div>
              <div className="space-y-2">
                <Label>EA File (.ex4 / .ex5)</Label>
                <Input type="file" accept=".ex4,.ex5" />
              </div>
              <Button className="w-full">Upload EA</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {eas.map((ea) => (
          <Card key={ea.id} className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Code className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">{ea.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">v{ea.version}</Badge>
                      <Badge variant="secondary">{ea.platform}</Badge>
                      <Badge 
                        variant="outline" 
                        className={ea.status === 'active' ? 'text-green-500 border-green-500/30' : 'text-muted-foreground'}
                      >
                        {ea.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <p className="text-2xl font-bold">{ea.downloads}</p>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {eas.length === 0 && (
        <Card className="bg-card/50 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Code className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No Expert Advisors uploaded yet</p>
            <Button className="mt-4" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Your First EA
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
