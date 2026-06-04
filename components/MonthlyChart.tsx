'use client';

import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { DAILY_DATA } from '@/lib/data';

const LINES = [
  { key: '후라이드양념', label: '후라이드/양념치킨', color: '#f07c20' },
  { key: '순살치킨',    label: '순살치킨',           color: '#6366f1' },
  { key: '사이드메뉴',  label: '사이드메뉴',          color: '#10b981' },
  { key: '음료기타',    label: '음료/기타',            color: '#f59e0b' },
];

function DarkTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1a2e',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
      minWidth: 160,
    }}>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            {p.name}
          </span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{p.value.toLocaleString()}만</span>
        </div>
      ))}
    </div>
  );
}

function CustomDot(props: { cx?: number; cy?: number; stroke?: string }) {
  const { cx, cy, stroke } = props;
  if (cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={3} fill="#fff" stroke={stroke} strokeWidth={2} />;
}

function ActiveDot(props: { cx?: number; cy?: number; stroke?: string }) {
  const { cx, cy, stroke } = props;
  if (cx == null || cy == null) return null;
  return (
    <circle
      cx={cx} cy={cy} r={5}
      fill={stroke}
      stroke="#fff"
      strokeWidth={2}
      style={{ filter: `drop-shadow(0 0 6px ${stroke}88)` }}
    />
  );
}

export default function MonthlyChart({ visible }: { visible: boolean }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setHidden(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Show every 7th tick on x-axis (91 days → ~13 labels)
  const ticks = DAILY_DATA
    .filter((_, i) => i % 7 === 0)
    .map(d => d.date);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: 'opacity 0.65s ease, transform 0.65s ease',
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* 커스텀 범례 — 클릭으로 토글 */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap',
        justifyContent: 'center',
        paddingBottom: 8,
      }}>
        {LINES.map(l => {
          const isHidden = hidden.has(l.key);
          return (
            <button
              key={l.key}
              onClick={() => toggle(l.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px',
                borderRadius: 9999,
                border: `1.5px solid ${isHidden ? '#e5e7eb' : l.color}`,
                background: isHidden ? '#f9fafb' : `${l.color}14`,
                cursor: 'pointer',
                fontSize: 12,
                color: isHidden ? '#9e9e9e' : l.color,
                fontWeight: isHidden ? 400 : 600,
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isHidden ? '#d1d5db' : l.color,
                display: 'inline-block',
                transition: 'background 0.2s ease',
              }} />
              {l.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={DAILY_DATA}
            margin={{ top: 8, right: 24, left: 0, bottom: 8 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="rgba(0,0,0,0.06)"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9e9e9e', fontSize: 11 }}
              ticks={ticks}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9e9e9e', fontSize: 12 }}
              tickFormatter={v => `${v}만`}
            />
            <Tooltip content={<DarkTooltip />} />

            {LINES.map(l => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                name={l.label}
                stroke={l.color}
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={<ActiveDot />}
                hide={hidden.has(l.key)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
