export const DAYS = ["Pon","Tor","Sre","Čet","Pet","Sob","Ned"];

// ----- TEDEN -----
export function startOfISOWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1));
  return date;
}
export function getWeekId(d: Date): string {
  const ref = startOfISOWeek(d);
  const jan4 = new Date(Date.UTC(ref.getUTCFullYear(), 0, 4));
  const weekStart = startOfISOWeek(jan4);
  const diff = (ref.getTime() - weekStart.getTime()) / 86400000;
  const week = Math.floor(diff / 7) + 1;
  return `${ref.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
export function addWeeks(d: Date, w: number): Date {
  const nd = new Date(d);
  nd.setUTCDate(nd.getUTCDate() + w * 7);
  return nd;
}
export function weekDays(d: Date) {
  const start = startOfISOWeek(d);
  const out: { iso: string; labelShort: string; dayNum: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(start);
    dt.setUTCDate(start.getUTCDate() + i);
    out.push({
      iso: dt.toISOString().slice(0, 10),
      labelShort: DAYS[i],
      dayNum: dt.getUTCDate(),
    });
  }
  return out;
}

// ----- MESEC -----
export function startOfMonth(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}
export function addMonths(d: Date, m: number) {
  const nd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  nd.setUTCMonth(nd.getUTCMonth() + m);
  return nd;
}
export function getMonthId(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`; // ASCII, npr. 2025-08
}
export function monthDays(d: Date) {
  const start = startOfMonth(d);
  const next = addMonths(start, 1);
  const out: { iso: string; labelShort: string; dayNum: number }[] = [];
  for (let cur = new Date(start); cur < next; cur.setUTCDate(cur.getUTCDate() + 1)) {
    const dow = cur.getUTCDay() || 7;
    out.push({
      iso: cur.toISOString().slice(0, 10),
      labelShort: DAYS[dow - 1],
      dayNum: cur.getUTCDate(),
    });
  }
  return out;
}