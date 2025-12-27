import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole, BloodGroup } from "@/lib/supabase/types";

interface User {
  id: string;
  email: string | null;
  phone: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
}

interface DonorProfile {
  id: string;
  bloodGroup: BloodGroup;
  isAvailable: boolean;
  totalDonations: number;
  lastDonationDate: string | null;
  nextEligibleDate: string | null;
}

interface VolunteerProfile {
  id: string;
  isActive: boolean;
  requestsHandled: number;
  successRate: number;
}

interface AuthState {
  user: User | null;
  donorProfile: DonorProfile | null;
  volunteerProfile: VolunteerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setDonorProfile: (profile: DonorProfile | null) => void;
  setVolunteerProfile: (profile: VolunteerProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      donorProfile: null,
      volunteerProfile: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setDonorProfile: (donorProfile) => set({ donorProfile }),

      setVolunteerProfile: (volunteerProfile) => set({ volunteerProfile }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          donorProfile: null,
          volunteerProfile: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        donorProfile: state.donorProfile,
        volunteerProfile: state.volunteerProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


