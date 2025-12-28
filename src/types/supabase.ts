export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["user_id"]
          },
        ]
      }
      admins: {
        Row: {
          created_at: string
          department: string | null
          employee_id: string
          id: string
          permissions: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          employee_id?: string
          id?: string
          permissions?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          employee_id?: string
          id?: string
          permissions?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          assigned_by: string
          assignee_id: string
          created_at: string
          donor_current_location: unknown
          estimated_arrival_time: string | null
          id: string
          is_in_transit: boolean | null
          last_location_update: string | null
          request_id: string
          responded_at: string | null
          response_note: string | null
          route_distance_km: number | null
          route_duration_minutes: number | null
          route_geometry: unknown
          status: Database["public"]["Enums"]["assignment_status"]
          type: Database["public"]["Enums"]["assignment_type"]
          updated_at: string
        }
        Insert: {
          assigned_by: string
          assignee_id: string
          created_at?: string
          donor_current_location?: unknown
          estimated_arrival_time?: string | null
          id?: string
          is_in_transit?: boolean | null
          last_location_update?: string | null
          request_id: string
          responded_at?: string | null
          response_note?: string | null
          route_distance_km?: number | null
          route_duration_minutes?: number | null
          route_geometry?: unknown
          status?: Database["public"]["Enums"]["assignment_status"]
          type?: Database["public"]["Enums"]["assignment_type"]
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          assignee_id?: string
          created_at?: string
          donor_current_location?: unknown
          estimated_arrival_time?: string | null
          id?: string
          is_in_transit?: boolean | null
          last_location_update?: string | null
          request_id?: string
          responded_at?: string | null
          response_note?: string | null
          route_distance_km?: number | null
          route_duration_minutes?: number | null
          route_geometry?: unknown
          status?: Database["public"]["Enums"]["assignment_status"]
          type?: Database["public"]["Enums"]["assignment_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_requests: {
        Row: {
          approved_at: string | null
          assigned_volunteer_id: string | null
          blood_group: Database["public"]["Enums"]["blood_group"]
          completed_at: string | null
          created_at: string
          district: string
          division: string
          hospital_address: string
          hospital_name: string
          id: string
          is_emergency: boolean
          latitude: number
          location: unknown
          longitude: number
          needed_by: string
          notes: string | null
          patient_age: number | null
          patient_gender: Database["public"]["Enums"]["gender"] | null
          patient_name: string
          reason: string | null
          requester_email: string | null
          requester_name: string
          requester_phone: string
          requester_type: string
          requester_user_id: string | null
          status: Database["public"]["Enums"]["request_status"]
          tracking_id: string
          units_needed: number
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        Insert: {
          approved_at?: string | null
          assigned_volunteer_id?: string | null
          blood_group: Database["public"]["Enums"]["blood_group"]
          completed_at?: string | null
          created_at?: string
          district: string
          division: string
          hospital_address: string
          hospital_name: string
          id?: string
          is_emergency?: boolean
          latitude: number
          location?: unknown
          longitude?: number
          needed_by: string
          notes?: string | null
          patient_age?: number | null
          patient_gender?: Database["public"]["Enums"]["gender"] | null
          patient_name: string
          reason?: string | null
          requester_email?: string | null
          requester_name?: string
          requester_phone?: string
          requester_type?: string | null
          requester_user_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          tracking_id: string
          units_needed?: number
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Update: {
          approved_at?: string | null
          assigned_volunteer_id?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"]
          completed_at?: string | null
          created_at?: string
          district?: string
          division?: string
          hospital_address?: string
          hospital_name?: string
          id?: string
          is_emergency?: boolean
          latitude?: number
          location?: unknown
          longitude?: number
          needed_by?: string
          notes?: string | null
          patient_age?: number | null
          patient_gender?: Database["public"]["Enums"]["gender"] | null
          patient_name?: string
          reason?: string | null
          requester_email?: string | null
          requester_name?: string
          requester_phone?: string
          requester_type?: string
          requester_user_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          tracking_id?: string
          units_needed?: number
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Relationships: [
          {
            foreignKeyName: "blood_requests_assigned_volunteer_id_fkey"
            columns: ["assigned_volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_requests_requester_user_id_fkey"
            columns: ["requester_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          division: string
          division_bn: string
          id: number
          name: string
          name_bn: string
        }
        Insert: {
          division: string
          division_bn: string
          id?: number
          name: string
          name_bn: string
        }
        Update: {
          division?: string
          division_bn?: string
          id?: number
          name?: string
          name_bn?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          blood_pressure: string | null
          certificate_id: string | null
          created_at: string
          donation_date: string
          donation_location: string | null
          donor_id: string
          hemoglobin_level: number | null
          id: string
          notes: string | null
          request_id: string
          units_donated: number
          verified_at: string | null
          verified_by: string | null
          volunteer_id: string | null
        }
        Insert: {
          blood_pressure?: string | null
          certificate_id?: string | null
          created_at?: string
          donation_date?: string
          donation_location?: string | null
          donor_id: string
          hemoglobin_level?: number | null
          id?: string
          notes?: string | null
          request_id: string
          units_donated?: number
          verified_at?: string | null
          verified_by?: string | null
          volunteer_id?: string | null
        }
        Update: {
          blood_pressure?: string | null
          certificate_id?: string | null
          created_at?: string
          donation_date?: string
          donation_location?: string | null
          donor_id?: string
          hemoglobin_level?: number | null
          id?: string
          notes?: string | null
          request_id?: string
          units_donated?: number
          verified_at?: string | null
          verified_by?: string | null
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          address: string
          blood_group: Database["public"]["Enums"]["blood_group"]
          created_at: string
          date_of_birth: string
          district: string
          division: string
          gender: Database["public"]["Enums"]["gender"]
          health_info: Json | null
          id: string
          is_available: boolean
          last_donation_date: string | null
          latitude: number
          location: unknown
          longitude: number
          next_eligible_date: string | null
          notification_preferences: Json
          total_donations: number
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          address: string
          blood_group: Database["public"]["Enums"]["blood_group"]
          created_at?: string
          date_of_birth: string
          district: string
          division: string
          gender: Database["public"]["Enums"]["gender"]
          health_info?: Json | null
          id?: string
          is_available?: boolean
          last_donation_date?: string | null
          latitude: number
          location?: unknown
          longitude?: number
          next_eligible_date?: string | null
          notification_preferences?: Json
          total_donations?: number
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          address?: string
          blood_group?: Database["public"]["Enums"]["blood_group"]
          created_at?: string
          date_of_birth?: string
          district?: string
          division?: string
          gender?: Database["public"]["Enums"]["gender"]
          health_info?: Json | null
          id?: string
          is_available?: boolean
          last_donation_date?: string | null
          latitude?: number
          location?: unknown
          longitude?: number
          next_eligible_date?: string | null
          notification_preferences?: Json
          total_donations?: number
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "donors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      location_history: {
        Row: {
          accuracy_meters: number | null
          assignment_id: string
          created_at: string
          heading_degrees: number | null
          id: string
          location: unknown
          recorded_at: string
          speed_kmh: number | null
        }
        Insert: {
          accuracy_meters?: number | null
          assignment_id: string
          created_at?: string
          heading_degrees?: number | null
          id?: string
          location: unknown
          recorded_at?: string
          speed_kmh?: number | null
        }
        Update: {
          accuracy_meters?: number | null
          assignment_id?: string
          created_at?: string
          heading_degrees?: number | null
          id?: string
          location?: unknown
          recorded_at?: string
          speed_kmh?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "location_history_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "active_tracking"
            referencedColumns: ["assignment_id"]
          },
          {
            foreignKeyName: "location_history_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          data: Json | null
          delivered_at: string | null
          email: string | null
          id: string
          message: string
          phone: string | null
          read_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json | null
          delivered_at?: string | null
          email?: string | null
          id?: string
          message: string
          phone?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json | null
          delivered_at?: string | null
          email?: string | null
          id?: string
          message?: string
          phone?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          phone: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      route_positions: {
        Row: {
          accuracy: number | null
          altitude: number | null
          bearing: number | null
          distance_from_route: number | null
          id: string
          is_on_route: boolean | null
          latitude: number
          longitude: number
          route_id: string
          speed: number | null
          timestamp: string
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          bearing?: number | null
          distance_from_route?: number | null
          id?: string
          is_on_route?: boolean | null
          latitude: number
          longitude: number
          route_id: string
          speed?: number | null
          timestamp?: string
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          bearing?: number | null
          distance_from_route?: number | null
          id?: string
          is_on_route?: boolean | null
          latitude?: number
          longitude?: number
          route_id?: string
          speed?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_positions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          alternatives: Json | null
          assignment_id: string
          cache_expires_at: string
          completed_at: string | null
          created_at: string
          current_eta: string | null
          current_step_index: number | null
          deviation_count: number | null
          distance: number
          duration: number
          end_location: Json
          geometry: Json
          id: string
          is_active: boolean
          last_eta_update: string | null
          last_position: Json | null
          original_eta: string | null
          profile: string
          share_expires_at: string | null
          share_token: string | null
          start_location: Json
          started_at: string | null
          status: string
          steps: Json | null
          traffic_duration: number | null
          updated_at: string
          waypoints: Json | null
        }
        Insert: {
          alternatives?: Json | null
          assignment_id: string
          cache_expires_at?: string
          completed_at?: string | null
          created_at?: string
          current_eta?: string | null
          current_step_index?: number | null
          deviation_count?: number | null
          distance: number
          duration: number
          end_location: Json
          geometry: Json
          id?: string
          is_active?: boolean
          last_eta_update?: string | null
          last_position?: Json | null
          original_eta?: string | null
          profile?: string
          share_expires_at?: string | null
          share_token?: string | null
          start_location: Json
          started_at?: string | null
          status?: string
          steps?: Json | null
          traffic_duration?: number | null
          updated_at?: string
          waypoints?: Json | null
        }
        Update: {
          alternatives?: Json | null
          assignment_id?: string
          cache_expires_at?: string
          completed_at?: string | null
          created_at?: string
          current_eta?: string | null
          current_step_index?: number | null
          deviation_count?: number | null
          distance?: number
          duration?: number
          end_location?: Json
          geometry?: Json
          id?: string
          is_active?: boolean
          last_eta_update?: string | null
          last_position?: Json | null
          original_eta?: string | null
          profile?: string
          share_expires_at?: string | null
          share_token?: string | null
          start_location?: Json
          started_at?: string | null
          status?: string
          steps?: Json | null
          traffic_duration?: number | null
          updated_at?: string
          waypoints?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "active_tracking"
            referencedColumns: ["assignment_id"]
          },
          {
            foreignKeyName: "routes_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          address: string
          coverage_radius_km: number
          created_at: string
          district: string
          division: string
          donations_facilitated: number
          employee_id: string | null
          id: string
          is_active: boolean
          latitude: number
          location: unknown
          longitude: number
          requests_handled: number
          success_rate: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          coverage_radius_km?: number
          created_at?: string
          district: string
          division: string
          donations_facilitated?: number
          employee_id?: string | null
          id?: string
          is_active?: boolean
          latitude: number
          location?: unknown
          longitude?: number
          requests_handled?: number
          success_rate?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          coverage_radius_km?: number
          created_at?: string
          district?: string
          division?: string
          donations_facilitated?: number
          employee_id?: string | null
          id?: string
          is_active?: boolean
          latitude?: number
          location?: unknown
          longitude?: number
          requests_handled?: number
          success_rate?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Enums: {
      assignment_status: "pending" | "accepted" | "declined" | "completed" | "cancelled"
      assignment_type: "donor" | "volunteer"
      blood_group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      gender: "male" | "female" | "other"
      notification_channel: "email" | "sms" | "push" | "in_app"
      notification_status: "pending" | "sent" | "delivered" | "failed" | "read"
      notification_type: "request_created" | "request_approved" | "assignment_created" | "donation_completed" | "general"
      request_status: "pending" | "approved" | "assigned" | "completed" | "cancelled"
      urgency_level: "low" | "medium" | "high" | "critical"
      user_role: "donor" | "volunteer" | "admin" | "super_admin"
    }
    Views: {
      active_tracking: {
        Row: {
          assignee_id: string | null
          assignment_id: string | null
          blood_group: Database["public"]["Enums"]["blood_group"] | null
          donor_current_location: unknown
          donor_name: string | null
          donor_phone: string | null
          estimated_arrival_time: string | null
          hospital_latitude: number | null
          hospital_longitude: number | null
          hospital_name: string | null
          is_in_transit: boolean | null
          last_location_update: string | null
          request_id: string | null
          route_distance_km: number | null
          route_duration_minutes: number | null
          urgency: Database["public"]["Enums"]["urgency_level"] | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      calculate_distance_km: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
// The file content continues...
