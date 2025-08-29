import type { WeekAssignments, WeekId, Shift } from "../types";

const LS_KEY = "mc_assignments_v1";

/** Mini event bus za rerender UI-ja */
const listeners = new Set<() => void>();
function notify(){ listeners.forEach(l => { try { l(); } catch {} }); }
/** Naroči se na spremembe urnika (odjavi z return funkcijo). */
export function subscribe(fn: () => void){ listeners.add(fn); return () => listeners.delete(fn); }

function readAll(): Record<WeekId, WeekAssignments> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
function writeAll(data: Record<WeekId, WeekAssignments>) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export function loadWeek(weekId: WeekId): WeekAssignments {
  const all = readAll();
  if (!all[weekId]) all[weekId] = { weekId, matrix: {} };
  return all[weekId];
}

export function saveWeek(payload: WeekAssignments) {
  const all = readAll();
  all[payload.weekId] = payload;
  writeAll(all);
  notify();
}

export function setCell(weekId: WeekId, employeeId: string, dayIndex: number, shift: Shift) {
  const all = readAll();
  if (!all[weekId]) all[weekId] = { weekId, matrix: {} };
  if (!all[weekId].matrix[employeeId]) all[weekId].matrix[employeeId] = {};
  all[weekId].matrix[employeeId][dayIndex] = shift;
  writeAll(all);
  notify();
}

export function getCell(weekId: WeekId, employeeId: string, dayIndex: number): Shift {
  const wk = loadWeek(weekId);
  const row = wk.matrix[employeeId] || {};
  return row[dayIndex] || { kind: "empty" };
}