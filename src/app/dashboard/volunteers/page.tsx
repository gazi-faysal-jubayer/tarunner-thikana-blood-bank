"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  Search,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  Shield,
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
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";

interface VolunteerData {
  id: string;
  user_id: string;
  employee_id: string;
  is_active: boolean;
  requests_handled: number;
  donations_facilitated: number;
  success_rate: number;
  district: string;
  coverage_radius_km: number;
  profile: {
    full_name: string;
    email: string;
    phone: string;
  } | null;
}

export default function VolunteersPage() {
  const router = useRouter();
  const supabase: any = createClient();
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState<VolunteerData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get user role - only admin can access this page
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (!data.success) {
        router.push("/login");
        return;
      }

      if (data.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      // Fetch volunteers with profiles
      const { data: volunteersData } = await supabase
        .from("volunteers")
        .select(`
          id,
          user_id,
          employee_id,
          is_active,
          requests_handled,
          donations_facilitated,
          success_rate,
          district,
          coverage_radius_km,
          profiles!volunteers_user_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .order("is_active", { ascending: false })
        .order("requests_handled", { ascending: false });

      if (volunteersData) {
        setVolunteers(
          volunteersData.map((v: any) => ({
            ...v,
            profile: v.profiles,
          }))
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVolunteerStatus = async (volunteerId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("volunteers")
      .update({ is_active: !currentStatus })
      .eq("id", volunteerId);

    if (!error) {
      setVolunteers((prev) =>
        prev.map((v) =>
          v.id === volunteerId ? { ...v, is_active: !currentStatus } : v
        )
      );
    }
  };

  const filteredVolunteers = volunteers.filter((vol) => {
    const matchesSearch =
      vol.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.district?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && vol.is_active) ||
      (statusFilter === "inactive" && !vol.is_active);
    return matchesSearch && matchesStatus;
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
            <UserCheck className="h-6 w-6 text-blood-600" />
            স্বেচ্ছাসেবক ব্যবস্থাপনা
          </h1>
          <p className="text-muted-foreground">
            স্বেচ্ছাসেবকদের তালিকা এবং পারফরম্যান্স দেখুন
          </p>
        </div>
        <Button>
          নতুন স্বেচ্ছাসেবক যোগ করুন
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">মোট</p>
                <p className="text-2xl font-bold">{volunteers.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blood-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">সক্রিয়</p>
                <p className="text-2xl font-bold text-green-600">
                  {volunteers.filter((v) => v.is_active).length}
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
                <p className="text-sm text-muted-foreground">মোট অনুরোধ সম্পন্ন</p>
                <p className="text-2xl font-bold">
                  {volunteers.reduce((sum, v) => sum + (v.requests_handled || 0), 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">গড় সাফল্যের হার</p>
                <p className="text-2xl font-bold">
                  {volunteers.length > 0
                    ? Math.round(
                        volunteers.reduce((sum, v) => sum + (v.success_rate || 0), 0) /
                          volunteers.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
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
                placeholder="নাম, ID বা জেলা খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="অবস্থা" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব</SelectItem>
                <SelectItem value="active">সক্রিয়</SelectItem>
                <SelectItem value="inactive">নিষ্ক্রিয়</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Volunteers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVolunteers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>কোনো স্বেচ্ছাসেবক পাওয়া যায়নি</p>
            </CardContent>
          </Card>
        ) : (
          filteredVolunteers.map((volunteer) => (
            <Card
              key={volunteer.id}
              className={!volunteer.is_active ? "opacity-60" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {volunteer.profile?.full_name?.charAt(0) || "V"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {volunteer.profile?.full_name || "Unknown"}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          ID: {volunteer.employee_id || "N/A"}
                        </p>
                      </div>
                      <Badge
                        className={`cursor-pointer ${
                          volunteer.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                        onClick={() =>
                          toggleVolunteerStatus(volunteer.id, volunteer.is_active)
                        }
                      >
                        {volunteer.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{volunteer.district || "N/A"}</span>
                      <span className="mx-1">•</span>
                      <span>{volunteer.coverage_radius_km || 10} কি.মি.</span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">সাফল্যের হার</span>
                        <span className="font-medium">
                          {volunteer.success_rate || 0}%
                        </span>
                      </div>
                      <Progress value={volunteer.success_rate || 0} className="h-1" />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-lg font-bold">
                          {volunteer.requests_handled || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">অনুরোধ</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-lg font-bold">
                          {volunteer.donations_facilitated || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">রক্তদান</p>
                      </div>
                    </div>
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


