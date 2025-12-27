"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MapPin, Loader2, Filter, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

// Dynamic import for map component to avoid SSR issues
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

type UserRole = "admin" | "volunteer" | "donor";

interface MapMarker {
  id: string;
  type: "request" | "donor" | "volunteer";
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  blood_group?: string;
  urgency?: string;
}

export default function MapPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("donor");
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [showRequests, setShowRequests] = useState(true);
  const [showDonors, setShowDonors] = useState(true);
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (!data.success) {
        router.push("/login");
        return;
      }

      setRole(data.role as UserRole);

      const allMarkers: MapMarker[] = [];

      // Fetch blood requests
      const { data: requests } = await supabase
        .from("blood_requests")
        .select("id, tracking_id, hospital_name, blood_group, urgency, latitude, longitude")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .neq("status", "completed")
        .neq("status", "cancelled");

      if (requests) {
        requests.forEach((req: any) => {
          allMarkers.push({
            id: req.id,
            type: "request",
            latitude: parseFloat(req.latitude),
            longitude: parseFloat(req.longitude),
            title: req.hospital_name,
            description: `${req.blood_group} - ${req.tracking_id}`,
            blood_group: req.blood_group,
            urgency: req.urgency,
          });
        });
      }

      // Fetch donors (for admin and volunteer)
      if (data.role === "admin" || data.role === "volunteer") {
        const { data: donors } = await supabase
          .from("donors")
          .select(`
            id,
            blood_group,
            latitude,
            longitude,
            district,
            is_available,
            profiles!donors_user_id_fkey (full_name)
          `)
          .eq("is_available", true)
          .not("latitude", "is", null)
          .not("longitude", "is", null);

        if (donors) {
          donors.forEach((donor: any) => {
            allMarkers.push({
              id: donor.id,
              type: "donor",
              latitude: parseFloat(donor.latitude),
              longitude: parseFloat(donor.longitude),
              title: donor.profiles?.full_name || "Donor",
              description: donor.district,
              blood_group: donor.blood_group,
            });
          });
        }
      }

      setMarkers(allMarkers);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkers = markers.filter((marker) => {
    // Filter out markers with invalid coordinates
    if (!marker || typeof marker.latitude !== 'number' || typeof marker.longitude !== 'number' ||
        isNaN(marker.latitude) || isNaN(marker.longitude)) {
      return false;
    }
    if (marker.type === "request" && !showRequests) return false;
    if (marker.type === "donor" && !showDonors) return false;
    if (bloodGroupFilter !== "all" && marker.blood_group !== bloodGroupFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blood-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blood-600" />
            ইন্টারেক্টিভ ম্যাপ
          </h1>
          <p className="text-muted-foreground">
            {role === "admin"
              ? "সব অনুরোধ এবং রক্তদাতার অবস্থান দেখুন"
              : role === "volunteer"
              ? "আপনার এলাকার অনুরোধ এবং রক্তদাতা দেখুন"
              : "আপনার জন্য অ্যাসাইন করা অনুরোধের অবস্থান দেখুন"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">লেয়ার:</span>
            </div>
            <Button
              variant={showRequests ? "default" : "outline"}
              size="sm"
              onClick={() => setShowRequests(!showRequests)}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
              অনুরোধ ({markers.filter((m) => m.type === "request").length})
            </Button>
            {(role === "admin" || role === "volunteer") && (
              <Button
                variant={showDonors ? "default" : "outline"}
                size="sm"
                onClick={() => setShowDonors(!showDonors)}
              >
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                রক্তদাতা ({markers.filter((m) => m.type === "donor").length})
              </Button>
            )}
            <div className="ml-auto">
              <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="রক্তের গ্রুপ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব গ্রুপ</SelectItem>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="flex-1 h-[calc(100%-8rem)]">
        <CardContent className="p-0 h-full">
          <div className="h-full min-h-[500px] rounded-lg overflow-hidden">
            <EnhancedMap
              markers={filteredMarkers.map((m) => ({
                id: m.id,
                latitude: m.latitude,
                longitude: m.longitude,
                type: m.type as "request" | "donor" | "hospital",
                title: m.title,
                description: m.description,
                bloodGroup: m.blood_group,
                urgency: m.urgency as "critical" | "urgent" | "normal" | undefined,
              }))}
              center={{ lat: 23.8103, lng: 90.4125 }} // Dhaka center
              zoom={11}
              enableLocationTracking={true}
              enable3D={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


