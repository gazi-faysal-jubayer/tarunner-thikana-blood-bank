"use client";

/**
 * Public Route Tracking Page
 * Allows anyone with a share token to view the route and ETA
 */

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  Loader2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  MapPin, 
  RefreshCw,
  Share2,
  Droplet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistance, formatDuration, formatETA } from "@/lib/map-utils";

// Dynamic import for map
const EnhancedMap = dynamic(
  () => import("@/components/maps/enhanced-map").then((mod) => mod.EnhancedMap),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-blood-600" />
      </div>
    )
  }
);

interface RouteInfo {
  id: string;
  geometry: GeoJSON.LineString;
  distance: number;
  duration: number;
  trafficDuration?: number;
  startLocation: { latitude: number; longitude: number; address?: string };
  endLocation: { latitude: number; longitude: number; address?: string };
  status: string;
  currentEta?: string;
  progress?: number;
  lastPosition?: { latitude: number; longitude: number };
}

interface RequestInfo {
  hospitalName: string;
  hospitalAddress: string;
  bloodGroup: string;
  urgency: string;
}

export default function TrackRoutePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const routeId = params.routeId as string;
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [request, setRequest] = useState<RequestInfo | null>(null);
  const [etaInfo, setEtaInfo] = useState<{
    currentEta: Date;
    remainingDistance: number;
    remainingDuration: number;
    progress: number;
  } | null>(null);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!token) {
      setError("শেয়ার টোকেন পাওয়া যায়নি");
      setLoading(false);
      return;
    }
    
    loadData();
    
    // Auto-refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      refreshETA();
    }, 30000);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [routeId, token]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch route with share token
      const res = await fetch(`/api/routes?routeId=${routeId}`);
      const data = await res.json();
      
      if (!data.routes || data.routes.length === 0) {
        setError("রুট পাওয়া যায়নি বা মেয়াদ শেষ হয়ে গেছে");
        return;
      }
      
      const routeData = data.routes[0];
      setRoute({
        id: routeData.id,
        geometry: routeData.geometry,
        distance: routeData.distance,
        duration: routeData.duration,
        trafficDuration: routeData.traffic_duration,
        startLocation: routeData.start_location,
        endLocation: routeData.end_location,
        status: routeData.status,
        currentEta: routeData.current_eta,
        progress: 0,
        lastPosition: routeData.last_position,
      });
      
      // Get request info if available
      if (routeData.assignments?.blood_requests) {
        const br = routeData.assignments.blood_requests;
        setRequest({
          hospitalName: br.hospital_name,
          hospitalAddress: br.hospital_address,
          bloodGroup: br.blood_group,
          urgency: br.urgency,
        });
      }
      
      // Fetch initial ETA
      await refreshETA();
      
    } catch (err) {
      console.error("Error loading route:", err);
      setError("রুট লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const refreshETA = async () => {
    if (!routeId || !token) return;
    
    try {
      const res = await fetch(`/api/routes/${routeId}/eta?token=${token}`);
      const data = await res.json();
      
      if (!data.error) {
        setEtaInfo({
          currentEta: new Date(data.currentEta),
          remainingDistance: data.remainingDistance,
          remainingDuration: data.remainingDuration,
          progress: data.progress,
        });
        
        // Update route status
        if (route) {
          setRoute(prev => prev ? { ...prev, status: data.status } : null);
        }
      }
    } catch (err) {
      console.error("Error refreshing ETA:", err);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "রক্তদাতা লোকেশন ট্র্যাক করুন",
          text: `রক্তদাতা ${request?.hospitalName || "হাসপাতালে"} যাচ্ছেন। লাইভ ট্র্যাক করুন।`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Share error:", err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert("লিংক কপি হয়েছে!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blood-600 mx-auto" />
          <p className="text-muted-foreground">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
            <h2 className="text-xl font-semibold">সমস্যা হয়েছে</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (route?.status) {
      case "active":
        return <Badge className="bg-green-500">সক্রিয়</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">সম্পন্ন</Badge>;
      case "deviated":
        return <Badge className="bg-yellow-500">রাস্তা বদলেছে</Badge>;
      default:
        return <Badge variant="outline">অপেক্ষমান</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blood-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplet className="h-8 w-8" />
            <div>
              <h1 className="font-semibold">রক্তদাতা ট্র্যাকিং</h1>
              <p className="text-sm text-blood-100">লাইভ অবস্থান ট্র্যাক করুন</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button variant="ghost" size="icon" className="text-white" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Destination Info */}
        {request && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 rounded-full p-3">
                  <MapPin className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold text-lg">{request.hospitalName}</h2>
                      <p className="text-sm text-muted-foreground">{request.hospitalAddress}</p>
                    </div>
                    <Badge variant="destructive" className="text-lg">
                      {request.bloodGroup}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ETA Card */}
        {etaInfo && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  আনুমানিক পৌঁছানোর সময়
                </span>
                <Button variant="ghost" size="sm" onClick={refreshETA}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-blood-600">
                  {formatETA(etaInfo.currentEta, 'bn')}
                </p>
              </div>
              
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>অগ্রগতি</span>
                  <span>{Math.round(etaInfo.progress)}%</span>
                </div>
                <Progress value={etaInfo.progress} className="h-2" />
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">বাকি দূরত্ব</p>
                    <p className="font-semibold">{formatDistance(etaInfo.remainingDistance, 'bn')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">বাকি সময়</p>
                    <p className="font-semibold">{formatDuration(etaInfo.remainingDuration, 'bn')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map */}
        <Card>
          <CardContent className="p-0">
            <div className="h-[400px] rounded-lg overflow-hidden">
              {route && (
                <EnhancedMap
                  center={{ 
                    lat: route.lastPosition?.latitude || route.endLocation.latitude, 
                    lng: route.lastPosition?.longitude || route.endLocation.longitude 
                  }}
                  zoom={13}
                  enable3D={false}
                  routeStart={[route.startLocation.longitude, route.startLocation.latitude]}
                  routeEnd={[route.endLocation.longitude, route.endLocation.latitude]}
                  markers={[
                    {
                      id: "destination",
                      type: "hospital",
                      latitude: route.endLocation.latitude,
                      longitude: route.endLocation.longitude,
                      title: request?.hospitalName || "গন্তব্য",
                    },
                    ...(route.lastPosition ? [{
                      id: "donor",
                      type: "donor" as const,
                      latitude: route.lastPosition.latitude,
                      longitude: route.lastPosition.longitude,
                      title: "রক্তদাতা",
                    }] : []),
                  ]}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Message */}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              এই পেজটি প্রতি ৩০ সেকেন্ডে স্বয়ংক্রিয়ভাবে আপডেট হয়
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
