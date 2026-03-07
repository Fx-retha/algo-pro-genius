import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Plus, Download, Trash2, Edit, Bot, Zap, TrendingUp, Shield, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';

type EAMode = 'aggressive' | 'conservative' | 'scalping' | 'swing';

interface EA {
  id: string;
  name: string;
  version: string;
  platform: 'MT4' | 'MT5' | 'Both';
  downloads: number;
  status: 'active' | 'inactive';
  mode: EAMode;
  assignedUsers: string[];
}

const modeConfig: Record<EAMode, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  aggressive: {
    label: 'Aggressive',
    icon: <Zap className="h-3.5 w-3.5" />,
    color: 'text-red-500 border-red-500/30 bg-red-500/10',
    description: 'High risk, high reward trading',
  },
  conservative: {
    label: 'Conservative',
    icon: <Shield className="h-3.5 w-3.5" />,
    color: 'text-blue-500 border-blue-500/30 bg-blue-500/10',
    description: 'Low risk, steady gains',
  },
  scalping: {
    label: 'Scalping',
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    color: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
    description: 'Fast trades, small profits',
  },
  swing: {
    label: 'Swing',
    icon: <Bot className="h-3.5 w-3.5" />,
    color: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10',
    description: 'Medium-term position trading',
  },
};

const defaultEAs: EA[] = [
  { id: '1', name: 'Code Base Scalper', version: '1.0.0', platform: 'Both', downloads: 0, status: 'active', mode: 'scalping', assignedUsers: [] },
];

export function ManageEAs() {
  const [eas, setEAs] = useState<EA[]>(defaultEAs);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedEA, setSelectedEA] = useState<EA | null>(null);
  const [assignEmail, setAssignEmail] = useState('');
  const [newEA, setNewEA] = useState({ name: '', version: '1.0.0', platform: 'Both' as EA['platform'], mode: 'conservative' as EAMode });

  const handleAddEA = () => {
    if (!newEA.name.trim()) return;
    const ea: EA = {
      id: Date.now().toString(),
      name: newEA.name,
      version: newEA.version,
      platform: newEA.platform,
      downloads: 0,
      status: 'active',
      mode: newEA.mode,
      assignedUsers: [],
    };
    setEAs([...eas, ea]);
    setNewEA({ name: '', version: '1.0.0', platform: 'Both', mode: 'conservative' });
    setDialogOpen(false);
    toast.success(`${ea.name} added successfully`);
  };

  const handleDelete = (id: string) => {
    setEAs(eas.filter(ea => ea.id !== id));
    toast.success('EA removed');
  };

  const toggleStatus = (id: string) => {
    setEAs(eas.map(ea => ea.id === id ? { ...ea, status: ea.status === 'active' ? 'inactive' : 'active' } : ea));
  };

  const handleAssign = () => {
    if (!assignEmail.trim() || !selectedEA) return;
    setEAs(eas.map(ea => 
      ea.id === selectedEA.id 
        ? { ...ea, assignedUsers: [...ea.assignedUsers, assignEmail.trim()] } 
        : ea
    ));
    toast.success(`EA assigned to ${assignEmail}`);
    setAssignEmail('');
    setAssignDialogOpen(false);
  };

  const removeAssignment = (eaId: string, email: string) => {
    setEAs(eas.map(ea =>
      ea.id === eaId
        ? { ...ea, assignedUsers: ea.assignedUsers.filter(u => u !== email) }
        : ea
    ));
    toast.success(`Assignment removed for ${email}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Manage EAs</h1>
          <p className="text-muted-foreground">Manage Expert Advisors and assign them to mentors/users</p>
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
                <Input placeholder="Enter EA name" value={newEA.name} onChange={e => setNewEA({ ...newEA, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Version</Label>
                <Input placeholder="1.0.0" value={newEA.version} onChange={e => setNewEA({ ...newEA, version: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={newEA.platform} onValueChange={(v: EA['platform']) => setNewEA({ ...newEA, platform: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MT4">MT4</SelectItem>
                    <SelectItem value="MT5">MT5</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trading Mode</Label>
                <Select value={newEA.mode} onValueChange={(v: EAMode) => setNewEA({ ...newEA, mode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(modeConfig).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {cfg.icon}
                          <span>{cfg.label}</span>
                          <span className="text-xs text-muted-foreground ml-1">— {cfg.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>EA File (.ex4 / .ex5)</Label>
                <Input type="file" accept=".ex4,.ex5" />
              </div>
              <Button className="w-full" onClick={handleAddEA}>Upload EA</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assign EA Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign EA to User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Assign <span className="font-semibold text-foreground">{selectedEA?.name}</span> to a user by email
            </p>
            <div className="space-y-2">
              <Label>User Email</Label>
              <Input
                placeholder="user@example.com"
                value={assignEmail}
                onChange={e => setAssignEmail(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleAssign}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign EA
            </Button>
            {selectedEA && selectedEA.assignedUsers.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Label className="text-sm">Currently Assigned</Label>
                <div className="space-y-1.5">
                  {selectedEA.assignedUsers.map(email => (
                    <div key={email} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                      <span className="text-sm">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-destructive hover:text-destructive"
                        onClick={() => removeAssignment(selectedEA.id, email)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {eas.map((ea) => {
          const mode = modeConfig[ea.mode];
          return (
            <Card key={ea.id} className="bg-card/50 border-border overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Code className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg">{ea.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline">v{ea.version}</Badge>
                        <Badge variant="secondary">{ea.platform}</Badge>
                        <Badge
                          variant="outline"
                          className={ea.status === 'active' ? 'text-green-500 border-green-500/30' : 'text-muted-foreground'}
                        >
                          {ea.status}
                        </Badge>
                        <Badge variant="outline" className={mode.color}>
                          <span className="flex items-center gap-1">
                            {mode.icon}
                            {mode.label}
                          </span>
                        </Badge>
                        {ea.assignedUsers.length > 0 && (
                          <Badge variant="outline" className="text-primary border-primary/30">
                            <Users className="h-3 w-3 mr-1" />
                            {ea.assignedUsers.length} assigned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right mr-2">
                      <p className="text-2xl font-bold">{ea.downloads}</p>
                      <p className="text-xs text-muted-foreground">Downloads</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Assign to user"
                        onClick={() => { setSelectedEA(ea); setAssignDialogOpen(true); }}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Toggle status" onClick={() => toggleStatus(ea.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete" onClick={() => handleDelete(ea.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
