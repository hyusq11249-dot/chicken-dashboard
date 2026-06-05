'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { STEP_MAP } from '@/lib/mockData';
import { fetchDashboard } from '@/lib/data-source';
import { getSupabase } from '@/lib/supabase';
import type { DashboardData, Period } from '@/lib/types';

const TOTAL_STEPS = STEP_MAP.length;
function sectionOf(step: number) { return STEP_MAP[Math.min(step, TOTAL_STEPS - 1)].section; }

export function useDashboard() {
  const [globalStep,    setGlobalStep]    = useState(0);
  const [highWaterMark, setHighWaterMark] = useState(0);
  const [period,        setPeriod]        = useState<Period>('monthly');
  const [customStart,   setCustomStart]   = useState('2025-09-01');
  const [customEnd,     setCustomEnd]     = useState('2025-11-30');
  const [apiData,       setApiData]       = useState<DashboardData | null>(null);
  const [isLoading,     setIsLoading]     = useState(true);
  const [isError,       setIsError]       = useState(false);
  const [retryToken,    setRetryToken]    = useState(0);

  const sectionRefs    = useRef<(HTMLElement | null)[]>([null, null, null, null]);
  const currentSection = sectionOf(globalStep);

  useEffect(() => {
    if (period === 'custom' && (!customStart || !customEnd)) return;
    setIsLoading(true);
    setIsError(false);
    fetchDashboard(period, customStart, customEnd)
      .then(data => { setApiData(data); setIsLoading(false); })
      .catch(() => { setIsError(true); setIsLoading(false); });
  }, [period, customStart, customEnd, retryToken]);

  useEffect(() => {
    const el = sectionRefs.current[currentSection];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentSection]);

  // 로딩 화면 없이 백그라운드 갱신 — Realtime 이벤트용
  const silentRefresh = useCallback(() => {
    if (period === 'custom' && (!customStart || !customEnd)) return;
    fetchDashboard(period, customStart, customEnd)
      .then(data => setApiData(data))
      .catch(() => {});
  }, [period, customStart, customEnd]);

  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_sales' },   silentRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channel_sales' }, silentRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_sales' }, silentRefresh)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [silentRefresh]);

  const changePeriod = useCallback((p: Period) => {
    setPeriod(p);
    setGlobalStep(0);
    setHighWaterMark(0);
  }, []);

  const advance = useCallback(() => {
    setGlobalStep(s => {
      const next = Math.min(s + 1, TOTAL_STEPS - 1);
      setHighWaterMark(m => Math.max(m, next));
      return next;
    });
  }, []);

  const retreat = useCallback(() => { setGlobalStep(s => Math.max(s - 1, 0)); }, []);
  const jumpTo  = useCallback((target: number) => {
    setGlobalStep(target);
    setHighWaterMark(m => Math.max(m, target));
  }, []);
  const retry = useCallback(() => setRetryToken(t => t + 1), []);

  useEffect(() => {
    if (isLoading) return;
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); advance(); }
      if (['ArrowLeft',  'ArrowUp'  ].includes(e.key)) { e.preventDefault(); retreat(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, retreat, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    let lastWheel = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheel < 500) return;
      lastWheel = now;
      if (e.deltaY > 0) advance(); else retreat();
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [advance, retreat, isLoading]);

  const visibleSub = (sec: number) => {
    let maxSub = -1;
    STEP_MAP.forEach((s, gi) => { if (s.section === sec && gi <= highWaterMark) maxSub = s.sub; });
    return maxSub;
  };

  return {
    period, setPeriod: changePeriod, customStart, setCustomStart, customEnd, setCustomEnd,
    globalStep, highWaterMark, jumpTo, retry, sectionRefs,
    isLoading, isError, apiData, currentSection,
    sec0Sub: visibleSub(0), sec1Sub: visibleSub(1),
    sec2Sub: visibleSub(2), sec3Sub: visibleSub(3),
  };
}
