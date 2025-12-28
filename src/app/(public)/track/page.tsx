"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrackPage() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!trackingId.trim()) {
      setError("ট্র্যাকিং আইডি দিন");
      return;
    }

    // Validate format
    if (!trackingId.startsWith("BLD-")) {
      setError("সঠিক ট্র্যাকিং আইডি দিন (যেমন: BLD-20241226-A1B2)");
      return;
    }

    router.push(`/track/${trackingId.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-blood-50/50 to-white py-12">
      <div className="container max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blood-100 rounded-full flex items-center justify-center mb-4">
              <Droplet className="h-8 w-8 text-blood-600" />
            </div>
            <CardTitle className="text-2xl">অনুরোধ ট্র্যাক করুন</CardTitle>
            <p className="text-muted-foreground mt-2">
              আপনার রক্তের অনুরোধের বর্তমান অবস্থা দেখুন
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="ট্র্যাকিং আইডি (যেমন: BLD-20241226-A1B2)"
                  value={trackingId}
                  onChange={(e) => {
                    setTrackingId(e.target.value.toUpperCase());
                    setError("");
                  }}
                  className="text-center text-lg h-12"
                />
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
              </div>
              <Button type="submit" variant="blood" className="w-full h-12">
                <Search className="h-5 w-5 mr-2" />
                ট্র্যাক করুন
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                ট্র্যাকিং আইডি আপনার মোবাইলে SMS-এ পাঠানো হয়েছে। আপনি যদি SMS না
                পেয়ে থাকেন, অনুগ্রহ করে যোগাযোগ করুন।
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




