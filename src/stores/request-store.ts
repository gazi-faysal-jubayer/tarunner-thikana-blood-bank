import { create } from "zustand";
import type { BloodGroup, UrgencyLevel, RequestStatus } from "@/lib/supabase/types";

interface BloodRequest {
  id: string;
  trackingId: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospitalName: string;
  hospitalAddress: string;
  latitude: number;
  longitude: number;
  district: string;
  division: string;
  neededBy: string;
  isEmergency: boolean;
  urgency: UrgencyLevel;
  status: RequestStatus;
  patientName: string;
  requesterName: string;
  requesterPhone: string;
  assignedVolunteerId: string | null;
  createdAt: string;
}

interface RequestState {
  requests: BloodRequest[];
  selectedRequest: BloodRequest | null;
  filters: {
    bloodGroup: BloodGroup | "all";
    urgency: UrgencyLevel | "all";
    status: RequestStatus | "all";
    district: string | "all";
  };
  isLoading: boolean;

  // Actions
  setRequests: (requests: BloodRequest[]) => void;
  addRequest: (request: BloodRequest) => void;
  updateRequest: (id: string, updates: Partial<BloodRequest>) => void;
  setSelectedRequest: (request: BloodRequest | null) => void;
  setFilter: (key: keyof RequestState["filters"], value: string) => void;
  setLoading: (loading: boolean) => void;
  getFilteredRequests: () => BloodRequest[];
}

export const useRequestStore = create<RequestState>((set, get) => ({
  requests: [],
  selectedRequest: null,
  filters: {
    bloodGroup: "all",
    urgency: "all",
    status: "all",
    district: "all",
  },
  isLoading: false,

  setRequests: (requests) => set({ requests }),

  addRequest: (request) =>
    set((state) => ({
      requests: [request, ...state.requests],
    })),

  updateRequest: (id, updates) =>
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id ? { ...req, ...updates } : req
      ),
    })),

  setSelectedRequest: (selectedRequest) => set({ selectedRequest }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  getFilteredRequests: () => {
    const { requests, filters } = get();
    return requests.filter((request) => {
      if (filters.bloodGroup !== "all" && request.bloodGroup !== filters.bloodGroup)
        return false;
      if (filters.urgency !== "all" && request.urgency !== filters.urgency)
        return false;
      if (filters.status !== "all" && request.status !== filters.status)
        return false;
      if (filters.district !== "all" && request.district !== filters.district)
        return false;
      return true;
    });
  },
}));


