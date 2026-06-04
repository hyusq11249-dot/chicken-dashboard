import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

type Period = 'weekly' | 'monthly' | 'quarterly';

// ── 날짜 범위 계산 ─────────────────────────────────────────────
function dateRange(period: Period): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  if (period === 'weekly')      start.setDate(end.getDate() - 7 * 13);   // ~13주
  else if (period === 'monthly') start.setMonth(end.getMonth() - 2);      // 3개월
  else                           start.setMonth(end.getMonth() - 8);      // ~3분기
  return {
    start: start.toISOString().slice(0, 10),
    end:   end.toISOString().slice(0, 10),
  };
}

// ── 트렌드 rows 집계 ──────────────────────────────────────────
function groupTrend(
  rows: { sale_date: string; category: string; amount_krw: number }[],
  period: Period,
) {
  const map = new Map<string, { dateStart: string; dateEnd: string; [k: string]: unknown }>();

  for (const row of rows) {
    const d = new Date(row.sale_date);
    let label: string;

    if (period === 'quarterly') {
      const q = Math.floor(d.getMonth() / 3) + 1;
      label = `Q${q} ${d.getFullYear()}`;
    } else if (period === 'monthly') {
      label = `${d.getMonth() + 1}월`;
    } else {
      // weekly: 월요일 기준
      const day = d.getDay();
      const mon = new Date(d);
      mon.setDate(d.getDate() - ((day + 6) % 7));
      label = `${String(mon.getMonth() + 1).padStart(2, '0')}/${String(mon.getDate()).padStart(2, '0')}`;
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
    (entry[row.category] as number) += Math.round(row.amount_krw / 10000); // 만원
  }

  return Array.from(map.values());
}

// ── 포맷 헬퍼 ─────────────────────────────────────────────────
function fmtKrw(won: number): string {
  const man = Math.round(won / 10000);
  if (man >= 10000) return `${Math.round(man / 1000) / 10}억 ${man % 10000 > 0 ? (man % 10000).toLocaleString() + '만' : ''}`.trim();
  return `${man.toLocaleString()}만`;
}

// ── GET /api/dashboard?period=weekly|monthly|quarterly ────────
export async function GET(req: NextRequest) {
  const period = (req.nextUrl.searchParams.get('period') ?? 'monthly') as Period;
  const { start, end } = dateRange(period);

  const supabase = getSupabase();

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

  // ── KPI 계산 ──────────────────────────────────────────────
  const dailyRows = dailyRes.data ?? [];
  const totalWon  = dailyRows.reduce((s, r) => s + r.amount_krw, 0);

  // 이전 기간 총매출 (전월 비교용)
  const monthRows = dailyRows.filter(r => {
    const m = new Date(r.sale_date).getMonth();
    return m === new Date(end).getMonth();
  });
  const prevRows = dailyRows.filter(r => {
    const m = new Date(r.sale_date).getMonth();
    return m === new Date(end).getMonth() - 1;
  });
  const thisMonthWon = monthRows.reduce((s, r) => s + r.amount_krw, 0);
  const prevMonthWon = prevRows.reduce((s, r) => s + r.amount_krw, 0);
  const momPct = prevMonthWon > 0
    ? ((thisMonthWon - prevMonthWon) / prevMonthWon * 100).toFixed(1)
    : null;

  // 채널 합계
  const channelRows = channelRes.data ?? [];
  const channelMap = new Map<string, number>();
  for (const r of channelRows) channelMap.set(r.channel, (channelMap.get(r.channel) ?? 0) + r.amount_krw);
  const channelTotal = Array.from(channelMap.values()).reduce((s, v) => s + v, 0);
  const deliveryShare = channelTotal > 0
    ? Math.round((channelMap.get('배달앱') ?? 0) / channelTotal * 1000) / 10
    : 0;

  // 제품 합계
  const productMap = new Map<string, number>();
  for (const r of productRes.data ?? []) {
    productMap.set(r.product_name, (productMap.get(r.product_name) ?? 0) + r.amount_krw);
  }
  const sortedProducts = Array.from(productMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // ── 응답 조합 ─────────────────────────────────────────────
  return NextResponse.json({
    meta: {
      period,
      rangeStart:   start,
      rangeEnd:     end,
      generatedAt:  new Date().toISOString(),
    },
    kpis: [
      {
        id: 'total_revenue', label: '기간 총매출',
        value: totalWon, display: fmtKrw(totalWon), unit: '원',
        sub: `${start.slice(0,7)} ~ ${end.slice(0,7)}`, trend: null, warning: false,
      },
      {
        id: 'latest_month_revenue', label: `${new Date(end).getMonth() + 1}월 매출`,
        value: thisMonthWon, display: fmtKrw(thisMonthWon), unit: '원',
        sub: momPct ? `전월 대비 ${Number(momPct) >= 0 ? '▲' : '▼'}${Math.abs(Number(momPct))}%` : '전월 데이터 없음',
        trend: momPct ? (Number(momPct) >= 0 ? 'up' : 'down') : null, warning: false,
      },
      {
        id: 'delivery_app_share', label: '배달앱 비중',
        value: deliveryShare, display: String(deliveryShare), unit: '%',
        sub: '채널 의존도', trend: null, warning: deliveryShare > 50,
      },
    ],
    trend: {
      rows: groupTrend(dailyRows, period),
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
      rank:    i + 1,
      name,
      amount,
      display: fmtKrw(amount),
    })),
    insights: {
      kpi:     `${period === 'monthly' ? '3개월' : period === 'weekly' ? '13주' : '분기'} 총 ${fmtKrw(totalWon)}원. 배달앱 비중 ${deliveryShare}% — 채널 다변화 필요.`,
      trend:   '후라이드계 매출 견인 지속. 순살치킨 추세 점검 필요.',
      channel: `배달앱 ${deliveryShare}% 집중 → 플랫폼 수수료 리스크. 자사앱 전환 권장.`,
      product: '크리스피치킨 단품 1위. 사이드+음료 세트화로 객단가 상승 가능.',
    },
  });
}
