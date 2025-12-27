"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Mock data
const mockDonorData = {
  name: "মোহাম্মদ রাহিম",
  bloodGroup: "A+",
  totalDonations: 5,
  nextEligibleDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  lastDonationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
  isAvailable: true,
  assignedRequests: [
    {
      id: "1",
      trackingId: "BLD-20241226-A1B2",
      bloodGroup: "A+",
      hospitalName: "ঢাকা মেডিকেল কলেজ",
      urgency: "critical" as const,
      status: "donor_assigned",
      distance: 2.5,
    },
  ],
  recentDonations: [
    {
      id: "1",
      date: "২০২৪-১০-১৫",
      hospital: "স্কয়ার হাসপাতাল",
      units: 1,
    },
    {
      id: "2",
      date: "২০২৪-০৭-১০",
      hospital: "ঢাকা মেডিকেল কলেজ",
      units: 1,
    },
  ],
};

export default function DonorDashboardPage() {
  const [isAvailable, setIsAvailable] = useState(mockDonorData.isAvailable);

  const daysUntilEligible = Math.ceil(
    (mockDonorData.nextEligibleDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isEligible = daysUntilEligible <= 0;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blood-600 to-blood-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blood-100">স্বাগতম,</p>
              <h2 className="text-2xl font-bold">{mockDonorData.name}</h2>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
                  <Droplet className="h-5 w-5" />
                  <span className="font-bold">{mockDonorData.bloodGroup}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 fill-white" />
                  <span>{mockDonorData.totalDonations} বার রক্তদান</span>
                </div>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">রক্তদানে উপলব্ধ</span>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
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
                <p className="text-2xl font-bold">{mockDonorData.totalDonations} বার</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blood-100 flex items-center justify-center">
                <Heart className="h-6 w-6 text-blood-600 fill-blood-200" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              আপনি {mockDonorData.totalDonations * 3} টি জীবন বাঁচিয়েছেন! 🎉
            </p>
          </CardContent>
        </Card>

        {/* Active Assignments */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">সক্রিয় অনুরোধ</p>
                <p className="text-2xl font-bold">
                  {mockDonorData.assignedRequests.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            {mockDonorData.assignedRequests.length > 0 && (
              <Badge variant="critical" className="mt-2">
                জরুরি প্রতিক্রিয়া প্রয়োজন
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Request */}
      {mockDonorData.assignedRequests.length > 0 && (
        <Card className="border-blood-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blood-700">
              <AlertCircle className="h-5 w-5" />
              আপনার জন্য অনুরোধ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mockDonorData.assignedRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-4 p-4 bg-blood-50 rounded-xl"
              >
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    request.urgency === "critical"
                      ? "bg-urgency-critical animate-pulse"
                      : request.urgency === "urgent"
                      ? "bg-urgency-urgent"
                      : "bg-urgency-normal"
                  } text-white`}
                >
                  <span className="text-xl font-bold">{request.bloodGroup}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={request.urgency}>
                      {request.urgency === "critical" ? "জরুরি" : "দ্রুত"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {request.trackingId}
                    </span>
                  </div>
                  <p className="font-medium">{request.hospitalName}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{request.distance} কি.মি. দূরে</span>
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

      {/* Recent Donations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">সাম্প্রতিক রক্তদান</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/donor/history">
              সব দেখুন
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {mockDonorData.recentDonations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>এখনও কোনো রক্তদানের রেকর্ড নেই</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockDonorData.recentDonations.map((donation, index) => (
                <div key={donation.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blood-100 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-blood-600 fill-blood-200" />
                      </div>
                      <div>
                        <p className="font-medium">{donation.hospital}</p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {donation.date}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{donation.units} ব্যাগ</Badge>
                  </div>
                  {index < mockDonorData.recentDonations.length - 1 && (
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


