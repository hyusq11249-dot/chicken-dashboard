import type { ReactNode } from 'react';

export function DarkTooltipShell({
  children,
  padding = '12px 16px',
  radius = 12,
  minWidth,
}: {
  children: ReactNode;
  padding?: string;
  radius?: number;
  minWidth?: number;
}) {
  return (
    <div style={{
      background: '#1a1a2e',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: radius,
      padding,
      boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
      ...(minWidth ? { minWidth } : {}),
    }}>
      {children}
    </div>
  );
}
