import { NextRequest, NextResponse } from "next/server";
import { generateTrackingId } from "@/lib/utils";
import { bloodRequestSchema } from "@/lib/validations/blood-request";
import { sendNotification } from "@/lib/services/notifications";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = bloodRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // Generate tracking ID
    const trackingId = generateTrackingId();
    
    // Calculate urgency
    const neededBy = new Date(data.neededBy);
    const hoursUntilNeeded = (neededBy.getTime() - Date.now()) / (1000 * 60 * 60);
    let urgency: "critical" | "urgent" | "normal" = "normal";
    let isEmergency = data.isEmergency;
    
    if (hoursUntilNeeded <= 6 || data.isEmergency) {
      urgency = "critical";
      isEmergency = true;
    } else if (hoursUntilNeeded <= 24) {
      urgency = "urgent";
    }

    // Create Supabase client using service role for public submissions
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Insert into database using service role
    const response = await fetch(`${supabaseUrl}/rest/v1/blood_requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        tracking_id: trackingId,
        requester_type: "public",
        requester_name: data.requesterName,
        requester_phone: data.requesterPhone,
        requester_email: data.requesterEmail || null,
        patient_name: data.patientName,
        patient_age: data.patientAge || null,
        patient_gender: data.patientGender || null,
        blood_group: data.bloodGroup,
        units_needed: data.unitsNeeded,
        hospital_name: data.hospitalName,
        hospital_address: data.hospitalAddress,
        latitude: data.latitude,
        longitude: data.longitude,
        district: data.district,
        division: data.division,
        reason: data.reason || null,
        needed_by: data.neededBy,
        is_emergency: isEmergency,
        urgency,
        status: "submitted",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Database error:", error);
      throw new Error("Failed to create blood request");
    }

    const [bloodRequest] = await response.json();

    // Send email notification
    if (data.requesterEmail) {
      await sendNotification({
        email: data.requesterEmail,
        type: "request_submitted",
        title: "রক্তের অনুরোধ জমা হয়েছে",
        message: `আপনার রক্তের অনুরোধ জমা হয়েছে। ট্র্যাকিং আইডি: ${trackingId}`,
        data: {
          trackingId,
          patientName: data.patientName,
        },
      });
    }

    // For emergency requests, log notification
    if (isEmergency) {
      console.log("[EMERGENCY] Would notify nearby donors for:", trackingId);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: bloodRequest.id,
        trackingId,
        status: "submitted",
        urgency,
        isEmergency,
        message: "আপনার রক্তের অনুরোধ সফলভাবে জমা হয়েছে",
      },
    });
  } catch (error) {
    console.error("Error creating blood request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
