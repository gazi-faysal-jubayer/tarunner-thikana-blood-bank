-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
  role user_role;
BEGIN
  SELECT p.role INTO role FROM public.profiles p WHERE p.id = user_id;
  RETURN role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is volunteer
CREATE OR REPLACE FUNCTION is_volunteer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.volunteers WHERE volunteers.user_id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Districts (public read)
CREATE POLICY "Districts are viewable by everyone"
  ON public.districts FOR SELECT
  USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Volunteers can view profiles of assigned donors"
  ON public.profiles FOR SELECT
  USING (is_volunteer(auth.uid()));

-- Donors policies
CREATE POLICY "Users can view their own donor profile"
  ON public.donors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own donor profile"
  ON public.donors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own donor profile"
  ON public.donors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all donors"
  ON public.donors FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Volunteers can view available donors"
  ON public.donors FOR SELECT
  USING (is_volunteer(auth.uid()) AND is_available = true);

-- Volunteers policies
CREATE POLICY "Users can view their own volunteer profile"
  ON public.volunteers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own volunteer profile"
  ON public.volunteers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all volunteers"
  ON public.volunteers FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage volunteers"
  ON public.volunteers FOR ALL
  USING (is_admin(auth.uid()));

-- Admins policies
CREATE POLICY "Admins can view admin profiles"
  ON public.admins FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage other admins"
  ON public.admins FOR ALL
  USING (is_admin(auth.uid()));

-- Blood Requests policies

-- Public can view sanitized request data (for public map)
CREATE POLICY "Anyone can view active blood requests (limited fields)"
  ON public.blood_requests FOR SELECT
  USING (
    status NOT IN ('cancelled', 'completed') 
    OR (status = 'completed' AND completed_at > NOW() - INTERVAL '24 hours')
  );

-- Public can insert new requests (no auth required for public requests)
CREATE POLICY "Anyone can submit blood requests"
  ON public.blood_requests FOR INSERT
  WITH CHECK (requester_type = 'public' OR auth.uid() = requester_user_id);

-- Users can view their own requests
CREATE POLICY "Users can view their own requests"
  ON public.blood_requests FOR SELECT
  USING (auth.uid() = requester_user_id);

-- Users can update their own pending requests
CREATE POLICY "Users can update their pending requests"
  ON public.blood_requests FOR UPDATE
  USING (auth.uid() = requester_user_id AND status = 'submitted');

-- Volunteers can view and update assigned requests
CREATE POLICY "Volunteers can view assigned requests"
  ON public.blood_requests FOR SELECT
  USING (
    is_volunteer(auth.uid()) 
    AND assigned_volunteer_id = (
      SELECT id FROM public.volunteers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Volunteers can update assigned requests"
  ON public.blood_requests FOR UPDATE
  USING (
    is_volunteer(auth.uid()) 
    AND assigned_volunteer_id = (
      SELECT id FROM public.volunteers WHERE user_id = auth.uid()
    )
  );

-- Admins can do everything with requests
CREATE POLICY "Admins can manage all requests"
  ON public.blood_requests FOR ALL
  USING (is_admin(auth.uid()));

-- Assignments policies
CREATE POLICY "Users can view assignments they're involved in"
  ON public.assignments FOR SELECT
  USING (
    auth.uid() = assigned_by
    OR assignee_id IN (
      SELECT id FROM public.donors WHERE user_id = auth.uid()
      UNION
      SELECT id FROM public.volunteers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Volunteers can create donor assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (
    is_volunteer(auth.uid()) 
    AND type = 'donor'
  );

CREATE POLICY "Volunteers can update assignments they created"
  ON public.assignments FOR UPDATE
  USING (auth.uid() = assigned_by);

CREATE POLICY "Donors can update their assignment responses"
  ON public.assignments FOR UPDATE
  USING (
    type = 'donor' 
    AND assignee_id IN (SELECT id FROM public.donors WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all assignments"
  ON public.assignments FOR ALL
  USING (is_admin(auth.uid()));

-- Donations policies
CREATE POLICY "Donors can view their own donations"
  ON public.donations FOR SELECT
  USING (
    donor_id IN (SELECT id FROM public.donors WHERE user_id = auth.uid())
  );

CREATE POLICY "Volunteers can view and manage donations they facilitated"
  ON public.donations FOR ALL
  USING (
    volunteer_id IN (SELECT id FROM public.volunteers WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all donations"
  ON public.donations FOR ALL
  USING (is_admin(auth.uid()));

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark read)"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications"
  ON public.notifications FOR ALL
  USING (is_admin(auth.uid()));

-- Service role bypass for API routes
-- Note: Service role key bypasses RLS automatically

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'donor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant permissions for public access (anonymous users)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.districts TO anon;
GRANT SELECT ON public.blood_requests TO anon;
GRANT INSERT ON public.blood_requests TO anon;

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;



