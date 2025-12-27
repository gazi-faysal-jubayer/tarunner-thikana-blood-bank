'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserCheck, UserX, Download, MapPin } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Donor {
  id: string;
  user_id: string;
  blood_group: string;
  gender: string;
  date_of_birth: string;
  is_available: boolean;
  last_donation_date: string | null;
  total_donations: number;
  address: string;
  district: string;
  profiles: {
    full_name: string;
    phone: string;
    email: string;
  };
}

export default function DonorsManagement() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const supabase = createClient();

  useEffect(() => {
    loadDonors();
  }, []);

  useEffect(() => {
    filterDonors();
  }, [donors, searchTerm, bloodGroupFilter, availabilityFilter]);

  const loadDonors = async () => {
    try {
      const { data, error } = await supabase
        .from('donors')
        .select(`
          *,
          profiles!inner(full_name, phone, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonors(data || []);
    } catch (error) {
      console.error('Error loading donors:', error);
      toast.error('Failed to load donors');
    } finally {
      setLoading(false);
    }
  };

  const filterDonors = () => {
    let filtered = [...donors];

    if (searchTerm) {
      filtered = filtered.filter(
        (donor) =>
          donor.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donor.profiles.phone.includes(searchTerm) ||
          donor.profiles.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (bloodGroupFilter !== 'all') {
      filtered = filtered.filter((donor) => donor.blood_group === bloodGroupFilter);
    }

    if (availabilityFilter !== 'all') {
      const isAvailable = availabilityFilter === 'available';
      filtered = filtered.filter((donor) => donor.is_available === isAvailable);
    }

    setFilteredDonors(filtered);
  };

  const toggleAvailability = async (donorId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('donors')
        .update({ is_available: !currentStatus })
        .eq('id', donorId);

      if (error) throw error;

      toast.success(`Donor availability ${!currentStatus ? 'enabled' : 'disabled'}`);
      loadDonors();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Blood Group', 'Gender', 'District', 'Available', 'Donations'];
    const rows = filteredDonors.map(donor => [
      donor.profiles.full_name,
      donor.profiles.phone,
      donor.profiles.email || '',
      donor.blood_group,
      donor.gender,
      donor.district,
      donor.is_available ? 'Yes' : 'No',
      donor.total_donations
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donors-${new Date().toISOString().split('T')[0]}.csv`;
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
          <h2 className="text-2xl font-bold tracking-tight">Donors</h2>
          <p className="text-muted-foreground">Manage registered blood donors</p>
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
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donors.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {donors.filter((d) => d.is_available).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unavailable</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {donors.filter((d) => !d.is_available).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {donors.reduce((sum, d) => sum + d.total_donations, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Name, phone, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="blood-group">Blood Group</Label>
              <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
                <SelectTrigger id="blood-group">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blood Groups</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="availability">Availability</Label>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger id="availability">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Donors</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Donors ({filteredDonors.length})</CardTitle>
          <CardDescription>All registered blood donors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Blood Group</th>
                  <th className="pb-3 font-medium">Gender</th>
                  <th className="pb-3 font-medium">District</th>
                  <th className="pb-3 font-medium">Donations</th>
                  <th className="pb-3 font-medium">Last Donation</th>
                  <th className="pb-3 font-medium">Available</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No donors found
                    </td>
                  </tr>
                ) : (
                  filteredDonors.map((donor) => (
                    <tr key={donor.id} className="border-b last:border-0">
                      <td className="py-3 text-sm font-medium">
                        {donor.profiles.full_name}
                      </td>
                      <td className="py-3 text-sm">{donor.profiles.phone}</td>
                      <td className="py-3">
                        <Badge variant="outline">{donor.blood_group}</Badge>
                      </td>
                      <td className="py-3 text-sm capitalize">{donor.gender}</td>
                      <td className="py-3 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {donor.district}
                        </div>
                      </td>
                      <td className="py-3 text-sm">{donor.total_donations}</td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {donor.last_donation_date
                          ? new Date(donor.last_donation_date).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="py-3">
                        <Switch
                          checked={donor.is_available}
                          onCheckedChange={() =>
                            toggleAvailability(donor.id, donor.is_available)
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

