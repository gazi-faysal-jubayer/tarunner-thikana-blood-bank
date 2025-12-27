-- Migration: 00003_location_tracking_final.sql
-- Add location tracking capabilities for real-time donor tracking
-- Compatible with existing schema using assignee_id pattern

-- Enable PostGIS if not already enabled (for geographic data types)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add location tracking columns to assignments table
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS donor_current_location GEOGRAPHY(POINT, 4326),
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_in_transit BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS estimated_arrival_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS route_distance_km NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS route_duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS route_geometry GEOMETRY(LINESTRING, 4326);

-- Add indexes for location queries
CREATE INDEX IF NOT EXISTS idx_assignments_location 
ON assignments USING GIST (donor_current_location);

CREATE INDEX IF NOT EXISTS idx_assignments_in_transit 
ON assignments (is_in_transit) WHERE is_in_transit = TRUE;

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
  R CONSTANT DOUBLE PRECISION := 6371; -- Earth's radius in km
  dLat DOUBLE PRECISION;
  dLon DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  
  a := sin(dLat/2) * sin(dLat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dLon/2) * sin(dLon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update estimated arrival time
CREATE OR REPLACE FUNCTION update_estimated_arrival()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if donor location is updated and assignment is in transit
  IF NEW.donor_current_location IS NOT NULL 
     AND NEW.is_in_transit = TRUE 
     AND NEW.route_duration_minutes IS NOT NULL THEN
    
    NEW.estimated_arrival_time := NEW.last_location_update + 
                                   (NEW.route_duration_minutes || ' minutes')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update ETA
DROP TRIGGER IF EXISTS trigger_update_eta ON assignments;
CREATE TRIGGER trigger_update_eta
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  WHEN (NEW.donor_current_location IS NOT NULL)
  EXECUTE FUNCTION update_estimated_arrival();

-- Add location history table for tracking donor movement
CREATE TABLE IF NOT EXISTS location_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  accuracy_meters NUMERIC(10, 2),
  speed_kmh NUMERIC(10, 2),
  heading_degrees NUMERIC(5, 2),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for location history queries
CREATE INDEX IF NOT EXISTS idx_location_history_assignment 
ON location_history(assignment_id);

CREATE INDEX IF NOT EXISTS idx_location_history_recorded 
ON location_history(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_location_history_location 
ON location_history USING GIST(location);

-- View for active tracking (donors currently in transit)
-- Uses assignee_id and type='donor' to match existing schema
CREATE OR REPLACE VIEW active_tracking AS
SELECT 
  a.id as assignment_id,
  a.request_id,
  a.assignee_id,
  a.is_in_transit,
  a.donor_current_location,
  a.last_location_update,
  a.estimated_arrival_time,
  a.route_distance_km,
  a.route_duration_minutes,
  br.hospital_name,
  br.latitude as hospital_latitude,
  br.longitude as hospital_longitude,
  br.blood_group,
  br.urgency,
  p.full_name as donor_name,
  p.phone as donor_phone
FROM 
  assignments a
  JOIN blood_requests br ON a.request_id = br.id
  JOIN donors d ON a.assignee_id = d.id AND a.type = 'donor'
  JOIN profiles p ON d.user_id = p.id
WHERE 
  a.is_in_transit = TRUE
  AND a.donor_current_location IS NOT NULL
  AND a.status = 'pending';

-- Function to find nearby donors within radius
-- Drop existing function first to avoid signature conflicts
DROP FUNCTION IF EXISTS find_nearby_donors(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, TEXT);
CREATE OR REPLACE FUNCTION find_nearby_donors(
  target_lat DOUBLE PRECISION,
  target_lon DOUBLE PRECISION,
  radius_km DOUBLE PRECISION,
  blood_group_filter blood_group DEFAULT NULL
)
RETURNS TABLE (
  donor_id UUID,
  full_name TEXT,
  phone TEXT,
  blood_group blood_group,
  distance_km DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    p.full_name,
    p.phone,
    d.blood_group,
    calculate_distance_km(target_lat, target_lon, d.latitude, d.longitude) as distance_km,
    d.latitude,
    d.longitude
  FROM donors d
  JOIN profiles p ON d.user_id = p.id
  WHERE 
    d.is_available = TRUE
    AND (blood_group_filter IS NULL OR d.blood_group = blood_group_filter)
    AND calculate_distance_km(target_lat, target_lon, d.latitude, d.longitude) <= radius_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent location history for an assignment
DROP FUNCTION IF EXISTS get_location_history(UUID, INTEGER);
CREATE OR REPLACE FUNCTION get_location_history(
  assignment_uuid UUID,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  location_lat DOUBLE PRECISION,
  location_lon DOUBLE PRECISION,
  accuracy_meters NUMERIC,
  speed_kmh NUMERIC,
  heading_degrees NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ST_Y(location::geometry) as location_lat,
    ST_X(location::geometry) as location_lon,
    lh.accuracy_meters,
    lh.speed_kmh,
    lh.heading_degrees,
    lh.recorded_at
  FROM location_history lh
  WHERE lh.assignment_id = assignment_uuid
  ORDER BY lh.recorded_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to start tracking (set assignment to in-transit)
DROP FUNCTION IF EXISTS start_tracking(UUID);
CREATE OR REPLACE FUNCTION start_tracking(assignment_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE assignments 
  SET is_in_transit = TRUE
  WHERE id = assignment_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to stop tracking (set assignment to not in-transit)
DROP FUNCTION IF EXISTS stop_tracking(UUID);
CREATE OR REPLACE FUNCTION stop_tracking(assignment_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE assignments 
  SET 
    is_in_transit = FALSE,
    donor_current_location = NULL,
    last_location_update = NULL,
    estimated_arrival_time = NULL
  WHERE id = assignment_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON COLUMN assignments.donor_current_location IS 'Current GPS location of donor during transit';
COMMENT ON COLUMN assignments.is_in_transit IS 'Whether donor is currently traveling to hospital';
COMMENT ON COLUMN assignments.last_location_update IS 'Timestamp of last location update';
COMMENT ON COLUMN assignments.estimated_arrival_time IS 'Calculated ETA based on current location and distance';
COMMENT ON COLUMN assignments.route_distance_km IS 'Estimated road distance in kilometers';
COMMENT ON COLUMN assignments.route_duration_minutes IS 'Estimated travel time in minutes';
COMMENT ON COLUMN assignments.route_geometry IS 'LineString geometry of planned route';
COMMENT ON TABLE location_history IS 'Historical location data for donor tracking and analytics';
COMMENT ON VIEW active_tracking IS 'Real-time view of all donors currently in transit';
COMMENT ON FUNCTION find_nearby_donors IS 'Find available donors within specified radius of a location';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ Location tracking migration completed successfully!';
    RAISE NOTICE '✓ Added 7 columns to assignments table';
    RAISE NOTICE '✓ Created location_history table';
    RAISE NOTICE '✓ Created 5 utility functions';
    RAISE NOTICE '✓ Created active_tracking view';
    RAISE NOTICE '✓ All features ready for 3D map integration';
END $$;


