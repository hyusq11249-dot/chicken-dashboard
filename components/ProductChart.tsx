'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  ResponsiveContainer, LabelList,
} from 'recharts';
import type { ProductItem } from '@/lib/types';
import { DarkTooltipShell } from '@/components/DarkTooltip';

function barColor(i: number) {
  if (i === 0) return '#f07c20';
  if (i < 5)   return '#6366f1';
  return '#d1d5db';
}
function barGradId(i: number) {
  if (i === 0) return 'pg-org';
  if (i < 5)   return 'pg-ind';
  return 'pg-muted';
}

function DarkTooltip({ active, payload }: {
  active?: boolean;
  payload?: { payload: { name: string; value: number; display: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <DarkTooltipShell padding="10px 14px" radius={10}>
      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 4 }}>{d.name}</p>
      <p style={{ color: '#f07c20', fontWeight: 700, fontSize: 16 }}>
        {d.display}<span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4 }}>원</span>
      </p>
    </DarkTooltipShell>
  );
}

export default function ProductChart({
  visible,
  products,
}: {
  visible: boolean;
  products: ProductItem[];
}) {
  // 만원 단위로 변환
  const data = products.map(p => ({
    name:    p.name,
    value:   Math.round(p.amount / 10000),
    display: p.display,
  }));
  const maxVal = data[0]?.value ?? 1;

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-24px)',
      transition: 'opacity 0.65s ease, transform 0.65s ease',
      width: '100%', height: '100%',
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 80, left: 4, bottom: 4 }}
          barCategoryGap="22%"
        >
          <defs>
            <linearGradient id="pg-org" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f07c20" stopOpacity={1} />
              <stop offset="100%" stopColor="#fbbf80" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="pg-ind" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
              <stop offset="100%" stopColor="#a5b4fc" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="pg-muted" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d1d5db" stopOpacity={1} />
              <stop offset="100%" stopColor="#e5e7eb" stopOpacity={0.7} />
            </linearGradient>
          </defs>

          <XAxis type="number" hide domain={[0, maxVal * 1.15]} />
          <YAxis
            type="category"
            dataKey="name"
            width={104}
            axisLine={false}
            tickLine={false}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tick={({ x, y, payload, index }: any) => (
              <text x={x} y={y} textAnchor="end" dominantBaseline="middle">
                <tspan fontSize={11} fontWeight={700} fill={barColor(index)}>
                  {String(index + 1).padStart(2, '0')}
                </tspan>
                <tspan dx={6} fontSize={12} fill="#6b6b6b">{payload.value}</tspan>
              </text>
            )}
          />
          <Tooltip content={<DarkTooltip />} cursor={false} />

          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={`url(#${barGradId(i)})`} />
            ))}
            <LabelList
              dataKey="display"
              position="right"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => `${v}`}
              style={{ fill: '#9e9e9e', fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
