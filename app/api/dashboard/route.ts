import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { fmtKrw } from '@/lib/formatters';
import type { Period } from '@/lib/types';
type GroupBy = 'daily' | 'weekly' | 'monthly' | 'quarterly';

// ── 날짜 범위 계산 ─────────────────────────────────────────────
// anchor: DB 최신 날짜 기준 (new Date()가 데이터보다 미래일 때 대응)
function resolveDateRange(
  period: Period,
  anchor: Date,
  customStart?: string,
  customEnd?: string,
): { start: string; end: string } {
  if (period === 'custom' && customStart && customEnd) {
    return { start: customStart, end: customEnd };
  }
  const end   = new Date(anchor);
  const start = new Date(anchor);
  if (period === 'weekly') {
    start.setDate(end.getDate() - 7 * 13);           // 13주
  } else {
    start.setDate(1);                                 // 말일 오버플로우 방지 후 월 조정
    if (period === 'monthly')   start.setMonth(end.getMonth() - 2);   // 3개월
    else                        start.setMonth(end.getMonth() - 11);  // 4분기 = 12개월
  }
  return {
    start: start.toISOString().slice(0, 10),
    end:   end.toISOString().slice(0, 10),
  };
}

// 범위 길이에 따라 집계 단위 자동 결정
function resolveGroupBy(period: Period, start: string, end: string): GroupBy {
  if (period !== 'custom') {
    if (period === 'weekly')    return 'weekly';
    if (period === 'monthly')   return 'monthly';
    if (period === 'quarterly') return 'quarterly';
  }
  const days = (new Date(end).getTime() - new Date(start).getTime()) / 86400000;
  if (days <= 14)  return 'daily';
  if (days <= 90)  return 'weekly';
  if (days <= 365) return 'monthly';
  return 'quarterly';
}

// ── 트렌드 rows 집계 ──────────────────────────────────────────
function groupTrend(
  rows: { sale_date: string; category: string; amount_krw: number }[],
  groupBy: GroupBy,
) {
  const map = new Map<string, { dateStart: string; dateEnd: string; [k: string]: unknown }>();

  // 연도가 복수인 경우 monthly 레이블에 연도 표기
  const years = new Set(rows.map(r => new Date(r.sale_date).getFullYear()));
  const multiYear = years.size > 1;

  for (const row of rows) {
    const d = new Date(row.sale_date);
    let label: string;

    if (groupBy === 'quarterly') {
      const q = Math.floor(d.getMonth() / 3) + 1;
      label = `Q${q} ${d.getFullYear()}`;
    } else if (groupBy === 'monthly') {
      label = multiYear
        ? `${d.getMonth() + 1}월 '${String(d.getFullYear()).slice(2)}`
        : `${d.getMonth() + 1}월`;
    } else if (groupBy === 'weekly') {
      const day = d.getDay();
      const mon = new Date(d);
      mon.setDate(d.getDate() - ((day + 6) % 7));
      label = `${String(mon.getMonth() + 1).padStart(2, '0')}/${String(mon.getDate()).padStart(2, '0')}`;
    } else {
      // daily
      label = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    }

    if (!map.has(label)) {
      map.set(label, {
        label,
        dateStart: row.sale_date,
        dateEnd:   row.sale_date,
        후라이드양념: 0, 순살치킨: 0, 사이드메뉴: 0, 음료기타: 0,
      });
    }
    const entry = map.get(label)!;
    entry.dateEnd = row.sale_date;
    (entry[row.category] as number) += Math.round(row.amount_krw / 10000);
  }

  return Array.from(map.values());
}

// ── GET /api/dashboard ────────────────────────────────────────
// params: period=weekly|monthly|quarterly|custom
//         start=YYYY-MM-DD  (period=custom일 때 필수)
//         end=YYYY-MM-DD    (period=custom일 때 필수)
export async function GET(req: NextRequest) {
  const params       = req.nextUrl.searchParams;
  const period       = (params.get('period') ?? 'monthly') as Period;
  const customStart  = params.get('start') ?? undefined;
  const customEnd    = params.get('end')   ?? undefined;

  const supabase = getSupabase();

  // DB 최신 날짜를 기준점으로 — 시드 데이터가 과거에 끝나도 올바른 범위 계산
  const { data: anchorRow } = await supabase
    .from('daily_sales')
    .select('sale_date')
    .order('sale_date', { ascending: false })
    .limit(1)
    .single();
  const anchor = anchorRow ? new Date(anchorRow.sale_date) : new Date();

  const { start, end } = resolveDateRange(period, anchor, customStart, customEnd);
  const groupBy        = resolveGroupBy(period, start, end);

  const [dailyRes, channelRes, productRes] = await Promise.all([
    supabase
      .from('daily_sales')
      .select('sale_date, category, amount_krw')
      .gte('sale_date', start)
      .lte('sale_date', end)
      .order('sale_date'),

    supabase
      .from('channel_sales')
      .select('channel, amount_krw')
      .gte('month_start', start)
      .lte('month_start', end),

    supabase
      .from('product_sales')
      .select('product_name, amount_krw')
      .gte('month_start', start)
      .lte('month_start', end)
      .order('amount_krw', { ascending: false })
      .limit(10),
  ]);

  if (dailyRes.error || channelRes.error || productRes.error) {
    return NextResponse.json({ error: 'DB query failed' }, { status: 500 });
  }

  const dailyRows  = dailyRes.data  ?? [];
  const totalWon   = dailyRows.reduce((s, r) => s + r.amount_krw, 0);

  const endMonth   = new Date(end).getMonth();
  const thisMonthWon = dailyRows
    .filter(r => new Date(r.sale_date).getMonth() === endMonth)
    .reduce((s, r) => s + r.amount_krw, 0);
  const prevMonthWon = dailyRows
    .filter(r => new Date(r.sale_date).getMonth() === endMonth - 1)
    .reduce((s, r) => s + r.amount_krw, 0);
  const momPct = prevMonthWon > 0
    ? ((thisMonthWon - prevMonthWon) / prevMonthWon * 100).toFixed(1)
    : null;

  const channelMap = new Map<string, number>();
  for (const r of channelRes.data ?? []) {
    channelMap.set(r.channel, (channelMap.get(r.channel) ?? 0) + r.amount_krw);
  }
  const channelTotal   = Array.from(channelMap.values()).reduce((s, v) => s + v, 0);
  const deliveryShare  = channelTotal > 0
    ? Math.round((channelMap.get('배달앱') ?? 0) / channelTotal * 1000) / 10
    : 0;

  const productMap = new Map<string, number>();
  for (const r of productRes.data ?? []) {
    productMap.set(r.product_name, (productMap.get(r.product_name) ?? 0) + r.amount_krw);
  }
  const sortedProducts = Array.from(productMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return NextResponse.json({
    meta: { period, groupBy, rangeStart: start, rangeEnd: end, generatedAt: new Date().toISOString() },
    kpis: [
      {
        id: 'total_revenue', label: '기간 총매출',
        value: totalWon, display: fmtKrw(totalWon), unit: '원',
        sub: `${start.slice(0, 7)} ~ ${end.slice(0, 7)}`, trend: null, warning: false,
      },
      {
        id: 'latest_month_revenue', label: `${new Date(end).getMonth() + 1}월 매출`,
        value: thisMonthWon, display: fmtKrw(thisMonthWon), unit: '원',
        sub: momPct ? `전월 대비 ${Number(momPct) >= 0 ? '▲' : '▼'}${Math.abs(Number(momPct))}%` : '전월 데이터 없음',
        trend: momPct ? (Number(momPct) >= 0 ? 'up' : 'down') : null, warning: false,
      },
      {
        id: 'avg_order_value', label: '평균 건당 매출',
        value: 16529, display: '16,529', unit: '원',
        sub: '충청권 17,243원 최고', trend: null, warning: false,
      },
      {
        id: 'delivery_app_share', label: '배달앱 비중',
        value: deliveryShare, display: String(deliveryShare), unit: '%',
        sub: '채널 의존도', trend: null, warning: deliveryShare > 50,
      },
    ],
    trend: {
      rows: groupTrend(dailyRows, groupBy),
      categories: ['후라이드양념', '순살치킨', '사이드메뉴', '음료기타'],
    },
    channels: Array.from(channelMap.entries()).map(([name, amount]) => ({
      name,
      share:   Math.round(amount / channelTotal * 1000) / 10,
      amount,
      display: fmtKrw(amount),
      note:    name === '배달앱' && deliveryShare > 50 ? '수수료 리스크'
             : name === '자사앱' ? '전환 기회' : null,
    })).sort((a, b) => b.share - a.share),
    products: sortedProducts.map(([name, amount], i) => ({
      rank: i + 1, name, amount, display: fmtKrw(amount),
    })),
    insights: {
      kpi:     `${start.slice(0, 7)} ~ ${end.slice(0, 7)} 총 ${fmtKrw(totalWon)}원. 배달앱 비중 ${deliveryShare}% — 채널 다변화 필요.`,
      trend:   `${groupBy === 'daily' ? '일별' : groupBy === 'weekly' ? '주별' : groupBy === 'monthly' ? '월별' : '분기별'} 추이. 후라이드계 매출 견인 지속.`,
      channel: `배달앱 ${deliveryShare}% 집중 → 플랫폼 수수료 리스크. 자사앱 전환 권장.`,
      product: '크리스피치킨 단품 1위. 사이드+음료 세트화로 객단가 상승 가능.',
    },
  });
}
