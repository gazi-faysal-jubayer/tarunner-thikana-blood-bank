"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Droplet,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";

interface VolunteerData {
  id: string;
  user_id: string;
  employee_id: string;
  requests_handled: number;
  donations_facilitated: number;
  success_rate: number;
  is_active: boolean;
  latitude: number;
  longitude: number;
  coverage_radius_km: number;
  district: string;
}

interface ProfileData {
  full_name: string;
  email: string;
}

interface AssignedRequest {
  id: string;
  tracking_id: string;
  blood_group: string;
  hospital_name: string;
  patient_name: string;
  urgency: string;
  status: string;
  units_needed: number;
  needed_by: string;
  latitude: number;
  longitude: number;
}

export function VolunteerDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [volunteer, setVolunteer] = useState<VolunteerData | null>(null);
  const [assignedRequests, setAssignedRequests] = useState<AssignedRequest[]>([]);
  const [nearbyDonors, setNearbyDonors] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadVolunteerData();
  }, []);

  const loadVolunteerData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Get volunteer data
      const { data: volunteerData } = await supabase
        .from("volunteers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (volunteerData) {
        setVolunteer(volunteerData);
      }

      // Get assigned requests
      const { data: requests } = await supabase
        .from("blood_requests")
        .select("*")
        .eq("assigned_volunteer_id", volunteerData?.id)
        .in("status", ["volunteer_assigned", "donor_assigned", "donor_confirmed", "in_progress"])
        .order("created_at", { ascending: false });

      if (requests) {
        setAssignedRequests(requests.map(r => ({
          id: r.id,
          tracking_id: r.tracking_id,
          blood_group: r.blood_group,
          hospital_name: r.hospital_name,
          patient_name: r.patient_name,
          urgency: r.urgency,
          status: r.status,
          units_needed: r.units_needed,
          needed_by: r.needed_by,
          latitude: r.latitude,
          longitude: r.longitude,
        })));
      }

      // Count nearby available donors
      const { count } = await supabase
        .from("donors")
        .select("*", { count: "exact", head: true })
        .eq("is_available", true)
        .eq("district", volunteerData?.district || "Dhaka");

      setNearbyDonors(count || 0);

    } catch (error) {
      console.error("Error loading volunteer data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blood-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">স্বাগতম, {profile?.full_name || "ভলান্টিয়ার"}</h1>
          <p className="text-muted-foreground">
            ভলান্টিয়ার ID: {volunteer?.employee_id || "N/A"}
          </p>
        </div>
        <Badge variant={volunteer?.is_active ? "default" : "secondary"} className="text-sm">
          {volunteer?.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">সক্রিয় অনুরোধ</p>
                <p className="text-2xl font-bold text-blood-600">
                  {assignedRequests.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blood-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-blood-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">মোট সম্পন্ন</p>
                <p className="text-2xl font-bold">{volunteer?.requests_handled || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">রক্তদান সহায়তা</p>
                <p className="text-2xl font-bold">
                  {volunteer?.donations_facilitated || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Droplet className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">সাফল্যের হার</p>
                <p className="text-2xl font-bold">{volunteer?.success_rate || 0}%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <Progress value={volunteer?.success_rate || 0} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Assigned Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blood-600" />
              আপনার অনুরোধ ({assignedRequests.length})
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/requests">
                সব দেখুন
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignedRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>কোনো সক্রিয় অনুরোধ নেই</p>
                <p className="text-sm mt-2">নতুন অনুরোধ আসলে আপনাকে জানানো হবে</p>
              </div>
            ) : (
              assignedRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  onClick={() => setSelectedRequest(request.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedRequest === request.id
                      ? "border-blood-600 bg-blood-50"
                      : "border-transparent bg-muted/50 hover:border-blood-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        request.urgency === "critical"
                          ? "bg-red-600 animate-pulse"
                          : request.urgency === "urgent"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      } text-white`}
                    >
                      <span className="font-bold">{request.blood_group}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={request.urgency === "critical" ? "destructive" : "default"} 
                          className="text-xs"
                        >
                          {request.urgency === "critical" ? "জরুরি" : request.urgency === "urgent" ? "দ্রুত" : "সাধারণ"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {request.tracking_id}
                        </span>
                      </div>
                      <p className="font-medium">{request.hospital_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.patient_name} • {request.units_needed} ব্যাগ
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {request.needed_by 
                            ? new Date(request.needed_by).toLocaleDateString("bn-BD") 
                            : "যত দ্রুত সম্ভব"}
                        </span>
                      </div>
                    </div>

                    <Button variant="blood" size="sm" asChild>
                      <Link href="/dashboard/donors">
                        দাতা খুঁজুন
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blood-600" />
              আপনার এলাকা
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">জেলা</span>
                  <span className="font-medium">{volunteer?.district || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">কভারেজ এলাকা</span>
                  <span className="font-medium">{volunteer?.coverage_radius_km || 10} কি.মি.</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">উপলব্ধ দাতা</span>
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {nearbyDonors} জন
                  </Badge>
                </div>
              </div>

              <div className="h-[200px] bg-muted rounded-xl flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">ম্যাপ দেখতে ম্যাপ পেজে যান</p>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/map">
                  <MapPin className="h-4 w-4 mr-2" />
                  বড় ম্যাপ দেখুন
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>দ্রুত কার্যক্রম</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              asChild
            >
              <Link href="/dashboard/donors">
                <Users className="h-6 w-6 text-blood-600" />
                <span>রক্তদাতা খুঁজুন</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              asChild
            >
              <Link href="/dashboard/map">
                <MapPin className="h-6 w-6 text-blood-600" />
                <span>ম্যাপ দেখুন</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              asChild
            >
              <Link href="/dashboard/statistics">
                <ClipboardList className="h-6 w-6 text-blood-600" />
                <span>পরিসংখ্যান দেখুন</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


