export type Period = 'weekly' | 'monthly' | 'quarterly' | 'custom';

export interface KpiItem {
  id: string;
  label: string;
  value: number;
  display: string;
  unit: string;
  sub: string;
  trend: null | 'up' | 'down';
  warning: boolean;
}

export interface TrendRow {
  label: string;
  dateStart: string;
  dateEnd: string;
  후라이드양념: number;
  순살치킨: number;
  사이드메뉴: number;
  음료기타: number;
}

export interface ChannelItem {
  name: string;
  share: number;
  amount: number;
  display: string;
  note: string | null;
}

export interface ProductItem {
  rank: number;
  name: string;
  amount: number;
  display: string;
}

export interface DashboardData {
  meta: { period: Period; rangeStart: string; rangeEnd: string };
  kpis: KpiItem[];
  trend: { rows: TrendRow[]; categories: string[] };
  channels: ChannelItem[];
  products: ProductItem[];
  insights: { kpi: string; trend: string; channel: string; product: string };
}
