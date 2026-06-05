export default function SectionHeader({ show, title, insight }: { show: boolean; title: string; insight: string }) {
  return (
    <div style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
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
