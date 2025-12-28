/**
 * Route Share API
 * Generate and manage shareable route links
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// Use crypto.randomUUID() instead of uuid dependency
import { generateStaticMapUrl, generateShareableRouteLink } from '@/lib/map-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/routes/[id]/share - Generate a shareable link for a route
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
    const { expiresInHours = 24 } = body;
    
    // Fetch route
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (routeError || !route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    const R: any = route;

    // Generate share token
    const shareToken = typeof crypto !== 'undefined' && (crypto as any).randomUUID
      ? (crypto as any).randomUUID()
      : (await import('crypto')).randomUUID();
    const shareExpiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    
    // Update route with share token
    const { error: updateError } = await (supabase as any)
      .from('routes')
      .update({
        share_token: shareToken,
        share_expires_at: shareExpiresAt.toISOString(),
      })
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating route:', updateError);
      return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 });
    }
    
    // Generate URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const shareUrl = generateShareableRouteLink(id, shareToken, baseUrl);
    
    // Generate static map image
    const startLocation = R.start_location as { latitude: number; longitude: number };
    const endLocation = R.end_location as { latitude: number; longitude: number };

    const staticMapUrl = generateStaticMapUrl(R.geometry as GeoJSON.LineString, {
      startMarker: [startLocation.longitude, startLocation.latitude],
      endMarker: [endLocation.longitude, endLocation.latitude],
    });
    
    return NextResponse.json({
      success: true,
      shareUrl,
      shareToken,
      expiresAt: shareExpiresAt.toISOString(),
      staticMapUrl,
    });
  } catch (error) {
    console.error('Share route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/routes/[id]/share - Revoke share link
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Remove share token
    const { error } = await (supabase as any)
      .from('routes')
      .update({
        share_token: null,
        share_expires_at: null,
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error revoking share:', error);
      return NextResponse.json({ error: 'Failed to revoke share link' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Revoke share error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
