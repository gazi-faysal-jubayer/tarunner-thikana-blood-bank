/**
 * Assignment Service
 * Handles the two-level assignment system:
 * 1. Admin assigns volunteers to requests
 * 2. Volunteers assign donors to requests
 */

import { calculateDistance } from "@/lib/utils";
import type { BloodGroup } from "@/lib/supabase/types";

interface Donor {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  bloodGroup: BloodGroup;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
  lastDonationDate: string | null;
  nextEligibleDate: string | null;
  totalDonations: number;
}

interface Volunteer {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  requestsHandled: number;
  successRate: number;
}

interface BloodRequest {
  id: string;
  bloodGroup: BloodGroup;
  latitude: number;
  longitude: number;
  unitsNeeded: number;
  isEmergency: boolean;
}

interface DonorScore {
  donor: Donor;
  score: number;
  distance: number;
  isEligible: boolean;
  reasons: string[];
}

interface VolunteerScore {
  volunteer: Volunteer;
  score: number;
  distance: number;
  reasons: string[];
}

// Blood group compatibility
const bloodCompatibility: Record<BloodGroup, BloodGroup[]> = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"],
};

/**
 * Check if a donor is eligible to donate
 */
function isDonorEligible(donor: Donor): boolean {
  if (!donor.nextEligibleDate) return true;
  return new Date(donor.nextEligibleDate) <= new Date();
}

/**
 * Check if blood groups are compatible
 */
function isBloodCompatible(
  neededGroup: BloodGroup,
  donorGroup: BloodGroup
): boolean {
  return bloodCompatibility[neededGroup]?.includes(donorGroup) ?? false;
}

/**
 * Calculate donor matching score
 * Scoring factors:
 * - Distance: 40% weight (closer is better)
 * - Blood group match: 30% weight (exact match > compatible)
 * - Availability: 10% weight
 * - Donation history: 10% weight
 * - Eligibility: 5% weight
 * - Response rate: 5% weight (future implementation)
 */
export function calculateDonorScore(
  donor: Donor,
  request: BloodRequest
): DonorScore {
  const reasons: string[] = [];
  let score = 0;

  // Calculate distance
  const distance = calculateDistance(
    request.latitude,
    request.longitude,
    donor.latitude,
    donor.longitude
  );

  // Distance score (40% weight) - Max 40 points, decreases with distance
  const maxDistance = 20; // km
  const distanceScore = Math.max(0, 40 * (1 - distance / maxDistance));
  score += distanceScore;
  if (distance <= 5) {
    reasons.push("খুব কাছে");
  } else if (distance <= 10) {
    reasons.push("কাছাকাছি");
  }

  // Blood group match (30% weight)
  const isExactMatch = donor.bloodGroup === request.bloodGroup;
  const isCompatible = isBloodCompatible(request.bloodGroup, donor.bloodGroup);

  if (isExactMatch) {
    score += 30;
    reasons.push("সঠিক রক্তের গ্রুপ");
  } else if (isCompatible) {
    score += 20;
    reasons.push("সামঞ্জস্যপূর্ণ রক্তের গ্রুপ");
  }

  // Availability (10% weight)
  if (donor.isAvailable) {
    score += 10;
    reasons.push("উপলব্ধ");
  }

  // Donation history (10% weight) - More donations = more reliable
  const historyScore = Math.min(10, donor.totalDonations * 2);
  score += historyScore;
  if (donor.totalDonations >= 3) {
    reasons.push("অভিজ্ঞ দাতা");
  }

  // Eligibility (5% weight)
  const isEligible = isDonorEligible(donor);
  if (isEligible) {
    score += 5;
  } else {
    reasons.push("এখনও যোগ্য নয়");
  }

  // Response rate (5% weight) - Would come from actual data
  score += 5; // Default to max for now

  return {
    donor,
    score: Math.round(score),
    distance: Math.round(distance * 10) / 10,
    isEligible,
    reasons,
  };
}

/**
 * Calculate volunteer matching score
 */
export function calculateVolunteerScore(
  volunteer: Volunteer,
  request: BloodRequest
): VolunteerScore {
  const reasons: string[] = [];
  let score = 0;

  // Calculate distance
  const distance = calculateDistance(
    request.latitude,
    request.longitude,
    volunteer.latitude,
    volunteer.longitude
  );

  // Distance score (50% weight)
  const maxDistance = 30; // km
  const distanceScore = Math.max(0, 50 * (1 - distance / maxDistance));
  score += distanceScore;
  if (distance <= 10) {
    reasons.push("কাছাকাছি");
  }

  // Activity status (20% weight)
  if (volunteer.isActive) {
    score += 20;
    reasons.push("সক্রিয়");
  }

  // Success rate (20% weight)
  const successScore = volunteer.successRate * 0.2;
  score += successScore;
  if (volunteer.successRate >= 80) {
    reasons.push("উচ্চ সাফল্যের হার");
  }

  // Experience (10% weight)
  const experienceScore = Math.min(10, volunteer.requestsHandled * 0.5);
  score += experienceScore;
  if (volunteer.requestsHandled >= 20) {
    reasons.push("অভিজ্ঞ");
  }

  return {
    volunteer,
    score: Math.round(score),
    distance: Math.round(distance * 10) / 10,
    reasons,
  };
}

/**
 * Find and rank nearby donors for a request
 */
export function findMatchingDonors(
  donors: Donor[],
  request: BloodRequest,
  limit: number = 10
): DonorScore[] {
  // Filter for compatible blood groups and available donors
  const compatibleDonors = donors.filter(
    (donor) =>
      isBloodCompatible(request.bloodGroup, donor.bloodGroup) &&
      donor.isAvailable &&
      isDonorEligible(donor)
  );

  // Calculate scores for each donor
  const scoredDonors = compatibleDonors.map((donor) =>
    calculateDonorScore(donor, request)
  );

  // Sort by score (highest first) and return top matches
  return scoredDonors
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Find and rank nearby volunteers for a request
 */
export function findMatchingVolunteers(
  volunteers: Volunteer[],
  request: BloodRequest,
  limit: number = 5
): VolunteerScore[] {
  // Filter for active volunteers
  const activeVolunteers = volunteers.filter((v) => v.isActive);

  // Calculate scores for each volunteer
  const scoredVolunteers = activeVolunteers.map((volunteer) =>
    calculateVolunteerScore(volunteer, request)
  );

  // Sort by score (highest first) and return top matches
  return scoredVolunteers
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Create a volunteer assignment
 */
export async function assignVolunteerToRequest(
  requestId: string,
  volunteerId: string,
  assignedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, this would:
    // 1. Insert into assignments table
    // 2. Update blood_request.assigned_volunteer_id
    // 3. Update blood_request.status to 'volunteer_assigned'
    // 4. Send notification to volunteer

    console.log("[MOCK] Assigning volunteer", volunteerId, "to request", requestId);

    return { success: true };
  } catch (error) {
    console.error("Error assigning volunteer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create a donor assignment
 */
export async function assignDonorToRequest(
  requestId: string,
  donorId: string,
  assignedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, this would:
    // 1. Insert into assignments table
    // 2. Update blood_request.status to 'donor_assigned'
    // 3. Send notification to donor with request details
    // 4. Unlock contact details for both parties

    console.log("[MOCK] Assigning donor", donorId, "to request", requestId);

    return { success: true };
  } catch (error) {
    console.error("Error assigning donor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Handle donor response to assignment
 */
export async function respondToAssignment(
  assignmentId: string,
  response: "accepted" | "rejected",
  note?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, this would:
    // 1. Update assignment status
    // 2. If accepted, update request status to 'donor_confirmed'
    // 3. Send notifications to requester and volunteer
    // 4. If rejected, potentially find next best donor

    console.log("[MOCK] Assignment response:", assignmentId, response);

    return { success: true };
  } catch (error) {
    console.error("Error responding to assignment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}



