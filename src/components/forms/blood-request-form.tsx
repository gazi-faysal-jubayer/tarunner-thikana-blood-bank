"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Droplet,
  MapPin,
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  AlertCircle,
  Loader2,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  bloodRequestSchema,
  type BloodRequestFormValues,
  divisions,
  districtsByDivision,
} from "@/lib/validations/blood-request";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const genderOptions = [
  { value: "male", label: "পুরুষ" },
  { value: "female", label: "মহিলা" },
  { value: "other", label: "অন্যান্য" },
];

export function BloodRequestForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BloodRequestFormValues>({
    resolver: zodResolver(bloodRequestSchema),
    defaultValues: {
      unitsNeeded: 1,
      isEmergency: false,
      latitude: 23.8103, // Default to Dhaka
      longitude: 90.4125,
      division: "",
      district: "",
    },
  });

  const watchedIsEmergency = watch("isEmergency");
  const watchedBloodGroup = watch("bloodGroup");

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "ত্রুটি",
        description: "আপনার ব্রাউজার লোকেশন সাপোর্ট করে না",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", position.coords.latitude);
        setValue("longitude", position.coords.longitude);
        setIsLocating(false);
        toast({
          title: "সফল",
          description: "আপনার লোকেশন পাওয়া গেছে",
        });
      },
      (error) => {
        setIsLocating(false);
        toast({
          title: "ত্রুটি",
          description: "লোকেশন পেতে ব্যর্থ হয়েছে",
          variant: "destructive",
        });
        console.error(error);
      },
      { enableHighAccuracy: true }
    );
  };

  const onSubmit = async (data: BloodRequestFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/public/request-blood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "অনুরোধ জমা হয়েছে!",
          description: `ট্র্যাকিং আইডি: ${result.data.trackingId}`,
          variant: "default",
        });
        router.push(`/track/${result.data.trackingId}`);
      } else {
        throw new Error(result.error || "কিছু একটা ভুল হয়েছে");
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: error instanceof Error ? error.message : "অনুরোধ জমা দিতে ব্যর্থ হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Blood Group Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blood-700">
            <Droplet className="h-5 w-5" />
            রক্তের গ্রুপ নির্বাচন করুন
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {bloodGroups.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setValue("bloodGroup", group)}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all ${
                  watchedBloodGroup === group
                    ? "border-blood-600 bg-blood-50 ring-2 ring-blood-600 ring-offset-2"
                    : "border-border hover:border-blood-300 hover:bg-blood-50/50"
                }`}
              >
                <Droplet
                  className={`h-6 w-6 ${
                    watchedBloodGroup === group
                      ? "text-blood-600 fill-blood-200"
                      : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`mt-1 font-bold ${
                    watchedBloodGroup === group ? "text-blood-700" : "text-foreground"
                  }`}
                >
                  {group}
                </span>
              </button>
            ))}
          </div>
          {errors.bloodGroup && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.bloodGroup.message}
            </p>
          )}

          {/* Units needed */}
          <div className="mt-4 flex items-center gap-4">
            <Label htmlFor="unitsNeeded">কত ব্যাগ প্রয়োজন?</Label>
            <Select
              defaultValue="1"
              onValueChange={(value) => setValue("unitsNeeded", parseInt(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} ব্যাগ
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Toggle */}
      <Card className={watchedIsEmergency ? "border-urgency-critical" : ""}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Checkbox
              id="isEmergency"
              checked={watchedIsEmergency}
              onCheckedChange={(checked) => setValue("isEmergency", !!checked)}
              className="h-5 w-5"
            />
            <div className="flex-1">
              <Label htmlFor="isEmergency" className="text-base font-semibold cursor-pointer">
                এটি একটি জরুরি অনুরোধ
              </Label>
              <p className="text-sm text-muted-foreground">
                ৬ ঘণ্টার মধ্যে রক্ত প্রয়োজন হলে এটি নির্বাচন করুন
              </p>
            </div>
            {watchedIsEmergency && (
              <Badge variant="critical" className="animate-pulse">
                জরুরি
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            রোগীর তথ্য
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">রোগীর নাম *</Label>
              <Input
                id="patientName"
                placeholder="রোগীর পুরো নাম"
                {...register("patientName")}
                className={errors.patientName ? "border-destructive" : ""}
              />
              {errors.patientName && (
                <p className="text-sm text-destructive">{errors.patientName.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientAge">বয়স</Label>
                <Input
                  id="patientAge"
                  type="number"
                  placeholder="বয়স"
                  {...register("patientAge")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientGender">লিঙ্গ</Label>
                <Select onValueChange={(value) => setValue("patientGender", value as "male" | "female" | "other")}>
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
          </div>
        </CardContent>
      </Card>

      {/* Requester Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            যোগাযোগের তথ্য
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requesterName">আপনার নাম *</Label>
              <Input
                id="requesterName"
                placeholder="আপনার পুরো নাম"
                {...register("requesterName")}
                className={errors.requesterName ? "border-destructive" : ""}
              />
              {errors.requesterName && (
                <p className="text-sm text-destructive">{errors.requesterName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="requesterPhone">মোবাইল নম্বর *</Label>
              <Input
                id="requesterPhone"
                placeholder="01XXXXXXXXX"
                {...register("requesterPhone")}
                className={errors.requesterPhone ? "border-destructive" : ""}
              />
              {errors.requesterPhone && (
                <p className="text-sm text-destructive">{errors.requesterPhone.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="requesterEmail">
              <Mail className="h-4 w-4 inline mr-1" />
              ইমেইল (ঐচ্ছিক)
            </Label>
            <Input
              id="requesterEmail"
              type="email"
              placeholder="your@email.com"
              {...register("requesterEmail")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Hospital Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            হাসপাতালের তথ্য
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hospitalName">হাসপাতালের নাম *</Label>
            <Input
              id="hospitalName"
              placeholder="হাসপাতাল বা ক্লিনিকের নাম"
              {...register("hospitalName")}
              className={errors.hospitalName ? "border-destructive" : ""}
            />
            {errors.hospitalName && (
              <p className="text-sm text-destructive">{errors.hospitalName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="hospitalAddress">সম্পূর্ণ ঠিকানা *</Label>
            <Textarea
              id="hospitalAddress"
              placeholder="বিস্তারিত ঠিকানা লিখুন"
              {...register("hospitalAddress")}
              className={errors.hospitalAddress ? "border-destructive" : ""}
            />
            {errors.hospitalAddress && (
              <p className="text-sm text-destructive">{errors.hospitalAddress.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>বিভাগ *</Label>
              <Select
                onValueChange={(value) => {
                  setSelectedDivision(value);
                  setValue("division", value);
                  setValue("district", "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
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
                disabled={!selectedDivision}
                onValueChange={(value) => setValue("district", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="জেলা নির্বাচন করুন" />
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

          {/* Get Location Button */}
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGetLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              বর্তমান লোকেশন ব্যবহার করুন
            </Button>
            <span className="text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 inline mr-1" />
              অথবা ম্যাপে ক্লিক করুন
            </span>
          </div>

          {/* Hidden location fields */}
          <input type="hidden" {...register("latitude")} />
          <input type="hidden" {...register("longitude")} />
        </CardContent>
      </Card>

      {/* When Needed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            কবে রক্ত প্রয়োজন?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="neededBy">তারিখ ও সময় *</Label>
              <Input
                id="neededBy"
                type="datetime-local"
                {...register("neededBy")}
                className={errors.neededBy ? "border-destructive" : ""}
              />
              {errors.neededBy && (
                <p className="text-sm text-destructive">{errors.neededBy.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">কারণ (ঐচ্ছিক)</Label>
              <Input
                id="reason"
                placeholder="অপারেশন, দুর্ঘটনা, ইত্যাদি"
                {...register("reason")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          variant="blood"
          size="xl"
          disabled={isSubmitting}
          className="w-full md:w-auto min-w-[300px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              জমা হচ্ছে...
            </>
          ) : (
            <>
              <Droplet className="h-5 w-5 mr-2" />
              রক্তের অনুরোধ জমা দিন
            </>
          )}
        </Button>
      </div>
    </form>
  );
}



