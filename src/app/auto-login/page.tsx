"use client";

import { useEffect, useState } from "react";

export default function AutoLoginPage() {
  const [status, setStatus] = useState("Logging in...");

  useEffect(() => {
    const login = async () => {
      try {
        setStatus("Calling login API...");
        
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "gazi.faysal.jubayer@gmail.com",
            password: "Admin@123456",
          }),
        });

        const result = await response.json();
        
        if (!result.success) {
          setStatus(`Error: ${result.error}`);
          return;
        }

        setStatus(`Success! Role: ${result.role}. Setting session...`);

        // Import and set session
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        
        if (result.session) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          });
          
          if (sessionError) {
            setStatus(`Session error: ${sessionError.message}`);
            return;
          }
        }

        setStatus(`Success! Role: ${result.role}. Redirecting...`);
        
        // Wait a moment for session to be set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirect
        if (result.role === "admin") {
          setStatus("Redirecting to admin dashboard...");
          window.location.href = "/dashboard/admin";
        } else {
          window.location.href = "/dashboard";
        }
      } catch (error: any) {
        setStatus(`Error: ${error.message}`);
      }
    };

    login();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{status}</h1>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
}

