"use client";

/**
 * Navigation Page
 * Real-time turn-by-turn navigation for donors and volunteers
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  Navigation, 
  Loader2, 
  AlertTriangle, 
  Phone, 
  MapPin,
  Clock,
  Route,
  RotateCcw,
  X,
  Volume2,
  VolumeX,
  Compass,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistance, formatDuration, translateManeuver, formatETA } from "@/lib/map-utils";
import type { RouteData, RouteStep, NavigationState } from "@/components/maps/types";

// Dynamic import for map
const EnhancedMap = dynamic(
  () => import("@/components/maps/enhanced-map").then((mod) => mod.EnhancedMap),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-muted">
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
  steps: RouteStep[];
  startLocation: { latitude: number; longitude: number; address?: string };
  endLocation: { latitude: number; longitude: number; address?: string };
  status: string;
}

interface AssignmentInfo {
  id: string;
  type: 'donor' | 'volunteer';
  requestId: string;
  bloodGroup: string;
  hospitalName: string;
  hospitalAddress: string;
  requesterPhone?: string;
}

export default function NavigatePage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [assignment, setAssignment] = useState<AssignmentInfo | null>(null);
  
  // Navigation state
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    currentStep: 0,
    totalSteps: 0,
    remainingDistance: 0,
    remainingDuration: 0,
    progress: 0,
    currentETA: new Date(),
    isOnRoute: true,
  });
  
  // UI state
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showRerouteDialog, setShowRerouteDialog] = useState(false);
  const [pendingReroute, setPendingReroute] = useState<any>(null);
  
  // Refs
  const watchIdRef = useRef<number | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load route and assignment data
  useEffect(() => {
    loadData();
    return () => {
      stopTracking();
    };
  }, [assignmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch route for this assignment
      const routeRes = await fetch(`/api/routes?assignmentId=${assignmentId}`);
      const routeData = await routeRes.json();
      
      if (!routeData.routes || routeData.routes.length === 0) {
        setError("এই অ্যাসাইনমেন্টের জন্য কোনো রুট পাওয়া যায়নি");
        return;
      }
      
      const routeInfo = routeData.routes[0];
      setRoute({
        id: routeInfo.id,
        geometry: routeInfo.geometry,
        distance: routeInfo.distance,
        duration: routeInfo.duration,
        trafficDuration: routeInfo.traffic_duration,
        steps: routeInfo.steps || [],
        startLocation: routeInfo.start_location,
        endLocation: routeInfo.end_location,
        status: routeInfo.status,
      });
      
      // Get assignment details
      if (routeInfo.assignments) {
        const a = routeInfo.assignments;
        setAssignment({
          id: a.id,
          type: a.type,
          requestId: a.request_id,
          bloodGroup: a.blood_requests?.blood_group,
          hospitalName: a.blood_requests?.hospital_name,
          hospitalAddress: a.blood_requests?.hospital_address,
          requesterPhone: undefined, // Would come from request
        });
      }
      
      setNavigationState(prev => ({
        ...prev,
        totalSteps: routeInfo.steps?.length || 0,
        remainingDistance: routeInfo.distance,
        remainingDuration: routeInfo.traffic_duration || routeInfo.duration,
        currentETA: new Date(Date.now() + (routeInfo.traffic_duration || routeInfo.duration) * 1000),
      }));
      
    } catch (err) {
      console.error("Error loading navigation data:", err);
      setError("ডেটা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  // Start GPS tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("আপনার ব্রাউজার GPS সমর্থন করে না");
      return;
    }
    
    setIsNavigating(true);
    setNavigationState(prev => ({ ...prev, isNavigating: true }));
    
    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading, speed } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        
        // Send position update to server
        updatePosition(latitude, longitude, heading, speed);
      },
      (err) => {
        console.error("GPS error:", err);
        if (err.code === err.PERMISSION_DENIED) {
          setError("GPS অনুমতি প্রয়োজন");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
    
    // Update ETA every 30 seconds
    updateIntervalRef.current = setInterval(() => {
      if (currentPosition) {
        updatePosition(currentPosition.lat, currentPosition.lng);
      }
    }, 30000);
  }, [route?.id, currentPosition]);

  // Stop GPS tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    setIsNavigating(false);
    setNavigationState(prev => ({ ...prev, isNavigating: false }));
  }, []);

  // Update position on server
  const updatePosition = async (lat: number, lng: number, bearing?: number | null, speed?: number | null) => {
    if (!route?.id) return;
    
    try {
      const res = await fetch(`/api/routes/${route.id}/eta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          bearing: bearing || undefined,
          speed: speed ? speed * 3.6 : undefined, // Convert m/s to km/h
        }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        console.error("ETA update error:", data.error);
        return;
      }
      
      // Update navigation state
      setNavigationState(prev => ({
        ...prev,
        remainingDistance: data.remainingDistance,
        remainingDuration: data.remainingDuration,
        progress: data.progress,
        currentETA: new Date(data.currentEta),
        isOnRoute: data.deviation?.isOnRoute ?? true,
        deviationDistance: data.deviation?.distanceFromRoute,
      }));
      
      // Handle deviation
      if (data.deviation?.shouldReroute && data.reroute?.available) {
        setPendingReroute(data.reroute);
        setShowRerouteDialog(true);
      }
      
      // Speak next instruction if voice enabled
      if (voiceEnabled && data.deviation?.isOnRoute && route.steps) {
        // Would integrate with Web Speech API here
      }
      
    } catch (err) {
      console.error("Error updating position:", err);
    }
  };

  // Accept reroute
  const acceptReroute = async () => {
    if (!pendingReroute || !currentPosition) return;
    
    try {
      const res = await fetch(`/api/routes/${route?.id}/reroute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentLatitude: currentPosition.lat,
          currentLongitude: currentPosition.lng,
        }),
      });
      
      const data = await res.json();
      
      if (data.success && data.newRoute) {
        setRoute(prev => prev ? {
          ...prev,
          geometry: data.newRoute.geometry,
          distance: data.newRoute.distance,
          duration: data.newRoute.duration,
          trafficDuration: data.newRoute.trafficDuration,
          steps: data.newRoute.steps || [],
        } : null);
        
        setNavigationState(prev => ({
          ...prev,
          currentStep: 0,
          totalSteps: data.newRoute.steps?.length || 0,
          remainingDistance: data.newRoute.distance,
          remainingDuration: data.newRoute.trafficDuration || data.newRoute.duration,
          currentETA: new Date(data.newRoute.eta),
          isOnRoute: true,
          deviationDistance: undefined,
        }));
      }
    } catch (err) {
      console.error("Error rerouting:", err);
    } finally {
      setShowRerouteDialog(false);
      setPendingReroute(null);
    }
  };

  // Get current step
  const currentStep = route?.steps?.[navigationState.currentStep];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blood-600 mx-auto" />
          <p className="text-muted-foreground">নেভিগেশন লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
            <h2 className="text-xl font-semibold">সমস্যা হয়েছে</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => router.back()}>ফিরে যান</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="bg-blood-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blood-700"
            onClick={() => router.back()}
          >
            <X className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold">{assignment?.hospitalName || "নেভিগেশন"}</h1>
            <p className="text-sm text-blood-100">{assignment?.bloodGroup} রক্ত প্রয়োজন</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blood-700"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          {assignment?.requesterPhone && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blood-700"
              asChild
            >
              <a href={`tel:${assignment.requesterPhone}`}>
                <Phone className="h-5 w-5" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <EnhancedMap
          center={currentPosition || { 
            lat: route?.startLocation.latitude || 23.8103, 
            lng: route?.startLocation.longitude || 90.4125 
          }}
          zoom={15}
          enable3D={false}
          enableLocationTracking={isNavigating}
          routeStart={route ? [route.startLocation.longitude, route.startLocation.latitude] : undefined}
          routeEnd={route ? [route.endLocation.longitude, route.endLocation.latitude] : undefined}
          markers={[
            ...(route ? [{
              id: "destination",
              type: "hospital" as const,
              latitude: route.endLocation.latitude,
              longitude: route.endLocation.longitude,
              title: assignment?.hospitalName || "গন্তব্য",
            }] : []),
          ]}
        />

        {/* Navigation Overlay */}
        {isNavigating && currentStep && (
          <div className="absolute top-4 left-4 right-4">
            <Card className="bg-white/95 backdrop-blur shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 rounded-full p-3 text-white">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold">
                      {translateManeuver(currentStep.maneuver.type)}
                    </p>
                    {currentStep.name && (
                      <p className="text-muted-foreground">{currentStep.name}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <Badge variant="outline">
                        {formatDistance(currentStep.distance, 'bn')}
                      </Badge>
                      <Badge variant="outline">
                        {formatDuration(currentStep.duration, 'bn')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Deviation Warning */}
        {isNavigating && !navigationState.isOnRoute && (
          <div className="absolute top-24 left-4 right-4">
            <Card className="bg-yellow-50 border-yellow-300">
              <CardContent className="p-3 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  আপনি রাস্তা থেকে {Math.round(navigationState.deviationDistance || 0)} মিটার দূরে
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <div className="bg-white border-t shadow-lg">
        {/* Progress */}
        {isNavigating && (
          <div className="px-4 pt-3">
            <Progress value={navigationState.progress} className="h-2" />
          </div>
        )}

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-blood-600">
                  {formatDuration(navigationState.remainingDuration, 'bn')}
                </p>
                <p className="text-xs text-muted-foreground">বাকি সময়</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {formatDistance(navigationState.remainingDistance, 'bn')}
                </p>
                <p className="text-xs text-muted-foreground">বাকি দূরত্ব</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                {formatETA(navigationState.currentETA, 'bn')}
              </p>
              <p className="text-xs text-muted-foreground">আনুমানিক পৌঁছানোর সময়</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isNavigating ? (
              <Button 
                className="flex-1 bg-blood-600 hover:bg-blood-700"
                size="lg"
                onClick={startTracking}
              >
                <Navigation className="h-5 w-5 mr-2" />
                নেভিগেশন শুরু করুন
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={stopTracking}
                  className="flex-1"
                >
                  <X className="h-5 w-5 mr-2" />
                  বন্ধ করুন
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => currentPosition && updatePosition(currentPosition.lat, currentPosition.lng)}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reroute Dialog */}
      <AlertDialog open={showRerouteDialog} onOpenChange={setShowRerouteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>রাস্তা পরিবর্তন করতে চান?</AlertDialogTitle>
            <AlertDialogDescription>
              আপনি মূল রাস্তা থেকে সরে গেছেন। নতুন রাস্তা অনুসরণ করতে চাইলে "হ্যাঁ" চাপুন।
              {pendingReroute && (
                <span className="block mt-2">
                  নতুন দূরত্ব: {formatDistance(pendingReroute.newDistance, 'bn')}<br />
                  নতুন সময়: {formatDuration(pendingReroute.newDuration, 'bn')}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>না, পুরনো রাস্তায় থাকুন</AlertDialogCancel>
            <AlertDialogAction onClick={acceptReroute}>
              হ্যাঁ, নতুন রাস্তা দেখান
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
