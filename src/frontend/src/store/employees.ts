import type { Employee } from "../types";

const KEY = "mc_employees";
const listeners = new Set<() => void>();

export function loadEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Employee[];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export function saveEmployees(list: Employee[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  notify();
}

export function subscribeEmployees(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(){ listeners.forEach(fn => { try { fn(); } catch {} }); }

// cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) notify();
  });
}

// omogoči ročno nastavljanje (debug) v konzoli: window.mcSetEmployees([...])
if (typeof window !== "undefined") {
  // @ts-ignore
  (window as any).mcSetEmployees = saveEmployees;
}