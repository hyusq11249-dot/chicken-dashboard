'use client';

import dynamic from 'next/dynamic';
import { useDashboard }   from '@/hooks/useDashboard';
import DashboardHeader    from '@/components/DashboardHeader';
import KpiSection         from '@/components/KpiSection';
import SectionWrapper     from '@/components/SectionWrapper';
import SectionHeader      from '@/components/SectionHeader';
import DashboardCard      from '@/components/DashboardCard';
import ChannelLegend      from '@/components/ChannelLegend';
import StepDots           from '@/components/StepDots';
import KeyHint            from '@/components/KeyHint';
import LoadingScreen      from '@/components/LoadingScreen';
import ErrorScreen        from '@/components/ErrorScreen';
import { SECTION_TITLES } from '@/lib/mockData';

const MonthlyChart = dynamic(() => import('@/components/MonthlyChart'), { ssr: false });
const ChannelChart = dynamic(() => import('@/components/ChannelChart'), { ssr: false });
const ProductChart = dynamic(() => import('@/components/ProductChart'),  { ssr: false });

export default function Dashboard() {
  const {
    period, setPeriod, customStart, setCustomStart, customEnd, setCustomEnd,
    globalStep, highWaterMark, jumpTo, retry, sectionRefs, isLoading, isError, apiData,
    sec0Sub, sec1Sub, sec2Sub, sec3Sub, currentSection,
  } = useDashboard();

  if (isLoading || !apiData) return <LoadingScreen />;
  if (isError) return <ErrorScreen onRetry={retry} />;

  const ref = (i: number) => (el: HTMLElement | null) => { sectionRefs.current[i] = el; };
  const { insights } = apiData;

  return (
    <div style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <DashboardHeader period={period} onPeriod={setPeriod} customStart={customStart}
        onCustomStart={setCustomStart} customEnd={customEnd} onCustomEnd={setCustomEnd}
        rangeStart={apiData.meta.rangeStart} rangeEnd={apiData.meta.rangeEnd}
        currentSection={currentSection} onJumpTo={jumpTo} />
      <div style={{ height: '100vh', overflowY: 'hidden' }}>
        <KpiSection sectionRef={ref(0)} kpis={apiData.kpis} insight={insights.kpi} sec0Sub={sec0Sub} currentSection={currentSection} />
        <SectionWrapper onRef={ref(1)} background="#ffffff">
          <SectionHeader show={sec1Sub >= 0} title={SECTION_TITLES[1]} insight={insights.trend} />
          <DashboardCard style={{ flex: 1, marginTop: 'var(--space-6)', minHeight: 0 }} padding="var(--space-4)">
            <MonthlyChart visible={sec1Sub >= 1} rows={apiData.trend.rows} />
          </DashboardCard>
        </SectionWrapper>
        <SectionWrapper onRef={ref(2)} background="var(--color-bg-surface)">
          <SectionHeader show={sec2Sub >= 0} title={SECTION_TITLES[2]} insight={insights.channel} />
          <DashboardCard style={{ flex: 1, flexDirection: 'row', gap: 'var(--space-8)', marginTop: 'var(--space-6)', minHeight: 0 }} padding="var(--space-4)">
            <div style={{ flex: 1, minHeight: 0 }}><ChannelChart visible={sec2Sub >= 1} channels={apiData.channels} /></div>
            <ChannelLegend visible={sec2Sub >= 1} channels={apiData.channels} />
          </DashboardCard>
        </SectionWrapper>
        <SectionWrapper onRef={ref(3)} background="#ffffff">
          <SectionHeader show={sec3Sub >= 0} title={SECTION_TITLES[3]} insight={insights.product} />
          <DashboardCard style={{ flex: 1, marginTop: 'var(--space-6)', minHeight: 0 }} padding="var(--space-4)">
            <ProductChart visible={sec3Sub >= 1} products={apiData.products} />
          </DashboardCard>
        </SectionWrapper>
      </div>
      <StepDots globalStep={globalStep} highWaterMark={highWaterMark} onJumpTo={jumpTo} />
      <KeyHint highWaterMark={highWaterMark} />
    </div>
  );
}
