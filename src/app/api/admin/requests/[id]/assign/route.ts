import { requireAdmin, logAdminAction } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAdmin();
    const body = await request.json();
    const { volunteerId, donorId, notes } = body;

    const supabase = createClient();

    // Create assignment
    const { error: assignmentError } = await supabase
      .from('assignments')
      .insert({
        request_id: params.id,
        assignee_id: volunteerId || donorId,
        type: volunteerId ? 'volunteer' : 'donor',
        assigned_by: user.id,
        status: 'pending',
        notes: notes || null,
      });

    if (assignmentError) throw assignmentError;

    // Update request status
    const newStatus = volunteerId ? 'volunteer_assigned' : 'donor_assigned';
    const { error: updateError } = await supabase
      .from('blood_requests')
      .update({ status: newStatus })
      .eq('id', params.id);

    if (updateError) throw updateError;

    await logAdminAction('assign_request', 'blood_request', params.id, {
      assignee_id: volunteerId || donorId,
      type: volunteerId ? 'volunteer' : 'donor',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Forbidden' },
      { status: 403 }
    );
  }
}

