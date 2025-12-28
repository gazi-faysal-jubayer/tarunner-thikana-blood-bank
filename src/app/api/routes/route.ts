/**
 * Routes API - GET, POST routes
 * Handles route creation and retrieval for assignments
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  getTrafficAwareDirections, 
  getDirectionsWithWaypoints,
  calculateETA,
  generateStaticMapUrl 
} from '@/lib/map-utils';
import { randomUUID } from 'crypto';

// GET /api/routes - Get routes for an assignment or all routes
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const routeId = searchParams.get('routeId');
    const status = searchParams.get('status');
    
    // Build query based on parameters
    if (routeId) {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          assignments:assignment_id (
            id,
            type,
            status,
            request_id,
            blood_requests:request_id (
              id,
              tracking_id,
              blood_group,
              hospital_name,
              hospital_address,
              urgency
            )
          )
        `)
        .eq('id', routeId)
        .single();
      
      if (error) {
        console.error('Error fetching route:', error);
        return NextResponse.json({ error: 'Failed to fetch route' }, { status: 500 });
      }
      
      return NextResponse.json({ routes: [data] });
    }
    
    let query = supabase
      .from('routes')
      .select(`
        *,
        assignments:assignment_id (
          id,
          type,
          status,
          request_id,
          blood_requests:request_id (
            id,
            tracking_id,
            blood_group,
            hospital_name,
            hospital_address,
            urgency
          )
        )
      `)
      .order('created_at', { ascending: false });
    
    if (assignmentId) {
      query = query.eq('assignment_id', assignmentId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching routes:', error);
      return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 });
    }
    
    return NextResponse.json({ routes: data });
  } catch (error) {
    console.error('Routes GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/routes - Create a new route for an assignment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is volunteer or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const userRole = (profile as any)?.role;
    if (!userRole || !['admin', 'volunteer'].includes(userRole)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    const body = await request.json();
    const { 
      assignmentId, 
      startLocation, 
      endLocation, 
      waypoints = [],
      profile: routeProfile = 'driving-traffic',
      generateShareLink = false,
    } = body;
    
    if (!assignmentId || !startLocation || !endLocation) {
      return NextResponse.json({ 
        error: 'Missing required fields: assignmentId, startLocation, endLocation' 
      }, { status: 400 });
    }
    
    // Verify assignment exists
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('id, type, status, request_id')
      .eq('id', assignmentId)
      .single();
    
    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    
    // Build coordinates array with waypoints
    const coordinates: Array<[number, number]> = [
      [startLocation.longitude, startLocation.latitude],
      ...waypoints.map((wp: any) => [wp.longitude, wp.latitude] as [number, number]),
      [endLocation.longitude, endLocation.latitude],
    ];
    
    // Fetch route from Mapbox
    let routeData;
    if (waypoints.length > 0) {
      routeData = await getDirectionsWithWaypoints(coordinates, {
        profile: routeProfile as any,
        language: 'bn',
      });
    } else {
      routeData = await getTrafficAwareDirections(
        coordinates[0],
        coordinates[coordinates.length - 1],
        { language: 'bn', alternatives: true }
      );
    }
    
    if (!routeData) {
      return NextResponse.json({ error: 'Failed to calculate route' }, { status: 500 });
    }
    
    // Calculate ETA
    const eta = calculateETA(routeData.trafficDuration || routeData.duration);
    
    // Generate share token if requested
    let shareToken: string | null = null;
    let shareExpiresAt: Date | null = null;
    if (generateShareLink) {
      shareToken = randomUUID();
      shareExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }
    
    // Insert route into database
    const routeInsert = {
      assignment_id: assignmentId,
      geometry: routeData.geometry,
      waypoints: waypoints.length > 0 ? waypoints : null,
      distance: routeData.distance,
      duration: routeData.duration,
      traffic_duration: routeData.trafficDuration || null,
      profile: routeProfile,
      start_location: startLocation,
      end_location: endLocation,
      steps: routeData.steps || [],
      alternatives: [],
      status: 'pending',
      original_eta: eta,
      current_eta: eta,
      share_token: shareToken,
      share_expires_at: shareExpiresAt,
      cache_expires_at: new Date(Date.now() + 30 * 60 * 1000),
    };
    
    const { data: route, error: insertError } = await supabase
      .from('routes')
      .insert(routeInsert as any)
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting route:', insertError);
      return NextResponse.json({ error: 'Failed to save route' }, { status: 500 });
    }
    
    // Generate static map URL for sharing
    const staticMapUrl = generateStaticMapUrl(routeData.geometry, {
      startMarker: [startLocation.longitude, startLocation.latitude],
      endMarker: [endLocation.longitude, endLocation.latitude],
    });
    
    const routeResponse = route as Record<string, any>;
    
    return NextResponse.json({
      success: true,
      route: {
        ...routeResponse,
        staticMapUrl,
        shareUrl: shareToken 
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/track/route/${routeResponse.id}?token=${shareToken}`
          : null,
      },
    });
  } catch (error) {
    console.error('Routes POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/routes - Delete a route
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get('routeId');
    
    if (!routeId) {
      return NextResponse.json({ error: 'Route ID required' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', routeId);
    
    if (error) {
      console.error('Error deleting route:', error);
      return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Routes DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
