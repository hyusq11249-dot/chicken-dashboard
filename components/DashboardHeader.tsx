'use client';

import type { Period } from '@/lib/types';
import { PERIOD_LABELS, SECTION_TITLES, SECTION_START } from '@/lib/mockData';

interface Props {
  period: Period;
  onPeriod: (p: Period) => void;
  customStart: string;
  onCustomStart: (v: string) => void;
  customEnd: string;
  onCustomEnd: (v: string) => void;
  rangeStart: string;
  rangeEnd: string;
  currentSection: number;
  onJumpTo: (step: number) => void;
}

export default function DashboardHeader({
  period, onPeriod, customStart, onCustomStart, customEnd, onCustomEnd,
  rangeStart, rangeEnd, currentSection, onJumpTo,
}: Props) {
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 var(--space-8)', height: '56px',
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent-warm)' }} />
        <span style={{ fontWeight: 700, fontSize: 'var(--text-size-label)', color: 'var(--color-text-base)' }}>치킨 매출 대시보드</span>
        <span style={{ fontSize: 'var(--text-size-small)', color: 'var(--color-text-muted)' }}>{rangeStart.slice(0, 7)} ~ {rangeEnd.slice(0, 7)}</span>

        <div style={{ display: 'flex', gap: 4, marginLeft: 8, background: '#f5f5f5', borderRadius: 9999, padding: '2px 3px' }}>
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button key={p} onClick={() => onPeriod(p)} style={{
              fontSize: 11, fontWeight: period === p ? 700 : 400,
              color: period === p ? '#fff' : 'var(--color-text-muted)',
              background: period === p ? 'var(--color-accent-warm)' : 'transparent',
              border: 'none', cursor: 'pointer', padding: '3px 10px',
              borderRadius: 9999, transition: 'all 0.2s',
            }}>{PERIOD_LABELS[p]}</button>
          ))}
        </div>

        {period === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
            <input type="date" value={customStart} min="2023-01-01" max={customEnd}
              onChange={e => onCustomStart(e.target.value)}
              style={{ fontSize: 11, padding: '3px 8px', border: '1px solid var(--color-border)', borderRadius: 6, color: 'var(--color-text-base)', background: '#fff', cursor: 'pointer', outline: 'none' }} />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>~</span>
            <input type="date" value={customEnd} min={customStart} max="2025-11-30"
              onChange={e => onCustomEnd(e.target.value)}
              style={{ fontSize: 11, padding: '3px 8px', border: '1px solid var(--color-border)', borderRadius: 6, color: 'var(--color-text-base)', background: '#fff', cursor: 'pointer', outline: 'none' }} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        {SECTION_TITLES.map((title, i) => (
          <button key={i} onClick={() => onJumpTo(SECTION_START[i])} style={{
            fontSize: 'var(--text-size-small)', fontWeight: currentSection === i ? 700 : 400,
            color: currentSection === i ? 'var(--color-accent-warm)' : 'var(--color-text-muted)',
            background: currentSection === i ? 'var(--color-accent-warm-bg)' : 'none',
            border: 'none', cursor: 'pointer', padding: '4px 10px',
            borderRadius: 'var(--radius-pill)', transition: 'all 0.2s',
          }}>{i + 1}. {title}</button>
        ))}
      </div>
    </header>
  );
}
