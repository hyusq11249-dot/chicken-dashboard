import type { ReactNode } from 'react';

export default function SectionWrapper({
  onRef, background, children,
}: {
  onRef: (el: HTMLElement | null) => void;
  background: string;
  children: ReactNode;
}) {
  return (
    <section ref={onRef} style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      padding: 'var(--space-12) var(--space-8)',
      paddingTop: 'calc(var(--space-12) + 56px)',
      background,
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </section>
  );
}
