import { requireAdmin } from '@/lib/permissions';
import {
  getRequestTrends,
  getBloodGroupDemand,
  getVolunteerPerformance,
  getGeographicDistribution,
  getResponseTimes,
  getDashboardStats,
} from '@/lib/queries/analytics';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let data: any = {};

    if (type === 'all' || type === 'dashboard') {
      data.dashboard = await getDashboardStats();
    }

    if (type === 'all' || type === 'trends') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      data.trends = await getRequestTrends(
        thirtyDaysAgo.toISOString().split('T')[0],
        now.toISOString().split('T')[0]
      );
    }

    if (type === 'all' || type === 'bloodGroups') {
      data.bloodGroups = await getBloodGroupDemand();
    }

    if (type === 'all' || type === 'volunteers') {
      data.volunteers = await getVolunteerPerformance();
    }

    if (type === 'all' || type === 'geographic') {
      data.geographic = await getGeographicDistribution();
    }

    if (type === 'all' || type === 'responseTimes') {
      data.responseTimes = await getResponseTimes();
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Forbidden' },
      { status: 403 }
    );
  }
}

