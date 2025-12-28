"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  MapPin,
  Phone,
  Droplet,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

type UserRole = "admin" | "volunteer" | "donor";

interface DonorData {
  id: string;
  user_id: string;
  blood_group: string;
  is_available: boolean;
  total_donations: number;
  last_donation_date: string | null;
  district: string;
  address: string;
  profile: {
    full_name: string;
    email: string;
    phone: string;
  } | null;
}

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface VolunteerRequest {
  id: string;
  tracking_id: string;
  blood_group: string;
  hospital_name: string;
}

export default function DonorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("donor");
  const [donors, setDonors] = useState<DonorData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [volunteerRequests, setVolunteerRequests] = useState<VolunteerRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Check if a request ID was passed in URL
    const requestId = searchParams.get("request");
    if (requestId) {
      setSelectedRequestId(requestId);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      // Get user role
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (!data.success) {
        router.push("/login");
        return;
      }

      // Only admin and volunteer can access this page
      if (data.role === "donor") {
        router.push("/dashboard");
        return;
      }

      setRole(data.role as UserRole);

      // If volunteer, load their assigned requests
      if (data.role === "volunteer") {
        const { data: volunteerData } = await supabase
          .from("volunteers")
          .select("id")
          .eq("user_id", data.user.id)
          .single();

        if (volunteerData) {
          const { data: requests } = await supabase
            .from("blood_requests")
            .select("id, tracking_id, blood_group, hospital_name")
            .eq("assigned_volunteer_id", volunteerData.id)
            .in("status", ["volunteer_assigned"]);

          if (requests) {
            setVolunteerRequests(requests);
            // Auto-select first request if none selected
            if (!selectedRequestId && requests.length > 0) {
              setSelectedRequestId(requests[0].id);
              // Auto-filter by blood group
              setBloodGroupFilter(requests[0].blood_group);
            }
          }
        }
      }

      // Fetch donors with profiles
      const { data: donorsData } = await supabase
        .from("donors")
        .select(`
          id,
          user_id,
          blood_group,
          is_available,
          total_donations,
          last_donation_date,
          district,
          address,
          profiles!donors_user_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .order("is_available", { ascending: false })
        .order("total_donations", { ascending: false });

      if (donorsData) {
        setDonors(
          donorsData.map((d: any) => ({
            ...d,
            profile: d.profiles,
          }))
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const assignDonor = async (donorId: string) => {
    if (!selectedRequestId) {
      toast({
        title: "অনুরোধ নির্বাচন করুন",
        description: "প্রথমে একটি অনুরোধ নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    setAssigning(donorId);
    try {
      const response = await fetch(`/api/requests/${selectedRequestId}/assign-donor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donorId }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "সফল",
          description: "রক্তদাতা সফলভাবে অ্যাসাইন করা হয়েছে",
        });
        // Remove the assigned request from the list
        setVolunteerRequests(prev => prev.filter(r => r.id !== selectedRequestId));
        setSelectedRequestId(null);
        router.push("/dashboard/requests");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "অ্যাসাইন করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setAssigning(null);
    }
  };

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch =
      donor.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.profile?.phone?.includes(searchTerm) ||
      donor.district?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBloodGroup =
      bloodGroupFilter === "all" || donor.blood_group === bloodGroupFilter;
    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && donor.is_available) ||
      (availabilityFilter === "unavailable" && !donor.is_available);
    return matchesSearch && matchesBloodGroup && matchesAvailability;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blood-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-blood-600" />
            রক্তদাতা তালিকা
          </h1>
          <p className="text-muted-foreground">
            {role === "admin"
              ? "সব রক্তদাতা পরিচালনা করুন"
              : "আপনার এলাকার রক্তদাতা দেখুন"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blood-600">{donors.length}</p>
          <p className="text-sm text-muted-foreground">মোট রক্তদাতা</p>
        </div>
      </div>

      {/* Request Selection for Volunteers */}
      {role === "volunteer" && volunteerRequests.length > 0 && (
        <Card className="border-blood-200 bg-blood-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">অনুরোধ নির্বাচন করুন:</p>
                <Select 
                  value={selectedRequestId || ""} 
                  onValueChange={(value) => {
                    setSelectedRequestId(value);
                    const request = volunteerRequests.find(r => r.id === value);
                    if (request) {
                      setBloodGroupFilter(request.blood_group);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="অনুরোধ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {volunteerRequests.map((req) => (
                      <SelectItem key={req.id} value={req.id}>
                        {req.tracking_id} - {req.blood_group} - {req.hospital_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedRequestId && (
                <Badge variant="blood" className="text-lg px-4 py-2">
                  {volunteerRequests.find(r => r.id === selectedRequestId)?.blood_group}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">উপলব্ধ</p>
                <p className="text-2xl font-bold text-green-600">
                  {donors.filter((d) => d.is_available).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">অনুপলব্ধ</p>
                <p className="text-2xl font-bold text-gray-600">
                  {donors.filter((d) => !d.is_available).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">সবচেয়ে বেশি (O+)</p>
                <p className="text-2xl font-bold">
                  {donors.filter((d) => d.blood_group === "O+").length}
                </p>
              </div>
              <Droplet className="h-8 w-8 text-blood-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">মোট রক্তদান</p>
                <p className="text-2xl font-bold">
                  {donors.reduce((sum, d) => sum + (d.total_donations || 0), 0)}
                </p>
              </div>
              <Droplet className="h-8 w-8 text-blood-600 fill-blood-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="নাম, ফোন বা জেলা খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="রক্তের গ্রুপ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব গ্রুপ</SelectItem>
                {bloodGroups.map((bg) => (
                  <SelectItem key={bg} value={bg}>
                    {bg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="অবস্থা" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব</SelectItem>
                <SelectItem value="available">উপলব্ধ</SelectItem>
                <SelectItem value="unavailable">অনুপলব্ধ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Donors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDonors.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>কোনো রক্তদাতা পাওয়া যায়নি</p>
            </CardContent>
          </Card>
        ) : (
          filteredDonors.map((donor) => (
            <Card key={donor.id} className={!donor.is_available ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blood-100 text-blood-700">
                      {donor.profile?.full_name?.charAt(0) || "D"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {donor.profile?.full_name || "Unknown"}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {donor.district || "N/A"}
                        </p>
                      </div>
                      <Badge
                        className={`${
                          donor.is_available
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {donor.is_available ? "উপলব্ধ" : "অনুপলব্ধ"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant="outline" className="text-lg font-bold">
                        {donor.blood_group}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {donor.total_donations || 0} বার দান
                      </span>
                    </div>

                    {role === "volunteer" && donor.is_available && (
                      <div className="mt-3 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            if (donor.profile?.phone) {
                              window.open(`tel:${donor.profile.phone}`, '_self');
                            }
                          }}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          কল করুন
                        </Button>
                        <Button 
                          size="sm" 
                          variant="blood" 
                          className="flex-1"
                          disabled={!selectedRequestId || assigning === donor.id}
                          onClick={() => assignDonor(donor.id)}
                        >
                          {assigning === donor.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "অ্যাসাইন করুন"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}



