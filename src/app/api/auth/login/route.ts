import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Step 1: Authenticate via Supabase REST API
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseAnonKey,
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: authData.error_description || authData.msg || "Invalid credentials" 
        },
        { status: 401 }
      );
    }

    // Step 2: Fetch profile using service role (bypasses RLS)
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${authData.user.id}&select=role,full_name`,
      {
        headers: {
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
      }
    );

    const profiles = await profileResponse.json();
    const profile = profiles?.[0];

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // Step 3: Set auth cookie
    const cookieStore = await cookies();
    const projectRef = supabaseUrl.split('//')[1].split('.')[0];
    
    cookieStore.set(`sb-${projectRef}-auth-token`, JSON.stringify({
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      expires_at: authData.expires_at,
      expires_in: authData.expires_in,
      token_type: authData.token_type,
      user: authData.user,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: authData.expires_in || 3600,
    });

    // Step 4: Return success with role for redirect
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: profile.full_name,
      },
      role: profile.role,
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
