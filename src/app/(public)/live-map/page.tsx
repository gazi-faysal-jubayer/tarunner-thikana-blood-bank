"use client";

import { useState } from "react";
import { MapPin, Filter, Droplet, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MockMap } from "@/components/maps/mock-map";

const bloodGroups = ["সব", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const urgencyLevels = [
  { value: "all", label: "সব" },
  { value: "critical", label: "জরুরি" },
  { value: "urgent", label: "দ্রুত" },
  { value: "normal", label: "সাধারণ" },
];

// Mock request data
const mockRequests = [
  {
    id: "1",
    type: "request" as const,
    latitude: 23.8103,
    longitude: 90.4125,
    bloodGroup: "A+",
    urgency: "critical" as const,
    title: "ঢাকা মেডিকেল কলেজ",
    subtitle: "২ ব্যাগ প্রয়োজন",
    timeAgo: "৫ মিনিট আগে",
  },
  {
    id: "2",
    type: "request" as const,
    latitude: 23.78,
    longitude: 90.42,
    bloodGroup: "O-",
    urgency: "urgent" as const,
    title: "স্কয়ার হাসপাতাল",
    subtitle: "১ ব্যাগ প্রয়োজন",
    timeAgo: "১৫ মিনিট আগে",
  },
  {
    id: "3",
    type: "request" as const,
    latitude: 23.75,
    longitude: 90.38,
    bloodGroup: "B+",
    urgency: "normal" as const,
    title: "ইউনাইটেড হাসপাতাল",
    subtitle: "৩ ব্যাগ প্রয়োজন",
    timeAgo: "৩০ মিনিট আগে",
  },
  {
    id: "4",
    type: "request" as const,
    latitude: 23.85,
    longitude: 90.4,
    bloodGroup: "AB+",
    urgency: "critical" as const,
    title: "ল্যাব এইড হাসপাতাল",
    subtitle: "১ ব্যাগ প্রয়োজন",
    timeAgo: "১০ মিনিট আগে",
  },
];

export default function LiveMapPage() {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("সব");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  // Filter requests based on selection
  const filteredRequests = mockRequests.filter((req) => {
    if (selectedBloodGroup !== "সব" && req.bloodGroup !== selectedBloodGroup)
      return false;
    if (selectedUrgency !== "all" && req.urgency !== selectedUrgency)
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-blood-600 text-white py-8">
        <div className="container">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-6 w-6" />
            <h1 className="text-2xl font-bold">লাইভ ম্যাপ</h1>
          </div>
          <p className="opacity-90">
            রিয়েল-টাইমে সক্রিয় রক্তের অনুরোধগুলো দেখুন
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container py-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">ফিল্টার:</span>
              </div>

              <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="রক্তের গ্রুপ" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="জরুরিতা" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="ml-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                রিফ্রেশ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="container pb-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <MockMap
              markers={filteredRequests}
              height="600px"
              onMarkerClick={(marker) => setSelectedMarker(marker.id)}
              selectedMarker={selectedMarker}
            />
          </div>

          {/* Request List */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blood-600" />
                  সক্রিয় অনুরোধ ({filteredRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    কোনো অনুরোধ পাওয়া যায়নি
                  </p>
                ) : (
                  filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedMarker === request.id
                          ? "border-blood-600 bg-blood-50"
                          : "hover:border-blood-300"
                      }`}
                      onClick={() => setSelectedMarker(request.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            request.urgency === "critical"
                              ? "bg-urgency-critical"
                              : request.urgency === "urgent"
                              ? "bg-urgency-urgent"
                              : "bg-urgency-normal"
                          } text-white`}
                        >
                          <span className="font-bold">{request.bloodGroup}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={request.urgency}
                              className="text-xs"
                            >
                              {request.urgency === "critical"
                                ? "জরুরি"
                                : request.urgency === "urgent"
                                ? "দ্রুত"
                                : "সাধারণ"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {request.timeAgo}
                            </span>
                          </div>
                          <p className="font-medium text-sm">{request.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {request.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">পরিসংখ্যান</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blood-50 rounded-lg">
                    <p className="text-2xl font-bold text-blood-600">
                      {mockRequests.filter((r) => r.urgency === "critical").length}
                    </p>
                    <p className="text-xs text-muted-foreground">জরুরি</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {mockRequests.filter((r) => r.urgency === "urgent").length}
                    </p>
                    <p className="text-xs text-muted-foreground">দ্রুত</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {mockRequests.filter((r) => r.urgency === "normal").length}
                    </p>
                    <p className="text-xs text-muted-foreground">সাধারণ</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">১২৫</p>
                    <p className="text-xs text-muted-foreground">উপলব্ধ দাতা</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


