import type { ReactNode, CSSProperties } from 'react';

interface DashboardCardProps {
  accentColor?: string;
  padding?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export default function DashboardCard({
  accentColor,
  padding = 'var(--space-6)',
  style,
  children,
}: DashboardCardProps) {
  return (
    <div style={{
      background: accentColor
        ? `linear-gradient(145deg, #ffffff 60%, ${accentColor}08 100%)`
        : '#ffffff',
      borderRadius: 'var(--radius-card)',
      padding,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {accentColor && (
        <>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}44)`,
            borderRadius: '16px 16px 0 0',
          }} />
          <div style={{
            position: 'absolute', bottom: -24, right: -24,
            width: 80, height: 80,
            borderRadius: '50%',
            background: accentColor,
            opacity: 0.06,
            pointerEvents: 'none',
          }} />
        </>
      )}
      {children}
    </div>
  );
}
