'use client';

import { useEffect, useState } from 'react';
import {
  getRequestTrends,
  getBloodGroupDemand,
  getVolunteerPerformance,
  getGeographicDistribution,
  getResponseTimes,
} from '@/lib/queries/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Users, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface TrendData {
  date: string;
  total: number;
  critical: number;
  completed: number;
}

interface BloodGroupData {
  bloodGroup: string;
  total: number;
  pending: number;
  critical: number;
}

interface VolunteerData {
  id: string;
  name: string;
  requestsHandled: number;
  donationsFacilitated: number;
  successRate: number;
}

interface DistrictData {
  district: string;
  division: string;
  total: number;
  pending: number;
  completed: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [bloodGroups, setBloodGroups] = useState<BloodGroupData[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerData[]>([]);
  const [districts, setDistricts] = useState<DistrictData[]>([]);
  const [responseTimes, setResponseTimes] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [trendsData, bloodGroupData, volunteersData, districtsData, responseData] =
        await Promise.all([
          getRequestTrends(
            thirtyDaysAgo.toISOString().split('T')[0],
            now.toISOString().split('T')[0]
          ),
          getBloodGroupDemand(),
          getVolunteerPerformance(),
          getGeographicDistribution(),
          getResponseTimes(),
        ]);

      setTrends(trendsData);
      setBloodGroups(bloodGroupData);
      setVolunteers(volunteersData);
      setDistricts(districtsData.slice(0, 10)); // Top 10 districts
      setResponseTimes(responseData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportData = (data: any[], filename: string) => {
    const csv = [
      Object.keys(data[0] || {}),
      ...data.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
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
          <h2 className="text-2xl font-bold tracking-tight">Analytics & Reports</h2>
          <p className="text-muted-foreground">
            Performance metrics and insights
          </p>
        </div>
      </div>

      {/* Response Time Metrics */}
      {responseTimes && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Approval Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {responseTimes.avgApprovalTime} min
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {responseTimes.avgCompletionTime} min
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Response</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {responseTimes.byUrgency.find((u: any) => u.urgency === 'critical')
                  ?.avgApprovalTime || 0}{' '}
                min
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Normal Response</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {responseTimes.byUrgency.find((u: any) => u.urgency === 'normal')
                  ?.avgApprovalTime || 0}{' '}
                min
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Blood Group Demand */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blood Group Demand</CardTitle>
              <CardDescription>Request distribution by blood type</CardDescription>
            </div>
            <Button
              onClick={() => exportData(bloodGroups, 'blood-group-demand')}
              variant="outline"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bloodGroups.map((bg) => (
              <div key={bg.bloodGroup} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Badge variant="outline" className="w-16">
                    {bg.bloodGroup}
                  </Badge>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{bg.total} requests</span>
                      {bg.critical > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {bg.critical} critical
                        </Badge>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (bg.total /
                              Math.max(...bloodGroups.map((b) => b.total), 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {bg.pending} pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Volunteers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Volunteers</CardTitle>
                <CardDescription>Performance leaderboard</CardDescription>
              </div>
              <Button
                onClick={() => exportData(volunteers, 'volunteer-performance')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {volunteers.map((vol, index) => (
                <div
                  key={vol.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{vol.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {vol.requestsHandled} requests handled
                      </div>
                    </div>
                  </div>
                  <Badge variant={vol.successRate >= 80 ? 'default' : 'secondary'}>
                    {vol.successRate}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Districts</CardTitle>
                <CardDescription>Requests by location</CardDescription>
              </div>
              <Button
                onClick={() => exportData(districts, 'geographic-distribution')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {districts.map((dist) => (
                <div
                  key={dist.district}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{dist.district}</div>
                      <div className="text-xs text-muted-foreground">
                        {dist.division}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{dist.total}</div>
                    <div className="text-xs text-muted-foreground">
                      {dist.completed} completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Request Trends (Last 30 Days)</CardTitle>
              <CardDescription>Daily request statistics</CardDescription>
            </div>
            <Button
              onClick={() => exportData(trends, 'request-trends')}
              variant="outline"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {trends.map((trend) => (
              <div
                key={trend.date}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <span className="text-sm font-medium">
                  {new Date(trend.date).toLocaleDateString()}
                </span>
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Total: <strong>{trend.total}</strong>
                  </span>
                  <span className="text-red-600">
                    Critical: <strong>{trend.critical}</strong>
                  </span>
                  <span className="text-green-600">
                    Completed: <strong>{trend.completed}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

