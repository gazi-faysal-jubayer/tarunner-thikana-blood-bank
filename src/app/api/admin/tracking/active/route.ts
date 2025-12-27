import { requireAdmin } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createClient();

    const { data, error } = await supabase
      .from('active_tracking')
      .select('*');

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Forbidden' },
      { status: 403 }
    );
  }
}


