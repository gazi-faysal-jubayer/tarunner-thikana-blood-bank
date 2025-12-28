/**
 * Route Optimization API
 * Optimize routes for multiple donors to a single request
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  getOptimizedRoute, 
  getTrafficAwareDirections,
  calculateETA,
  calculateDistance,
} from '@/lib/map-utils';

// POST /api/routes/optimize - Optimize route for multiple stops
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
      requestId,
      donorIds,
      destination, // Hospital location
      optimizeOrder = true,
      includeIndividualRoutes = true,
    } = body;
    
    if (!requestId || !donorIds || !destination) {
      return NextResponse.json({ 
        error: 'Missing required fields: requestId, donorIds, destination' 
      }, { status: 400 });
    }
    
    if (donorIds.length < 1 || donorIds.length > 10) {
      return NextResponse.json({ 
        error: 'donorIds must contain 1-10 donors' 
      }, { status: 400 });
    }
    
    // Fetch donor locations
    const { data: donors, error: donorsError } = await supabase
      .from('donors')
      .select('id, user_id, latitude, longitude, address')
      .in('id', donorIds);
    
    if (donorsError || !donors || donors.length === 0) {
      return NextResponse.json({ error: 'Donors not found' }, { status: 404 });
    }
    const Donors: any[] = donors as any[];
    
    // Fetch blood request details
    const { data: request_, error: requestError } = await supabase
      .from('blood_requests')
      .select('id, hospital_name, hospital_address, latitude, longitude, urgency')
      .eq('id', requestId)
      .single();
    
    if (requestError || !request_) {
      return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
    }
    const Req: any = request_;

    // Build response
    const results: any = {
      requestId,
      destination: {
          name: Req.hospital_name,
          address: Req.hospital_address,
        coordinates: [destination.longitude, destination.latitude],
      },
      donors: [],
      optimizedRoute: null,
      individualRoutes: [],
    };
    
    // Calculate individual routes for each donor
    if (includeIndividualRoutes) {
      for (const donor of Donors) {
        const route = await getTrafficAwareDirections(
          [donor.longitude, donor.latitude],
          [destination.longitude, destination.latitude],
          { language: 'bn' }
        );
        
        if (route) {
          const eta = calculateETA(route.trafficDuration || route.duration);
          const straightLineDistance = calculateDistance(
            [donor.longitude, donor.latitude],
            [destination.longitude, destination.latitude]
          );
          
          results.individualRoutes.push({
            donorId: donor.id,
            startLocation: {
              latitude: donor.latitude,
              longitude: donor.longitude,
              address: donor.address,
            },
            distance: route.distance,
            duration: route.duration,
            trafficDuration: route.trafficDuration,
            straightLineDistance: straightLineDistance * 1000, // Convert to meters
            eta: eta.toISOString(),
            geometry: route.geometry,
            steps: route.steps,
            traffic: route.traffic,
          });
        }
      }
      
      // Sort by duration (fastest first)
      results.individualRoutes.sort((a: any, b: any) =>
        (a.trafficDuration || a.duration) - (b.trafficDuration || b.duration)
      );
    }
    
    // Calculate optimized multi-stop route if multiple donors
    if (optimizeOrder && donors.length > 1) {
      // Build coordinates: all donors + destination
      const donorCoords: Array<[number, number]> = Donors.map(d => [d.longitude, d.latitude]);
      const allCoords = [...donorCoords, [destination.longitude, destination.latitude] as [number, number]];
      
      const optimizedRoute = await getOptimizedRoute(allCoords, {
        profile: 'driving-traffic',
        language: 'bn',
        roundTrip: false,
        source: 'any',
        destination: 'last',
      });
      
      if (optimizedRoute) {
        // Map waypoints back to donor IDs
        const waypointOrder = optimizedRoute.waypoints?.map((wp, i) => {
          if (i === optimizedRoute.waypoints!.length - 1) {
            return { type: 'destination', location: wp };
          }
          // Find closest donor to this waypoint
          const closest = Donors.reduce((prev, curr) => {
            const prevDist = calculateDistance(
              [prev.longitude, prev.latitude],
              wp.coordinates
            );
            const currDist = calculateDistance(
              [curr.longitude, curr.latitude],
              wp.coordinates
            );
            return currDist < prevDist ? curr : prev;
          });
          return { type: 'donor', donorId: closest.id, location: wp };
        });
        
        results.optimizedRoute = {
          totalDistance: optimizedRoute.distance,
          totalDuration: optimizedRoute.duration,
          geometry: optimizedRoute.geometry,
          legs: optimizedRoute.legs,
          waypointOrder,
          eta: calculateETA(optimizedRoute.duration).toISOString(),
        };
      }
    }
    
    // Add summary statistics
    results.summary = {
      totalDonors: Donors.length,
      fastestDonor: results.individualRoutes[0]?.donorId || null,
      fastestEta: results.individualRoutes[0]?.eta || null,
      averageDuration: results.individualRoutes.length > 0
        ? results.individualRoutes.reduce((sum: number, r: any) => sum + (r.trafficDuration || r.duration), 0) / results.individualRoutes.length
        : 0,
    };
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Route optimization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/routes/optimize - Get optimization suggestions for a request
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    const maxDonors = parseInt(searchParams.get('maxDonors') || '5');
    const maxDistanceKm = parseFloat(searchParams.get('maxDistanceKm') || '20');
    
    if (!requestId) {
      return NextResponse.json({ error: 'requestId required' }, { status: 400 });
    }
    
    // Fetch blood request
    const { data: request_, error: requestError } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (requestError || !request_) {
      return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
    }
    const ReqData: any = request_;

    // Find nearby available donors with compatible blood
    const { data: donors, error: donorsError } = await supabase
      .from('donors')
      .select('id, user_id, blood_group, latitude, longitude, address, is_available, last_donation_date')
      .eq('blood_group', ReqData.blood_group)
      .eq('is_available', true);
    
    if (donorsError) {
      return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
    }
    
    // Filter by distance and sort
    const donorsWithDistance = ((donors || []) as any[])
      .map((donor: any) => ({
        ...donor,
        distance: calculateDistance(
          [donor.longitude, donor.latitude],
          [ReqData.longitude, ReqData.latitude]
        ),
      }))
      .filter(donor => donor.distance <= maxDistanceKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxDonors);
    
    return NextResponse.json({
      requestId,
      bloodGroup: ReqData.blood_group,
      hospital: {
        name: ReqData.hospital_name,
        address: ReqData.hospital_address,
        coordinates: [ReqData.longitude, ReqData.latitude],
      },
      suggestedDonors: donorsWithDistance.map(d => ({
        id: d.id,
        bloodGroup: d.blood_group,
        distance: d.distance,
        coordinates: [d.longitude, d.latitude],
        address: d.address,
        isAvailable: d.is_available,
      })),
      totalAvailable: donorsWithDistance.length,
    });
  } catch (error) {
    console.error('Route optimization GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
