"use client";

import { useState } from "react";
import Link from "next/link";
import { Droplet, Heart, Lock, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Get form values
    const formData = new FormData(e.currentTarget);
    const formEmail = (formData.get("email") as string) || email;
    const formPassword = (formData.get("password") as string) || password;

    if (!formEmail || !formPassword) {
      toast({
        title: "ত্রুটি",
        description: "ইমেইল এবং পাসওয়ার্ড প্রয়োজন",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formEmail.trim(),
          password: formPassword,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast({
          title: "লগইন ব্যর্থ",
          description: result.error === "Invalid credentials" 
            ? "ভুল ইমেইল বা পাসওয়ার্ড"
            : result.error || "লগইন করতে সমস্যা হয়েছে",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Success - show message and redirect
      toast({
        title: "সফল ✓",
        description: `স্বাগতম, ${result.user.name || result.user.email}!`,
      });

      // All roles redirect to unified dashboard
      // The dashboard page will render role-specific content
      window.location.href = "/dashboard";

    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "ত্রুটি",
        description: "লগইন করতে সমস্যা হয়েছে",
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
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল অ্যাড্রেস</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
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
                    লগইন হচ্ছে...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    লগইন করুন
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">অ্যাকাউন্ট নেই? </span>
              <Link href="/register" className="text-blood-600 hover:underline font-medium">
                রক্তদাতা হিসেবে নিবন্ধন করুন
              </Link>
            </div>

            {/* Test credentials hint */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <p className="font-medium mb-1">টেস্ট অ্যাকাউন্ট:</p>
              <p>Admin: gazi.faysal.jubayer@gmail.com / Admin@123456</p>
              <p>Volunteer: volunteer1@blooddonation.org / Volunteer@123</p>
              <p>Donor: donor1@blooddonation.org / Donor@123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
