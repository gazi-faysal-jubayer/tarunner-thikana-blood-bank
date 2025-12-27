"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { MapPin, Filter, Droplet, AlertCircle, RefreshCw, Layers, Navigation2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DistanceRing } from "@/components/maps/types";

// Dynamically import map components with no SSR
const EnhancedMap = dynamic(
  () => import("@/components/maps/enhanced-map").then((mod) => mod.EnhancedMap),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-[600px] bg-muted"><Loader2 className="h-8 w-8 animate-spin" /></div> }
);

const DistanceRingControls = dynamic(
  () => import("@/components/maps/distance-ring").then((mod) => mod.DistanceRingControls),
  { ssr: false }
);

const bloodGroups = ["সব", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const urgencyLevels = [
  { value: "all", label: "সব" },
  { value: "critical", label: "জরুরি" },
  { value: "urgent", label: "দ্রুত" },
  { value: "normal", label: "সাধারণ" },
];

interface RequestMarker {
  id: string;
  type: "request";
  latitude: number;
  longitude: number;
  bloodGroup: string;
  urgency: "critical" | "urgent" | "normal";
  title: string;
  subtitle: string;
  timeAgo: string;
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "এইমাত্র";
  if (diffMins < 60) return `${diffMins} মিনিট আগে`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ঘন্টা আগে`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} দিন আগে`;
}

export default function LiveMapPage() {
  const [requests, setRequests] = useState<RequestMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("সব");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [enable3D, setEnable3D] = useState(false);
  const [enableLocation, setEnableLocation] = useState(false);
  const [showDistanceRings, setShowDistanceRings] = useState(false);
  const [distanceRings, setDistanceRings] = useState<DistanceRing[]>([]);
  const [mapCenter] = useState({ lat: 23.8103, lng: 90.4125 }); // Dhaka center

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'live-map/page.tsx:77',message:'useEffect triggered - fetchRequests called',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'live-map/page.tsx:82',message:'fetchRequests entry',data:{loading:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setLoading(true);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'live-map/page.tsx:85',message:'Before API fetch',data:{url:'/api/public/map/markers'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const response = await fetch("/api/public/map/markers");
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'live-map/page.tsx:86',message:'API response received',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const data = await response.json();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'live-map/page.tsx:87',message:'API data parsed',data:{success:data.success,hasData:!!data.data,dataLength:data.data?.length,rawDataSample:data.data?.[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      if (data.success && data.data) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'live-map/page.tsx:89',message:'Before filtering markers',data:{rawDataLength:data.data.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        const markers = data.data
          .filter((m: any) => {
            const isValid = m && 
              typeof m.latitude === 'number' && 
              typeof m.longitude === 'number' &&
              !isNaN(m.latitude) && 
              !isNaN(m.longitude);
            // #region agent log
            if (!isValid) fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'live-map/page.tsx:90',message:'Invalid marker filtered out',data:{marker:m,latType:typeof m?.latitude,lngType:typeof m?.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            return isValid;
          })
          .map((m: any) => {
            const marker = {
              id: m.id,
              type: "request" as const,
              latitude: m.latitude,
              longitude: m.longitude,
              bloodGroup: m.bloodGroup,
              urgency: m.urgency as "critical" | "urgent" | "normal",
              title: m.title,
              subtitle: m.subtitle,
              timeAgo: formatTimeAgo(m.createdAt),
            };
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'live-map/page.tsx:96',message:'Marker transformed',data:{hasTitle:!!marker.title,hasSubtitle:!!marker.subtitle,hasBloodGroup:!!marker.bloodGroup,hasUrgency:!!marker.urgency,marker},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            return marker;
          });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'live-map/page.tsx:107',message:'Before setRequests',data:{markersCount:markers.length,markers},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        setRequests(markers);
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'live-map/page.tsx:108',message:'API response invalid',data:{success:data.success,hasData:!!data.data,data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'live-map/page.tsx:110',message:'fetchRequests error',data:{error:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error("Error fetching requests:", error);
    } finally {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'live-map/page.tsx:112',message:'fetchRequests finally - setting loading false',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setLoading(false);
    }
  };

  // Filter requests based on selection
  const filteredRequests = requests.filter((req) => {
    if (selectedBloodGroup !== "সব" && req.bloodGroup !== selectedBloodGroup)
      return false;
    if (selectedUrgency !== "all" && req.urgency !== selectedUrgency)
      return false;
    return true;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-500 text-white";
      case "urgent":
        return "bg-orange-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "জরুরি";
      case "urgent":
        return "দ্রুত";
      default:
        return "সাধারণ";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="h-6 w-6 text-blood-600" />
                লাইভ রক্তের অনুরোধ ম্যাপ
              </h1>
              <p className="text-muted-foreground text-sm">
                বাংলাদেশে বর্তমান রক্তের অনুরোধ দেখুন
              </p>
            </div>
            <Button onClick={fetchRequests} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              রিফ্রেশ
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters and Request List */}
          <div className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  ফিল্টার
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Blood Group Filter */}
                <div className="space-y-2">
                  <Label className="text-xs">রক্তের গ্রুপ</Label>
                  <Select
                    value={selectedBloodGroup}
                    onValueChange={setSelectedBloodGroup}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Urgency Filter */}
                <div className="space-y-2">
                  <Label className="text-xs">জরুরিতা</Label>
                  <Select
                    value={selectedUrgency}
                    onValueChange={setSelectedUrgency}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Map Options */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="3d-mode" className="text-xs flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      ৩ডি মোড
                    </Label>
                    <Switch
                      id="3d-mode"
                      checked={enable3D}
                      onCheckedChange={setEnable3D}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="location" className="text-xs flex items-center gap-1">
                      <Navigation2 className="h-3 w-3" />
                      আমার অবস্থান
                    </Label>
                    <Switch
                      id="location"
                      checked={enableLocation}
                      onCheckedChange={setEnableLocation}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Request List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    অনুরোধ ({filteredRequests.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    লোড হচ্ছে...
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    কোনো অনুরোধ পাওয়া যায়নি
                  </div>
                ) : (
                  filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedMarker(req.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedMarker === req.id
                          ? "border-blood-500 bg-blood-50"
                          : "border-border hover:border-blood-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Badge className={`${getUrgencyColor(req.urgency)} text-xs shrink-0`}>
                          {req.bloodGroup}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{req.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {req.subtitle}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getUrgencyLabel(req.urgency)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {req.timeAgo}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="h-[700px]">
              <CardContent className="p-0 h-full">
                <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                  {(() => {
                    // #region agent log
                    const markersForMap = filteredRequests.map((req) => ({
                      id: req.id,
                      type: req.type,
                      latitude: req.latitude,
                      longitude: req.longitude,
                      bloodGroup: req.bloodGroup,
                      urgency: req.urgency,
                      title: req.title,
                      description: req.subtitle,
                    }));
                    fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'live-map/page.tsx:314',message:'Rendering EnhancedMap',data:{markersCount:markersForMap.length,filteredRequestsCount:filteredRequests.length,requestsCount:requests.length,markersForMap,mapCenter},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                    // #endregion
                    return (
                      <EnhancedMap
                        markers={markersForMap}
                        center={mapCenter}
                        zoom={11}
                        enable3D={enable3D}
                        enableLocationTracking={enableLocation}
                        distanceRings={showDistanceRings ? distanceRings : undefined}
                        onMarkerClick={(marker) => setSelectedMarker(marker.id)}
                      />
                    );
                  })()}
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Droplet className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold">
                {filteredRequests.filter((r) => r.urgency === "critical").length}
              </p>
              <p className="text-xs text-muted-foreground">জরুরি অনুরোধ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Droplet className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">
                {filteredRequests.filter((r) => r.urgency === "urgent").length}
              </p>
              <p className="text-xs text-muted-foreground">দ্রুত অনুরোধ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Droplet className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">
                {filteredRequests.filter((r) => r.urgency === "normal").length}
              </p>
              <p className="text-xs text-muted-foreground">সাধারণ অনুরোধ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-blood-500" />
              <p className="text-2xl font-bold">{filteredRequests.length}</p>
              <p className="text-xs text-muted-foreground">মোট অনুরোধ</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
