import { STEP_MAP } from '@/lib/mockData';

const TOTAL_STEPS = STEP_MAP.length;

export default function KeyHint({ highWaterMark }: { highWaterMark: number }) {
  return (
    <div style={{
      position: 'fixed', bottom: 'var(--space-4)', left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
      zIndex: 20, opacity: 0.5,
      fontSize: 'var(--text-size-small)', color: 'var(--color-text-muted)',
      userSelect: 'none',
    }}>
      {(['←', '↑', '↓', '→'] as const).map(k => (
        <span key={k} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 22, height: 22, border: '1px solid var(--color-border)',
          borderRadius: 4, fontSize: 11, fontWeight: 700,
        }}>{k}</span>
      ))}
      <span>방향키로 단계 이동</span>
      <span>·</span>
      <span>{highWaterMark + 1} / {TOTAL_STEPS} 공개됨</span>
    </div>
  );
}
