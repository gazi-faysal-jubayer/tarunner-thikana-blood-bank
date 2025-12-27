import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get("bloodGroup");
    const urgency = searchParams.get("urgency");
    const bounds = searchParams.get("bounds"); // Format: "lat1,lng1,lat2,lng2"

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

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    let markers = (requests || []).map((req) => ({
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
    }));

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

    return NextResponse.json({
      success: true,
      data: markers,
      total: markers.length,
    });
  } catch (error) {
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
