'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import KpiCard from '@/components/KpiCard';
import { KPI_CARDS, STEP_MAP, SECTION_TITLES, SECTION_INSIGHTS } from '@/lib/data';

const MonthlyChart = dynamic(() => import('@/components/MonthlyChart'), { ssr: false });
const ChannelChart = dynamic(() => import('@/components/ChannelChart'), { ssr: false });
const ProductChart  = dynamic(() => import('@/components/ProductChart'),  { ssr: false });

const TOTAL_STEPS = STEP_MAP.length;
const SECTION_START = [0, 4, 6, 8] as const;

function sectionOf(step: number) { return STEP_MAP[Math.min(step, TOTAL_STEPS - 1)].section; }

export default function Dashboard() {
  // globalStep: 현재 위치 (섹션 스크롤용)
  // highWaterMark: 지금까지 도달한 최대 스텝 (가시성 계산용 — 뒤로 가도 줄어들지 않음)
  const [globalStep,    setGlobalStep]    = useState(0);
  const [highWaterMark, setHighWaterMark] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([null, null, null, null]);
  const isScrolling  = useRef(false);
  const currentSection = sectionOf(globalStep);

  // 섹션이 바뀌면 스크롤
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
    // 현재 위치만 뒤로 이동 — highWaterMark는 그대로
    setGlobalStep(s => Math.max(s - 1, 0));
  }, []);

  // 키보드 핸들러
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); advance(); }
      if (['ArrowLeft',  'ArrowUp'  ].includes(e.key)) { e.preventDefault(); retreat(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, retreat]);

  // 마우스 휠로 스텝 이동
  useEffect(() => {
    let lastWheel = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheel < 500) return;
      lastWheel = now;
      if (e.deltaY > 0) advance();
      else if (e.deltaY < 0) retreat();
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [advance, retreat]);

  // 가시성은 highWaterMark 기준 — 한번 나온 요소는 뒤로 가도 유지됨
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

  return (
    <div style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* ── 고정 헤더 ─────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 var(--space-8)',
        height: '56px',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--color-accent-warm)',
          }} />
          <span style={{
            fontWeight: 700, fontSize: 'var(--text-size-label)',
            color: 'var(--color-text-base)',
          }}>
            치킨 매출 대시보드
          </span>
          <span style={{ fontSize: 'var(--text-size-small)', color: 'var(--color-text-muted)' }}>
            2025년 9~11월
          </span>
        </div>

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
                border: 'none',
                cursor: 'pointer',
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

      {/* ── 섹션 컨테이너 ─────────────────────────────────── */}
      <div style={{ height: '100vh', overflowY: 'hidden' }}>

        {/* 섹션 1: KPI */}
        <section
          ref={el => { sectionRefs.current[0] = el; }}
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'var(--space-16) var(--space-8)',
            paddingTop: 'calc(var(--space-16) + 56px)',
            background: 'linear-gradient(160deg, #fff8f2 0%, #ffffff 60%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', bottom: '-80px', right: '-80px',
            width: '380px', height: '380px',
            background: 'var(--color-accent-warm)',
            borderRadius: '60% 70% 40% 50% / 50% 40% 60% 70%',
            opacity: 0.07,
            pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
            <SectionHeader
              show={sec0Sub >= 0 || currentSection > 0}
              title={SECTION_TITLES[0]}
              insight={SECTION_INSIGHTS[0]}
            />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'var(--space-6)',
              marginTop: 'var(--space-8)',
            }}>
              {KPI_CARDS.map((card, i) => (
                <KpiCard key={card.label} {...card} visible={sec0Sub >= i} />
              ))}
            </div>
          </div>
        </section>

        {/* 섹션 2: 월별 트렌드 */}
        <section
          ref={el => { sectionRefs.current[1] = el; }}
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-12) var(--space-8)',
            paddingTop: 'calc(var(--space-12) + 56px)',
            background: '#ffffff',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <SectionHeader
              show={sec1Sub >= 0}
              title={SECTION_TITLES[1]}
              insight={SECTION_INSIGHTS[1]}
            />
            <div style={{ flex: 1, marginTop: 'var(--space-6)', minHeight: 0 }}>
              <MonthlyChart visible={sec1Sub >= 1} />
            </div>
          </div>
        </section>

        {/* 섹션 3: 채널 분석 */}
        <section
          ref={el => { sectionRefs.current[2] = el; }}
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-12) var(--space-8)',
            paddingTop: 'calc(var(--space-12) + 56px)',
            background: 'var(--color-bg-surface)',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <SectionHeader
              show={sec2Sub >= 0}
              title={SECTION_TITLES[2]}
              insight={SECTION_INSIGHTS[2]}
            />
            <div style={{ flex: 1, display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-6)', minHeight: 0 }}>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ChannelChart visible={sec2Sub >= 1} />
              </div>
              <ChannelLegend visible={sec2Sub >= 1} />
            </div>
          </div>
        </section>

        {/* 섹션 4: 제품 포트폴리오 */}
        <section
          ref={el => { sectionRefs.current[3] = el; }}
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-12) var(--space-8)',
            paddingTop: 'calc(var(--space-12) + 56px)',
            background: '#ffffff',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <SectionHeader
              show={sec3Sub >= 0}
              title={SECTION_TITLES[3]}
              insight={SECTION_INSIGHTS[3]}
            />
            <div style={{ flex: 1, marginTop: 'var(--space-6)', minHeight: 0 }}>
              <ProductChart visible={sec3Sub >= 1} />
            </div>
          </div>
        </section>
      </div>

      {/* ── 스텝 진행 점 (우측) ─────────────────────────────── */}
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
              background: i === globalStep
                ? 'var(--color-accent-warm)'
                : i <= highWaterMark ? '#ffa55a' : 'var(--color-border)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.25s ease',
            }}
          />
        ))}
      </nav>

      {/* ── 하단 키 안내 ─────────────────────────────────────── */}
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

// ── 헬퍼 컴포넌트 ─────────────────────────────────────────────

function SectionHeader({ show, title, insight }: { show: boolean; title: string; insight: string }) {
  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <div style={{ width: 4, height: 22, background: 'var(--color-accent-warm)', borderRadius: 'var(--radius-pill)' }} />
        <h2 style={{ fontSize: 'var(--text-size-section)', fontWeight: 700, color: 'var(--color-text-base)' }}>
          {title}
        </h2>
      </div>
      <p style={{ fontSize: 'var(--text-size-body)', color: 'var(--color-text-subdued)', lineHeight: 1.6, maxWidth: '640px' }}>
        {insight}
      </p>
    </div>
  );
}

function ChannelLegend({ visible }: { visible: boolean }) {
  const items = [
    { name: '배달앱',   pct: '55.2%', amt: '8,140만원', note: '⚠ 수수료 리스크', noteColor: 'var(--color-warning)' },
    { name: '포장',     pct: '20.6%', amt: '3,032만원', note: '', noteColor: '' },
    { name: '매장(홀)', pct: '13.0%', amt: '1,912만원', note: '', noteColor: '' },
    { name: '자사앱',   pct: '11.2%', amt: '1,653만원', note: '✦ 전환 기회', noteColor: 'var(--color-accent-green)' },
  ];
  const colors = ['#f07c20', '#6366f1', '#10b981', '#f59e0b'];
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.6s ease 0.2s',
      display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
      justifyContent: 'center', minWidth: '200px',
    }}>
      {items.map((item, i) => (
        <div key={item.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: colors[i], flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 'var(--text-size-label)', color: 'var(--color-text-base)' }}>
                {item.pct}
              </span>
              <span style={{ fontSize: 'var(--text-size-small)', color: 'var(--color-text-subdued)' }}>
                {item.name}
              </span>
            </div>
            <div style={{ fontSize: 'var(--text-size-small)', color: 'var(--color-text-muted)' }}>
              {item.amt}
              {item.note && (
                <span style={{ marginLeft: 6, fontSize: 11, color: item.noteColor, fontWeight: 700 }}>
                  {item.note}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
