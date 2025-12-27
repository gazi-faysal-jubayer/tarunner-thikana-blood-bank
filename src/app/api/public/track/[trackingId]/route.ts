import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;

    if (!trackingId) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid tracking ID format",
        },
        { status: 400 }
      );
    }

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

    // Query database for the request
    const { data, error } = await supabase
      .from("blood_requests")
      .select("*")
      .eq("tracking_id", trackingId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: "Request not found",
        },
        { status: 404 }
      );
    }

    // Build timeline based on status
    const timeline = [];
    timeline.push({
      status: "submitted",
      timestamp: data.created_at,
      message: "অনুরোধ জমা হয়েছে",
    });

    if (data.approved_at) {
      timeline.push({
        status: "approved",
        timestamp: data.approved_at,
        message: "অনুরোধ অনুমোদিত হয়েছে",
      });
    }

    if (data.assigned_volunteer_id) {
      timeline.push({
        status: "volunteer_assigned",
        timestamp: data.updated_at,
        message: "স্বেচ্ছাসেবক নিযুক্ত করা হয়েছে",
      });
    }

    if (data.status === "completed" && data.completed_at) {
      timeline.push({
        status: "completed",
        timestamp: data.completed_at,
        message: "অনুরোধ সম্পন্ন হয়েছে",
      });
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
      timeline,
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
