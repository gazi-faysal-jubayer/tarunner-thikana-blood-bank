"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Droplet,
  Calendar,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

type UserRole = "admin" | "volunteer" | "donor";

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

interface DonorData {
  blood_group: string;
  district: string;
  address: string;
  is_available: boolean;
  total_donations: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase: any = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [donorData, setDonorData] = useState<DonorData | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    district: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (!data.success) {
        router.push("/login");
        return;
      }

      // Load full profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileData) {
        const p = profileData as any;
        setProfile({
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
          role: p.role,
          created_at: p.created_at,
        });
        setFormData((prev) => ({
          ...prev,
          full_name: p.full_name || "",
          phone: p.phone || "",
        }));
      }

      // Load donor data if user is a donor
      if (data.role === "donor") {
        const { data: donor } = await supabase
          .from("donors")
          .select("blood_group, district, address, is_available, total_donations")
          .eq("user_id", data.user.id)
          .single();

        if (donor) {
          const d = donor as any;
          setDonorData(d);
          setFormData((prev) => ({
            ...prev,
            address: d.address || "",
            district: d.district || "",
          }));
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      // Update donor data if applicable
      if (profile.role === "donor") {
        const { error: donorError } = await supabase
          .from("donors")
          .update({
            address: formData.address,
            district: formData.district,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", profile.id);

        if (donorError) throw donorError;
      }

      toast({
        title: "সফল",
        description: "প্রোফাইল আপডেট করা হয়েছে",
      });
    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const roleLabel: Record<UserRole, string> = {
    admin: "অ্যাডমিন",
    volunteer: "স্বেচ্ছাসেবক",
    donor: "রক্তদাতা",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blood-600" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-blood-600" />
          আমার প্রোফাইল
        </h1>
        <p className="text-muted-foreground">আপনার তথ্য দেখুন এবং আপডেট করুন</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-blood-100 text-blood-700 text-2xl">
                {profile.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle>{profile.full_name || "User"}</CardTitle>
          <CardDescription>{profile.email}</CardDescription>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant="outline">{roleLabel[profile.role]}</Badge>
            {donorData?.blood_group && (
              <Badge variant="destructive">{donorData.blood_group}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">পুরো নাম</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                }
                placeholder="আপনার নাম"
              />
            </div>

            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={profile.email}
                  readOnly
                  className="pl-10 bg-muted"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">ফোন নম্বর</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+880"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Donor specific fields */}
            {profile.role === "donor" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="district">জেলা</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, district: e.target.value }))
                      }
                      placeholder="জেলার নাম"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">ঠিকানা</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="পুরো ঠিকানা"
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <Droplet className="h-6 w-6 mx-auto mb-2 text-blood-600" />
                    <p className="text-2xl font-bold">{donorData?.total_donations || 0}</p>
                    <p className="text-sm text-muted-foreground">মোট রক্তদান</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">
                      {profile.created_at
                        ? new Date(profile.created_at).toLocaleDateString("bn-BD")
                        : "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">যোগদান</p>
                  </div>
                </div>
              </>
            )}

            {/* Save Button */}
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              সংরক্ষণ করুন
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



