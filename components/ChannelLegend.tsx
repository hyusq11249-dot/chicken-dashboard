import type { DashboardData } from '@/lib/types';
import { CHANNEL_COLORS } from '@/lib/mockData';

export default function ChannelLegend({ visible, channels }: { visible: boolean; channels: DashboardData['channels'] }) {
  return (
    <div style={{
      opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.2s',
      display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
      justifyContent: 'center', minWidth: '200px',
    }}>
      {channels.map((item, i) => (
        <div key={item.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: CHANNEL_COLORS[i] ?? '#ccc', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 'var(--text-size-label)', color: 'var(--color-text-base)' }}>{item.share}%</span>
              <span style={{ fontSize: 'var(--text-size-small)', color: 'var(--color-text-subdued)' }}>{item.name}</span>
            </div>
            <div style={{ fontSize: 'var(--text-size-small)', color: 'var(--color-text-muted)' }}>
              {item.display}원
              {item.note && (
                <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: item.note.includes('리스크') ? 'var(--color-warning)' : 'var(--color-accent-green)' }}>
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
