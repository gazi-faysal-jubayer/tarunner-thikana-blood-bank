"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MockMap } from "@/components/maps/mock-map";

// Mock data
const mockVolunteerData = {
  name: "আব্দুল করিম",
  requestsHandled: 45,
  donationsFacilitated: 38,
  successRate: 84,
  assignedRequests: [
    {
      id: "1",
      trackingId: "BLD-20241226-A1B2",
      bloodGroup: "A+",
      hospitalName: "ঢাকা মেডিকেল কলেজ",
      patientName: "মোঃ করিম",
      urgency: "critical" as const,
      status: "volunteer_assigned",
      unitsNeeded: 2,
      neededBy: "আজ সন্ধ্যা ৬টা",
      latitude: 23.8103,
      longitude: 90.4125,
    },
    {
      id: "2",
      trackingId: "BLD-20241226-C3D4",
      bloodGroup: "O-",
      hospitalName: "স্কয়ার হাসপাতাল",
      patientName: "ফাতেমা বেগম",
      urgency: "urgent" as const,
      status: "volunteer_assigned",
      unitsNeeded: 1,
      neededBy: "আগামীকাল সকাল",
      latitude: 23.78,
      longitude: 90.42,
    },
  ],
  nearbyDonors: 15,
};

export default function VolunteerDashboardPage() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">সক্রিয় অনুরোধ</p>
                <p className="text-2xl font-bold text-blood-600">
                  {mockVolunteerData.assignedRequests.length}
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
                <p className="text-2xl font-bold">{mockVolunteerData.requestsHandled}</p>
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
                  {mockVolunteerData.donationsFacilitated}
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
                <p className="text-2xl font-bold">{mockVolunteerData.successRate}%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <Progress value={mockVolunteerData.successRate} className="mt-2 h-1" />
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
              আপনার অনুরোধ
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/volunteer/requests">
                সব দেখুন
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockVolunteerData.assignedRequests.map((request) => (
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
                      {request.patientName} • {request.unitsNeeded} ব্যাগ
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{request.neededBy}</span>
                    </div>
                  </div>

                  <Button variant="blood" size="sm">
                    দাতা খুঁজুন
                  </Button>
                </div>
              </div>
            ))}

            {mockVolunteerData.assignedRequests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>কোনো সক্রিয় অনুরোধ নেই</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blood-600" />
              অনুরোধের অবস্থান
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MockMap
              markers={mockVolunteerData.assignedRequests.map((req) => ({
                id: req.id,
                type: "request" as const,
                latitude: req.latitude,
                longitude: req.longitude,
                bloodGroup: req.bloodGroup,
                urgency: req.urgency,
                title: req.hospitalName,
                subtitle: `${req.bloodGroup} • ${req.unitsNeeded} ব্যাগ`,
              }))}
              height="350px"
              selectedMarker={selectedRequest}
              onMarkerClick={(marker) => setSelectedRequest(marker.id)}
            />
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                <Users className="h-4 w-4 inline mr-1" />
                কাছাকাছি উপলব্ধ দাতা: {mockVolunteerData.nearbyDonors} জন
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/volunteer/map">
                  বড় ম্যাপ
                  <ArrowRight className="h-4 w-4 ml-1" />
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
              <Link href="/dashboard/volunteer/donors">
                <Users className="h-6 w-6 text-blood-600" />
                <span>রক্তদাতা খুঁজুন</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              asChild
            >
              <Link href="/dashboard/volunteer/map">
                <MapPin className="h-6 w-6 text-blood-600" />
                <span>ম্যাপ দেখুন</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <ClipboardList className="h-6 w-6 text-blood-600" />
              <span>রিপোর্ট তৈরি</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


