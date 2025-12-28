import { z } from "zod";
import { BloodGroup, UrgencyLevel, Gender } from "@/lib/supabase/types";

export const bloodRequestSchema = z.object({
  // Requester Information
  requester_name: z.string().min(3, "নাম কমপক্ষে ৩ অক্ষরের হতে হবে"),
  requester_phone: z.string().regex(/^(\+88)?01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)"),
  requester_email: z.string().email("সঠিক ইমেইল দিন").optional().or(z.literal("")),

  // Patient Information
  patient_name: z.string().min(1, "রোগীর নাম প্রয়োজন"),
  patient_age: z.coerce.number().min(0, "সঠিক বয়স দিন").optional(),
  patient_gender: z.enum(["male", "female", "other"] as [string, ...string[]]).optional(),
  blood_group: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as [string, ...string[]], {
    required_error: "রক্তের গ্রুপ নির্বাচন করুন",
  }),
  disease_reason: z.string().optional(),
  units_required: z.coerce.number().min(1, "কমপক্ষে ১ ব্যাগ রক্ত প্রয়োজন").max(10, "সর্বোচ্চ ১০ ব্যাগ অনুরোধ করা যাবে"),

  // Urgency and Timing
  urgency: z.enum(["routine", "urgent", "emergency"] as [string, ...string[]], {
    required_error: "জরুরী অবস্থা নির্বাচন করুন",
  }),
  date_needed: z.string().min(1, "তারিখ প্রয়োজন"),
  time_needed: z.string().min(1, "সময় প্রয়োজন"),

  // Location Information
  location_name: z.string().min(1, "হাসপাতাল বা স্থানের নাম প্রয়োজন"),
  location_address: z.string().min(1, "ঠিকানা প্রয়োজন"),
  latitude: z.number({ required_error: "ম্যাপ থেকে লোকেশন নির্বাচন করুন" }),
  longitude: z.number({ required_error: "ম্যাপ থেকে লোকেশন নির্বাচন করুন" }),
  district: z.string().min(1, "জেলা নির্বাচন করুন"),
  division: z.string().optional(),
});


export type BloodRequestFormData = z.infer<typeof bloodRequestSchema>;

export const divisions = [
  { value: "dhaka", label: "ঢাকা" },
  { value: "chittagong", label: "চট্টগ্রাম" },
  { value: "rajshahi", label: "রাজশাহী" },
  { value: "khulna", label: "খুলনা" },
  { value: "barisal", label: "বরিশাল" },
  { value: "sylhet", label: "সিলেট" },
  { value: "rangpur", label: "রংপুর" },
  { value: "mymensingh", label: "ময়মনসিংহ" },
];

export const districtsByDivision: Record<string, { value: string; label: string }[]> = {
  dhaka: [
    { value: "dhaka", label: "ঢাকা" },
    { value: "gazipur", label: "গাজীপুর" },
    { value: "narayanganj", label: "নারায়ণগঞ্জ" },
    { value: "tangail", label: "টাঙ্গাইল" },
    { value: "faridpur", label: "ফরিদপুর" },
  ],
  chittagong: [
    { value: "chittagong", label: "চট্টগ্রাম" },
    { value: "coxsbazar", label: "কক্সবাজার" },
    { value: "comilla", label: "কুমিল্লা" },
    { value: "noakhali", label: "নোয়াখালী" },
    { value: "feni", label: "ফেনী" },
  ],
  rajshahi: [
    { value: "rajshahi", label: "রাজশাহী" },
    { value: "bogra", label: "বগুড়া" },
    { value: "pabna", label: "পাবনা" },
    { value: "sirajganj", label: "সিরাজগঞ্জ" },
  ],
  khulna: [
    { value: "khulna", label: "খুলনা" },
    { value: "jessore", label: "যশোর" },
    { value: "satkhira", label: "সাতক্ষীরা" },
    { value: "kushtia", label: "কুষ্টিয়া" },
  ],
  barisal: [
    { value: "barisal", label: "বরিশাল" },
    { value: "patuakhali", label: "পটুয়াখালী" },
    { value: "bhola", label: "ভোলা" },
  ],
  sylhet: [
    { value: "sylhet", label: "সিলেট" },
    { value: "sunamganj", label: "সুনামগঞ্জ" },
    { value: "habiganj", label: "হবিগঞ্জ" },
    { value: "moulvibazar", label: "মৌলভীবাজার" },
  ],
  rangpur: [
    { value: "rangpur", label: "রংপুর" },
    { value: "dinajpur", label: "দিনাজপুর" },
    { value: "kurigram", label: "কুড়িগ্রাম" },
  ],
  mymensingh: [
    { value: "mymensingh", label: "ময়মনসিংহ" },
    { value: "jamalpur", label: "জামালপুর" },
    { value: "netrokona", label: "নেত্রকোণা" },
    { value: "sherpur", label: "শেরপুর" },
  ],
};
