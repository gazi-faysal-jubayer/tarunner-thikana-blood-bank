import { createClient } from '@/lib/supabase/client';

/**
 * Get request trends over time
 */
export async function getRequestTrends(startDate: string, endDate: string) {
  const supabase: any = createClient();

  const { data, error } = await supabase
    .from('blood_requests')
    .select('created_at, status, urgency')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at');

  if (error) throw error;

  // Group by date
  const trendsMap = new Map<string, { total: number; critical: number; completed: number }>();
  
  data?.forEach((request: any) => {
    const date = new Date(request.created_at).toISOString().split('T')[0];
    const current = trendsMap.get(date) || { total: 0, critical: 0, completed: 0 };
    
    current.total++;
    if (request.urgency === 'critical') current.critical++;
    if (request.status === 'completed') current.completed++;
    
    trendsMap.set(date, current);
  });

  return Array.from(trendsMap.entries()).map(([date, stats]) => ({
    date,
    ...stats,
  }));
}

/**
 * Get blood group demand analysis
 */
export async function getBloodGroupDemand() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('blood_requests')
    .select('blood_group, status, urgency');

  if (error) throw error;

  // Group by blood group
  const demandMap = new Map<string, { total: number; pending: number; critical: number }>();
  
  data?.forEach((request: any) => {
    const current = demandMap.get(request.blood_group) || { total: 0, pending: 0, critical: 0 };
    
    current.total++;
    if (['submitted', 'approved'].includes(request.status)) current.pending++;
    if (request.urgency === 'critical') current.critical++;
    
    demandMap.set(request.blood_group, current);
  });

  return Array.from(demandMap.entries()).map(([bloodGroup, stats]) => ({
    bloodGroup,
    ...stats,
  }));
}

/**
 * Get volunteer performance metrics
 */
export async function getVolunteerPerformance() {
  const supabase: any = createClient();

  const { data: volunteers, error: volunteersError } = await supabase
    .from('volunteers')
    .select(`
      id,
      user_id,
      requests_handled,
      donations_facilitated,
      success_rate,
      profiles!inner(full_name)
    `)
    .order('requests_handled', { ascending: false })
    .limit(10);

  if (volunteersError) throw volunteersError;

  // Get assignments for each volunteer
  const volunteersWithAssignments = await Promise.all(
    volunteers?.map(async (volunteer: any) => {
      const { count: totalAssignments } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('assignee_id', volunteer.id)
        .eq('type', 'volunteer');

      const { count: acceptedAssignments } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('assignee_id', volunteer.id)
        .eq('type', 'volunteer')
        .eq('status', 'accepted');

      return {
        id: volunteer.id,
        name: volunteer.profiles.full_name,
        requestsHandled: volunteer.requests_handled,
        donationsFacilitated: volunteer.donations_facilitated,
        successRate: volunteer.success_rate,
        totalAssignments: totalAssignments || 0,
        acceptedAssignments: acceptedAssignments || 0,
      };
    }) || []
  );

  return volunteersWithAssignments;
}

/**
 * Get geographic distribution of requests
 */
export async function getGeographicDistribution() {
  const supabase: any = createClient();

  const { data, error } = await supabase
    .from('blood_requests')
    .select('district, division, status');

  if (error) throw error;

  // Group by district
  const districtMap = new Map<string, { 
    division: string; 
    total: number; 
    pending: number; 
    completed: number; 
  }>();
  
  data?.forEach((request: any) => {
    const current = districtMap.get(request.district) || { 
      division: request.division,
      total: 0, 
      pending: 0, 
      completed: 0 
    };
    
    current.total++;
    if (['submitted', 'approved'].includes(request.status)) current.pending++;
    if (request.status === 'completed') current.completed++;
    
    districtMap.set(request.district, current);
  });

  return Array.from(districtMap.entries())
    .map(([district, stats]) => ({
      district,
      ...stats,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Get response time analytics
 */
export async function getResponseTimes() {
  const supabase: any = createClient();

  const { data, error } = await supabase
    .from('blood_requests')
    .select('created_at, approved_at, completed_at, urgency')
    .not('approved_at', 'is', null);

  if (error) throw error;

  // Calculate average response times
  let totalApprovalTime = 0;
  let totalCompletionTime = 0;
  let approvalCount = 0;
  let completionCount = 0;
  
  const urgencyTimes: Record<string, { 
    approvalTime: number; 
    completionTime: number; 
    count: number 
  }> = {
    critical: { approvalTime: 0, completionTime: 0, count: 0 },
    urgent: { approvalTime: 0, completionTime: 0, count: 0 },
    normal: { approvalTime: 0, completionTime: 0, count: 0 },
  };

  data?.forEach((request: any) => {
    const created = new Date(request.created_at).getTime();
    const approved = request.approved_at ? new Date(request.approved_at).getTime() : null;
    const completed = request.completed_at ? new Date(request.completed_at).getTime() : null;

    if (approved) {
      const approvalTime = (approved - created) / (1000 * 60); // minutes
      totalApprovalTime += approvalTime;
      approvalCount++;
      urgencyTimes[request.urgency].approvalTime += approvalTime;
    }

    if (completed && approved) {
      const completionTime = (completed - created) / (1000 * 60); // minutes
      totalCompletionTime += completionTime;
      completionCount++;
      urgencyTimes[request.urgency].completionTime += completionTime;
      urgencyTimes[request.urgency].count++;
    }
  });

  return {
    avgApprovalTime: approvalCount > 0 ? Math.round(totalApprovalTime / approvalCount) : 0,
    avgCompletionTime: completionCount > 0 ? Math.round(totalCompletionTime / completionCount) : 0,
    byUrgency: Object.entries(urgencyTimes).map(([urgency, times]) => ({
      urgency,
      avgApprovalTime: times.count > 0 ? Math.round(times.approvalTime / times.count) : 0,
      avgCompletionTime: times.count > 0 ? Math.round(times.completionTime / times.count) : 0,
    })),
  };
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  const supabase: any = createClient();

  const [
    pendingRequests,
    activeDonors,
    inTransit,
    completedToday,
    criticalRequests,
  ] = await Promise.all([
    supabase
      .from('blood_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['submitted', 'approved']),
    
    supabase
      .from('donors')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true),
    
    supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('is_in_transit', true),
    
    supabase
      .from('blood_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('completed_at', new Date().toISOString().split('T')[0]),
    
    supabase
      .from('blood_requests')
      .select('*', { count: 'exact', head: true })
      .eq('urgency', 'critical')
      .neq('status', 'completed'),
  ]);

  return {
    pendingRequests: pendingRequests.count || 0,
    activeDonors: activeDonors.count || 0,
    inTransit: inTransit.count || 0,
    completedToday: completedToday.count || 0,
    criticalRequests: criticalRequests.count || 0,
  };
}



