'use client';

import { useState, type ComponentProps } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import type { ChannelItem } from '@/lib/types';
import { DarkTooltipShell } from '@/components/DarkTooltip';

const COLORS   = ['#f07c20', '#6366f1', '#10b981', '#f59e0b'];
const COLORS_D = ['#fbbf80', '#a5b4fc', '#6ee7b7', '#fcd34d'];

function DarkTooltip({ active, payload }: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { display: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <DarkTooltipShell padding="10px 16px">
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{d.name}</p>
      <p style={{ color: '#f07c20', fontWeight: 700, fontSize: 18 }}>{d.value}%</p>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{d.payload.display}원</p>
    </DarkTooltipShell>
  );
}

function ActiveShape(props: {
  cx?: number; cy?: number;
  innerRadius?: number; outerRadius?: number;
  startAngle?: number; endAngle?: number;
  fill?: string;
}) {
  const { cx = 0, cy = 0, innerRadius = 0, outerRadius = 0, startAngle = 0, endAngle = 0, fill = '#ccc' } = props;
  return (
    <Sector
      cx={cx} cy={cy}
      innerRadius={innerRadius - 4}
      outerRadius={outerRadius + 10}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

export default function ChannelChart({
  visible,
  channels,
}: {
  visible: boolean;
  channels: ChannelItem[];
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  // share → value 매핑
  const pieData = channels.map(c => ({ name: c.name, value: c.share, display: c.display }));
  const active = channels[activeIdx] ?? channels[0];

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1)' : 'scale(0.9)',
      transition: 'opacity 0.65s ease, transform 0.65s ease',
      width: '100%', height: '100%',
      position: 'relative',
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {channels.map((_, i) => (
              <radialGradient key={i} id={`rg-${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={COLORS_D[i] ?? '#ccc'} stopOpacity={1} />
                <stop offset="100%" stopColor={COLORS[i]   ?? '#aaa'} stopOpacity={1} />
              </radialGradient>
            ))}
          </defs>
          <Pie
            data={pieData}
            cx="50%" cy="50%"
            innerRadius="46%" outerRadius="70%"
            dataKey="value"
            paddingAngle={3}
            onMouseEnter={(_: unknown, idx: number) => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(0)}
            {...({ activeIndex: activeIdx, activeShape: ActiveShape } as unknown as ComponentProps<typeof Pie>)}
          >
            {channels.map((_, i) => (
              <Cell key={i} fill={`url(#rg-${i})`} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<DarkTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* 도넛 중앙 */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', pointerEvents: 'none',
        transition: 'all 0.25s ease',
      }}>
        <div style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: COLORS[activeIdx] ?? COLORS[0], lineHeight: 1 }}>
          {active?.share}%
        </div>
        <div style={{ fontSize: 12, color: '#9e9e9e', marginTop: 4 }}>
          {active?.name}
        </div>
      </div>
    </div>
  );
}
