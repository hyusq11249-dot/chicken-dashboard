export const STEP_MAP = [
  { section: 0, sub: 0 },  // KPI 카드 1
  { section: 0, sub: 1 },  // KPI 카드 2
  { section: 0, sub: 2 },  // KPI 카드 3
  { section: 0, sub: 3 },  // KPI 카드 4
  { section: 1, sub: 0 },  // 일별: 헤더
  { section: 1, sub: 1 },  // 일별: 차트
  { section: 2, sub: 0 },  // 채널: 헤더
  { section: 2, sub: 1 },  // 채널: 차트
  { section: 3, sub: 0 },  // 제품: 헤더
  { section: 3, sub: 1 },  // 제품: 차트
] as const;

export const SECTION_TITLES = [
  '핵심 KPI 요약',
  '일별 매출 트렌드',
  '채널별 성과 분석',
  '제품 포트폴리오',
];
