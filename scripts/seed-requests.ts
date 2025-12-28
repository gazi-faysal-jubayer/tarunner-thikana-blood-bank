
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { addDays, format } from 'date-fns';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Anon Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const generateTrackingId = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `BLD-${date}-${random}`;
};

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const districts = ["Dhaka", "Chittagong", "Sylhet", "Khulna", "Rajshahi"];
const urgencies = ["routine", "urgent", "emergency"];

const requests = [
    {
        patient_name: "Rahim Uddin",
        patient_age: 45,
        patient_gender: "male",
        blood_group: "A+",
        units_needed: 2,
        reason: "Surgery",
        hospital_name: "Dhaka Medical College",
        hospital_address: "Bakshibazar, Dhaka",
        district: "Dhaka",
        division: "Dhaka",
        urgency: "urgent",
        requester_name: "Karim Uddin",
        requester_phone: "01711111111",
        requester_type: "public",
        latitude: 23.7260,
        longitude: 90.3976
    },
    {
        patient_name: "Fatema Begum",
        patient_age: 30,
        patient_gender: "female",
        blood_group: "B-",
        units_needed: 1,
        reason: "Anemia",
        hospital_name: "Square Hospital",
        hospital_address: "Panthapath, Dhaka",
        district: "Dhaka",
        division: "Dhaka",
        urgency: "routine",
        requester_name: "Abdul Malek",
        requester_phone: "01811111111",
        requester_type: "public",
        latitude: 23.7531,
        longitude: 90.3912
    },
    {
        patient_name: "Kamal Hasan",
        patient_age: 55,
        patient_gender: "male",
        blood_group: "O+",
        units_needed: 3,
        reason: "Accident",
        hospital_name: "Chittagong Medical College",
        hospital_address: "KB Fazlul Kader Rd, Chittagong",
        district: "Chittagong",
        division: "Chittagong",
        urgency: "emergency",
        requester_name: "Jamal Hasan",
        requester_phone: "01911111111",
        requester_type: "public",
        latitude: 22.3590,
        longitude: 91.8215
    },
    {
        patient_name: "Sultana Razia",
        patient_age: 25,
        patient_gender: "female",
        blood_group: "AB+",
        units_needed: 1,
        reason: "Delivery",
        hospital_name: "Sylhet Osmani Medical",
        hospital_address: "Sylhet",
        district: "Sylhet",
        division: "Sylhet",
        urgency: "urgent",
        requester_name: "Rafiqul Islam",
        requester_phone: "01611111111",
        requester_type: "public",
        latitude: 24.9036,
        longitude: 91.8682
    },
    {
        patient_name: "Mokbul Hossain",
        patient_age: 60,
        patient_gender: "male",
        blood_group: "B+",
        units_needed: 2,
        reason: "Cancer Treatment",
        hospital_name: "Rajshahi Medical College",
        hospital_address: "Rajshahi",
        district: "Rajshahi",
        division: "Rajshahi",
        urgency: "routine",
        requester_name: "Sohag Miah",
        requester_phone: "01511111111",
        requester_type: "public",
        latitude: 24.3727,
        longitude: 88.5982
    },
    {
        patient_name: "Jasim Uddin",
        patient_age: 35,
        patient_gender: "male",
        blood_group: "A-",
        units_needed: 1,
        reason: "Dengue",
        hospital_name: "Kurmitola General Hospital",
        hospital_address: "Dhaka Cantonment",
        district: "Dhaka",
        division: "Dhaka",
        urgency: "urgent",
        requester_name: "Nasima Akter",
        requester_phone: "01722222222",
        requester_type: "public",
        latitude: 23.8180,
        longitude: 90.4100
    },
    {
        patient_name: "Nazma Khatun",
        patient_age: 28,
        patient_gender: "female",
        blood_group: "O-",
        units_needed: 2,
        reason: "Thalassemia",
        hospital_name: "BSMMU",
        hospital_address: "Shahbag, Dhaka",
        district: "Dhaka",
        division: "Dhaka",
        urgency: "routine",
        requester_name: "Shahidul Islam",
        requester_phone: "01822222222",
        requester_type: "public",
        latitude: 23.7389,
        longitude: 90.3957
    },
    {
        patient_name: "Rafiq Ahmed",
        patient_age: 50,
        patient_gender: "male",
        blood_group: "AB-",
        units_needed: 1,
        reason: "Kidney Dialysis",
        hospital_name: "Kidney Foundation",
        hospital_address: "Mirpur 2, Dhaka",
        district: "Dhaka",
        division: "Dhaka",
        urgency: "routine",
        requester_name: "Salma Begum",
        requester_phone: "01922222222",
        requester_type: "public",
        latitude: 23.8073,
        longitude: 90.3601
    },
    {
        patient_name: "Baby of Ayesha",
        patient_age: 0,
        patient_gender: "female",
        blood_group: "B+",
        units_needed: 1,
        reason: "Newborn Jaundice",
        hospital_name: "Shishu Hospital",
        hospital_address: "Agargaon, Dhaka",
        district: "Dhaka",
        division: "Dhaka",
        urgency: "emergency",
        requester_name: "Ayesha Siddiqua",
        requester_phone: "01622222222",
        requester_type: "public",
        latitude: 23.7744,
        longitude: 90.3725
    },
    {
        patient_name: "Faruk Hossain",
        patient_age: 40,
        patient_gender: "male",
        blood_group: "A+",
        units_needed: 2,
        reason: "Road Accident",
        hospital_name: "Trauma Center",
        hospital_address: "Shyamoli, Dhaka",
        district: "Dhaka",
        division: "Dhaka",
        urgency: "emergency",
        requester_name: "Bilkis Banu",
        requester_phone: "01522222222",
        requester_type: "public",
        latitude: 23.7720,
        longitude: 90.3650
    }
];

async function seed() {
    console.log('Seeding blood requests...');

    for (const req of requests) {
        const tracking_id = generateTrackingId();
        const date_needed = addDays(new Date(), Math.floor(Math.random() * 5)); // Random next 5 days
        const is_emergency = req.urgency === "emergency";

        // Map urgency to DB enum
        // urgency: "routine" | "urgent" | "critical" | "normal"
        // Schema: 'normal' | 'urgent' | 'critical'
        let dbUrgency = 'urgent';
        if (req.urgency === 'routine') dbUrgency = 'normal';
        if (req.urgency === 'emergency') dbUrgency = 'critical';

        const { error } = await supabase.from('blood_requests').insert({
            tracking_id,
            requester_name: req.requester_name,
            requester_phone: req.requester_phone,
            requester_type: req.requester_type,
            patient_name: req.patient_name,
            patient_age: req.patient_age,
            patient_gender: req.patient_gender,
            blood_group: req.blood_group,
            units_needed: req.units_needed,
            reason: req.reason,
            hospital_name: req.hospital_name,
            hospital_address: req.hospital_address,
            district: req.district,
            division: req.division,
            latitude: req.latitude,
            longitude: req.longitude,
            urgency: dbUrgency,
            is_emergency: is_emergency,
            needed_by: date_needed.toISOString(),
            status: 'submitted'
        });

        if (error) {
            console.error(`Error inserting request for ${req.patient_name}:`, error.message);
        } else {
            console.log(`Inserted request for ${req.patient_name}, Tracking ID: ${tracking_id}`);
        }
    }

    console.log('Seeding complete.');
}

seed().catch(console.error);
