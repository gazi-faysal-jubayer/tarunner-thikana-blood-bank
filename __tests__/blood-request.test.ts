/**
 * Blood Request Tests
 * Tests for public blood request submission
 */

describe("Blood Request", () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  test("Public blood request can be submitted without login", async () => {
    const requestData = {
      requesterName: "Test Requester",
      requesterPhone: "+8801700000001",
      requesterEmail: "test@example.com",
      patientName: "Test Patient",
      patientAge: 30,
      patientGender: "male",
      bloodGroup: "A+",
      unitsNeeded: 2,
      hospitalName: "Test Hospital",
      hospitalAddress: "Test Address",
      latitude: 23.8103,
      longitude: 90.4125,
      district: "Dhaka",
      division: "Dhaka",
      neededBy: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isEmergency: false,
      reason: "Test reason",
    };

    const response = await fetch(`${baseUrl}/api/public/request-blood`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.trackingId).toBeDefined();
  });

  test("Tracking ID is generated for new request", async () => {
    const requestData = {
      requesterName: "Test Requester 2",
      requesterPhone: "+8801700000002",
      patientName: "Test Patient 2",
      bloodGroup: "B+",
      unitsNeeded: 1,
      hospitalName: "Test Hospital 2",
      hospitalAddress: "Test Address 2",
      latitude: 23.8103,
      longitude: 90.4125,
      district: "Dhaka",
      division: "Dhaka",
      neededBy: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      isEmergency: false,
    };

    const response = await fetch(`${baseUrl}/api/public/request-blood`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.trackingId).toMatch(/^TR-/);
  });
});


