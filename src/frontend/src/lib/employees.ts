import { useEffect, useState } from "react";

export type GroupName = "Crew" | "Managerji" | "Trainer" | "Assistant" | "Other";

export interface Employee {
  id: string;
  name: string;
  username: string;
  group: GroupName | string;
  email?: string;
  phone?: string;
  active: boolean;
  stations?: string[]; // za "Postaje" v nastavitvah
}

const KEY = "mc.v1.employees";

/** Safe read */
export function getEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Safe write (+ event) */
export function setEmployees(list: Employee[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("mc:employees"));
}

/** CRUD helpers */
export function upsertEmployee(emp: Employee) {
  const arr = getEmployees();
  const i = arr.findIndex((x) => x.id === emp.id);
  if (i >= 0) arr[i] = emp; else arr.push(emp);
  setEmployees(arr);
}

export function removeEmployee(id: string) {
  const arr = getEmployees().filter((x) => x.id !== id);
  setEmployees(arr);
}

/** React hook: auto-refresh ob spremembah */
export function useEmployees() {
  const [list, setList] = useState<Employee[]>(getEmployees());
  useEffect(() => {
    const update = () => setList(getEmployees());
    const onCustom = () => update();
    window.addEventListener("storage", update);
    window.addEventListener("mc:employees", onCustom as any);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("mc:employees", onCustom as any);
    };
  }, []);
  return {
    employees: list,
    setAll: setEmployees,
    upsert: upsertEmployee,
    remove: removeEmployee,
  };
}
