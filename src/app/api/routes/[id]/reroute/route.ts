/**
 * Route Reroute API
 * Calculate new route when user deviates from original path
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  getTrafficAwareDirections,
  getDirectionsWithWaypoints,
  calculateETA,
} from '@/lib/map-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/routes/[id]/reroute - Calculate new route from current position
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
    const { 
      currentLatitude, 
      currentLongitude,
      preserveWaypoints = true,
    } = body;
    
    if (currentLatitude === undefined || currentLongitude === undefined) {
      return NextResponse.json({ error: 'Current position required' }, { status: 400 });
    }
    
    // Fetch existing route
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (routeError || !route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    const R: any = route;

    const endLocation = R.end_location as { latitude: number; longitude: number; address?: string };
    const currentPosition: [number, number] = [currentLongitude, currentLatitude];
    const destinationPosition: [number, number] = [endLocation.longitude, endLocation.latitude];
    
    // Calculate new route
    let newRouteData;
    
    if (preserveWaypoints && R.waypoints && (R.waypoints as any[]).length > 0) {
      // Filter waypoints that haven't been visited yet
      // (simplified - in production would check which waypoints are still ahead)
      const remainingWaypoints = R.waypoints as Array<{ latitude: number; longitude: number }>;
      const coordinates: Array<[number, number]> = [
        currentPosition,
        ...remainingWaypoints.map(wp => [wp.longitude, wp.latitude] as [number, number]),
        destinationPosition,
      ];
      
      newRouteData = await getDirectionsWithWaypoints(coordinates, {
        profile: R.profile as any || 'driving-traffic',
        language: 'bn',
      });
    } else {
      newRouteData = await getTrafficAwareDirections(
        currentPosition,
        destinationPosition,
        { language: 'bn', alternatives: false }
      );
    }
    
    if (!newRouteData) {
      return NextResponse.json({ error: 'Failed to calculate new route' }, { status: 500 });
    }
    
    const newEta = calculateETA(newRouteData.trafficDuration || newRouteData.duration);
    
    // Update route in database
    const { error: updateError } = await (supabase as any)
      .from('routes')
      .update({
        geometry: newRouteData.geometry,
        distance: newRouteData.distance,
        duration: newRouteData.duration,
        traffic_duration: newRouteData.trafficDuration,
        steps: newRouteData.steps || [],
        current_eta: newEta,
        current_step_index: 0,
        status: 'active',
        last_position: {
          latitude: currentLatitude,
          longitude: currentLongitude,
          timestamp: new Date().toISOString(),
        },
        cache_expires_at: new Date(Date.now() + 30 * 60 * 1000),
      })
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating route:', updateError);
      return NextResponse.json({ error: 'Failed to update route' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      routeId: id,
      newRoute: {
        geometry: newRouteData.geometry,
        distance: newRouteData.distance,
        duration: newRouteData.duration,
        trafficDuration: newRouteData.trafficDuration,
        steps: newRouteData.steps,
        eta: newEta.toISOString(),
      },
    });
  } catch (error) {
    console.error('Reroute error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
