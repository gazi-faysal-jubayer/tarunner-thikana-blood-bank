import { NextRequest, NextResponse } from "next/server";
import { generateTrackingId } from "@/lib/utils";
import { bloodRequestSchema } from "@/lib/validations/blood-request";
import { sendNotification } from "@/lib/services/notifications";

// Mock database for development
const mockDatabase: Record<string, unknown>[] = [];

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

    // Create the blood request record
    const bloodRequest = {
      id: crypto.randomUUID(),
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // In mock mode, store in memory
    // In production, this would insert into Supabase
    const isMockMode = process.env.NEXT_PUBLIC_MOCK_SERVICES === "true";
    
    if (isMockMode) {
      mockDatabase.push(bloodRequest);
      console.log("[MOCK DB] Blood request created:", trackingId);
    } else {
      // Real Supabase implementation would go here
      // const { createServiceRoleClient } = await import("@/lib/supabase/server");
      // const supabase = await createServiceRoleClient();
      // const { error } = await supabase.from("blood_requests").insert(bloodRequest);
      // if (error) throw error;
      
      // For now, use mock
      mockDatabase.push(bloodRequest);
    }

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

    // For emergency requests, also notify nearby donors
    if (isEmergency) {
      console.log("[EMERGENCY] Would notify nearby donors for:", trackingId);
      // In production, this would trigger emergency notifications
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

// Export mock database for tracking API
export function getMockRequests() {
  return mockDatabase;
}

