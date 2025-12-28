/**
 * Route ETA API - Update and get real-time ETA
 * Handles ETA calculations based on current position
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  checkRouteDeviation, 
  calculateRemainingRoute,
  calculateETA,
  getTrafficAwareDirections,
} from '@/lib/map-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/routes/[id]/eta - Get current ETA for a route
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Allow public access with share token
    const { searchParams } = new URL(request.url);
    const shareToken = searchParams.get('token');
    
    let query = supabase
      .from('routes')
      .select('*')
      .eq('id', id);
    
    if (shareToken) {
      query = query.eq('share_token', shareToken).gt('share_expires_at', new Date().toISOString());
    }
    
    const { data: route, error } = await query.single();
    
    if (error || !route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }
    
    // Calculate remaining distance and time based on last position
      // Workaround: supabase generated types may cause `route` to be inferred as `never`.
      const R: any = route;

      // Calculate remaining distance and time based on last position
      let remainingInfo = {
        remainingDistance: R.distance,
        remainingDuration: R.traffic_duration || R.duration,
        progress: 0,
      };

      if (R.last_position) {
        const lastPos = R.last_position as {
          latitude: number;
          longitude: number;
          speed?: number;
        };

        remainingInfo = calculateRemainingRoute(
          [lastPos.longitude, lastPos.latitude],
          R.geometry as GeoJSON.LineString,
          R.distance,
          R.traffic_duration || R.duration,
          lastPos.speed ? lastPos.speed / 3.6 : undefined // Convert km/h to m/s
        );
      }
    
    const currentEta = calculateETA(remainingInfo.remainingDuration);
    
    return NextResponse.json({
      routeId: id,
      originalEta: R.original_eta,
      currentEta: currentEta.toISOString(),
      remainingDistance: remainingInfo.remainingDistance,
      remainingDuration: remainingInfo.remainingDuration,
      progress: remainingInfo.progress,
      status: R.status,
      lastUpdate: R.last_eta_update || R.updated_at,
    });
  } catch (error) {
    console.error('ETA GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/routes/[id]/eta - Update position and recalculate ETA
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { latitude, longitude, bearing, speed, accuracy, altitude } = body;
    
    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Position required' }, { status: 400 });
    }
    
    // Fetch route
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (routeError || !route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }
    
    // Check for deviation
      const R: any = route;

      // Check for deviation
      const deviation = checkRouteDeviation(
        [longitude, latitude],
        R.geometry as GeoJSON.LineString,
        R.current_step_index || 0
      );
    
    // Insert position record
    const { error: positionError } = await (supabase as any)
      .from('route_positions')
      .insert({
        route_id: id,
        latitude,
        longitude,
        bearing,
        speed,
        accuracy,
        altitude,
        is_on_route: deviation.isOnRoute,
        distance_from_route: deviation.distanceFromRoute,
      });
    
    if (positionError) {
      console.error('Error inserting position:', positionError);
    }
    
    // Calculate remaining route
      const remainingInfo = calculateRemainingRoute(
        [longitude, latitude],
        R.geometry as GeoJSON.LineString,
        R.distance,
        R.traffic_duration || R.duration,
        speed ? speed / 3.6 : undefined // Convert km/h to m/s
      );
    
    const newEta = calculateETA(remainingInfo.remainingDuration);
    
    // Update route with new position and ETA
    const updateData: any = {
      last_position: { latitude, longitude, bearing, speed, timestamp: new Date().toISOString() },
      current_eta: newEta.toISOString(),
      last_eta_update: new Date().toISOString(),
    };
    
    // Handle deviation
    if (deviation.shouldReroute) {
      updateData.deviation_count = (R.deviation_count || 0) + 1;
      updateData.status = 'deviated';
    }
    
    // Update status to active if still pending
    if (R.status === 'pending') {
      updateData.status = 'active';
      updateData.started_at = new Date().toISOString();
    }
    
    // Check if arrived (within 50m of destination)
    const endLocation = R.end_location as { latitude: number; longitude: number };
    const distanceToEnd = Math.sqrt(
      Math.pow((latitude - endLocation.latitude) * 111000, 2) +
      Math.pow((longitude - endLocation.longitude) * 111000 * Math.cos(latitude * Math.PI / 180), 2)
    );
    
    if (distanceToEnd < 50) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    }
    
    const { error: updateError } = await (supabase as any)
      .from('routes')
      .update(updateData)
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating route:', updateError);
    }
    
    // If significantly deviated, offer reroute
    let rerouteData = null;
    if (deviation.shouldReroute) {
      const endLoc = R.end_location as { latitude: number; longitude: number };
      rerouteData = await getTrafficAwareDirections(
        [longitude, latitude],
        [endLoc.longitude, endLoc.latitude],
        { language: 'bn' }
      );
    }
    
    return NextResponse.json({
      routeId: id,
      currentEta: newEta.toISOString(),
      remainingDistance: remainingInfo.remainingDistance,
      remainingDuration: remainingInfo.remainingDuration,
      progress: remainingInfo.progress,
      deviation: {
        isOnRoute: deviation.isOnRoute,
        distanceFromRoute: deviation.distanceFromRoute,
        shouldReroute: deviation.shouldReroute,
      },
      status: updateData.status || R.status,
      reroute: rerouteData ? {
        available: true,
        newDistance: rerouteData.distance,
        newDuration: rerouteData.trafficDuration || rerouteData.duration,
        geometry: rerouteData.geometry,
      } : null,
    });
  } catch (error) {
    console.error('ETA POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
