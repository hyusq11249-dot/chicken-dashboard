'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import KpiCard from '@/components/KpiCard';
import { STEP_MAP, SECTION_TITLES } from '@/lib/data';
import type { DashboardData, Period } from '@/lib/types';

const MonthlyChart = dynamic(() => import('@/components/MonthlyChart'), { ssr: false });
const ChannelChart = dynamic(() => import('@/components/ChannelChart'), { ssr: false });
const ProductChart  = dynamic(() => import('@/components/ProductChart'),  { ssr: false });

const TOTAL_STEPS  = STEP_MAP.length;
const SECTION_START = [0, 4, 6, 8] as const;

function sectionOf(step: number) { return STEP_MAP[Math.min(step, TOTAL_STEPS - 1)].section; }

const PERIOD_LABELS: Record<Period, string> = {
  weekly:    '주간',
  monthly:   '월간',
  quarterly: '분기',
};

export default function Dashboard() {
  const [globalStep,    setGlobalStep]    = useState(0);
  const [highWaterMark, setHighWaterMark] = useState(0);
  const [period,        setPeriod]        = useState<Period>('monthly');
  const [apiData,       setApiData]       = useState<DashboardData | null>(null);
  const [isLoading,     setIsLoading]     = useState(true);
  const [isError,       setIsError]       = useState(false);

  const sectionRefs = useRef<(HTMLElement | null)[]>([null, null, null, null]);
  const isScrolling  = useRef(false);
  const currentSection = sectionOf(globalStep);

  // API fetch
  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    fetch(`/api/dashboard?period=${period}`)
      .then(r => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json() as Promise<DashboardData>;
      })
      .then(data => {
        setApiData(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsError(true);
        setIsLoading(false);
      });
  }, [period]);

  // 섹션 스크롤
  useEffect(() => {
    const el = sectionRefs.current[currentSection];
    if (!el) return;
    isScrolling.current = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const timer = setTimeout(() => { isScrolling.current = false; }, 800);
    return () => clearTimeout(timer);
  }, [currentSection]);

  const advance = useCallback(() => {
    setGlobalStep(s => {
      const next = Math.min(s + 1, TOTAL_STEPS - 1);
      setHighWaterMark(m => Math.max(m, next));
      return next;
    });
  }, []);

  const retreat = useCallback(() => {
    setGlobalStep(s => Math.max(s - 1, 0));
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); advance(); }
      if (['ArrowLeft',  'ArrowUp'  ].includes(e.key)) { e.preventDefault(); retreat(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, retreat, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    let lastWheel = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheel < 500) return;
      lastWheel = now;
      if (e.deltaY > 0) advance();
      else retreat();
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [advance, retreat, isLoading]);

  const visibleSub = (sec: number) => {
    let maxSub = -1;
    STEP_MAP.forEach((s, gi) => {
      if (s.section === sec && gi <= highWaterMark) maxSub = s.sub;
    });
    return maxSub;
  };

  const sec0Sub = visibleSub(0);
  const sec1Sub = visibleSub(1);
  const sec2Sub = visibleSub(2);
  const sec3Sub = visibleSub(3);

  // ── 로딩 화면 ────────────────────────────────────────────────
  if (isLoading || !apiData) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #fff8f2 0%, #ffffff 60%)',
        gap: 16,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid #f07c20',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ color: '#9e9e9e', fontSize: 14 }}>데이터 불러오는 중...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 32 }}>⚠</span>
        <span style={{ color: '#6b6b6b', fontSize: 15 }}>데이터를 불러오지 못했습니다.</span>
        <button
          onClick={() => setPeriod(p => p)}
          style={{ padding: '8px 20px', borderRadius: 9999, border: '1px solid #f07c20', background: 'none', color: '#f07c20', cursor: 'pointer', fontSize: 14 }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  const insights = apiData.insights;

  return (
    <div style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* ── 고정 헤더 ─────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 var(--space-8)',
        height: '56px',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        gap: 16,
      }}>
        {/* 좌: 타이틀 + 기간 필터 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent-warm)' }} />
          <span style={{ fontWeight: 700, fontSize: 'var(--text-size-label)', color: 'var(--color-text-base)' }}>
            치킨 매출 대시보드
          </span>
          <span style={{ fontSize: 'var(--text-size-small)', color: 'var(--color-text-muted)' }}>
            {apiData.meta.rangeStart.slice(0, 7)} ~ {apiData.meta.rangeEnd.slice(0, 7)}
          </span>

          {/* period 토글 */}
          <div style={{ display: 'flex', gap: 4, marginLeft: 8, background: '#f5f5f5', borderRadius: 9999, padding: '2px 3px' }}>
            {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  fontSize: 11, fontWeight: period === p ? 700 : 400,
                  color: period === p ? '#fff' : 'var(--color-text-muted)',
                  background: period === p ? 'var(--color-accent-warm)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  padding: '3px 10px',
                  borderRadius: 9999,
                  transition: 'all 0.2s',
                }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* 우: 섹션 탭 */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {SECTION_TITLES.map((title, i) => (
            <button
              key={i}
              onClick={() => {
                const target = SECTION_START[i];
                setGlobalStep(target);
                setHighWaterMark(m => Math.max(m, target));
              }}
              style={{
                fontSize: 'var(--text-size-small)',
                fontWeight: currentSection === i ? 700 : 400,
                color: currentSection === i ? 'var(--color-accent-warm)' : 'var(--color-text-muted)',
                background: currentSection === i ? 'var(--color-accent-warm-bg)' : 'none',
                border: 'none', cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                transition: 'all 0.2s',
              }}
            >
              {i + 1}. {title}
            </button>
          ))}
        </div>
      </header>

      {/* ── 섹션 컨테이너 ─────────────────────────────────────── */}
      <div style={{ height: '100vh', overflowY: 'hidden' }}>

        {/* 섹션 1: KPI */}
        <section
          ref={el => { sectionRefs.current[0] = el; }}
          style={{
            height: '100vh', display: 'flex', flexDirection: 'column',
            justifyContent: 'center',
            padding: 'var(--space-16) var(--space-8)',
            paddingTop: 'calc(var(--space-16) + 56px)',
            background: 'linear-gradient(160deg, #fff8f2 0%, #ffffff 60%)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', bottom: '-80px', right: '-80px',
            width: '380px', height: '380px',
            background: 'var(--color-accent-warm)',
            borderRadius: '60% 70% 40% 50% / 50% 40% 60% 70%',
            opacity: 0.07, pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
            <SectionHeader
              show={sec0Sub >= 0 || currentSection > 0}
              title={SECTION_TITLES[0]}
              insight={insights.kpi}
            />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'var(--space-6)',
              marginTop: 'var(--space-8)',
            }}>
              {apiData.kpis.map((card, i) => (
                <KpiCard
                  key={card.id}
                  label={card.label}
                  value={card.display}
                  unit={card.unit}
                  sub={card.sub}
                  trend={card.trend}
                  warning={card.warning}
                  visible={sec0Sub >= i}
                  delay={i * 80}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 섹션 2: 트렌드 차트 */}
        <section
          ref={el => { sectionRefs.current[1] = el; }}
          style={{
            height: '100vh', display: 'flex', flexDirection: 'column',
            padding: 'var(--space-12) var(--space-8)',
            paddingTop: 'calc(var(--space-12) + 56px)',
            background: '#ffffff',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <SectionHeader show={sec1Sub >= 0} title={SECTION_TITLES[1]} insight={insights.trend} />
            <div style={{ flex: 1, marginTop: 'var(--space-6)', minHeight: 0 }}>
              <MonthlyChart visible={sec1Sub >= 1} rows={apiData.trend.rows} />
            </div>
          </div>
        </section>

        {/* 섹션 3: 채널 분석 */}
        <section
          ref={el => { sectionRefs.current[2] = el; }}
          style={{
            height: '100vh', display: 'flex', flexDirection: 'column',
            padding: 'var(--space-12) var(--space-8)',
            paddingTop: 'calc(var(--space-12) + 56px)',
            background: 'var(--color-bg-surface)',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <SectionHeader show={sec2Sub >= 0} title={SECTION_TITLES[2]} insight={insights.channel} />
            <div style={{ flex: 1, display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-6)', minHeight: 0 }}>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ChannelChart visible={sec2Sub >= 1} channels={apiData.channels} />
              </div>
              <ChannelLegend visible={sec2Sub >= 1} channels={apiData.channels} />
            </div>
          </div>
        </section>

        {/* 섹션 4: 제품 포트폴리오 */}
        <section
          ref={el => { sectionRefs.current[3] = el; }}
          style={{
            height: '100vh', display: 'flex', flexDirection: 'column',
            padding: 'var(--space-12) var(--space-8)',
            paddingTop: 'calc(var(--space-12) + 56px)',
            background: '#ffffff',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <SectionHeader show={sec3Sub >= 0} title={SECTION_TITLES[3]} insight={insights.product} />
            <div style={{ flex: 1, marginTop: 'var(--space-6)', minHeight: 0 }}>
              <ProductChart visible={sec3Sub >= 1} products={apiData.products} />
            </div>
          </div>
        </section>
      </div>

      {/* ── 스텝 점 ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', right: 'var(--space-6)', top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 6,
        zIndex: 20,
      }}>
        {STEP_MAP.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setGlobalStep(i);
              setHighWaterMark(m => Math.max(m, i));
            }}
            title={`${SECTION_TITLES[s.section]} — 스텝 ${s.sub + 1}`}
            style={{
              width:  i === globalStep ? 8 : 6,
              height: i === globalStep ? 8 : 6,
              borderRadius: '50%',
              background: i === globalStep ? 'var(--color-accent-warm)'
                : i <= highWaterMark ? '#ffa55a' : 'var(--color-border)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.25s ease',
            }}
          />
        ))}
      </nav>

      {/* ── 하단 키 안내 ─────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 'var(--space-4)', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        zIndex: 20, opacity: 0.5,
        fontSize: 'var(--text-size-small)',
        color: 'var(--color-text-muted)',
        userSelect: 'none',
      }}>
        {(['←','↑','↓','→'] as const).map(k => (
          <span key={k} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22,
            border: '1px solid var(--color-border)',
            borderRadius: 4, fontSize: 11, fontWeight: 700,
          }}>{k}</span>
        ))}
        <span>방향키로 단계 이동</span>
        <span>·</span>
        <span>{highWaterMark + 1} / {TOTAL_STEPS} 공개됨</span>
      </div>
    </div>
  );
}

// ── 헬퍼 컴포넌트 ──────────────────────────────────────────────

function SectionHeader({ show, title, insight }: { show: boolean; title: string; insight: string }) {
  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <div style={{ width: 4, height: 22, background: 'var(--color-accent-warm)', borderRadius: 'var(--radius-pill)' }} />
        <h2 style={{ fontSize: 'var(--text-size-section)', fontWeight: 700, color: 'var(--color-text-base)' }}>{title}</h2>
      </div>
      <p style={{ fontSize: 'var(--text-size-body)', color: 'var(--color-text-subdued)', lineHeight: 1.6, maxWidth: '640px' }}>
        {insight}
      </p>
    </div>
  );
}

const CHANNEL_COLORS = ['#f07c20', '#6366f1', '#10b981', '#f59e0b'];

function ChannelLegend({ visible, channels }: { visible: boolean; channels: DashboardData['channels'] }) {
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.6s ease 0.2s',
      display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
      justifyContent: 'center', minWidth: '200px',
    }}>
      {channels.map((item, i) => (
        <div key={item.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: CHANNEL_COLORS[i] ?? '#ccc', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 'var(--text-size-label)', color: 'var(--color-text-base)' }}>
                {item.share}%
              </span>
              <span style={{ fontSize: 'var(--text-size-small)', color: 'var(--color-text-subdued)' }}>
                {item.name}
              </span>
            </div>
            <div style={{ fontSize: 'var(--text-size-small)', color: 'var(--color-text-muted)' }}>
              {item.display}원
              {item.note && (
                <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700,
                  color: item.note.includes('리스크') ? 'var(--color-warning)' : 'var(--color-accent-green)' }}>
                  {item.note.includes('리스크') ? '⚠ ' : '✦ '}{item.note}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
