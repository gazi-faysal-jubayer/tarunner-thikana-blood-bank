import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Updated for Next.js 15
) {
  try {
    const supabase = await createClient() as any;
    const { id } = await params;

    // Check if user is authenticated and authorized (admin or volunteer)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await (supabase
      .from("profiles") as any)
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "volunteer")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { donorId } = body;

    if (!donorId) {
      return NextResponse.json({ success: false, error: "Donor ID is required" }, { status: 400 });
    }

    // Start transaction (simulated with sequential operations)

    // 1. Update request status to donor_assigned
    const { error: requestError } = await (supabase
      .from("blood_requests") as any)
      .update({
        status: "donor_assigned",
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (requestError) throw requestError;

    // 2. Create assignment record for donor
    const { error: assignmentError } = await (supabase
      .from("assignments") as any)
      .insert({
        request_id: id,
        type: "donor",
        assignee_id: donorId,
        assigned_by: user.id,
        status: "pending",
        created_at: new Date().toISOString()
      });

    if (assignmentError) throw assignmentError;

    // 3. Send notification (placeholder for now)
    // await sendNotificationToDonor(donorId, id);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error assigning donor:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to assign donor" },
      { status: 500 }
    );
  }
}
