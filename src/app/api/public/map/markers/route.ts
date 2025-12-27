import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // #region agent log
    const logEntry = {location:'api/public/map/markers/route.ts:5',message:'API GET request received',data:{url:request.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
    await fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry)}).catch(()=>{});
    // #endregion
    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get("bloodGroup");
    const urgency = searchParams.get("urgency");
    const bounds = searchParams.get("bounds"); // Format: "lat1,lng1,lat2,lng2"
    // #region agent log
    const logEntry2 = {location:'api/public/map/markers/route.ts:11',message:'Query params parsed',data:{bloodGroup,urgency,hasBounds:!!bounds},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
    await fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry2)}).catch(()=>{});
    // #endregion

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    // Build query
    let query = supabase
      .from("blood_requests")
      .select("id, tracking_id, blood_group, urgency, status, hospital_name, units_needed, latitude, longitude, created_at")
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .neq("status", "completed")
      .neq("status", "cancelled");

    // Filter by blood group
    if (bloodGroup && bloodGroup !== "all") {
      query = query.eq("blood_group", bloodGroup);
    }

    // Filter by urgency
    if (urgency && urgency !== "all") {
      query = query.eq("urgency", urgency);
    }

    const { data: requests, error } = await query.order("created_at", { ascending: false });
    // #region agent log
    const logEntry3 = {location:'api/public/map/markers/route.ts:46',message:'Database query result',data:{hasError:!!error,error:error?.message,requestsCount:requests?.length||0,requestsSample:requests?.[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
    await fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry3)}).catch(()=>{});
    // #endregion

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    let markers = (requests || []).map((req) => {
      const marker = {
        id: req.id,
        type: "request",
        latitude: parseFloat(req.latitude),
        longitude: parseFloat(req.longitude),
        bloodGroup: req.blood_group,
        urgency: req.urgency,
        status: req.status,
        title: req.hospital_name,
        subtitle: `${req.units_needed} ব্যাগ প্রয়োজন`,
        createdAt: req.created_at,
      };
      // #region agent log
      if (!marker.title || isNaN(marker.latitude) || isNaN(marker.longitude)) {
        const logEntry4 = {location:'api/public/map/markers/route.ts:53',message:'Marker with missing data',data:{marker,hasTitle:!!marker.title,hasLat:!isNaN(marker.latitude),hasLng:!isNaN(marker.longitude)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
        fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry4)}).catch(()=>{});
      }
      // #endregion
      return marker;
    });
    // #region agent log
    const logEntry5 = {location:'api/public/map/markers/route.ts:65',message:'Markers mapped',data:{markersCount:markers.length,markers},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
    await fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry5)}).catch(()=>{});
    // #endregion

    // Filter by map bounds
    if (bounds) {
      const [lat1, lng1, lat2, lng2] = bounds.split(",").map(Number);
      markers = markers.filter(
        (m) =>
          m.latitude >= Math.min(lat1, lat2) &&
          m.latitude <= Math.max(lat1, lat2) &&
          m.longitude >= Math.min(lng1, lng2) &&
          m.longitude <= Math.max(lng1, lng2)
      );
    }

    const response = {
      success: true,
      data: markers,
      total: markers.length,
    };
    // #region agent log
    const logEntry6 = {location:'api/public/map/markers/route.ts:78',message:'Returning success response',data:{success:response.success,dataLength:response.data.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
    await fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry6)}).catch(()=>{});
    // #endregion
    return NextResponse.json(response);
  } catch (error) {
    // #region agent log
    const logEntry7 = {location:'api/public/map/markers/route.ts:84',message:'API error caught',data:{error:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
    await fetch('http://127.0.0.1:7242/ingest/c9cfbb9d-d410-41eb-add3-f4ebacc75e84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry7)}).catch(()=>{});
    // #endregion
    console.error("Error fetching map markers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch markers",
      },
      { status: 500 }
    );
  }
}
