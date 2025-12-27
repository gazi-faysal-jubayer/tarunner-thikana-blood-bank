"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Droplet, Heart, Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Use Supabase Auth Magic Link (OTP via email)
    try {
      // In production, this would use Supabase Auth:
      // const { data, error } = await supabase.auth.signInWithOtp({ email })
      
      // Mock implementation for now
      setTimeout(() => {
        setEmailSent(true);
        toast({
          title: "ইমেইল পাঠানো হয়েছে ✓",
          description: "আপনার ইমেইলে একটি লগইন লিংক পাঠানো হয়েছে",
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "লগইন লিংক পাঠাতে সমস্যা হয়েছে",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blood-50 via-white to-blood-100 py-12 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blood-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blood-300 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          হোমে ফিরে যান
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blood-100 rounded-full flex items-center justify-center mb-4 relative">
              <Droplet className="h-8 w-8 text-blood-600 fill-blood-200" />
              <Heart className="absolute -bottom-1 -right-1 h-5 w-5 text-blood-500 fill-blood-500" />
            </div>
            <CardTitle className="text-2xl">লগইন করুন</CardTitle>
            <CardDescription>
              আপনার অ্যাকাউন্টে প্রবেশ করুন
            </CardDescription>
          </CardHeader>

          <CardContent>
            {emailSent ? (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">ইমেইল পাঠানো হয়েছে!</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>{email}</strong> এ একটি লগইন লিংক পাঠানো হয়েছে।
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    আপনার ইমেইল চেক করুন এবং লিংকে ক্লিক করুন।
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="mt-4"
                >
                  ভিন্ন ইমেইল ব্যবহার করুন
                </Button>
              </div>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">ইমেইল অ্যাড্রেস</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    আমরা আপনার ইমেইলে একটি লগইন লিংক পাঠাব (পাসওয়ার্ড প্রয়োজন নেই)
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="blood"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      লিংক পাঠানো হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      লগইন লিংক পাঠান
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">অ্যাকাউন্ট নেই? </span>
              <Link href="/register" className="text-blood-600 hover:underline font-medium">
                রক্তদাতা হিসেবে নিবন্ধন করুন
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

