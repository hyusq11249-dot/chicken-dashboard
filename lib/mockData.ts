import type { Period } from '@/lib/types';

export const STEP_MAP = [
  { section: 0, sub: 0 }, { section: 0, sub: 1 }, { section: 0, sub: 2 }, { section: 0, sub: 3 },
  { section: 1, sub: 0 }, { section: 1, sub: 1 },
  { section: 2, sub: 0 }, { section: 2, sub: 1 },
  { section: 3, sub: 0 }, { section: 3, sub: 1 },
] as const;

export const SECTION_TITLES = ['핵심 KPI 요약', '일별 매출 트렌드', '채널별 성과 분석', '제품 포트폴리오'];

export const SECTION_START = [0, 4, 6, 8] as const;

export const PERIOD_LABELS: Record<Period, string> = {
  weekly: '주간', monthly: '월간', quarterly: '분기', custom: '직접입력',
};

export const CHANNEL_COLORS = ['#f07c20', '#6366f1', '#10b981', '#f59e0b'];

export const LABEL_COLOR: Record<string, string> = {
  '3개월 총매출':   '#f07c20',
  '11월 매출':     '#6366f1',
  '평균 건당 매출': '#10b981',
  '배달앱 비중':    '#f59e0b',
};
