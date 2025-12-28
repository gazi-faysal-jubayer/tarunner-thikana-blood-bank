-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Custom types
CREATE TYPE user_role AS ENUM ('donor', 'volunteer', 'admin');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE gender AS ENUM ('male', 'female', 'other');
CREATE TYPE request_status AS ENUM (
  'submitted', 
  'approved', 
  'volunteer_assigned', 
  'donor_assigned', 
  'donor_confirmed', 
  'in_progress', 
  'completed', 
  'cancelled'
);
CREATE TYPE urgency_level AS ENUM ('critical', 'urgent', 'normal');
CREATE TYPE assignment_type AS ENUM ('volunteer', 'donor');
CREATE TYPE assignment_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
CREATE TYPE notification_channel AS ENUM ('sms', 'email', 'push', 'in_app');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed');
CREATE TYPE notification_type AS ENUM (
  'request_submitted',
  'request_approved',
  'volunteer_assigned',
  'donor_assigned',
  'donor_confirmed',
  'donation_completed',
  'emergency_alert',
  'reminder'
);

-- Users profile table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'donor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Donors table
CREATE TABLE public.donors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blood_group blood_group NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender NOT NULL,
  weight NUMERIC(5,2),
  location GEOGRAPHY(POINT, 4326),
  latitude NUMERIC(10,8) NOT NULL,
  longitude NUMERIC(11,8) NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  division TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  last_donation_date DATE,
  next_eligible_date DATE,
  total_donations INTEGER NOT NULL DEFAULT 0,
  notification_preferences JSONB NOT NULL DEFAULT '{"sms": true, "email": true, "push": true}'::jsonb,
  health_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create spatial index on donors location
CREATE INDEX donors_location_idx ON public.donors USING GIST(location);
CREATE INDEX donors_blood_group_idx ON public.donors(blood_group);
CREATE INDEX donors_available_idx ON public.donors(is_available) WHERE is_available = true;
CREATE INDEX donors_district_idx ON public.donors(district);

-- Volunteers table
CREATE TABLE public.volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id TEXT,
  location GEOGRAPHY(POINT, 4326),
  latitude NUMERIC(10,8) NOT NULL,
  longitude NUMERIC(11,8) NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  division TEXT NOT NULL,
  coverage_radius_km NUMERIC(5,2) NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requests_handled INTEGER NOT NULL DEFAULT 0,
  donations_facilitated INTEGER NOT NULL DEFAULT 0,
  success_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX volunteers_location_idx ON public.volunteers USING GIST(location);
CREATE INDEX volunteers_active_idx ON public.volunteers(is_active) WHERE is_active = true;
CREATE INDEX volunteers_district_idx ON public.volunteers(district);

-- Admins table
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL,
  department TEXT,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(employee_id)
);

-- Blood requests table
CREATE TABLE public.blood_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_id TEXT NOT NULL UNIQUE,
  requester_type TEXT NOT NULL DEFAULT 'public' CHECK (requester_type IN ('public', 'registered')),
  requester_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  requester_name TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  requester_email TEXT,
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  patient_gender gender,
  blood_group blood_group NOT NULL,
  units_needed INTEGER NOT NULL DEFAULT 1,
  hospital_name TEXT NOT NULL,
  hospital_address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  latitude NUMERIC(10,8) NOT NULL,
  longitude NUMERIC(11,8) NOT NULL,
  district TEXT NOT NULL,
  division TEXT NOT NULL,
  reason TEXT,
  needed_by TIMESTAMPTZ NOT NULL,
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  urgency urgency_level NOT NULL DEFAULT 'normal',
  status request_status NOT NULL DEFAULT 'submitted',
  assigned_volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX blood_requests_tracking_idx ON public.blood_requests(tracking_id);
CREATE INDEX blood_requests_status_idx ON public.blood_requests(status);
CREATE INDEX blood_requests_blood_group_idx ON public.blood_requests(blood_group);
CREATE INDEX blood_requests_urgency_idx ON public.blood_requests(urgency);
CREATE INDEX blood_requests_location_idx ON public.blood_requests USING GIST(location);
CREATE INDEX blood_requests_created_idx ON public.blood_requests(created_at DESC);
CREATE INDEX blood_requests_volunteer_idx ON public.blood_requests(assigned_volunteer_id);

-- Assignments table (for both volunteer and donor assignments)
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  type assignment_type NOT NULL,
  assignee_id UUID NOT NULL, -- References donors.id or volunteers.id based on type
  assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  status assignment_status NOT NULL DEFAULT 'pending',
  response_note TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX assignments_request_idx ON public.assignments(request_id);
CREATE INDEX assignments_type_idx ON public.assignments(type);
CREATE INDEX assignments_assignee_idx ON public.assignments(assignee_id);
CREATE INDEX assignments_status_idx ON public.assignments(status);

-- Donations table (completed donations)
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
  units_donated INTEGER NOT NULL DEFAULT 1,
  donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  donation_location TEXT,
  hemoglobin_level NUMERIC(4,2),
  blood_pressure TEXT,
  notes TEXT,
  certificate_id TEXT,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX donations_request_idx ON public.donations(request_id);
CREATE INDEX donations_donor_idx ON public.donations(donor_id);
CREATE INDEX donations_date_idx ON public.donations(donation_date DESC);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone TEXT,
  email TEXT,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  channel notification_channel NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user_idx ON public.notifications(user_id);
CREATE INDEX notifications_status_idx ON public.notifications(status);
CREATE INDEX notifications_created_idx ON public.notifications(created_at DESC);

-- Districts reference table (Bangladesh)
CREATE TABLE public.districts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  division TEXT NOT NULL,
  division_bn TEXT NOT NULL
);

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_donors_updated_at
  BEFORE UPDATE ON public.donors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_volunteers_updated_at
  BEFORE UPDATE ON public.volunteers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_blood_requests_updated_at
  BEFORE UPDATE ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger to update donor location geography from lat/lng
CREATE OR REPLACE FUNCTION update_donor_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_donor_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.donors
  FOR EACH ROW EXECUTE FUNCTION update_donor_location();

-- Trigger to update volunteer location geography from lat/lng
CREATE OR REPLACE FUNCTION update_volunteer_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_volunteer_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.volunteers
  FOR EACH ROW EXECUTE FUNCTION update_volunteer_location();

-- Trigger to update blood request location geography from lat/lng
CREATE OR REPLACE FUNCTION update_request_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_request_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION update_request_location();

-- Trigger to calculate urgency based on needed_by
CREATE OR REPLACE FUNCTION calculate_urgency()
RETURNS TRIGGER AS $$
DECLARE
  hours_diff NUMERIC;
BEGIN
  hours_diff = EXTRACT(EPOCH FROM (NEW.needed_by - NOW())) / 3600;
  
  IF hours_diff <= 6 OR NEW.is_emergency = true THEN
    NEW.urgency = 'critical';
    NEW.is_emergency = true;
  ELSIF hours_diff <= 24 THEN
    NEW.urgency = 'urgent';
  ELSE
    NEW.urgency = 'normal';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_request_urgency
  BEFORE INSERT OR UPDATE OF needed_by, is_emergency ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION calculate_urgency();

-- Trigger to update donor stats after donation
CREATE OR REPLACE FUNCTION update_donor_after_donation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.donors
  SET 
    total_donations = total_donations + NEW.units_donated,
    last_donation_date = NEW.donation_date,
    next_eligible_date = NEW.donation_date + INTERVAL '90 days'
  WHERE id = NEW.donor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_donation_insert
  AFTER INSERT ON public.donations
  FOR EACH ROW EXECUTE FUNCTION update_donor_after_donation();

-- Trigger to update volunteer stats after donation
CREATE OR REPLACE FUNCTION update_volunteer_after_donation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.volunteer_id IS NOT NULL THEN
    UPDATE public.volunteers
    SET donations_facilitated = donations_facilitated + 1
    WHERE id = NEW.volunteer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_donation_volunteer_update
  AFTER INSERT ON public.donations
  FOR EACH ROW EXECUTE FUNCTION update_volunteer_after_donation();

-- Function to find nearby donors
CREATE OR REPLACE FUNCTION find_nearby_donors(
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_blood_group blood_group,
  p_radius_km NUMERIC DEFAULT 10,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  donor_id UUID,
  user_id UUID,
  full_name TEXT,
  phone TEXT,
  blood_group blood_group,
  distance_km NUMERIC,
  is_available BOOLEAN,
  last_donation_date DATE,
  next_eligible_date DATE,
  total_donations INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as donor_id,
    d.user_id,
    p.full_name,
    p.phone,
    d.blood_group,
    ROUND((ST_Distance(
      d.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
    ) / 1000)::NUMERIC, 2) as distance_km,
    d.is_available,
    d.last_donation_date,
    d.next_eligible_date,
    d.total_donations
  FROM public.donors d
  JOIN public.profiles p ON d.user_id = p.id
  WHERE d.blood_group = p_blood_group
    AND d.is_available = true
    AND (d.next_eligible_date IS NULL OR d.next_eligible_date <= CURRENT_DATE)
    AND ST_DWithin(
      d.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to find nearby volunteers
CREATE OR REPLACE FUNCTION find_nearby_volunteers(
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_radius_km NUMERIC DEFAULT 20,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  volunteer_id UUID,
  user_id UUID,
  full_name TEXT,
  phone TEXT,
  distance_km NUMERIC,
  requests_handled INTEGER,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id as volunteer_id,
    v.user_id,
    p.full_name,
    p.phone,
    ROUND((ST_Distance(
      v.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
    ) / 1000)::NUMERIC, 2) as distance_km,
    v.requests_handled,
    v.success_rate
  FROM public.volunteers v
  JOIN public.profiles p ON v.user_id = p.id
  WHERE v.is_active = true
    AND ST_DWithin(
      v.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY distance_km ASC, v.success_rate DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Insert Bangladesh districts
INSERT INTO public.districts (name, name_bn, division, division_bn) VALUES
('Dhaka', 'ঢাকা', 'Dhaka', 'ঢাকা'),
('Gazipur', 'গাজীপুর', 'Dhaka', 'ঢাকা'),
('Narayanganj', 'নারায়ণগঞ্জ', 'Dhaka', 'ঢাকা'),
('Tangail', 'টাঙ্গাইল', 'Dhaka', 'ঢাকা'),
('Kishoreganj', 'কিশোরগঞ্জ', 'Dhaka', 'ঢাকা'),
('Manikganj', 'মানিকগঞ্জ', 'Dhaka', 'ঢাকা'),
('Munshiganj', 'মুন্সিগঞ্জ', 'Dhaka', 'ঢাকা'),
('Narsingdi', 'নরসিংদী', 'Dhaka', 'ঢাকা'),
('Rajbari', 'রাজবাড়ী', 'Dhaka', 'ঢাকা'),
('Madaripur', 'মাদারীপুর', 'Dhaka', 'ঢাকা'),
('Gopalganj', 'গোপালগঞ্জ', 'Dhaka', 'ঢাকা'),
('Faridpur', 'ফরিদপুর', 'Dhaka', 'ঢাকা'),
('Shariatpur', 'শরীয়তপুর', 'Dhaka', 'ঢাকা'),
('Chittagong', 'চট্টগ্রাম', 'Chittagong', 'চট্টগ্রাম'),
('Cox''s Bazar', 'কক্সবাজার', 'Chittagong', 'চট্টগ্রাম'),
('Comilla', 'কুমিল্লা', 'Chittagong', 'চট্টগ্রাম'),
('Brahmanbaria', 'ব্রাহ্মণবাড়িয়া', 'Chittagong', 'চট্টগ্রাম'),
('Chandpur', 'চাঁদপুর', 'Chittagong', 'চট্টগ্রাম'),
('Feni', 'ফেনী', 'Chittagong', 'চট্টগ্রাম'),
('Noakhali', 'নোয়াখালী', 'Chittagong', 'চট্টগ্রাম'),
('Lakshmipur', 'লক্ষ্মীপুর', 'Chittagong', 'চট্টগ্রাম'),
('Khagrachhari', 'খাগড়াছড়ি', 'Chittagong', 'চট্টগ্রাম'),
('Rangamati', 'রাঙ্গামাটি', 'Chittagong', 'চট্টগ্রাম'),
('Bandarban', 'বান্দরবান', 'Chittagong', 'চট্টগ্রাম'),
('Sylhet', 'সিলেট', 'Sylhet', 'সিলেট'),
('Moulvibazar', 'মৌলভীবাজার', 'Sylhet', 'সিলেট'),
('Habiganj', 'হবিগঞ্জ', 'Sylhet', 'সিলেট'),
('Sunamganj', 'সুনামগঞ্জ', 'Sylhet', 'সিলেট'),
('Rajshahi', 'রাজশাহী', 'Rajshahi', 'রাজশাহী'),
('Bogra', 'বগুড়া', 'Rajshahi', 'রাজশাহী'),
('Pabna', 'পাবনা', 'Rajshahi', 'রাজশাহী'),
('Sirajganj', 'সিরাজগঞ্জ', 'Rajshahi', 'রাজশাহী'),
('Natore', 'নাটোর', 'Rajshahi', 'রাজশাহী'),
('Naogaon', 'নওগাঁ', 'Rajshahi', 'রাজশাহী'),
('Chapainawabganj', 'চাঁপাইনবাবগঞ্জ', 'Rajshahi', 'রাজশাহী'),
('Joypurhat', 'জয়পুরহাট', 'Rajshahi', 'রাজশাহী'),
('Khulna', 'খুলনা', 'Khulna', 'খুলনা'),
('Jessore', 'যশোর', 'Khulna', 'খুলনা'),
('Satkhira', 'সাতক্ষীরা', 'Khulna', 'খুলনা'),
('Bagerhat', 'বাগেরহাট', 'Khulna', 'খুলনা'),
('Narail', 'নড়াইল', 'Khulna', 'খুলনা'),
('Magura', 'মাগুরা', 'Khulna', 'খুলনা'),
('Jhenaidah', 'ঝিনাইদহ', 'Khulna', 'খুলনা'),
('Chuadanga', 'চুয়াডাঙ্গা', 'Khulna', 'খুলনা'),
('Meherpur', 'মেহেরপুর', 'Khulna', 'খুলনা'),
('Kushtia', 'কুষ্টিয়া', 'Khulna', 'খুলনা'),
('Barisal', 'বরিশাল', 'Barisal', 'বরিশাল'),
('Patuakhali', 'পটুয়াখালী', 'Barisal', 'বরিশাল'),
('Pirojpur', 'পিরোজপুর', 'Barisal', 'বরিশাল'),
('Jhalokathi', 'ঝালকাঠি', 'Barisal', 'বরিশাল'),
('Barguna', 'বরগুনা', 'Barisal', 'বরিশাল'),
('Bhola', 'ভোলা', 'Barisal', 'বরিশাল'),
('Rangpur', 'রংপুর', 'Rangpur', 'রংপুর'),
('Dinajpur', 'দিনাজপুর', 'Rangpur', 'রংপুর'),
('Thakurgaon', 'ঠাকুরগাঁও', 'Rangpur', 'রংপুর'),
('Panchagarh', 'পঞ্চগড়', 'Rangpur', 'রংপুর'),
('Nilphamari', 'নীলফামারী', 'Rangpur', 'রংপুর'),
('Lalmonirhat', 'লালমনিরহাট', 'Rangpur', 'রংপুর'),
('Kurigram', 'কুড়িগ্রাম', 'Rangpur', 'রংপুর'),
('Gaibandha', 'গাইবান্ধা', 'Rangpur', 'রংপুর'),
('Mymensingh', 'ময়মনসিংহ', 'Mymensingh', 'ময়মনসিংহ'),
('Jamalpur', 'জামালপুর', 'Mymensingh', 'ময়মনসিংহ'),
('Sherpur', 'শেরপুর', 'Mymensingh', 'ময়মনসিংহ'),
('Netrokona', 'নেত্রকোণা', 'Mymensingh', 'ময়মনসিংহ');




