import { requireAdmin, logAdminAction } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAdmin();
    const supabase = createClient();

    const { error } = await supabase
      .from('blood_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) throw error;

    await logAdminAction('approve_request', 'blood_request', params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Forbidden' },
      { status: 403 }
    );
  }
}


