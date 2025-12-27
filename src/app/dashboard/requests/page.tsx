"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { RoleGate } from "@/components/dashboard/RoleGate";

type UserRole = "admin" | "volunteer" | "donor";

interface BloodRequest {
  id: string;
  tracking_id: string;
  patient_name: string;
  requester_name: string;
  blood_group: string;
  hospital_name: string;
  urgency: string;
  status: string;
  units_needed: number;
  needed_by: string;
  created_at: string;
  assigned_volunteer_id: string | null;
}

export default function RequestsPage() {
  const router = useRouter();
  const supabase: any = createClient();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("donor");
  const [userId, setUserId] = useState<string | null>(null);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");

  useEffect(() => {
    loadUserAndRequests();
  }, []);

  const loadUserAndRequests = async () => {
    try {
      // Get user role
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (!data.success) {
        router.push("/login");
        return;
      }

      setRole(data.role as UserRole);
      setUserId(data.user.id);

      // Fetch requests based on role
      await loadRequests(data.role, data.user.id);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async (userRole: UserRole, id: string) => {
    let query = supabase
      .from("blood_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (userRole === "volunteer") {
      // Volunteers see their assigned requests
      const { data: volunteerData } = await supabase
        .from("volunteers")
        .select("id")
        .eq("user_id", id)
        .single();

      if (volunteerData) {
        query = query.eq("assigned_volunteer_id", volunteerData.id);
      }
    } else if (userRole === "donor") {
      // Donors see requests assigned to them via assignments table
      const { data: donorData } = await supabase
        .from("donors")
        .select("id")
        .eq("user_id", id)
        .single();

      if (donorData) {
        const { data: assignments } = await supabase
          .from("assignments")
          .select("request_id")
          .eq("assignee_id", donorData.id)
          .eq("type", "donor");

        const requestIds = assignments?.map((a: any) => a.request_id) || [];
        if (requestIds.length > 0) {
          query = query.in("id", requestIds);
        } else {
          setRequests([]);
          return;
        }
      }
    }
    // Admin sees all requests (no filter)

    const { data } = await query;
    setRequests(data || []);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      volunteer_assigned: "bg-indigo-100 text-indigo-800",
      donor_assigned: "bg-purple-100 text-purple-800",
      in_progress: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-800",
      urgent: "bg-orange-100 text-orange-800",
      normal: "bg-green-100 text-green-800",
    };
    return colors[urgency] || "bg-gray-100 text-gray-800";
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.hospital_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesUrgency = urgencyFilter === "all" || req.urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const approveRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("blood_requests")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", requestId);

    if (!error) {
      await loadRequests(role, userId!);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-blood-600" />
            {role === "admin"
              ? "সব রক্তের অনুরোধ"
              : role === "volunteer"
              ? "আমার অ্যাসাইন করা অনুরোধ"
              : "আমার জন্য অনুরোধ"}
          </h1>
          <p className="text-muted-foreground">
            {role === "admin"
              ? "সিস্টেমে সব রক্তের অনুরোধ পরিচালনা করুন"
              : role === "volunteer"
              ? "আপনার অ্যাসাইন করা অনুরোধগুলি দেখুন"
              : "আপনার জন্য অ্যাসাইন করা রক্তদানের অনুরোধ"}
          </p>
        </div>
        <RoleGate allowedRoles={["admin"]} userRole={role}>
          <Button asChild>
            <Link href="/request-blood">নতুন অনুরোধ তৈরি করুন</Link>
          </Button>
        </RoleGate>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ট্র্যাকিং ID, রোগী বা হাসপাতালের নাম..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="অবস্থা" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব অবস্থা</SelectItem>
                <SelectItem value="submitted">জমা দেওয়া</SelectItem>
                <SelectItem value="approved">অনুমোদিত</SelectItem>
                <SelectItem value="volunteer_assigned">স্বেচ্ছাসেবক নিযুক্ত</SelectItem>
                <SelectItem value="donor_assigned">দাতা নিযুক্ত</SelectItem>
                <SelectItem value="in_progress">চলমান</SelectItem>
                <SelectItem value="completed">সম্পন্ন</SelectItem>
                <SelectItem value="cancelled">বাতিল</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="জরুরিতা" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব</SelectItem>
                <SelectItem value="critical">জরুরি</SelectItem>
                <SelectItem value="urgent">দ্রুত</SelectItem>
                <SelectItem value="normal">সাধারণ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>অনুরোধ তালিকা ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm">
                  <th className="pb-3 font-medium">ট্র্যাকিং ID</th>
                  <th className="pb-3 font-medium">রোগী</th>
                  <th className="pb-3 font-medium">রক্তের গ্রুপ</th>
                  <th className="pb-3 font-medium">হাসপাতাল</th>
                  <th className="pb-3 font-medium">জরুরিতা</th>
                  <th className="pb-3 font-medium">অবস্থা</th>
                  <th className="pb-3 font-medium">তারিখ</th>
                  <th className="pb-3 font-medium">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      কোনো অনুরোধ পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b last:border-0">
                      <td className="py-3 text-sm font-mono">{request.tracking_id}</td>
                      <td className="py-3 text-sm">{request.patient_name}</td>
                      <td className="py-3">
                        <Badge variant="outline">{request.blood_group}</Badge>
                      </td>
                      <td className="py-3 text-sm">{request.hospital_name}</td>
                      <td className="py-3">
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {request.urgency === "critical"
                            ? "জরুরি"
                            : request.urgency === "urgent"
                            ? "দ্রুত"
                            : "সাধারণ"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/track/${request.tracking_id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <RoleGate allowedRoles={["admin"]} userRole={role}>
                            {request.status === "submitted" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveRequest(request.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                অনুমোদন
                              </Button>
                            )}
                            {request.status === "approved" && (
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/assignments?request=${request.id}`}>
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  স্বেচ্ছাসেবক
                                </Link>
                              </Button>
                            )}
                          </RoleGate>
                          <RoleGate allowedRoles={["volunteer"]} userRole={role}>
                            <Button size="sm" variant="blood" asChild>
                              <Link href="/dashboard/donors">
                                দাতা খুঁজুন
                              </Link>
                            </Button>
                          </RoleGate>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


