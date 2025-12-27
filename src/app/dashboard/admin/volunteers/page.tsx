'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, UserCheck, Download, Activity } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Volunteer {
  id: string;
  user_id: string;
  district: string;
  division: string;
  is_active: boolean;
  requests_handled: number;
  donations_facilitated: number;
  success_rate: number;
  profiles: {
    full_name: string;
    phone: string;
    email: string;
  };
}

export default function VolunteersManagement() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadVolunteers();
  }, []);

  useEffect(() => {
    filterVolunteers();
  }, [volunteers, searchTerm]);

  const loadVolunteers = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select(`
          *,
          profiles!inner(full_name, phone, email)
        `)
        .order('requests_handled', { ascending: false });

      if (error) throw error;
      setVolunteers(data || []);
    } catch (error) {
      console.error('Error loading volunteers:', error);
      toast.error('Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  };

  const filterVolunteers = () => {
    let filtered = [...volunteers];

    if (searchTerm) {
      filtered = filtered.filter(
        (volunteer) =>
          volunteer.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          volunteer.profiles.phone.includes(searchTerm) ||
          volunteer.district.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVolunteers(filtered);
  };

  const toggleActive = async (volunteerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('volunteers')
        .update({ is_active: !currentStatus })
        .eq('id', volunteerId);

      if (error) throw error;

      toast.success(`Volunteer ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadVolunteers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'District', 'Requests Handled', 'Donations Facilitated', 'Success Rate', 'Active'];
    const rows = filteredVolunteers.map(vol => [
      vol.profiles.full_name,
      vol.profiles.phone,
      vol.district,
      vol.requests_handled,
      vol.donations_facilitated,
      `${vol.success_rate}%`,
      vol.is_active ? 'Yes' : 'No'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volunteers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <h2 className="text-2xl font-bold tracking-tight">Volunteers</h2>
          <p className="text-muted-foreground">Manage volunteer coordinators</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {volunteers.filter((v) => v.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests Handled</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {volunteers.reduce((sum, v) => sum + v.requests_handled, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {volunteers.length > 0
                ? Math.round(
                    volunteers.reduce((sum, v) => sum + v.success_rate, 0) / volunteers.length
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Name, phone, district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Volunteers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Volunteers ({filteredVolunteers.length})</CardTitle>
          <CardDescription>All volunteer coordinators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">District</th>
                  <th className="pb-3 font-medium">Requests</th>
                  <th className="pb-3 font-medium">Donations</th>
                  <th className="pb-3 font-medium">Success Rate</th>
                  <th className="pb-3 font-medium">Active</th>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No volunteers found
                    </td>
                  </tr>
                ) : (
                  filteredVolunteers.map((volunteer) => (
                    <tr key={volunteer.id} className="border-b last:border-0">
                      <td className="py-3 text-sm font-medium">
                        {volunteer.profiles.full_name}
                      </td>
                      <td className="py-3 text-sm">{volunteer.profiles.phone}</td>
                      <td className="py-3 text-sm">{volunteer.district}</td>
                      <td className="py-3 text-sm">{volunteer.requests_handled}</td>
                      <td className="py-3 text-sm">{volunteer.donations_facilitated}</td>
                      <td className="py-3">
                        <Badge variant={volunteer.success_rate >= 80 ? 'default' : 'secondary'}>
                          {volunteer.success_rate}%
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Switch
                          checked={volunteer.is_active}
                          onCheckedChange={() =>
                            toggleActive(volunteer.id, volunteer.is_active)
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

