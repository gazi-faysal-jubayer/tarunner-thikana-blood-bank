-- Routes table for storing navigation routes between donors/volunteers and hospitals
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  
  -- Route geometry and path data
  geometry JSONB NOT NULL, -- GeoJSON LineString
  waypoints JSONB DEFAULT '[]'::jsonb, -- Array of intermediate stops
  
  -- Distance and duration metrics
  distance NUMERIC(10,2) NOT NULL, -- meters
  duration NUMERIC(10,2) NOT NULL, -- seconds (estimated without traffic)
  traffic_duration NUMERIC(10,2), -- seconds (with traffic)
  
  -- Route profile and settings
  profile TEXT NOT NULL DEFAULT 'driving' CHECK (profile IN ('driving', 'driving-traffic', 'walking', 'cycling')),
  
  -- Start and end coordinates
  start_location JSONB NOT NULL, -- { latitude, longitude, address }
  end_location JSONB NOT NULL, -- { latitude, longitude, address }
  
  -- Turn-by-turn steps
  steps JSONB DEFAULT '[]'::jsonb,
  
  -- Alternative routes
  alternatives JSONB DEFAULT '[]'::jsonb, -- Array of alternative route data
  
  -- Status and tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'deviated')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Navigation state
  current_step_index INTEGER DEFAULT 0,
  last_position JSONB, -- { latitude, longitude, timestamp, bearing, speed }
  deviation_count INTEGER DEFAULT 0,
  
  -- ETA tracking
  original_eta TIMESTAMPTZ,
  current_eta TIMESTAMPTZ,
  last_eta_update TIMESTAMPTZ,
  
  -- Caching
  cache_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
  
  -- Sharing
  share_token TEXT UNIQUE,
  share_expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX routes_assignment_idx ON public.routes(assignment_id);
CREATE INDEX routes_status_idx ON public.routes(status);
CREATE INDEX routes_active_idx ON public.routes(is_active) WHERE is_active = true;
CREATE INDEX routes_share_token_idx ON public.routes(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX routes_cache_expires_idx ON public.routes(cache_expires_at);

-- Trigger to update updated_at
CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Route history for tracking movements
CREATE TABLE public.route_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  latitude NUMERIC(10,8) NOT NULL,
  longitude NUMERIC(11,8) NOT NULL,
  bearing NUMERIC(6,2), -- Direction in degrees
  speed NUMERIC(6,2), -- km/h
  accuracy NUMERIC(8,2), -- meters
  altitude NUMERIC(10,2), -- meters
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_on_route BOOLEAN DEFAULT true,
  distance_from_route NUMERIC(10,2) -- meters (if deviated)
);

CREATE INDEX route_positions_route_idx ON public.route_positions(route_id);
CREATE INDEX route_positions_timestamp_idx ON public.route_positions(timestamp DESC);

-- Function to update route ETA based on current position
CREATE OR REPLACE FUNCTION update_route_eta()
RETURNS TRIGGER AS $$
DECLARE
  remaining_distance NUMERIC;
  avg_speed NUMERIC;
  estimated_seconds NUMERIC;
BEGIN
  -- Calculate average speed from last 5 positions
  SELECT AVG(speed) INTO avg_speed
  FROM (
    SELECT speed 
    FROM public.route_positions 
    WHERE route_id = NEW.route_id 
      AND speed > 0
    ORDER BY timestamp DESC 
    LIMIT 5
  ) recent_speeds;
  
  -- If we have speed data, update ETA
  IF avg_speed IS NOT NULL AND avg_speed > 0 THEN
    -- Get remaining distance (would need actual route calculation)
    -- For now, store last position in routes table
    UPDATE public.routes
    SET 
      last_position = jsonb_build_object(
        'latitude', NEW.latitude,
        'longitude', NEW.longitude,
        'timestamp', NEW.timestamp,
        'bearing', NEW.bearing,
        'speed', NEW.speed
      ),
      last_eta_update = NOW()
    WHERE id = NEW.route_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_route_eta
  AFTER INSERT ON public.route_positions
  FOR EACH ROW EXECUTE FUNCTION update_route_eta();

-- RLS Policies for routes
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_positions ENABLE ROW LEVEL SECURITY;

-- Routes: Users can view routes for their assignments
CREATE POLICY "Users can view their own routes"
  ON public.routes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.donors d ON a.assignee_id = d.id AND a.type = 'donor'
      JOIN public.profiles p ON d.user_id = p.id
      WHERE a.id = routes.assignment_id AND p.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.volunteers v ON a.assignee_id = v.id AND a.type = 'volunteer'
      JOIN public.profiles p ON v.user_id = p.id
      WHERE a.id = routes.assignment_id AND p.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'volunteer')
    )
    OR
    (share_token IS NOT NULL AND share_expires_at > NOW())
  );

-- Routes: Only volunteers and admins can create routes
CREATE POLICY "Volunteers and admins can create routes"
  ON public.routes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'volunteer')
    )
  );

-- Routes: Assignees can update their routes (for navigation state)
CREATE POLICY "Assignees can update their routes"
  ON public.routes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.donors d ON a.assignee_id = d.id AND a.type = 'donor'
      JOIN public.profiles p ON d.user_id = p.id
      WHERE a.id = routes.assignment_id AND p.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.volunteers v ON a.assignee_id = v.id AND a.type = 'volunteer'
      JOIN public.profiles p ON v.user_id = p.id
      WHERE a.id = routes.assignment_id AND p.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'volunteer')
    )
  );

-- Route positions: Similar access control
CREATE POLICY "Users can view their route positions"
  ON public.route_positions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.routes r
      JOIN public.assignments a ON r.assignment_id = a.id
      JOIN public.donors d ON a.assignee_id = d.id AND a.type = 'donor'
      JOIN public.profiles p ON d.user_id = p.id
      WHERE r.id = route_positions.route_id AND p.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'volunteer')
    )
  );

CREATE POLICY "Assignees can insert route positions"
  ON public.route_positions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.routes r
      JOIN public.assignments a ON r.assignment_id = a.id
      JOIN public.donors d ON a.assignee_id = d.id AND a.type = 'donor'
      JOIN public.profiles p ON d.user_id = p.id
      WHERE r.id = route_positions.route_id AND p.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'volunteer')
    )
  );
