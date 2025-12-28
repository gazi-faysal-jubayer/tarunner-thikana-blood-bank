import { requireAdmin, logAdminAction } from '@/lib/permissions';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAdmin();
    const body = await request.json();
    const { volunteerId, donorId, notes } = body;
    const { id } = await params;

    const supabase: any = await createServerSupabaseClient();

    // Create assignment
    const { error: assignmentError } = await supabase
      .from('assignments')
      .insert({
        request_id: id,
        assignee_id: volunteerId || donorId,
        type: volunteerId ? 'volunteer' : 'donor',
        assigned_by: user.id,
        status: 'pending',
        response_note: notes || null,
      });

    if (assignmentError) throw assignmentError;

    // Update request status and assigned volunteer if applicable
    const newStatus = volunteerId ? 'volunteer_assigned' : 'donor_assigned';
    
    const updateData: any = { status: newStatus };
    if (volunteerId) {
      updateData.assigned_volunteer_id = volunteerId;
    }
    
    const { error: updateError } = await supabase
      .from('blood_requests')
      .update(updateData)
      .eq('id', id);

    if (updateError) throw updateError;

    await logAdminAction('assign_request', 'blood_request', id, {
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


