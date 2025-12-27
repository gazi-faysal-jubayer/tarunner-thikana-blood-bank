"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Users,
  Heart,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Droplet,
  MapPin,
  UserCheck,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MockMap } from "@/components/maps/mock-map";

// Mock data
const mockAdminData = {
  stats: {
    totalRequests: 156,
    activeRequests: 12,
    completedToday: 8,
    pendingApproval: 5,
    totalDonors: 1250,
    activeDonors: 890,
    totalVolunteers: 45,
    activeVolunteers: 38,
  },
  pendingRequests: [
    {
      id: "1",
      trackingId: "BLD-20241226-X1Y2",
      bloodGroup: "B+",
      hospitalName: "পপুলার হাসপাতাল",
      patientName: "আমিনুল ইসলাম",
      urgency: "critical" as const,
      status: "submitted",
      createdAt: "১০ মিনিট আগে",
    },
    {
      id: "2",
      trackingId: "BLD-20241226-Z3W4",
      bloodGroup: "AB-",
      hospitalName: "ইব্রাহিম কার্ডিয়াক",
      patientName: "সালমা খাতুন",
      urgency: "urgent" as const,
      status: "submitted",
      createdAt: "২৫ মিনিট আগে",
    },
  ],
  recentActivity: [
    {
      id: "1",
      type: "donation_completed",
      message: "মোঃ করিম A+ রক্তদান সম্পন্ন করেছেন",
      time: "৫ মিনিট আগে",
    },
    {
      id: "2",
      type: "volunteer_assigned",
      message: "স্বেচ্ছাসেবক আব্দুল করিম নতুন অনুরোধে নিযুক্ত",
      time: "১৫ মিনিট আগে",
    },
    {
      id: "3",
      type: "request_submitted",
      message: "নতুন জরুরি অনুরোধ: O- রক্ত প্রয়োজন",
      time: "২০ মিনিট আগে",
    },
  ],
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blood-50 to-blood-100 border-blood-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blood-600">সক্রিয় অনুরোধ</p>
                <p className="text-3xl font-bold text-blood-700">
                  {mockAdminData.stats.activeRequests}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-blood-500" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="critical" className="text-xs">
                {mockAdminData.stats.pendingApproval} অনুমোদন বাকি
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">আজ সম্পন্ন</p>
                <p className="text-3xl font-bold text-green-600">
                  {mockAdminData.stats.completedToday}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline text-green-500" /> +২৫% গতকালের চেয়ে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">রক্তদাতা</p>
                <p className="text-3xl font-bold">{mockAdminData.stats.totalDonors}</p>
              </div>
              <Heart className="h-8 w-8 text-blood-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {mockAdminData.stats.activeDonors} জন উপলব্ধ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">স্বেচ্ছাসেবক</p>
                <p className="text-3xl font-bold">
                  {mockAdminData.stats.totalVolunteers}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {mockAdminData.stats.activeVolunteers} জন সক্রিয়
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              অনুমোদনের অপেক্ষায়
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/admin/requests">
                সব দেখুন
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAdminData.pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl"
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    request.urgency === "critical"
                      ? "bg-urgency-critical animate-pulse"
                      : "bg-urgency-urgent"
                  } text-white`}
                >
                  <span className="font-bold">{request.bloodGroup}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={request.urgency} className="text-xs">
                      {request.urgency === "critical" ? "জরুরি" : "দ্রুত"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {request.trackingId}
                    </span>
                  </div>
                  <p className="font-medium">{request.hospitalName}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.patientName} • {request.createdAt}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="blood" size="sm">
                    অনুমোদন
                  </Button>
                  <Button variant="outline" size="sm">
                    বিস্তারিত
                  </Button>
                </div>
              </div>
            ))}

            {mockAdminData.pendingRequests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>সব অনুরোধ অনুমোদিত!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blood-600" />
              সাম্প্রতিক কার্যক্রম
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAdminData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "donation_completed"
                        ? "bg-green-500"
                        : activity.type === "volunteer_assigned"
                        ? "bg-blue-500"
                        : "bg-orange-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blood-600" />
            ম্যাপ ওভারভিউ
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/admin/map">
              বড় ম্যাপ
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <MockMap height="400px" />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>দ্রুত কার্যক্রম</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              asChild
            >
              <Link href="/dashboard/admin/requests">
                <ClipboardList className="h-6 w-6 text-blood-600" />
                <span>সব অনুরোধ</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              asChild
            >
              <Link href="/dashboard/admin/volunteers">
                <UserCheck className="h-6 w-6 text-purple-600" />
                <span>স্বেচ্ছাসেবক</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              asChild
            >
              <Link href="/dashboard/admin/donors">
                <Heart className="h-6 w-6 text-blood-600" />
                <span>রক্তদাতা</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              asChild
            >
              <Link href="/dashboard/admin/analytics">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <span>বিশ্লেষণ</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


