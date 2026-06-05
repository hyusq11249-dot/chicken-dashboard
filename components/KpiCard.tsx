'use client';

import DashboardCard from '@/components/DashboardCard';
import { LABEL_COLOR } from '@/lib/mockData';

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

function getCardColor(label: string) {
  return LABEL_COLOR[label] ?? '#f07c20';
}

export default function KpiCard({
  label, value, unit, sub, trend, warning,
  visible, delay = 0, accentColor: propColor,
}: KpiCardProps) {
  const accentColor = warning ? '#f59e0b' : (propColor ?? getCardColor(label));

  return (
    <div style={{
      opacity:    visible ? 1 : 0,
      transform:  visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      minWidth: 0,
    }}>
      <DashboardCard accentColor={accentColor} style={{ gap: 'var(--space-3)' }}>
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
              color: '#10b981', background: '#d1fae5',
              padding: '2px 8px', borderRadius: 'var(--radius-pill)',
            }}>
              ▲ UP
            </span>
          )}
          {trend === 'down' && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: 'var(--color-negative)', background: '#fde8ea',
              padding: '2px 8px', borderRadius: 'var(--radius-pill)',
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
      </DashboardCard>
    </div>
  );
}
