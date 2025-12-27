import { createClient } from '@/lib/supabase/server';

/**
 * Require admin role for server-side route handlers
 * Throws error if user is not authenticated or not an admin
 */
export async function requireAdmin() {
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized - Please log in');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden - Admin access required');
  }

  return { user, profile };
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  try {
    const { user } = await requireAdmin();
    const supabase = createClient();

    const { data: admin } = await supabase
      .from('admins')
      .select('permissions')
      .eq('user_id', user.id)
      .single();

    return admin?.permissions?.includes(permission) || false;
  } catch {
    return false;
  }
}

/**
 * Require specific permission
 * Throws error if user doesn't have permission
 */
export async function requirePermission(permission: string) {
  const has = await hasPermission(permission);
  
  if (!has) {
    throw new Error(`Forbidden - Permission required: ${permission}`);
  }

  return true;
}

/**
 * Check if user is admin (for client-side)
 */
export async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get admin permissions
 */
export async function getAdminPermissions(): Promise<string[]> {
  try {
    const { user } = await requireAdmin();
    const supabase = createClient();

    const { data: admin } = await supabase
      .from('admins')
      .select('permissions')
      .eq('user_id', user.id)
      .single();

    return admin?.permissions || [];
  } catch {
    return [];
  }
}

/**
 * Log admin action
 */
export async function logAdminAction(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>
) {
  try {
    const { user } = await requireAdmin();
    const supabase = createClient();

    await supabase.from('admin_activity_logs').insert({
      admin_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details || {},
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}


