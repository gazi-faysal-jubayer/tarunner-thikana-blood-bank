"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function TestLoginPage() {
  const [status, setStatus] = useState("Starting login test...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testLogin = async () => {
      try {
        setStatus("Calling /api/auth/login...");
        
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "gazi.faysal.jubayer@gmail.com",
            password: "Admin@123456",
          }),
        });

        const result = await response.json();
        
        if (!result.success) {
          setError(`Login failed: ${result.error}`);
          return;
        }

        setStatus(`Login successful! Role: ${result.role}. Redirecting...`);

        // Redirect based on role
        setTimeout(() => {
          window.location.href = 
            result.role === "admin" ? "/dashboard/admin" :
            result.role === "volunteer" ? "/dashboard/volunteer" :
            "/dashboard/donor";
        }, 1000);
        
      } catch (err: any) {
        setError(`Error: ${err.message}`);
      }
    };

    testLogin();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Test Login</h1>
        
        {error ? (
          <div className="text-red-600 mb-4">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}

