'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  ResponsiveContainer, LabelList,
} from 'recharts';
import { PRODUCT_DATA } from '@/lib/data';

const MAX_VAL = PRODUCT_DATA[0].value;

// 순위별 색상: 1위 오렌지, 2~5 인디고, 나머지 뮤트
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
  payload?: { payload: { name: string; value: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: '#1a1a2e',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 4 }}>{d.name}</p>
      <p style={{ color: '#f07c20', fontWeight: 700, fontSize: 16 }}>
        {d.value.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4 }}>만원</span>
      </p>
    </div>
  );
}

export default function ProductChart({ visible }: { visible: boolean }) {
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
          data={PRODUCT_DATA}
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

          <XAxis
            type="number"
            hide
            domain={[0, MAX_VAL * 1.15]}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={104}
            axisLine={false}
            tickLine={false}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tick={({ x, y, payload, index }: any) => (
              <text x={x} y={y} textAnchor="end" dominantBaseline="middle">
                {/* 순위 번호 */}
                <tspan
                  fontSize={11}
                  fontWeight={700}
                  fill={barColor(index)}
                >
                  {String(index + 1).padStart(2, '0')}
                </tspan>
                {/* 제품명 */}
                <tspan
                  dx={6}
                  fontSize={12}
                  fill="#6b6b6b"
                >
                  {payload.value}
                </tspan>
              </text>
            )}
          />
          <Tooltip content={<DarkTooltip />} cursor={false} />

          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {PRODUCT_DATA.map((_, i) => (
              <Cell key={i} fill={`url(#${barGradId(i)})`} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => `${Number(v).toLocaleString()}만`}
              style={{ fill: '#9e9e9e', fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
