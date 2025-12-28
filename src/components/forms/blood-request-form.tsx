"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { format, addHours, isBefore } from "date-fns";
import { Loader2, CalendarIcon, Clock, MapPin, User, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; // Assuming shadcn calendar exists
import { useToast } from "@/hooks/use-toast";
import { LocationPicker } from "@/components/LocationPicker";
import { createClient } from "@/lib/supabase/client";
import { bloodRequestSchema, type BloodRequestFormData } from "@/lib/validations/blood-request";
import { type BloodGroup, type Gender } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

// Generate tracking ID: BLD-YYYYMMDD-XXXX
const generateTrackingId = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `BLD-${date}-${random}`;
};

export function BloodRequestForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const form = useForm<BloodRequestFormData>({
    resolver: zodResolver(bloodRequestSchema),
    defaultValues: {
      requester_name: "",
      requester_phone: "",
      patient_name: "",
      units_required: 1,
      urgency: "urgent",
      date_needed: format(new Date(), "yyyy-MM-dd"), // Default today
      time_needed: "",
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
  const urgency = watch("urgency");

  const onSubmit = async (data: BloodRequestFormData) => {
    setIsSubmitting(true);
    try {
      // Calculate datetime_needed
      const datetime_needed = new Date(`${data.date_needed}T${data.time_needed}`);
      const now = new Date();

      // Determine emergency status automatically if < 6 hours or marked emergency
      const is_emergency =
        data.urgency === "emergency" ||
        isBefore(datetime_needed, addHours(now, 6));

      const tracking_id = generateTrackingId();

      const { error } = await supabase.from("blood_requests").insert({
        tracking_id,
        requester_name: data.requester_name,
        requester_phone: data.requester_phone,
        requester_email: data.requester_email || null,
        requester_type: "public" as const,
        patient_name: data.patient_name,
        patient_age: data.patient_age ?? null,
        patient_gender: (data.patient_gender as Gender) ?? null,
        blood_group: data.blood_group as BloodGroup,
        units_needed: data.units_required,
        reason: data.disease_reason || null,
        hospital_name: data.location_name,
        hospital_address: data.location_address,
        latitude: data.latitude,
        longitude: data.longitude,
        district: data.district || "Dhaka",
        division: data.division || "Dhaka",
        urgency: data.urgency === "emergency" ? "critical" : data.urgency === "routine" ? "normal" : "urgent",
        needed_by: datetime_needed.toISOString(), // Mapped to correct column
        status: "submitted",
        is_emergency,
        // datetime_needed removed as it does not exist
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Success
      toast({
        title: "অনুরোধ জমা হয়েছে",
        description: `আপনার ট্র্যাকিং আইডি: ${tracking_id}`,
      });

      router.push(`/request-blood/success?tracking_id=${tracking_id}`);

    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "ত্রুটি",
        description: "অনুরোধ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Requester Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-blood-600" />
            <h3 className="font-semibold text-lg">আবেদনকারীর তথ্য</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requester_name">আপনার নাম <span className="text-red-500">*</span></Label>
              <Input id="requester_name" {...register("requester_name")} placeholder="আপনার পুরো নাম" />
              {errors.requester_name && <p className="text-sm text-red-500">{errors.requester_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="requester_phone">মোবাইল নম্বর <span className="text-red-500">*</span></Label>
              <Input id="requester_phone" {...register("requester_phone")} placeholder="01XXXXXXXXX" />
              {errors.requester_phone && <p className="text-sm text-red-500">{errors.requester_phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="requester_email">ইমেইল (ঐচ্ছিক)</Label>
              <Input id="requester_email" {...register("requester_email")} placeholder="email@example.com" type="email" />
              {errors.requester_email && <p className="text-sm text-red-500">{errors.requester_email.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-blood-600" />
            <h3 className="font-semibold text-lg">রোগীর তথ্য</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient_name">রোগীর নাম <span className="text-red-500">*</span></Label>
              <Input id="patient_name" {...register("patient_name")} />
              {errors.patient_name && <p className="text-sm text-red-500">{errors.patient_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>রক্তের গ্রুপ <span className="text-red-500">*</span></Label>
              <Select onValueChange={(val) => setValue("blood_group", val as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="রক্তের গ্রুপ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.blood_group && <p className="text-sm text-red-500">{errors.blood_group.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="units_required">কত ব্যাগ রক্ত প্রয়োজন? <span className="text-red-500">*</span></Label>
              <Input
                id="units_required"
                type="number"
                min={1}
                max={10}
                {...register("units_required", { valueAsNumber: true })}
              />
              {errors.units_required && <p className="text-sm text-red-500">{errors.units_required.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="disease_reason">রোগ বা কারণ</Label>
              <Input id="disease_reason" {...register("disease_reason")} placeholder="যেমন: ডেঙ্গু, অপারেশন, থ্যালাসেমিয়া" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Urgency & Timing */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-blood-600" />
            <h3 className="font-semibold text-lg">সময় এবং জরুরি অবস্থা</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>জরুরি অবস্থা <span className="text-red-500">*</span></Label>
              <RadioGroup
                onValueChange={(val) => setValue("urgency", val as any)}
                defaultValue={urgency}
                className="grid md:grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="routine" id="routine" className="peer sr-only" />
                  <Label
                    htmlFor="routine"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blood-600 [&:has([data-state=checked])]:border-blood-600"
                  >
                    <span className="text-lg font-semibold">সাধারণ</span>
                    <span className="text-sm text-muted-foreground text-center mt-1">৩+ দিন পর প্রয়োজন</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="urgent" id="urgent" className="peer sr-only" />
                  <Label
                    htmlFor="urgent"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500"
                  >
                    <span className="text-lg font-semibold text-orange-600">জরুরি</span>
                    <span className="text-sm text-muted-foreground text-center mt-1">২৪-৭২ ঘন্টার মধ্যে</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="emergency" id="emergency" className="peer sr-only" />
                  <Label
                    htmlFor="emergency"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-600 [&:has([data-state=checked])]:border-red-600"
                  >
                    <span className="text-lg font-semibold text-red-600">অত্যন্ত জরুরি</span>
                    <span className="text-sm text-muted-foreground text-center mt-1">২৪ ঘন্টার মধ্যে</span>
                  </Label>
                </div>
              </RadioGroup>
              {errors.urgency && <p className="text-sm text-red-500">{errors.urgency.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_needed">কবে প্রয়োজন? <span className="text-red-500">*</span></Label>
                <Input type="date" id="date_needed" {...register("date_needed")} min={format(new Date(), "yyyy-MM-dd")} />
                {errors.date_needed && <p className="text-sm text-red-500">{errors.date_needed.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time_needed">কখন প্রয়োজন? <span className="text-red-500">*</span></Label>
                <Input type="time" id="time_needed" {...register("time_needed")} />
                {errors.time_needed && <p className="text-sm text-red-500">{errors.time_needed.message}</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-blood-600" />
            <h3 className="font-semibold text-lg">অবস্থান / হাসপাতাল</h3>
          </div>

          <LocationPicker
            onChange={(val) => {
              setValue("latitude", val.latitude);
              setValue("longitude", val.longitude);
              if (val.address) setValue("location_address", val.address);
              if (val.name) setValue("location_name", val.name);
              // Simple district extraction or default
              setValue("district", "Dhaka"); // TODO: Extract from address if possible
            }}
            error={errors.latitude?.message || errors.location_name?.message}
          />

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="location_name">হাসপাতাল/স্থানের নাম <span className="text-red-500">*</span></Label>
              <Input id="location_name" {...register("location_name")} placeholder="যেমন: ঢাকা মেডিকেল কলেজ" />
              {errors.location_name && <p className="text-sm text-red-500">{errors.location_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location_address">বিস্তারিত ঠিকানা <span className="text-red-500">*</span></Label>
              <Textarea id="location_address" {...register("location_address")} placeholder="রোড, হাউজ নং, এলাকা..." />
              {errors.location_address && <p className="text-sm text-red-500">{errors.location_address.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full bg-blood-600 hover:bg-blood-700 text-lg py-6" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            জমা দেওয়া হচ্ছে...
          </>
        ) : (
          "রক্তের অনুরোধ জমা দিন"
        )}
      </Button>
    </form>
  );
}
