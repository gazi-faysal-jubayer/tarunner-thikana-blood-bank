'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface Admin {
  id: string;
  user_id: string;
  employee_id: string;
  department: string;
  permissions: string[];
  created_at: string;
  profiles: {
    full_name: string;
    phone: string;
    email: string;
  };
}

export default function AdminsManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select(`
          *,
          profiles!inner(full_name, phone, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error loading admins:', error);
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Users</h2>
          <p className="text-muted-foreground">Manage admin accounts and permissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(admins.map((a) => a.department)).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Admins</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {admins.filter((a) => a.permissions.includes('system.admin')).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Accounts ({admins.length})</CardTitle>
          <CardDescription>All administrators with system access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Employee ID</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Contact</th>
                  <th className="pb-3 font-medium">Permissions</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No admins found
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="font-medium">{admin.profiles.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm font-mono">{admin.employee_id}</td>
                      <td className="py-3 text-sm">{admin.department}</td>
                      <td className="py-3 text-sm">
                        <div>{admin.profiles.phone}</div>
                        <div className="text-xs text-muted-foreground">
                          {admin.profiles.email}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.slice(0, 3).map((perm) => (
                            <Badge key={perm} variant="secondary" className="text-xs">
                              {perm.split('.')[1] || perm}
                            </Badge>
                          ))}
                          {admin.permissions.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{admin.permissions.length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Types</CardTitle>
          <CardDescription>Available system permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <Badge variant="outline">users.*</Badge>
              <span className="text-sm text-muted-foreground">
                View, create, edit, delete users
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">requests.*</Badge>
              <span className="text-sm text-muted-foreground">
                View, approve, reject, assign requests
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">donors.*</Badge>
              <span className="text-sm text-muted-foreground">
                View and edit donor information
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">volunteers.*</Badge>
              <span className="text-sm text-muted-foreground">
                View, edit, and assign volunteers
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">analytics.view</Badge>
              <span className="text-sm text-muted-foreground">
                Access analytics and reports
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">system.admin</Badge>
              <span className="text-sm text-muted-foreground">
                Full system administration
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

