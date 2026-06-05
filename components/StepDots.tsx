import { STEP_MAP, SECTION_TITLES } from '@/lib/mockData';

export default function StepDots({ globalStep, highWaterMark, onJumpTo }: {
  globalStep: number;
  highWaterMark: number;
  onJumpTo: (i: number) => void;
}) {
  return (
    <nav style={{
      position: 'fixed', right: 'var(--space-6)', top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex', flexDirection: 'column', gap: 6, zIndex: 20,
    }}>
      {STEP_MAP.map((s, i) => (
        <button
          key={i}
          onClick={() => onJumpTo(i)}
          title={`${SECTION_TITLES[s.section]} — 스텝 ${s.sub + 1}`}
          style={{
            width: i === globalStep ? 8 : 6, height: i === globalStep ? 8 : 6,
            borderRadius: '50%',
            background: i === globalStep ? 'var(--color-accent-warm)' : i <= highWaterMark ? '#ffa55a' : 'var(--color-border)',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'all 0.25s ease',
          }}
        />
      ))}
    </nav>
  );
}
