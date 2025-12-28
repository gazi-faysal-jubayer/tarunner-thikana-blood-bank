import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Updated for Next.js 15
) {
  try {
    const supabase = await createClient() as any;
    const { id } = await params;

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a volunteer
    const { data: volunteer } = await supabase
      .from("volunteers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!volunteer) {
      return NextResponse.json({ success: false, error: "Unauthorized - Volunteer only" }, { status: 403 });
    }

    // 1. Update donation record
    const { error: donationError } = await (supabase
      .from("donations") as any)
      .update({
        verified_by: volunteer.id,
        verified_at: new Date().toISOString()
      })
      .eq("id", id);

    if (donationError) throw donationError;

    // 2. Update volunteer stats (increment success rate, etc.)
    // Note: This logic should ideally be more complex (e.g. calculation), 
    // but for now we'll just increment requests_handled

    // Fetch current stats
    const { data: currentVol } = await supabase
      .from("volunteers")
      .select("requests_handled, donations_facilitated")
      .eq("id", volunteer.id)
      .single();

    if (currentVol) {
      await (supabase
        .from("volunteers") as any)
        .update({
          requests_handled: (currentVol.requests_handled || 0) + 1,
          donations_facilitated: (currentVol.donations_facilitated || 0) + 1,
        })
        .eq("id", volunteer.id);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error verifying donation:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify donation" },
      { status: 500 }
    );
  }
}
