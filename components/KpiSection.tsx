import type { KpiItem } from '@/lib/types';
import KpiCard from '@/components/KpiCard';
import SectionHeader from '@/components/SectionHeader';
import { SECTION_TITLES } from '@/lib/mockData';

interface Props {
  sectionRef: (el: HTMLElement | null) => void;
  kpis: KpiItem[];
  insight: string;
  sec0Sub: number;
  currentSection: number;
}

export default function KpiSection({ sectionRef, kpis, insight, sec0Sub, currentSection }: Props) {
  return (
    <section ref={sectionRef} style={{
      height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: 'var(--space-16) var(--space-8)', paddingTop: 'calc(var(--space-16) + 56px)',
      background: 'linear-gradient(160deg, #fff8f2 0%, #ffffff 60%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', bottom: '-80px', right: '-80px',
        width: '380px', height: '380px',
        background: 'var(--color-accent-warm)',
        borderRadius: '60% 70% 40% 50% / 50% 40% 60% 70%',
        opacity: 0.07, pointerEvents: 'none',
      }} />
      <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <SectionHeader show={sec0Sub >= 0 || currentSection > 0} title={SECTION_TITLES[0]} insight={insight} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-6)', marginTop: 'var(--space-8)' }}>
          {kpis.map((card, i) => (
            <KpiCard key={card.id} label={card.label} value={card.display} unit={card.unit}
              sub={card.sub} trend={card.trend} warning={card.warning}
              visible={sec0Sub >= i} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
