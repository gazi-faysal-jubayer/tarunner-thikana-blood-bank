"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Droplet,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  User,
  Building,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getStatusLabel, getStatusColor, formatDateTime } from "@/lib/utils";

interface TrackingData {
  trackingId: string;
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  hospitalName: string;
  district: string;
  division: string;
  neededBy: string;
  isEmergency: boolean;
  urgency: "critical" | "urgent" | "normal";
  status: string;
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    message: string;
  }>;
}

const statusSteps = [
  { key: "submitted", label: "জমা হয়েছে", icon: CheckCircle },
  { key: "approved", label: "অনুমোদিত", icon: CheckCircle },
  { key: "volunteer_assigned", label: "স্বেচ্ছাসেবক নিযুক্ত", icon: User },
  { key: "donor_assigned", label: "দাতা নিযুক্ত", icon: Droplet },
  { key: "donor_confirmed", label: "দাতা নিশ্চিত", icon: CheckCircle },
  { key: "completed", label: "সম্পন্ন", icon: CheckCircle },
];

function getStatusProgress(status: string): number {
  const statusIndex = statusSteps.findIndex((s) => s.key === status);
  if (statusIndex === -1) return 0;
  return ((statusIndex + 1) / statusSteps.length) * 100;
}

export default function TrackingPage({ params }: { params: Promise<{ trackingId: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/public/track/${resolvedParams.trackingId}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "অনুরোধ খুঁজে পাওয়া যায়নি");
      }
    } catch (err) {
      setError("সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [resolvedParams.trackingId]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blood-600 mx-auto" />
          <p className="mt-4 text-muted-foreground">তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">অনুরোধ খুঁজে পাওয়া যায়নি</h2>
            <p className="text-muted-foreground mb-4">
              {error || "এই ট্র্যাকিং আইডি দিয়ে কোনো অনুরোধ পাওয়া যায়নি।"}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link href="/track">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ফিরে যান
                </Link>
              </Button>
              <Button variant="blood" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                আবার চেষ্টা করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blood-50/50 to-white py-8">
      <div className="container max-w-3xl">
        {/* Back button */}
        <Button variant="ghost" className="mb-4" asChild>
          <Link href="/track">
            <ArrowLeft className="h-4 w-4 mr-2" />
            ফিরে যান
          </Link>
        </Button>

        {/* Header Card */}
        <Card className="mb-6 overflow-hidden">
          <div className={`p-6 ${data.isEmergency ? "bg-urgency-critical" : "bg-blood-600"} text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">ট্র্যাকিং আইডি</p>
                <h1 className="text-2xl font-bold">{data.trackingId}</h1>
              </div>
              <div className="text-right">
                <Badge
                  variant={data.urgency}
                  className="text-sm px-3 py-1"
                >
                  {data.urgency === "critical"
                    ? "জরুরি"
                    : data.urgency === "urgent"
                    ? "দ্রুত"
                    : "সাধারণ"}
                </Badge>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Blood Group */}
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-blood-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-3xl font-bold text-blood-600">
                    {data.bloodGroup}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.unitsNeeded} ব্যাগ প্রয়োজন
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>অগ্রগতি</span>
                <span className={getStatusColor(data.status).replace("bg-", "text-")}>
                  {getStatusLabel(data.status)}
                </span>
              </div>
              <Progress value={getStatusProgress(data.status)} className="h-2" />
            </div>

            <Separator className="my-6" />

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">হাসপাতাল</p>
                  <p className="font-medium">{data.hospitalName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">অবস্থান</p>
                  <p className="font-medium">
                    {data.district}, {data.division}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">প্রয়োজনের সময়</p>
                  <p className="font-medium">{formatDateTime(data.neededBy)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">অনুরোধের সময়</p>
                  <p className="font-medium">{formatDateTime(data.createdAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">অগ্রগতির টাইমলাইন</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {statusSteps.map((step, index) => {
                const isCompleted = statusSteps
                  .slice(0, index + 1)
                  .some((s) => s.key === data.status) ||
                  statusSteps.findIndex((s) => s.key === data.status) > index;
                const isCurrent = step.key === data.status;
                const timelineEvent = data.timeline?.find((t) => t.status === step.key);

                return (
                  <div
                    key={step.key}
                    className={`flex items-start gap-4 pb-6 ${
                      index < statusSteps.length - 1 ? "border-l-2 ml-3" : ""
                    } ${
                      isCompleted || isCurrent
                        ? "border-blood-300"
                        : "border-muted"
                    }`}
                  >
                    <div
                      className={`-ml-4 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCurrent
                          ? "bg-blood-600 text-white ring-4 ring-blood-100"
                          : isCompleted
                          ? "bg-blood-100 text-blood-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p
                        className={`font-medium ${
                          isCurrent
                            ? "text-blood-600"
                            : isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      {timelineEvent && (
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(timelineEvent.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            আপডেট দেখুন
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            প্রতি ৩০ সেকেন্ডে স্বয়ংক্রিয়ভাবে আপডেট হচ্ছে
          </p>
        </div>
      </div>
    </div>
  );
}



