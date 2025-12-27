import { NextRequest, NextResponse } from "next/server";

// Mock database for development (shared with request-blood route)
// In production, this would query Supabase
const getMockRequest = (trackingId: string) => {
  // Return a mock request for demonstration
  return {
    id: "mock-id",
    tracking_id: trackingId,
    requester_type: "public",
    patient_name: "মক রোগী",
    blood_group: "A+",
    units_needed: 2,
    hospital_name: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
    hospital_address: "সেগুনবাগিচা, ঢাকা",
    district: "Dhaka",
    division: "Dhaka",
    needed_by: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    is_emergency: false,
    urgency: "urgent" as const,
    status: "submitted" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    timeline: [
      {
        status: "submitted",
        timestamp: new Date().toISOString(),
        message: "অনুরোধ জমা হয়েছে",
      },
    ],
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;

    if (!trackingId || !trackingId.startsWith("BLD-")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid tracking ID format",
        },
        { status: 400 }
      );
    }

    // In production, this would query Supabase
    // const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    // const supabase = await createServerSupabaseClient();
    // const { data, error } = await supabase
    //   .from("blood_requests")
    //   .select("*")
    //   .eq("tracking_id", trackingId)
    //   .single();

    // For now, return mock data
    const data = getMockRequest(trackingId);

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Request not found",
        },
        { status: 404 }
      );
    }

    // Sanitize response for public viewing
    const publicData = {
      trackingId: data.tracking_id,
      patientName: data.patient_name.charAt(0) + "***", // Partially hide name
      bloodGroup: data.blood_group,
      unitsNeeded: data.units_needed,
      hospitalName: data.hospital_name,
      district: data.district,
      division: data.division,
      neededBy: data.needed_by,
      isEmergency: data.is_emergency,
      urgency: data.urgency,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      timeline: data.timeline,
    };

    return NextResponse.json({
      success: true,
      data: publicData,
    });
  } catch (error) {
    console.error("Error fetching blood request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}


