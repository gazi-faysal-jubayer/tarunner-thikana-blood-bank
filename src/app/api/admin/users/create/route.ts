import { requirePermission, logAdminAction } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await requirePermission('users.create');
    const body = await request.json();
    const { email, password, role, ...userData } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Create auth user (requires service role key in production)
    // For now, return instruction to create via Supabase Dashboard
    const response = {
      success: false,
      message: 'Please create user via Supabase Dashboard first',
      instructions: [
        '1. Go to Supabase Dashboard → Authentication → Users',
        '2. Click "Add User"',
        `3. Enter email: ${email}`,
        `4. Enter password: ${password}`,
        '5. Auto Confirm User: Yes',
        '6. Then call this endpoint with user_id',
      ],
    };

    await logAdminAction('attempt_create_user', 'user', undefined, {
      email,
      role,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Forbidden' },
      { status: 403 }
    );
  }
}


