import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient() as any;
    const { id } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Update assignment status? Or just request status?
    // The UI implies we track transit. Let's update request status to 'in_progress'.

    // Get assignment to find request_id
    const { data: assignment } = await supabase
      .from("assignments")
      .select("request_id")
      .eq("id", id)
      .single();

    if (!assignment) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    }

    const { error } = await (supabase
      .from("blood_requests") as any)
      .update({
        status: "in_progress",
        updated_at: new Date().toISOString()
      })
      .eq("id", assignment.request_id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error starting transit:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to start transit" },
      { status: 500 }
    );
  }
}
