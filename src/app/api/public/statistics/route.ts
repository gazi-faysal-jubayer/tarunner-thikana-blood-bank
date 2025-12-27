import { NextResponse } from "next/server";

// Mock statistics for public display
const mockStatistics = {
  totalRequests: 5234,
  activeRequests: 23,
  completedRequests: 4891,
  totalDonors: 12500,
  activeDonors: 8900,
  totalDonations: 15678,
  requestsByBloodGroup: {
    "A+": 1245,
    "A-": 234,
    "B+": 1567,
    "B-": 189,
    "AB+": 456,
    "AB-": 78,
    "O+": 1234,
    "O-": 231,
  },
  requestsByStatus: {
    submitted: 5,
    approved: 8,
    volunteer_assigned: 4,
    donor_assigned: 3,
    donor_confirmed: 2,
    in_progress: 1,
    completed: 4891,
    cancelled: 320,
  },
  recentTrends: {
    lastWeekRequests: 156,
    lastWeekDonations: 142,
    averageResponseTimeHours: 4.5,
    successRate: 91.2,
  },
};

export async function GET() {
  try {
    // In production, this would query Supabase for actual statistics
    // const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    // const supabase = await createServerSupabaseClient();
    // ... query statistics

    return NextResponse.json({
      success: true,
      data: mockStatistics,
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


