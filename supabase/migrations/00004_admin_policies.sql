-- Migration: 00004_admin_policies.sql
-- Add admin-specific RLS policies with full system access

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check specific permission
CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admins 
    WHERE admins.user_id = user_id 
    AND permission = ANY(permissions)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for blood_requests table
CREATE POLICY "Admins can view all requests"
  ON public.blood_requests FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all requests"
  ON public.blood_requests FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete requests"
  ON public.blood_requests FOR DELETE
  USING (is_admin(auth.uid()));

-- Admin policies for donors table
CREATE POLICY "Admins can view all donors"
  ON public.donors FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all donors"
  ON public.donors FOR UPDATE
  USING (is_admin(auth.uid()));

-- Admin policies for volunteers table
CREATE POLICY "Admins can view all volunteers"
  ON public.volunteers FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all volunteers"
  ON public.volunteers FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert volunteers"
  ON public.volunteers FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Admin policies for assignments table
CREATE POLICY "Admins can view all assignments"
  ON public.assignments FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update assignments"
  ON public.assignments FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete assignments"
  ON public.assignments FOR DELETE
  USING (is_admin(auth.uid()));

-- Admin policies for donations table
CREATE POLICY "Admins can view all donations"
  ON public.donations FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update donations"
  ON public.donations FOR UPDATE
  USING (is_admin(auth.uid()));

-- Admin policies for notifications table
CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Admin policies for profiles table
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- Admin policies for admins table
CREATE POLICY "Admins can view other admins"
  ON public.admins FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update other admins"
  ON public.admins FOR UPDATE
  USING (is_admin(auth.uid()) AND has_permission(auth.uid(), 'system.admin'));

CREATE POLICY "Admins can create other admins"
  ON public.admins FOR INSERT
  WITH CHECK (is_admin(auth.uid()) AND has_permission(auth.uid(), 'system.admin'));

-- Admin policies for location_history table
CREATE POLICY "Admins can view all location history"
  ON public.location_history FOR SELECT
  USING (is_admin(auth.uid()));

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.admins(user_id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_admin ON public.admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON public.admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_entity ON public.admin_activity_logs(entity_type, entity_id);

-- RLS for admin activity logs
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity logs"
  ON public.admin_activity_logs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert activity logs"
  ON public.admin_activity_logs FOR INSERT
  WITH CHECK (true);

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_activity_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    details,
    created_at
  )
  VALUES (
    p_admin_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_details,
    NOW()
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.admin_activity_logs TO authenticated;
GRANT INSERT ON public.admin_activity_logs TO authenticated;

COMMENT ON TABLE public.admin_activity_logs IS 'Audit log of all admin actions for security and compliance';
COMMENT ON FUNCTION public.is_admin IS 'Check if a user has admin role';
COMMENT ON FUNCTION public.has_permission IS 'Check if admin has specific permission';
COMMENT ON FUNCTION public.log_admin_action IS 'Log admin actions for audit trail';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ Admin RLS policies created successfully!';
    RAISE NOTICE '✓ Admin helper functions created';
    RAISE NOTICE '✓ Admin activity logging enabled';
    RAISE NOTICE '✓ Admins now have full system access';
END $$;

