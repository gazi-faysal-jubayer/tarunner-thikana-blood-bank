// Blood Groups
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

// User Roles
export type UserRole = "donor" | "volunteer" | "admin";

// Request Status
export type RequestStatus =
  | "submitted"
  | "approved"
  | "volunteer_assigned"
  | "donor_assigned"
  | "donor_confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

// Urgency Levels
export type UrgencyLevel = "critical" | "urgent" | "normal";

// Assignment Types
export type AssignmentType = "volunteer" | "donor";

// Assignment Status
export type AssignmentStatus = "pending" | "accepted" | "rejected" | "completed";

// Notification Types
export type NotificationType =
  | "request_submitted"
  | "request_approved"
  | "volunteer_assigned"
  | "donor_assigned"
  | "donor_confirmed"
  | "donation_completed"
  | "emergency_alert"
  | "reminder";

// Database Types
export interface User {
  id: string;
  email: string | null;
  phone: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Donor {
  id: string;
  user_id: string;
  blood_group: BloodGroup;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  weight: number;
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  division: string;
  is_available: boolean;
  last_donation_date: string | null;
  next_eligible_date: string | null;
  total_donations: number;
  notification_preferences: {
    sms: boolean;
    email: boolean;
    push: boolean;
  };
  health_info: {
    hemoglobin?: number;
    blood_pressure?: string;
    medical_conditions?: string[];
  };
  created_at: string;
  updated_at: string;
  // Relations
  user?: User;
}

export interface Volunteer {
  id: string;
  user_id: string;
  employee_id: string | null;
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  division: string;
  coverage_radius_km: number;
  is_active: boolean;
  requests_handled: number;
  donations_facilitated: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
  // Relations
  user?: User;
}

export interface Admin {
  id: string;
  user_id: string;
  employee_id: string;
  department: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
  // Relations
  user?: User;
}

export interface BloodRequest {
  id: string;
  tracking_id: string;
  requester_type: "public" | "registered";
  requester_user_id: string | null;
  requester_name: string;
  requester_phone: string;
  requester_email: string | null;
  patient_name: string;
  patient_age: number | null;
  patient_gender: "male" | "female" | "other" | null;
  blood_group: BloodGroup;
  units_needed: number;
  hospital_name: string;
  hospital_address: string;
  latitude: number;
  longitude: number;
  district: string;
  division: string;
  reason: string | null;
  needed_by: string;
  is_emergency: boolean;
  urgency: UrgencyLevel;
  status: RequestStatus;
  assigned_volunteer_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  completed_at: string | null;
  // Relations
  assigned_volunteer?: Volunteer;
  assignments?: Assignment[];
  donations?: Donation[];
}

export interface Assignment {
  id: string;
  request_id: string;
  type: AssignmentType;
  assignee_id: string;
  assigned_by: string;
  status: AssignmentStatus;
  response_note: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  request?: BloodRequest;
  assignee_donor?: Donor;
  assignee_volunteer?: Volunteer;
}

export interface Donation {
  id: string;
  request_id: string;
  donor_id: string;
  volunteer_id: string | null;
  units_donated: number;
  donation_date: string;
  donation_location: string | null;
  hemoglobin_level: number | null;
  blood_pressure: string | null;
  notes: string | null;
  certificate_id: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  // Relations
  request?: BloodRequest;
  donor?: Donor;
  volunteer?: Volunteer;
}

export interface Notification {
  id: string;
  user_id: string | null;
  phone: string | null;
  email: string | null;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  channel: "sms" | "email" | "push" | "in_app";
  status: "pending" | "sent" | "delivered" | "failed";
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}

// Map Types
export interface MapMarker {
  id: string;
  type: "request" | "donor" | "volunteer" | "hospital";
  latitude: number;
  longitude: number;
  bloodGroup?: BloodGroup;
  urgency?: UrgencyLevel;
  status?: RequestStatus;
  title: string;
  subtitle?: string;
  data?: Record<string, unknown>;
}

export interface MapAssignmentLine {
  id: string;
  type: "volunteer" | "donor";
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  status: AssignmentStatus;
}

// Form Types
export interface BloodRequestFormData {
  requesterName: string;
  requesterPhone: string;
  requesterEmail?: string;
  patientName: string;
  patientAge?: number;
  patientGender?: "male" | "female" | "other";
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospitalName: string;
  hospitalAddress: string;
  latitude: number;
  longitude: number;
  district: string;
  division: string;
  reason?: string;
  neededBy: Date;
  isEmergency: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Statistics Types
export interface Statistics {
  totalRequests: number;
  activeRequests: number;
  completedRequests: number;
  totalDonors: number;
  activeDonors: number;
  totalDonations: number;
  requestsByBloodGroup: Record<BloodGroup, number>;
  requestsByStatus: Record<RequestStatus, number>;
}



