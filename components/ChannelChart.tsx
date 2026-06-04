'use client';

import { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector,
} from 'recharts';
import { CHANNEL_DATA } from '@/lib/data';

const COLORS  = ['#f07c20', '#6366f1', '#10b981', '#f59e0b'];
const COLORS_D = ['#fbbf80', '#a5b4fc', '#6ee7b7', '#fcd34d']; // lighter shade for gradient effect

function DarkTooltip({ active, payload }: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { amount: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: '#1a1a2e',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '10px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
    }}>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{d.name}</p>
      <p style={{ color: '#f07c20', fontWeight: 700, fontSize: 18 }}>{d.value}%</p>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{d.payload.amount}원</p>
    </div>
  );
}

function ActiveShape(props: {
  cx?: number; cy?: number;
  innerRadius?: number; outerRadius?: number;
  startAngle?: number; endAngle?: number;
  fill?: string; payload?: { name: string; value: number };
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
      opacity={1}
    />
  );
}

export default function ChannelChart({ visible }: { visible: boolean }) {
  const [activeIdx, setActiveIdx] = useState<number | undefined>(0);

  const topItem = CHANNEL_DATA[activeIdx ?? 0];

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
            {CHANNEL_DATA.map((_, i) => (
              <radialGradient key={i} id={`rg-${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={COLORS_D[i]} stopOpacity={1} />
                <stop offset="100%" stopColor={COLORS[i]}   stopOpacity={1} />
              </radialGradient>
            ))}
          </defs>

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Pie
            data={CHANNEL_DATA}
            cx="50%"
            cy="50%"
            innerRadius="46%"
            outerRadius="70%"
            dataKey="value"
            paddingAngle={3}
            onMouseEnter={(_: unknown, idx: number) => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(0)}
            {...({ activeIndex: activeIdx, activeShape: ActiveShape } as any)}
          >
            {CHANNEL_DATA.map((_, i) => (
              <Cell
                key={i}
                fill={`url(#rg-${i})`}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<DarkTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* 도넛 중앙 텍스트 */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none',
        transition: 'all 0.25s ease',
      }}>
        <div style={{
          fontSize: 'clamp(20px, 2.5vw, 28px)',
          fontWeight: 700,
          color: COLORS[activeIdx ?? 0],
          lineHeight: 1,
        }}>
          {topItem.value}%
        </div>
        <div style={{
          fontSize: 12,
          color: '#9e9e9e',
          marginTop: 4,
          fontWeight: 400,
        }}>
          {topItem.name}
        </div>
      </div>
    </div>
  );
}
