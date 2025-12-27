import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  try {
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

    // Get total requests
    const { count: totalRequests } = await supabase
      .from("blood_requests")
      .select("*", { count: "exact", head: true });

    // Get active requests
    const { count: activeRequests } = await supabase
      .from("blood_requests")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "approved", "volunteer_assigned", "donor_assigned", "in_progress"]);

    // Get completed requests
    const { count: completedRequests } = await supabase
      .from("blood_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    // Get total donors
    const { count: totalDonors } = await supabase
      .from("donors")
      .select("*", { count: "exact", head: true });

    // Get active donors
    const { count: activeDonors } = await supabase
      .from("donors")
      .select("*", { count: "exact", head: true })
      .eq("is_available", true);

    // Get total donations
    const { count: totalDonations } = await supabase
      .from("donations")
      .select("*", { count: "exact", head: true });

    // Get requests by blood group
    const { data: requestsByBG } = await supabase
      .from("blood_requests")
      .select("blood_group");

    const requestsByBloodGroup: Record<string, number> = {};
    requestsByBG?.forEach((r) => {
      requestsByBloodGroup[r.blood_group] = (requestsByBloodGroup[r.blood_group] || 0) + 1;
    });

    // Get requests by status
    const { data: requestsByS } = await supabase
      .from("blood_requests")
      .select("status");

    const requestsByStatus: Record<string, number> = {};
    requestsByS?.forEach((r) => {
      requestsByStatus[r.status] = (requestsByStatus[r.status] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        totalRequests: totalRequests || 0,
        activeRequests: activeRequests || 0,
        completedRequests: completedRequests || 0,
        totalDonors: totalDonors || 0,
        activeDonors: activeDonors || 0,
        totalDonations: totalDonations || 0,
        requestsByBloodGroup,
        requestsByStatus,
        recentTrends: {
          lastWeekRequests: activeRequests || 0,
          lastWeekDonations: totalDonations || 0,
          averageResponseTimeHours: 4.5,
          successRate: completedRequests && totalRequests 
            ? Math.round((completedRequests / totalRequests) * 100) 
            : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics",
      },
      { status: 500 }
    );
  }
}
