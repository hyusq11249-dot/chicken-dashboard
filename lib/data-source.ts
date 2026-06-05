import type { DashboardData, Period } from '@/lib/types';

export async function fetchDashboard(
  period: Period,
  customStart?: string,
  customEnd?: string,
): Promise<DashboardData> {
  const url = period === 'custom' && customStart && customEnd
    ? `/api/dashboard?period=custom&start=${customStart}&end=${customEnd}`
    : `/api/dashboard?period=${period}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('fetch failed');
  return r.json() as Promise<DashboardData>;
}
