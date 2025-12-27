"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  Droplet,
  Users,
  Calendar,
  Heart,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

type UserRole = "admin" | "volunteer" | "donor";

interface Stats {
  totalRequests: number;
  completedRequests: number;
  totalDonors: number;
  activeDonors: number;
  totalVolunteers: number;
  totalDonations: number;
  bloodGroupDistribution: Record<string, number>;
  monthlyTrend: Array<{ month: string; count: number }>;
}

interface PersonalStats {
  totalDonations: number;
  livesSaved: number;
  lastDonation: string | null;
  nextEligibleDate: string | null;
  assignmentsCompleted: number;
  successRate: number;
}

export default function StatisticsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("donor");
  const [stats, setStats] = useState<Stats | null>(null);
  const [personalStats, setPersonalStats] = useState<PersonalStats | null>(null);

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

      if (data.role === "admin") {
        await loadAdminStats();
      } else if (data.role === "volunteer") {
        await loadVolunteerStats(data.user.id);
      } else {
        await loadDonorStats(data.user.id);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminStats = async () => {
    // Get request counts
    const { count: totalRequests } = await supabase
      .from("blood_requests")
      .select("*", { count: "exact", head: true });

    const { count: completedRequests } = await supabase
      .from("blood_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    // Get donor counts
    const { count: totalDonors } = await supabase
      .from("donors")
      .select("*", { count: "exact", head: true });

    const { count: activeDonors } = await supabase
      .from("donors")
      .select("*", { count: "exact", head: true })
      .eq("is_available", true);

    // Get volunteer count
    const { count: totalVolunteers } = await supabase
      .from("volunteers")
      .select("*", { count: "exact", head: true });

    // Get donation count
    const { count: totalDonations } = await supabase
      .from("donations")
      .select("*", { count: "exact", head: true });

    // Get blood group distribution
    const { data: donors } = await supabase
      .from("donors")
      .select("blood_group");

    const bloodGroupDistribution: Record<string, number> = {};
    donors?.forEach((d) => {
      bloodGroupDistribution[d.blood_group] =
        (bloodGroupDistribution[d.blood_group] || 0) + 1;
    });

    setStats({
      totalRequests: totalRequests || 0,
      completedRequests: completedRequests || 0,
      totalDonors: totalDonors || 0,
      activeDonors: activeDonors || 0,
      totalVolunteers: totalVolunteers || 0,
      totalDonations: totalDonations || 0,
      bloodGroupDistribution,
      monthlyTrend: [],
    });
  };

  const loadVolunteerStats = async (userId: string) => {
    const { data: volunteer } = await supabase
      .from("volunteers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (volunteer) {
      setPersonalStats({
        totalDonations: volunteer.donations_facilitated || 0,
        livesSaved: (volunteer.donations_facilitated || 0) * 3,
        lastDonation: null,
        nextEligibleDate: null,
        assignmentsCompleted: volunteer.requests_handled || 0,
        successRate: volunteer.success_rate || 0,
      });
    }
  };

  const loadDonorStats = async (userId: string) => {
    const { data: donor } = await supabase
      .from("donors")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (donor) {
      setPersonalStats({
        totalDonations: donor.total_donations || 0,
        livesSaved: (donor.total_donations || 0) * 3,
        lastDonation: donor.last_donation_date,
        nextEligibleDate: donor.next_eligible_date,
        assignmentsCompleted: 0,
        successRate: 100,
      });
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
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blood-600" />
          {role === "admin"
            ? "সিস্টেম বিশ্লেষণ"
            : role === "volunteer"
            ? "আমার পারফরম্যান্স"
            : "আমার রক্তদানের ইতিহাস"}
        </h1>
        <p className="text-muted-foreground">
          {role === "admin"
            ? "সম্পূর্ণ সিস্টেমের পরিসংখ্যান দেখুন"
            : "আপনার কার্যক্রমের বিস্তারিত দেখুন"}
        </p>
      </div>

      {/* Admin Stats */}
      {role === "admin" && stats && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">মোট অনুরোধ</p>
                    <p className="text-3xl font-bold">{stats.totalRequests}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Droplet className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>সম্পন্ন</span>
                    <span>
                      {stats.totalRequests > 0
                        ? Math.round((stats.completedRequests / stats.totalRequests) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      stats.totalRequests > 0
                        ? (stats.completedRequests / stats.totalRequests) * 100
                        : 0
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">মোট রক্তদাতা</p>
                    <p className="text-3xl font-bold">{stats.totalDonors}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {stats.activeDonors} জন উপলব্ধ
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">মোট স্বেচ্ছাসেবক</p>
                    <p className="text-3xl font-bold">{stats.totalVolunteers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">মোট রক্তদান</p>
                    <p className="text-3xl font-bold">{stats.totalDonations}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blood-100 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-blood-600 fill-blood-200" />
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-4">
                  {stats.totalDonations * 3} জীবন বাঁচানো হয়েছে
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Blood Group Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>রক্তের গ্রুপ অনুযায়ী বন্টন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <div key={bg} className="text-center p-4 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="text-lg font-bold mb-2">
                      {bg}
                    </Badge>
                    <p className="text-2xl font-bold">
                      {stats.bloodGroupDistribution[bg] || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">রক্তদাতা</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Personal Stats for Donor/Volunteer */}
      {(role === "donor" || role === "volunteer") && personalStats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blood-600 to-blood-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blood-100">
                    {role === "donor" ? "মোট রক্তদান" : "মোট রক্তদান সহায়তা"}
                  </p>
                  <p className="text-4xl font-bold">{personalStats.totalDonations}</p>
                </div>
                <Heart className="h-12 w-12 fill-white/30" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">জীবন বাঁচানো</p>
                  <p className="text-4xl font-bold text-green-600">
                    {personalStats.livesSaved}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-green-600 fill-green-200" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                প্রতিটি রক্তদান ৩ জনের জীবন বাঁচাতে পারে
              </p>
            </CardContent>
          </Card>

          {role === "volunteer" && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">সাফল্যের হার</p>
                    <p className="text-4xl font-bold">{personalStats.successRate}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <Progress value={personalStats.successRate} className="mt-4" />
              </CardContent>
            </Card>
          )}

          {role === "donor" && personalStats.lastDonation && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">শেষ রক্তদান</p>
                    <p className="text-xl font-bold">
                      {new Date(personalStats.lastDonation).toLocaleDateString("bn-BD")}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}


