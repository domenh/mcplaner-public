import { useEffect, useState } from "react";

export type DayIndex = 0|1|2|3|4|5|6;

export interface Shift {
  employeeId: string;
  day: DayIndex;          // 0..6
  value: string;          // npr. "8 16" ali "B" ali "D"
}

const KEY = "mc.v1.schedule";

/** Vrne celoten plan (če obstaja). */
export function getSchedule(): Shift[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setSchedule(list: Shift[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("mc:schedule"));
}

export function useSchedule() {
  const [list, setList] = useState<Shift[]>(getSchedule());
  useEffect(() => {
    const update = () => setList(getSchedule());
    window.addEventListener("storage", update);
    window.addEventListener("mc:schedule", update as any);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("mc:schedule", update as any);
    };
  }, []);
  return { schedule: list, setAll: setSchedule };
}
