import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Loader2, Shield, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  subscription_plan: string | null;
}

interface UserRole {
  user_id: string;
  role: string;
}

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const fetchUsers = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && profiles) {
      setUsers(profiles as UserProfile[]);
    }

    // Fetch roles separately
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (userRoles) {
      const roleMap: Record<string, string> = {};
      userRoles.forEach((r: UserRole) => {
        roleMap[r.user_id] = r.role;
      });
      setRoles(roleMap);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdminRole = async (userId: string, currentRole: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: 'Error',
        description: "You cannot change your own role.",
        variant: 'destructive',
      });
      return;
    }

    setUpdatingRole(userId);
    
    if (currentRole === 'admin') {
      // Demote to user
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'user' })
        .eq('user_id', userId);

      if (!error) {
        toast({ title: 'User demoted to regular user' });
        fetchUsers();
      }
    } else {
      // Promote to admin
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', userId);

      if (!error) {
        toast({ title: 'User promoted to admin' });
        fetchUsers();
      }
    }
    
    setUpdatingRole(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Users className="h-5 w-5 text-primary" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const userRole = roles[user.user_id] || 'user';
                const isCurrentUser = user.user_id === currentUser?.id;
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.email || 'N/A'}</TableCell>
                    <TableCell>{user.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={userRole === 'admin' 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted text-muted-foreground'
                        }
                      >
                        {userRole}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isCurrentUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updatingRole === user.user_id}
                          onClick={() => toggleAdminRole(user.user_id, userRole)}
                        >
                          {updatingRole === user.user_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : userRole === 'admin' ? (
                            <>
                              <ShieldOff className="mr-2 h-4 w-4" />
                              Remove Admin
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              Make Admin
                            </>
                          )}
                        </Button>
                      )}
                      {isCurrentUser && (
                        <span className="text-xs text-muted-foreground">You</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
