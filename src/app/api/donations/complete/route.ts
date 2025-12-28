import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient() as any;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: donor } = await (supabase
      .from("donors") as any)
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!donor) {
      return NextResponse.json({ success: false, error: "Donor profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { assignmentId, requestId, unitsDonated } = body;

    if (!requestId || !assignmentId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create donation record
    const { error: donationError } = await (supabase
      .from("donations") as any)
      .insert({
        request_id: requestId,
        donor_id: donor.id,
        units_donated: unitsDonated || 1,
        donation_date: new Date().toISOString(),
        // assignment_id is not in schema but linked via request/donor
      });

    if (donationError) throw donationError;

    // 2. Update request status to completed
    const { error: requestError } = await (supabase
      .from("blood_requests") as any)
      .update({
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (requestError) throw requestError;

    // 3. Update assignment status to completed
    const { error: assignmentError } = await (supabase
      .from("assignments") as any)
      .update({ status: "completed" })
      .eq("id", assignmentId);

    if (assignmentError) throw assignmentError;

    // 4. Update donor stats (increment total donations, last donation date, etc.)
    // This could also be a trigger, but doing it here for simplicity
    const { error: donorError } = await (supabase.rpc('increment_donor_stats', {
      row_id: donor.id
    }) as any);

    // If RPC doesn't exist, manual update:
    if (donorError) {
      // Fallback manual update
      const { data: currentDonor } = await supabase.from('donors').select('total_donations').eq('id', donor.id).single();
      await (supabase.from('donors') as any).update({
        total_donations: (currentDonor?.total_donations || 0) + 1,
        last_donation_date: new Date().toISOString(),
        is_available: false // Donor becomes unavailable for some time
      }).eq('id', donor.id);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error completing donation:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to complete donation" },
      { status: 500 }
    );
  }
}
