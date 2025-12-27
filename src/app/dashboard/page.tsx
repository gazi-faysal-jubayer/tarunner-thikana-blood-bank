"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToRoleDashboard = async () => {
      try {
        // Call our API endpoint to get user role (uses service role, bypasses RLS)
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!data.authenticated) {
          router.push("/login");
          return;
        }

        // Redirect based on role
        const role = data.role || "donor";
        
        switch (role) {
          case "admin":
            router.replace("/dashboard/admin");
            break;
          case "volunteer":
            router.replace("/dashboard/volunteer");
            break;
          case "donor":
          default:
            router.replace("/dashboard/donor");
            break;
        }
      } catch (error) {
        console.error("Error getting user role:", error);
        router.push("/login");
      }
    };

    redirectToRoleDashboard();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-blood-600 mx-auto mb-4" />
        <p className="text-muted-foreground">ড্যাশবোর্ডে নিয়ে যাচ্ছি...</p>
      </div>
    </div>
  );
}
