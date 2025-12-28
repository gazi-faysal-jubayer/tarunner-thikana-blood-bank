import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      fullName,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      weight,
      division,
      district,
      address,
      lastDonationDate,
    } = body;

    // Validate required fields
    if (!email || !password || !fullName || !phone || !bloodGroup) {
      return NextResponse.json(
        { success: false, error: "Required fields missing" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Step 1: Create auth user using Admin API (service role)
    const signUpResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
        email_confirm: true, // Auto-confirm email for now
        user_metadata: {
          full_name: fullName,
          phone,
        },
      }),
    });

    const signUpData = await signUpResponse.json();

    if (!signUpResponse.ok) {
      console.error("Signup error:", signUpData);
      return NextResponse.json(
        {
          success: false,
          error: signUpData.message || signUpData.msg || "Registration failed",
        },
        { status: 400 }
      );
    }

    const userId = signUpData.id;

    // Step 2: Create profile
    const profileData = {
      id: userId,
      email: email.trim(),
      phone,
      full_name: fullName,
      role: "donor", // New registrations are donors by default
    };

    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(profileData),
    });

    if (!profileResponse.ok) {
      const profileError = await profileResponse.text();
      console.error("Profile creation error:", profileError);
      // Don't fail - profile might be created by trigger
    }

    // Step 3: Create donor record
    // Calculate next eligible date if lastDonationDate provided
    let nextEligibleDate = null;
    if (lastDonationDate) {
      const lastDonation = new Date(lastDonationDate);
      nextEligibleDate = new Date(lastDonation);
      nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);
    }

    const donorData = {
      user_id: userId,
      blood_group: bloodGroup,
      date_of_birth: dateOfBirth || null,
      gender: gender || null,
      weight: weight ? parseFloat(weight) : null,
      address: address || null,
      district: district || null,
      division: division || null,
      latitude: 23.8103, // Default Dhaka coordinates
      longitude: 90.4125,
      is_available: true,
      last_donation_date: lastDonationDate || null,
      next_eligible_date: nextEligibleDate ? nextEligibleDate.toISOString().split("T")[0] : null,
      total_donations: lastDonationDate ? 1 : 0,
    };

    const donorResponse = await fetch(`${supabaseUrl}/rest/v1/donors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(donorData),
    });

    if (!donorResponse.ok) {
      const donorError = await donorResponse.text();
      console.error("Donor creation error:", donorError);
    }

    // Step 4: Log the user in by getting a token
    const loginResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
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

    const loginData = await loginResponse.json();

    if (loginResponse.ok && loginData.access_token) {
      // Set auth cookie
      const cookieStore = await cookies();
      const projectRef = supabaseUrl.split("//")[1].split(".")[0];

      cookieStore.set(`sb-${projectRef}-auth-token`, JSON.stringify({
        access_token: loginData.access_token,
        refresh_token: loginData.refresh_token,
        expires_at: loginData.expires_at,
        expires_in: loginData.expires_in,
        token_type: loginData.token_type,
        user: loginData.user,
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: loginData.expires_in || 3600,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user: {
        id: userId,
        email: email.trim(),
        name: fullName,
      },
      role: "donor",
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
