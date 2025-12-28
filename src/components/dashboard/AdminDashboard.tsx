'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Clock, CheckCircle2, AlertCircle, TrendingUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  pendingRequests: number;
  activeDonors: number;
  inTransit: number;
  completedToday: number;
  totalDonors: number;
  totalVolunteers: number;
  criticalRequests: number;
}

interface RecentRequest {
  id: string;
  tracking_id: string;
  patient_name: string;
  blood_group: string;
  urgency: string;
  status: string;
  hospital_name: string;
  created_at: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingRequests: 0,
    activeDonors: 0,
    inTransit: 0,
    completedToday: 0,
    totalDonors: 0,
    totalVolunteers: 0,
    criticalRequests: 0,
  });
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadDashboardData();

    // Set up real-time subscription for requests
    const channel = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blood_requests',
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get pending requests count
      const { count: pendingCount } = await supabase
        .from('blood_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['submitted', 'approved']);

      // Get critical requests count
      const { count: criticalCount } = await supabase
        .from('blood_requests')
        .select('*', { count: 'exact', head: true })
        .eq('urgency', 'critical')
        .neq('status', 'completed');

      // Get completed today count
      const today = new Date().toISOString().split('T')[0];
      const { count: completedCount } = await supabase
        .from('blood_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', today);

      // Get in-transit count
      const { count: inTransitCount } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('is_in_transit', true);

      // Get active donors count
      const { count: activeDonorsCount } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true })
        .eq('is_available', true);

      // Get total donors
      const { count: totalDonorsCount } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true });

      // Get total volunteers
      const { count: totalVolunteersCount } = await supabase
        .from('volunteers')
        .select('*', { count: 'exact', head: true });

      // Get pending requests for the table
      const { data: requests } = await supabase
        .from('blood_requests')
        .select('id, tracking_id, patient_name, blood_group, urgency, status, hospital_name, created_at')
        .eq('status', 'submitted')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        pendingRequests: pendingCount || 0,
        activeDonors: activeDonorsCount || 0,
        inTransit: inTransitCount || 0,
        completedToday: completedCount || 0,
        totalDonors: totalDonorsCount || 0,
        totalVolunteers: totalVolunteersCount || 0,
        criticalRequests: criticalCount || 0,
      });

      setRecentRequests(requests || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await (supabase
        .from('blood_requests') as any)
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;

      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800',
      urgent: 'bg-orange-100 text-orange-800',
      normal: 'bg-green-100 text-green-800',
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with quick actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">অ্যাডমিন ড্যাশবোর্ড</h2>
          <p className="text-muted-foreground">রক্তদান কার্যক্রম পরিচালনা করুন</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/map">
              <MapPin className="mr-2 h-4 w-4" />
              লাইভ ট্র্যাকিং
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/requests">
              সব অনুরোধ দেখুন
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অপেক্ষমাণ অনুরোধ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            {stats.criticalRequests > 0 && (
              <p className="text-xs text-red-600 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                {stats.criticalRequests} জরুরি
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">যাত্রাপথে</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground">দাতা পথে আছেন</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজ সম্পন্ন</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              সফল রক্তদান
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">উপলব্ধ দাতা</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDonors}</div>
            <p className="text-xs text-muted-foreground">
              মোট {stats.totalDonors} জনের মধ্যে
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>অপেক্ষমাণ অনুরোধসমূহ</CardTitle>
          <CardDescription>অনুমোদনের জন্য অপেক্ষমাণ অনুরোধ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm">
                  <th className="pb-3 font-medium">ট্র্যাকিং ID</th>
                  <th className="pb-3 font-medium">রোগী</th>
                  <th className="pb-3 font-medium">রক্তের গ্রুপ</th>
                  <th className="pb-3 font-medium">হাসপাতাল</th>
                  <th className="pb-3 font-medium">জরুরিতা</th>
                  <th className="pb-3 font-medium">অবস্থা</th>
                  <th className="pb-3 font-medium">তারিখ</th>
                  <th className="pb-3 font-medium">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      কোনো অপেক্ষমাণ অনুরোধ পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  recentRequests.map((request) => (
                    <tr key={request.id} className="border-b last:border-0">
                      <td className="py-3 text-sm font-mono">{request.tracking_id}</td>
                      <td className="py-3 text-sm">{request.patient_name}</td>
                      <td className="py-3">
                        <Badge variant="outline">{request.blood_group}</Badge>
                      </td>
                      <td className="py-3 text-sm">{request.hospital_name}</td>
                      <td className="py-3">
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {request.urgency === 'critical' ? 'জরুরি' : request.urgency === 'urgent' ? 'দ্রুত' : 'সাধারণ'}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status === 'submitted' ? 'অপেক্ষমাণ' : request.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="py-3 flex gap-2">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/dashboard/requests?id=${request.id}`}>
                            দেখুন
                          </Link>
                        </Button>
                        {request.status === 'submitted' && (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(request.id)}
                          >
                            অনুমোদন
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>সিস্টেম ওভারভিউ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">মোট রক্তদাতা</span>
                <span className="text-sm font-medium">{stats.totalDonors}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">মোট স্বেচ্ছাসেবক</span>
                <span className="text-sm font-medium">{stats.totalVolunteers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">সক্রিয় রক্তদাতা</span>
                <span className="text-sm font-medium">{stats.activeDonors}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>দ্রুত কার্যক্রম</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/requests">অপেক্ষমাণ অনুরোধ অনুমোদন করুন</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/volunteers">স্বেচ্ছাসেবক নিয়োগ করুন</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/donors">রক্তদাতা ব্যবস্থাপনা</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



