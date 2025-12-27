"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminDashboard, VolunteerDashboard, DonorDashboard } from "@/components/dashboard";

type UserRole = "admin" | "volunteer" | "donor";

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const result = await response.json();

        if (!result.success || !result.user) {
          router.push("/login");
          return;
        }

        setRole(result.role as UserRole);
      } catch (error) {
        console.error("Error getting user role:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blood-600 mx-auto mb-4" />
          <p className="text-muted-foreground">ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Render role-specific dashboard content
  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "volunteer":
      return <VolunteerDashboard />;
    case "donor":
      return <DonorDashboard />;
    default:
      return <DonorDashboard />; // Default to donor view
  }
}
