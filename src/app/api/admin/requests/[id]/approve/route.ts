import { requireAdmin, logAdminAction } from '@/lib/permissions';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { error } = await supabase
      .from('blood_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', id) as any;

    if (error) throw error;

    await logAdminAction('approve_request', 'blood_request', id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Forbidden' },
      { status: 403 }
    );
  }
}


