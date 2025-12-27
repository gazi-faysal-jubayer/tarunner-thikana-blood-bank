"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Link2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ArrowRight,
  User,
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
import { createClient } from "@/lib/supabase/client";

type UserRole = "admin" | "volunteer" | "donor";

interface Assignment {
  id: string;
  request_id: string;
  type: "volunteer" | "donor";
  status: "pending" | "accepted" | "rejected" | "completed";
  created_at: string;
  assignee_name: string;
  request_tracking_id: string;
  request_blood_group: string;
  request_hospital: string;
}

export default function AssignmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("donor");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

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

      // Only admin and volunteer can access this page
      if (data.role === "donor") {
        router.push("/dashboard");
        return;
      }

      setRole(data.role as UserRole);

      // Fetch assignments with related data
      const { data: assignmentsData } = await supabase
        .from("assignments")
        .select(`
          id,
          request_id,
          type,
          status,
          created_at,
          blood_requests (
            tracking_id,
            blood_group,
            hospital_name
          )
        `)
        .order("created_at", { ascending: false });

      if (assignmentsData) {
        setAssignments(
          assignmentsData.map((a: any) => ({
            id: a.id,
            request_id: a.request_id,
            type: a.type,
            status: a.status,
            created_at: a.created_at,
            assignee_name: "Assignee",
            request_tracking_id: a.blood_requests?.tracking_id || "",
            request_blood_group: a.blood_requests?.blood_group || "",
            request_hospital: a.blood_requests?.hospital_name || "",
          }))
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.request_tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.request_hospital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesType = typeFilter === "all" || a.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
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
            <Link2 className="h-6 w-6 text-blood-600" />
            অ্যাসাইনমেন্ট
          </h1>
          <p className="text-muted-foreground">
            {role === "admin"
              ? "সব অ্যাসাইনমেন্ট পরিচালনা করুন"
              : "আপনার অ্যাসাইনমেন্ট দেখুন"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">মোট</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
              <Link2 className="h-8 w-8 text-blood-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">অপেক্ষমাণ</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {assignments.filter((a) => a.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">গৃহীত</p>
                <p className="text-2xl font-bold text-green-600">
                  {assignments.filter((a) => a.status === "accepted").length}
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
                <p className="text-sm text-muted-foreground">সম্পন্ন</p>
                <p className="text-2xl font-bold text-blue-600">
                  {assignments.filter((a) => a.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
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
                placeholder="ট্র্যাকিং ID বা হাসপাতাল খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="ধরন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ধরন</SelectItem>
                <SelectItem value="volunteer">স্বেচ্ছাসেবক</SelectItem>
                <SelectItem value="donor">রক্তদাতা</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="অবস্থা" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব অবস্থা</SelectItem>
                <SelectItem value="pending">অপেক্ষমাণ</SelectItem>
                <SelectItem value="accepted">গৃহীত</SelectItem>
                <SelectItem value="rejected">প্রত্যাখ্যাত</SelectItem>
                <SelectItem value="completed">সম্পন্ন</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle>অ্যাসাইনমেন্ট তালিকা ({filteredAssignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>কোনো অ্যাসাইনমেন্ট পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        assignment.type === "volunteer"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {assignment.request_blood_group}
                        </Badge>
                        <span className="font-mono text-sm text-muted-foreground">
                          {assignment.request_tracking_id}
                        </span>
                      </div>
                      <p className="font-medium">{assignment.request_hospital}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge
                          variant="secondary"
                          className={
                            assignment.type === "volunteer"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }
                        >
                          {assignment.type === "volunteer"
                            ? "স্বেচ্ছাসেবক"
                            : "রক্তদাতা"}
                        </Badge>
                        <span>•</span>
                        <span>
                          {new Date(assignment.created_at).toLocaleDateString("bn-BD")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(assignment.status)}>
                      {getStatusIcon(assignment.status)}
                      <span className="ml-1">
                        {assignment.status === "pending"
                          ? "অপেক্ষমাণ"
                          : assignment.status === "accepted"
                          ? "গৃহীত"
                          : assignment.status === "rejected"
                          ? "প্রত্যাখ্যাত"
                          : "সম্পন্ন"}
                      </span>
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/track/${assignment.request_tracking_id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


