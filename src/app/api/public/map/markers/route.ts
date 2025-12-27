import { NextRequest, NextResponse } from "next/server";

// Mock markers for public map
const mockMarkers = [
  {
    id: "1",
    type: "request",
    latitude: 23.8103,
    longitude: 90.4125,
    bloodGroup: "A+",
    urgency: "critical",
    status: "approved",
    title: "ঢাকা মেডিকেল কলেজ",
    subtitle: "২ ব্যাগ প্রয়োজন",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    type: "request",
    latitude: 23.78,
    longitude: 90.42,
    bloodGroup: "O-",
    urgency: "urgent",
    status: "volunteer_assigned",
    title: "স্কয়ার হাসপাতাল",
    subtitle: "১ ব্যাগ প্রয়োজন",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    type: "request",
    latitude: 23.75,
    longitude: 90.38,
    bloodGroup: "B+",
    urgency: "normal",
    status: "submitted",
    title: "ইউনাইটেড হাসপাতাল",
    subtitle: "৩ ব্যাগ প্রয়োজন",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    type: "request",
    latitude: 23.85,
    longitude: 90.4,
    bloodGroup: "AB+",
    urgency: "critical",
    status: "approved",
    title: "ল্যাব এইড হাসপাতাল",
    subtitle: "১ ব্যাগ প্রয়োজন",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    type: "request",
    latitude: 22.3569,
    longitude: 91.7832,
    bloodGroup: "A-",
    urgency: "urgent",
    status: "approved",
    title: "চট্টগ্রাম মেডিকেল কলেজ",
    subtitle: "২ ব্যাগ প্রয়োজন",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get("bloodGroup");
    const urgency = searchParams.get("urgency");
    const bounds = searchParams.get("bounds"); // Format: "lat1,lng1,lat2,lng2"

    let filteredMarkers = [...mockMarkers];

    // Filter by blood group
    if (bloodGroup && bloodGroup !== "all") {
      filteredMarkers = filteredMarkers.filter(
        (m) => m.bloodGroup === bloodGroup
      );
    }

    // Filter by urgency
    if (urgency && urgency !== "all") {
      filteredMarkers = filteredMarkers.filter((m) => m.urgency === urgency);
    }

    // Filter by map bounds
    if (bounds) {
      const [lat1, lng1, lat2, lng2] = bounds.split(",").map(Number);
      filteredMarkers = filteredMarkers.filter(
        (m) =>
          m.latitude >= Math.min(lat1, lat2) &&
          m.latitude <= Math.max(lat1, lat2) &&
          m.longitude >= Math.min(lng1, lng2) &&
          m.longitude <= Math.max(lng1, lng2)
      );
    }

    // Sanitize data for public viewing
    const publicMarkers = filteredMarkers.map((marker) => ({
      id: marker.id,
      type: marker.type,
      latitude: marker.latitude,
      longitude: marker.longitude,
      bloodGroup: marker.bloodGroup,
      urgency: marker.urgency,
      status: marker.status,
      title: marker.title, // Hospital name is public
      subtitle: marker.subtitle,
      // Don't include patient names, contact info, etc.
    }));

    return NextResponse.json({
      success: true,
      data: publicMarkers,
      total: publicMarkers.length,
    });
  } catch (error) {
    console.error("Error fetching map markers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch markers",
      },
      { status: 500 }
    );
  }
}


