export function fmtKrw(won: number): string {
  const man = Math.round(won / 10000);
  if (man >= 10000) {
    const ok = Math.round(man / 1000) / 10;
    const rem = man % 10000;
    return `${ok}억 ${rem > 0 ? rem.toLocaleString() + '만' : ''}`.trim();
  }
  return `${man.toLocaleString()}만`;
}
