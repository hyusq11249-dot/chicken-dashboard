'use client';

interface KpiCardProps {
  label: string;
  value: string;
  unit: string;
  sub: string;
  trend: null | 'up' | 'down';
  warning: boolean;
  visible: boolean;
  delay?: number;
  accentColor?: string;
}

const LABEL_COLOR: Record<string, string> = {
  '3개월 총매출':  '#f07c20',
  '11월 매출':    '#6366f1',
  '평균 건당 매출': '#10b981',
  '배달앱 비중':   '#f59e0b',
};

function getCardColor(label: string) {
  return LABEL_COLOR[label] ?? '#f07c20';
}

export default function KpiCard({ label, value, unit, sub, trend, warning, visible, delay = 0, accentColor: propColor }: KpiCardProps) {
  const accentColor = warning ? '#f59e0b' : (propColor ?? getCardColor(label));

  return (
    <div
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
        background: `linear-gradient(145deg, #ffffff 60%, ${accentColor}08 100%)`,
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-6)',
        boxShadow: `0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        minWidth: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 상단 컬러 바 */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}44)`,
        borderRadius: '16px 16px 0 0',
      }} />

      {/* 배경 원형 장식 */}
      <div style={{
        position: 'absolute',
        bottom: -24, right: -24,
        width: 80, height: 80,
        borderRadius: '50%',
        background: accentColor,
        opacity: 0.06,
        pointerEvents: 'none',
      }} />

      <span style={{
        fontSize: 'var(--text-size-small)',
        fontWeight: 500,
        color: 'var(--color-text-muted)',
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontSize: 'clamp(20px, 2.8vw, 30px)',
          fontWeight: 700,
          color: warning ? '#c47800' : 'var(--color-text-base)',
          lineHeight: 1,
        }}>
          {value}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {unit}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {trend === 'up' && (
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: '#10b981',
            background: '#d1fae5',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
          }}>
            ▲ UP
          </span>
        )}
        {trend === 'down' && (
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: 'var(--color-negative)',
            background: '#fde8ea',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
          }}>
            ▼ DOWN
          </span>
        )}
        <span style={{
          fontSize: 'var(--text-size-small)',
          color: warning ? '#c47800' : 'var(--color-text-muted)',
          fontWeight: warning ? 600 : 400,
        }}>
          {warning && '⚠ '}{sub}
        </span>
      </div>
    </div>
  );
}
