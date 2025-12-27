export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "donor" | "volunteer" | "admin";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type Gender = "male" | "female" | "other";
export type RequestStatus =
  | "submitted"
  | "approved"
  | "volunteer_assigned"
  | "donor_assigned"
  | "donor_confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";
export type UrgencyLevel = "critical" | "urgent" | "normal";
export type AssignmentType = "volunteer" | "donor";
export type AssignmentStatus = "pending" | "accepted" | "rejected" | "completed";
export type NotificationChannel = "sms" | "email" | "push" | "in_app";
export type NotificationStatus = "pending" | "sent" | "delivered" | "failed";
export type NotificationType =
  | "request_submitted"
  | "request_approved"
  | "volunteer_assigned"
  | "donor_assigned"
  | "donor_confirmed"
  | "donation_completed"
  | "emergency_alert"
  | "reminder";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          phone: string;
          full_name: string;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          phone: string;
          full_name: string;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          phone?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      donors: {
        Row: {
          id: string;
          user_id: string;
          blood_group: BloodGroup;
          date_of_birth: string;
          gender: Gender;
          weight: number | null;
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
          health_info: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          blood_group: BloodGroup;
          date_of_birth: string;
          gender: Gender;
          weight?: number | null;
          latitude: number;
          longitude: number;
          address: string;
          district: string;
          division: string;
          is_available?: boolean;
          last_donation_date?: string | null;
          next_eligible_date?: string | null;
          total_donations?: number;
          notification_preferences?: {
            sms: boolean;
            email: boolean;
            push: boolean;
          };
          health_info?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          blood_group?: BloodGroup;
          date_of_birth?: string;
          gender?: Gender;
          weight?: number | null;
          latitude?: number;
          longitude?: number;
          address?: string;
          district?: string;
          division?: string;
          is_available?: boolean;
          last_donation_date?: string | null;
          next_eligible_date?: string | null;
          total_donations?: number;
          notification_preferences?: {
            sms: boolean;
            email: boolean;
            push: boolean;
          };
          health_info?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      volunteers: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          employee_id?: string | null;
          latitude: number;
          longitude: number;
          address: string;
          district: string;
          division: string;
          coverage_radius_km?: number;
          is_active?: boolean;
          requests_handled?: number;
          donations_facilitated?: number;
          success_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          employee_id?: string | null;
          latitude?: number;
          longitude?: number;
          address?: string;
          district?: string;
          division?: string;
          coverage_radius_km?: number;
          is_active?: boolean;
          requests_handled?: number;
          donations_facilitated?: number;
          success_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      admins: {
        Row: {
          id: string;
          user_id: string;
          employee_id: string;
          department: string | null;
          permissions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          employee_id: string;
          department?: string | null;
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          employee_id?: string;
          department?: string | null;
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      blood_requests: {
        Row: {
          id: string;
          tracking_id: string;
          requester_type: "public" | "registered";
          requester_user_id: string | null;
          requester_name: string;
          requester_phone: string;
          requester_email: string | null;
          patient_name: string;
          patient_age: number | null;
          patient_gender: Gender | null;
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
        };
        Insert: {
          id?: string;
          tracking_id: string;
          requester_type?: "public" | "registered";
          requester_user_id?: string | null;
          requester_name: string;
          requester_phone: string;
          requester_email?: string | null;
          patient_name: string;
          patient_age?: number | null;
          patient_gender?: Gender | null;
          blood_group: BloodGroup;
          units_needed?: number;
          hospital_name: string;
          hospital_address: string;
          latitude: number;
          longitude: number;
          district: string;
          division: string;
          reason?: string | null;
          needed_by: string;
          is_emergency?: boolean;
          urgency?: UrgencyLevel;
          status?: RequestStatus;
          assigned_volunteer_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          tracking_id?: string;
          requester_type?: "public" | "registered";
          requester_user_id?: string | null;
          requester_name?: string;
          requester_phone?: string;
          requester_email?: string | null;
          patient_name?: string;
          patient_age?: number | null;
          patient_gender?: Gender | null;
          blood_group?: BloodGroup;
          units_needed?: number;
          hospital_name?: string;
          hospital_address?: string;
          latitude?: number;
          longitude?: number;
          district?: string;
          division?: string;
          reason?: string | null;
          needed_by?: string;
          is_emergency?: boolean;
          urgency?: UrgencyLevel;
          status?: RequestStatus;
          assigned_volunteer_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
          completed_at?: string | null;
        };
      };
      assignments: {
        Row: {
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
        };
        Insert: {
          id?: string;
          request_id: string;
          type: AssignmentType;
          assignee_id: string;
          assigned_by: string;
          status?: AssignmentStatus;
          response_note?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          type?: AssignmentType;
          assignee_id?: string;
          assigned_by?: string;
          status?: AssignmentStatus;
          response_note?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      donations: {
        Row: {
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
        };
        Insert: {
          id?: string;
          request_id: string;
          donor_id: string;
          volunteer_id?: string | null;
          units_donated?: number;
          donation_date?: string;
          donation_location?: string | null;
          hemoglobin_level?: number | null;
          blood_pressure?: string | null;
          notes?: string | null;
          certificate_id?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          donor_id?: string;
          volunteer_id?: string | null;
          units_donated?: number;
          donation_date?: string;
          donation_location?: string | null;
          hemoglobin_level?: number | null;
          blood_pressure?: string | null;
          notes?: string | null;
          certificate_id?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          phone: string | null;
          email: string | null;
          type: NotificationType;
          title: string;
          message: string;
          data: Json | null;
          channel: NotificationChannel;
          status: NotificationStatus;
          sent_at: string | null;
          delivered_at: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          phone?: string | null;
          email?: string | null;
          type: NotificationType;
          title: string;
          message: string;
          data?: Json | null;
          channel: NotificationChannel;
          status?: NotificationStatus;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          phone?: string | null;
          email?: string | null;
          type?: NotificationType;
          title?: string;
          message?: string;
          data?: Json | null;
          channel?: NotificationChannel;
          status?: NotificationStatus;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
      };
      districts: {
        Row: {
          id: number;
          name: string;
          name_bn: string;
          division: string;
          division_bn: string;
        };
        Insert: {
          id?: number;
          name: string;
          name_bn: string;
          division: string;
          division_bn: string;
        };
        Update: {
          id?: number;
          name?: string;
          name_bn?: string;
          division?: string;
          division_bn?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      find_nearby_donors: {
        Args: {
          p_latitude: number;
          p_longitude: number;
          p_blood_group: BloodGroup;
          p_radius_km?: number;
          p_limit?: number;
        };
        Returns: {
          donor_id: string;
          user_id: string;
          full_name: string;
          phone: string;
          blood_group: BloodGroup;
          distance_km: number;
          is_available: boolean;
          last_donation_date: string | null;
          next_eligible_date: string | null;
          total_donations: number;
        }[];
      };
      find_nearby_volunteers: {
        Args: {
          p_latitude: number;
          p_longitude: number;
          p_radius_km?: number;
          p_limit?: number;
        };
        Returns: {
          volunteer_id: string;
          user_id: string;
          full_name: string;
          phone: string;
          distance_km: number;
          requests_handled: number;
          success_rate: number;
        }[];
      };
      get_user_role: {
        Args: {
          user_id: string;
        };
        Returns: UserRole;
      };
      is_admin: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
      is_volunteer: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      blood_group: BloodGroup;
      gender: Gender;
      request_status: RequestStatus;
      urgency_level: UrgencyLevel;
      assignment_type: AssignmentType;
      assignment_status: AssignmentStatus;
      notification_channel: NotificationChannel;
      notification_status: NotificationStatus;
      notification_type: NotificationType;
    };
  };
}


