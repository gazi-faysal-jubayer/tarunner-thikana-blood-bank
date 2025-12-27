'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, User } from 'lucide-react';

const EnhancedMap = dynamic(() => import('@/components/maps/enhanced-map'), { ssr: false });

interface ActiveTracking {
  assignment_id: string;
  request_id: string;
  assignee_id: string;
  donor_current_location: any;
  last_location_update: string;
  estimated_arrival_time: string;
  route_distance_km: number;
  route_duration_minutes: number;
  hospital_name: string;
  hospital_latitude: number;
  hospital_longitude: number;
  blood_group: string;
  urgency: string;
  donor_name: string;
  donor_phone: string;
}

export default function LiveTracking() {
  const [activeTracking, setActiveTracking] = useState<ActiveTracking[]>([]);
  const [selectedTracking, setSelectedTracking] = useState<ActiveTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadActiveTracking();

    // Real-time subscription to location updates
    const channel = supabase
      .channel('location-tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          filter: 'is_in_transit=eq.true',
        },
        () => {
          loadActiveTracking();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'location_history',
        },
        () => {
          loadActiveTracking();
        }
      )
      .subscribe();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadActiveTracking();
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const loadActiveTracking = async () => {
    try {
      const { data, error } = await supabase
        .from('active_tracking')
        .select('*');

      if (error) throw error;
      setActiveTracking(data || []);
    } catch (error) {
      console.error('Error loading active tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatETA = (eta: string) => {
    if (!eta) return 'N/A';
    const now = new Date();
    const arrival = new Date(eta);
    const diff = arrival.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 0) return 'Arrived';
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800',
      urgent: 'bg-orange-100 text-orange-800',
      normal: 'bg-green-100 text-green-800',
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
  };

  // Convert tracking data to map markers
  const markers = activeTracking
    .filter((t) => t.donor_current_location)
    .map((tracking) => {
      const location = tracking.donor_current_location;
      const coords = location?.coordinates || [0, 0];
      
      return {
        id: tracking.assignment_id,
        position: { lat: coords[1], lng: coords[0] },
        type: 'donor' as const,
        title: tracking.donor_name,
        description: `${tracking.blood_group} - ${tracking.hospital_name}`,
        urgency: tracking.urgency,
        onClick: () => setSelectedTracking(tracking),
      };
    });

  // Add hospital markers
  const hospitalMarkers = activeTracking.map((tracking) => ({
    id: `hospital-${tracking.request_id}`,
    position: { lat: tracking.hospital_latitude, lng: tracking.hospital_longitude },
    type: 'hospital' as const,
    title: tracking.hospital_name,
    description: `Waiting for ${tracking.blood_group}`,
  }));

  const allMarkers = [...markers, ...hospitalMarkers];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Live Tracking</h2>
        <p className="text-muted-foreground">
          Monitor donors in transit in real-time
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTracking.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeTracking.filter((t) => t.urgency === 'critical').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Distance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeTracking.length > 0
                ? (
                    activeTracking.reduce((sum, t) => sum + (t.route_distance_km || 0), 0) /
                    activeTracking.length
                  ).toFixed(1)
                : '0'}
              km
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {activeTracking.length > 0 ? 'Just now' : 'No activity'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Map</CardTitle>
            <CardDescription>3D view of all donors in transit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[600px] rounded-lg overflow-hidden">
              <EnhancedMap
                center={[23.8103, 90.4125]}
                zoom={12}
                markers={allMarkers}
                style3D={true}
                showControls={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Tracking List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Donors</CardTitle>
            <CardDescription>Currently in transit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {activeTracking.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active tracking at the moment
                </p>
              ) : (
                activeTracking.map((tracking) => (
                  <div
                    key={tracking.assignment_id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTracking?.assignment_id === tracking.assignment_id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTracking(tracking)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{tracking.donor_name}</span>
                      </div>
                      <Badge className={getUrgencyColor(tracking.urgency)}>
                        {tracking.urgency}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{tracking.hospital_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{tracking.blood_group}</Badge>
                        <span>·</span>
                        <span>{tracking.route_distance_km?.toFixed(1)} km</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>ETA: {formatETA(tracking.estimated_arrival_time)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

