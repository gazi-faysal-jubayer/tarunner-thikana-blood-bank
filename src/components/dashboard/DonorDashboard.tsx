"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Droplet,
  Heart,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Power,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DonorData {
  id: string;
  user_id: string;
  blood_group: string;
  is_available: boolean;
  total_donations: number;
  last_donation_date: string | null;
  next_eligible_date: string | null;
  address: string;
  district: string;
}

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
}

interface AssignedRequest {
  id: string;
  tracking_id: string;
  blood_group: string;
  hospital_name: string;
  urgency: string;
  status: string;
  latitude: number;
  longitude: number;
}

interface Donation {
  id: string;
  donation_date: string;
  donation_location: string;
  units_donated: number;
}

export function DonorDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [donor, setDonor] = useState<DonorData | null>(null);
  const [assignedRequests, setAssignedRequests] = useState<AssignedRequest[]>([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadDonorData();
  }, []);

  const loadDonorData = async () => {
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
        .select("full_name, email, phone")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Get donor data
      const { data: donorData } = await supabase
        .from("donors")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (donorData) {
        setDonor(donorData);
        setIsAvailable(donorData.is_available);
      }

      // Get assigned requests (where donor is assigned)
      if (donorData?.id) {
        const { data: assignments } = await supabase
          .from("assignments")
          .select(`
            id,
            status,
            blood_requests (
              id,
              tracking_id,
              blood_group,
              hospital_name,
              urgency,
              status,
              latitude,
              longitude
            )
          `)
          .eq("assignee_id", donorData.id)
          .eq("type", "donor")
          .in("status", ["pending", "accepted"]);

        if (assignments) {
          const requests = assignments
            .filter(a => a.blood_requests)
            .map(a => ({
              id: (a.blood_requests as any).id,
              tracking_id: (a.blood_requests as any).tracking_id,
              blood_group: (a.blood_requests as any).blood_group,
              hospital_name: (a.blood_requests as any).hospital_name,
              urgency: (a.blood_requests as any).urgency,
              status: (a.blood_requests as any).status,
              latitude: (a.blood_requests as any).latitude,
              longitude: (a.blood_requests as any).longitude,
            }));
          setAssignedRequests(requests);
        }

        // Get recent donations
        const { data: donations } = await supabase
          .from("donations")
          .select("id, donation_date, donation_location, units_donated")
          .eq("donor_id", donorData.id)
          .order("donation_date", { ascending: false })
          .limit(5);

        if (donations) {
          setRecentDonations(donations);
        }
      }
    } catch (error) {
      console.error("Error loading donor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (available: boolean) => {
    if (!donor) return;

    setIsAvailable(available);

    const { error } = await supabase
      .from("donors")
      .update({ is_available: available, updated_at: new Date().toISOString() })
      .eq("id", donor.id);

    if (error) {
      toast({
        title: "ত্রুটি",
        description: "অবস্থা আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
      setIsAvailable(!available);
    } else {
      toast({
        title: available ? "উপলব্ধ" : "অনুপলব্ধ",
        description: available 
          ? "আপনি এখন রক্তদানের জন্য উপলব্ধ" 
          : "আপনি এখন অনুপলব্ধ হিসেবে চিহ্নিত",
      });
    }
  };

  // Calculate eligibility
  const calculateEligibility = () => {
    if (!donor?.last_donation_date) {
      return { isEligible: true, daysUntilEligible: 0 };
    }
    const lastDonation = new Date(donor.last_donation_date);
    const nextEligible = new Date(lastDonation);
    nextEligible.setDate(nextEligible.getDate() + 90); // 90 days gap
    
    const now = new Date();
    const daysUntilEligible = Math.ceil((nextEligible.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      isEligible: daysUntilEligible <= 0,
      daysUntilEligible: Math.max(0, daysUntilEligible),
    };
  };

  const { isEligible, daysUntilEligible } = calculateEligibility();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blood-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blood-600 to-blood-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blood-100">স্বাগতম,</p>
              <h2 className="text-2xl font-bold">{profile?.full_name || "রক্তদাতা"}</h2>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
                  <Droplet className="h-5 w-5" />
                  <span className="font-bold">{donor?.blood_group || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 fill-white" />
                  <span>{donor?.total_donations || 0} বার রক্তদান</span>
                </div>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">রক্তদানে উপলব্ধ</span>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={toggleAvailability}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
              <Badge
                variant={isAvailable ? "default" : "secondary"}
                className={isAvailable ? "bg-green-500" : ""}
              >
                <Power className="h-3 w-3 mr-1" />
                {isAvailable ? "উপলব্ধ" : "অনুপলব্ধ"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Eligibility Status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">পরবর্তী রক্তদান</p>
                <p className="text-2xl font-bold">
                  {isEligible ? (
                    <span className="text-green-600">এখনই দিতে পারেন</span>
                  ) : (
                    <span>{daysUntilEligible} দিন পর</span>
                  )}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isEligible ? "bg-green-100" : "bg-orange-100"
                }`}
              >
                {isEligible ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Clock className="h-6 w-6 text-orange-600" />
                )}
              </div>
            </div>
            {!isEligible && (
              <Progress
                value={((90 - daysUntilEligible) / 90) * 100}
                className="mt-4 h-2"
              />
            )}
          </CardContent>
        </Card>

        {/* Total Donations */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">মোট রক্তদান</p>
                <p className="text-2xl font-bold">{donor?.total_donations || 0} বার</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blood-100 flex items-center justify-center">
                <Heart className="h-6 w-6 text-blood-600 fill-blood-200" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              আপনি {(donor?.total_donations || 0) * 3} টি জীবন বাঁচিয়েছেন! 🎉
            </p>
          </CardContent>
        </Card>

        {/* Active Assignments */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">সক্রিয় অনুরোধ</p>
                <p className="text-2xl font-bold">{assignedRequests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            {assignedRequests.length > 0 && (
              <Badge variant="destructive" className="mt-2">
                জরুরি প্রতিক্রিয়া প্রয়োজন
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Request */}
      {assignedRequests.length > 0 && (
        <Card className="border-blood-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blood-700">
              <AlertCircle className="h-5 w-5" />
              আপনার জন্য অনুরোধ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-4 p-4 bg-blood-50 rounded-xl mb-3"
              >
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    request.urgency === "critical"
                      ? "bg-red-600 animate-pulse"
                      : request.urgency === "urgent"
                      ? "bg-orange-500"
                      : "bg-blue-500"
                  } text-white`}
                >
                  <span className="text-xl font-bold">{request.blood_group}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={request.urgency === "critical" ? "destructive" : "default"}>
                      {request.urgency === "critical" ? "জরুরি" : request.urgency === "urgent" ? "দ্রুত" : "সাধারণ"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {request.tracking_id}
                    </span>
                  </div>
                  <p className="font-medium">{request.hospital_name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{request.urgency === "critical" ? "জরুরি প্রয়োজন" : "নিকটবর্তী"}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="blood">
                    গ্রহণ করুন
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline" size="sm">
                    প্রত্যাখ্যান
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Active Requests */}
      {assignedRequests.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="font-semibold mb-2">কোনো সক্রিয় অনুরোধ নেই</h3>
            <p className="text-muted-foreground text-sm">
              আপনার এলাকায় রক্তের প্রয়োজন হলে আমরা আপনাকে জানাবো
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Donations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">সাম্প্রতিক রক্তদান</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/statistics">
              সব দেখুন
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentDonations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>এখনও কোনো রক্তদানের রেকর্ড নেই</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentDonations.map((donation, index) => (
                <div key={donation.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blood-100 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-blood-600 fill-blood-200" />
                      </div>
                      <div>
                        <p className="font-medium">{donation.donation_location || "হাসপাতাল"}</p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(donation.donation_date).toLocaleDateString("bn-BD")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{donation.units_donated} ব্যাগ</Badge>
                  </div>
                  {index < recentDonations.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


