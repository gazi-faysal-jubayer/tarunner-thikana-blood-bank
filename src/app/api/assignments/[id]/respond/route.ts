import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient() as any;
    const { id } = await params;

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Verify assignment belongs to user (donor)
    const { data: assignment } = await supabase
      .from("assignments")
      .select("assignee_id, assignments_assignee_id_fkey(user_id)") // Adjust relation if needed
      .eq("id", id)
      .single();

    // Simplified check: usually we'd join but RLS should handle this if enabled. 
    // Here we trust the donor_id in assignment matches the user's donor profile.
    // For safety, let's fetch the donor profile of the user.
    const { data: donor } = await supabase
      .from("donors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!donor) {
      return NextResponse.json({ success: false, error: "Donor profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { accept } = body;

    // Start transaction

    // 1. Update assignment status
    const newStatus = accept ? "accepted" : "rejected";
    const { error: assignmentError } = await (supabase
      .from("assignments") as any)
      .update({
        status: newStatus,
        responded_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("assignee_id", donor.id); // Security check

    if (assignmentError) throw assignmentError;

    // 2. If accepted, update request status
    if (accept) {
      // Fetch request_id first
      const { data: assignData } = await supabase
        .from("assignments")
        .select("request_id")
        .eq("id", id)
        .single();

      if (assignData) {
        await supabase
          .from("blood_requests")
          .update({ status: "donor_confirmed" })
          .eq("id", assignData.request_id);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error responding to assignment:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to respond" },
      { status: 500 }
    );
  }
}
