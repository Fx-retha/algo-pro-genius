import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Check, X, Loader2, UserCheck, UserX, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MentorApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function MentorApplications() {
  const [applications, setApplications] = useState<MentorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | null;
    application: MentorApplication | null;
  }>({ open: false, action: null, application: null });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications((data as MentorApplication[]) || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching applications',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (application: MentorApplication) => {
    setActionLoading(application.id);
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('mentor_applications')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', application.id);

      if (updateError) throw updateError;

      // Grant admin role to the user
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', application.user_id);

      if (roleError) throw roleError;

      toast({
        title: 'Application approved!',
        description: `${application.full_name} is now a mentor.`,
      });

      fetchApplications();
    } catch (error: any) {
      toast({
        title: 'Error approving application',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: null, application: null });
    }
  };

  const handleReject = async (application: MentorApplication) => {
    setActionLoading(application.id);
    try {
      const { error } = await supabase
        .from('mentor_applications')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', application.id);

      if (error) throw error;

      toast({
        title: 'Application rejected',
        description: `${application.full_name}'s application has been rejected.`,
      });

      fetchApplications();
    } catch (error: any) {
      toast({
        title: 'Error rejecting application',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: null, application: null });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <UserCheck className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <UserX className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Mentor Applications</h1>
        <p className="text-muted-foreground">Review and manage mentor applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-amber-500">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-emerald-500">
              {applications.filter(a => a.status === 'approved').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl text-destructive">
              {applications.filter(a => a.status === 'rejected').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            {applications.length === 0 
              ? 'No mentor applications yet' 
              : `${applications.length} total application${applications.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No mentor applications have been submitted yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.full_name}</TableCell>
                    <TableCell>{application.email}</TableCell>
                    <TableCell>{application.phone_number}</TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell>
                      {new Date(application.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {application.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                            onClick={() => setConfirmDialog({
                              open: true,
                              action: 'approve',
                              application,
                            })}
                            disabled={actionLoading === application.id}
                          >
                            {actionLoading === application.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setConfirmDialog({
                              open: true,
                              action: 'reject',
                              application,
                            })}
                            disabled={actionLoading === application.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, action: null, application: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'approve' ? 'Approve Application' : 'Reject Application'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'approve' ? (
                <>
                  Are you sure you want to approve <strong>{confirmDialog.application?.full_name}</strong>'s 
                  mentor application? They will be granted admin access.
                </>
              ) : (
                <>
                  Are you sure you want to reject <strong>{confirmDialog.application?.full_name}</strong>'s 
                  mentor application?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.application) {
                  if (confirmDialog.action === 'approve') {
                    handleApprove(confirmDialog.application);
                  } else {
                    handleReject(confirmDialog.application);
                  }
                }
              }}
              className={confirmDialog.action === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
