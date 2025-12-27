"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Droplet,
  Heart,
  ArrowLeft,
  ArrowRight,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { divisions, districtsByDivision } from "@/lib/validations/blood-request";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genderOptions = [
  { value: "male", label: "পুরুষ" },
  { value: "female", label: "মহিলা" },
  { value: "other", label: "অন্যান্য" },
];

const steps = [
  { title: "ব্যক্তিগত তথ্য", icon: User },
  { title: "যোগাযোগ", icon: Phone },
  { title: "রক্তদান তথ্য", icon: Droplet },
];

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    weight: "",
    division: "",
    district: "",
    address: "",
    lastDonationDate: "",
    acceptTerms: false,
  });

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock registration - in production, use Supabase Auth
    setTimeout(() => {
      toast({
        title: "নিবন্ধন সফল!",
        description: "আপনি সফলভাবে রক্তদাতা হিসেবে নিবন্ধন করেছেন",
      });
      setIsLoading(false);
      router.push("/dashboard/donor");
    }, 1500);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blood-50 via-white to-blood-100 py-12 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blood-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blood-300 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="w-full max-w-lg relative">
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
              <Heart className="h-8 w-8 text-blood-600 fill-blood-200" />
            </div>
            <CardTitle className="text-2xl">রক্তদাতা হিসেবে নিবন্ধন করুন</CardTitle>
            <CardDescription>জীবন বাঁচাতে আমাদের সাথে যোগ দিন</CardDescription>

            {/* Progress */}
            <div className="mt-6">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-2">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className={`flex flex-col items-center ${
                      index <= currentStep
                        ? "text-blood-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index < currentStep
                          ? "bg-blood-600 text-white"
                          : index === currentStep
                          ? "bg-blood-100 text-blood-600 ring-2 ring-blood-600"
                          : "bg-muted"
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-xs mt-1 hidden sm:block">
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Info */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">পুরো নাম *</Label>
                    <Input
                      id="fullName"
                      placeholder="আপনার পুরো নাম"
                      value={formData.fullName}
                      onChange={(e) => updateFormData("fullName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">জন্ম তারিখ *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          updateFormData("dateOfBirth", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>লিঙ্গ *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => updateFormData("gender", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">ওজন (কেজি)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="৫০"
                      value={formData.weight}
                      onChange={(e) => updateFormData("weight", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      রক্তদানের জন্য সর্বনিম্ন ওজন ৫০ কেজি
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">মোবাইল নম্বর *</Label>
                    <Input
                      id="phone"
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">ইমেইল (ঐচ্ছিক)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">পাসওয়ার্ড *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="কমপক্ষে ৮ অক্ষর"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>বিভাগ *</Label>
                      <Select
                        value={formData.division}
                        onValueChange={(value) => {
                          updateFormData("division", value);
                          setSelectedDivision(value);
                          updateFormData("district", "");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="বিভাগ" />
                        </SelectTrigger>
                        <SelectContent>
                          {divisions.map((div) => (
                            <SelectItem key={div.value} value={div.value}>
                              {div.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>জেলা *</Label>
                      <Select
                        value={formData.district}
                        onValueChange={(value) => updateFormData("district", value)}
                        disabled={!selectedDivision}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="জেলা" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDivision &&
                            districtsByDivision[selectedDivision]?.map((dist) => (
                              <SelectItem key={dist.value} value={dist.value}>
                                {dist.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">সম্পূর্ণ ঠিকানা</Label>
                    <Input
                      id="address"
                      placeholder="বিস্তারিত ঠিকানা"
                      value={formData.address}
                      onChange={(e) => updateFormData("address", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Blood Donation Info */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>রক্তের গ্রুপ *</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {bloodGroups.map((group) => (
                        <button
                          key={group}
                          type="button"
                          onClick={() => updateFormData("bloodGroup", group)}
                          className={`p-3 rounded-lg border-2 text-center font-bold transition-all ${
                            formData.bloodGroup === group
                              ? "border-blood-600 bg-blood-50 text-blood-700"
                              : "border-border hover:border-blood-300"
                          }`}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastDonationDate">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      সর্বশেষ রক্তদানের তারিখ (যদি থাকে)
                    </Label>
                    <Input
                      id="lastDonationDate"
                      type="date"
                      value={formData.lastDonationDate}
                      onChange={(e) =>
                        updateFormData("lastDonationDate", e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      পুরুষ: ৩ মাস, মহিলা: ৪ মাস পর রক্তদান করা যায়
                    </p>
                  </div>

                  <div className="flex items-start gap-2 p-4 bg-blood-50 rounded-lg">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) =>
                        updateFormData("acceptTerms", !!checked)
                      }
                    />
                    <Label htmlFor="acceptTerms" className="text-sm cursor-pointer">
                      আমি শর্তাবলী এবং গোপনীয়তা নীতি পড়েছি এবং সম্মত আছি। আমি জরুরি
                      প্রয়োজনে রক্তদানের জন্য যোগাযোগ পেতে সম্মত।
                    </Label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  পিছনে
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button type="button" variant="blood" onClick={handleNext}>
                    পরবর্তী
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="blood"
                    disabled={isLoading || !formData.acceptTerms}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        নিবন্ধন হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4 mr-2" />
                        নিবন্ধন করুন
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">ইতোমধ্যে অ্যাকাউন্ট আছে? </span>
                <Link href="/login" className="text-blood-600 hover:underline font-medium">
                  লগইন করুন
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


