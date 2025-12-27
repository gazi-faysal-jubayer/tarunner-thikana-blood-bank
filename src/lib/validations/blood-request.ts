import { z } from "zod";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const bloodRequestSchema = z.object({
  // Requester info
  requesterName: z
    .string()
    .min(2, "নাম কমপক্ষে ২ অক্ষর হতে হবে")
    .max(100, "নাম ১০০ অক্ষরের বেশি হতে পারবে না"),
  requesterPhone: z
    .string()
    .regex(
      /^(\+88)?01[3-9]\d{8}$/,
      "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)"
    ),
  requesterEmail: z
    .string()
    .email("সঠিক ইমেইল ঠিকানা দিন")
    .optional()
    .or(z.literal("")),

  // Patient info
  patientName: z
    .string()
    .min(2, "রোগীর নাম কমপক্ষে ২ অক্ষর হতে হবে")
    .max(100, "রোগীর নাম ১০০ অক্ষরের বেশি হতে পারবে না"),
  patientAge: z.coerce
    .number()
    .min(0, "বয়স ০ এর কম হতে পারবে না")
    .max(150, "বয়স ১৫০ এর বেশি হতে পারবে না")
    .optional(),
  patientGender: z.enum(["male", "female", "other"]).optional(),

  // Blood requirement
  bloodGroup: z.enum(bloodGroups, {
    required_error: "রক্তের গ্রুপ নির্বাচন করুন",
  }),
  unitsNeeded: z.coerce
    .number()
    .min(1, "কমপক্ষে ১ ব্যাগ প্রয়োজন")
    .max(10, "সর্বোচ্চ ১০ ব্যাগ অনুরোধ করা যাবে")
    .default(1),

  // Hospital info
  hospitalName: z
    .string()
    .min(2, "হাসপাতালের নাম দিন")
    .max(200, "হাসপাতালের নাম ২০০ অক্ষরের বেশি হতে পারবে না"),
  hospitalAddress: z
    .string()
    .min(5, "হাসপাতালের ঠিকানা দিন")
    .max(500, "ঠিকানা ৫০০ অক্ষরের বেশি হতে পারবে না"),

  // Location
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  district: z.string().min(1, "জেলা নির্বাচন করুন"),
  division: z.string().min(1, "বিভাগ নির্বাচন করুন"),

  // Additional info
  reason: z.string().max(500, "কারণ ৫০০ অক্ষরের বেশি হতে পারবে না").optional(),
  neededBy: z.coerce.date({
    required_error: "কবে রক্ত প্রয়োজন তা জানান",
  }),
  isEmergency: z.boolean().default(false),
});

export type BloodRequestFormValues = z.infer<typeof bloodRequestSchema>;

// Blood group compatibility data
export const bloodCompatibility: Record<string, string[]> = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"],
};

// Divisions of Bangladesh
export const divisions = [
  { value: "Dhaka", label: "ঢাকা", labelEn: "Dhaka" },
  { value: "Chittagong", label: "চট্টগ্রাম", labelEn: "Chittagong" },
  { value: "Rajshahi", label: "রাজশাহী", labelEn: "Rajshahi" },
  { value: "Khulna", label: "খুলনা", labelEn: "Khulna" },
  { value: "Barisal", label: "বরিশাল", labelEn: "Barisal" },
  { value: "Sylhet", label: "সিলেট", labelEn: "Sylhet" },
  { value: "Rangpur", label: "রংপুর", labelEn: "Rangpur" },
  { value: "Mymensingh", label: "ময়মনসিংহ", labelEn: "Mymensingh" },
];

// Districts by division
export const districtsByDivision: Record<string, Array<{ value: string; label: string }>> = {
  Dhaka: [
    { value: "Dhaka", label: "ঢাকা" },
    { value: "Gazipur", label: "গাজীপুর" },
    { value: "Narayanganj", label: "নারায়ণগঞ্জ" },
    { value: "Tangail", label: "টাঙ্গাইল" },
    { value: "Kishoreganj", label: "কিশোরগঞ্জ" },
    { value: "Manikganj", label: "মানিকগঞ্জ" },
    { value: "Munshiganj", label: "মুন্সিগঞ্জ" },
    { value: "Narsingdi", label: "নরসিংদী" },
    { value: "Rajbari", label: "রাজবাড়ী" },
    { value: "Madaripur", label: "মাদারীপুর" },
    { value: "Gopalganj", label: "গোপালগঞ্জ" },
    { value: "Faridpur", label: "ফরিদপুর" },
    { value: "Shariatpur", label: "শরীয়তপুর" },
  ],
  Chittagong: [
    { value: "Chittagong", label: "চট্টগ্রাম" },
    { value: "Cox's Bazar", label: "কক্সবাজার" },
    { value: "Comilla", label: "কুমিল্লা" },
    { value: "Brahmanbaria", label: "ব্রাহ্মণবাড়িয়া" },
    { value: "Chandpur", label: "চাঁদপুর" },
    { value: "Feni", label: "ফেনী" },
    { value: "Noakhali", label: "নোয়াখালী" },
    { value: "Lakshmipur", label: "লক্ষ্মীপুর" },
  ],
  Rajshahi: [
    { value: "Rajshahi", label: "রাজশাহী" },
    { value: "Bogra", label: "বগুড়া" },
    { value: "Pabna", label: "পাবনা" },
    { value: "Sirajganj", label: "সিরাজগঞ্জ" },
    { value: "Natore", label: "নাটোর" },
    { value: "Naogaon", label: "নওগাঁ" },
    { value: "Chapainawabganj", label: "চাঁপাইনবাবগঞ্জ" },
    { value: "Joypurhat", label: "জয়পুরহাট" },
  ],
  Khulna: [
    { value: "Khulna", label: "খুলনা" },
    { value: "Jessore", label: "যশোর" },
    { value: "Satkhira", label: "সাতক্ষীরা" },
    { value: "Bagerhat", label: "বাগেরহাট" },
    { value: "Narail", label: "নড়াইল" },
    { value: "Magura", label: "মাগুরা" },
    { value: "Jhenaidah", label: "ঝিনাইদহ" },
    { value: "Chuadanga", label: "চুয়াডাঙ্গা" },
    { value: "Meherpur", label: "মেহেরপুর" },
    { value: "Kushtia", label: "কুষ্টিয়া" },
  ],
  Barisal: [
    { value: "Barisal", label: "বরিশাল" },
    { value: "Patuakhali", label: "পটুয়াখালী" },
    { value: "Pirojpur", label: "পিরোজপুর" },
    { value: "Jhalokathi", label: "ঝালকাঠি" },
    { value: "Barguna", label: "বরগুনা" },
    { value: "Bhola", label: "ভোলা" },
  ],
  Sylhet: [
    { value: "Sylhet", label: "সিলেট" },
    { value: "Moulvibazar", label: "মৌলভীবাজার" },
    { value: "Habiganj", label: "হবিগঞ্জ" },
    { value: "Sunamganj", label: "সুনামগঞ্জ" },
  ],
  Rangpur: [
    { value: "Rangpur", label: "রংপুর" },
    { value: "Dinajpur", label: "দিনাজপুর" },
    { value: "Thakurgaon", label: "ঠাকুরগাঁও" },
    { value: "Panchagarh", label: "পঞ্চগড়" },
    { value: "Nilphamari", label: "নীলফামারী" },
    { value: "Lalmonirhat", label: "লালমনিরহাট" },
    { value: "Kurigram", label: "কুড়িগ্রাম" },
    { value: "Gaibandha", label: "গাইবান্ধা" },
  ],
  Mymensingh: [
    { value: "Mymensingh", label: "ময়মনসিংহ" },
    { value: "Jamalpur", label: "জামালপুর" },
    { value: "Sherpur", label: "শেরপুর" },
    { value: "Netrokona", label: "নেত্রকোণা" },
  ],
};


