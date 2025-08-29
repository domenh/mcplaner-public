import { useEffect, useMemo, useState } from "react";
import Page from "../components/Page";

type Employee = { id: string; name: string; group?: string; active?: boolean };
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type Cell = { in?: string; out?: string };
type WeekData = Record<string /*employeeId*/, Record<DayKey, Cell>>;

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Pon" },
  { key: "tue", label: "Tor" },
  { key: "wed", label: "Sre" },
  { key: "thu", label: "Čet" },
  { key: "fri", label: "Pet" },
  { key: "sat", label: "Sob" },
  { key: "sun", label: "Ned" },
];

const EMP_KEYS = ["mc_employees", "employees", "mcplaner_employees"];
const SCHEDULE_KEY = "mc_schedule_week";

function readFirst<T>(keys: string[], fallback: T): T {
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw) as T;
    } catch { /* ignore */ }
  }
  return fallback;
}
function writeAll(keys: string[], value: unknown) {
  const s = JSON.stringify(value);
  for (const k of keys) localStorage.setItem(k, s);
}

function seedEmployees(): Employee[] {
  return [
    { id: "e1", name: "Ana", group: "Crew", active: true },
    { id: "e2", name: "Boris", group: "Crew", active: true },
    { id: "e3", name: "Cvetka", group: "Trainer", active: true },
    { id: "e4", name: "Domen", group: "Manager", active: true },
  ];
}

function emptyWeekFor(empId: string): Record<DayKey, Cell> {
  return { mon: {}, tue: {}, wed: {}, thu: {}, fri: {}, sat: {}, sun: {} };
}

export default function Schedule() {
  // Employees (live iz localStorage + storage-listener)
  const [employees, setEmployees] = useState<Employee[]>(() =>
    readFirst<Employee[]>(EMP_KEYS, seedEmployees()).filter(e => e?.active !== false)
  );

  // Week data
  const [week, setWeek] = useState<WeekData>(() => {
    try {
      const raw = localStorage.getItem(SCHEDULE_KEY);
      if (raw) return JSON.parse(raw) as WeekData;
    } catch {}
    // default: prazno za že obstoječe zaposlene
    const base: WeekData = {};
    for (const e of readFirst<Employee[]>(EMP_KEYS, seedEmployees())) base[e.id] = emptyWeekFor(e.id);
    return base;
  });

  // Naj bo week v koraku z novimi zaposlenimi (dodaj prazne vrstice)
  useEffect(() => {
    setWeek(prev => {
      const copy: WeekData = { ...prev };
      for (const e of employees) {
        if (!copy[e.id]) copy[e.id] = emptyWeekFor(e.id);
      }
      // po brisanju zaposlenega vrstice pustimo (zgodovina) — ne čistimo avtomatsko
      return copy;
    });
  }, [employees]);

  // Live osvežitev, ko Settings doda/odstrani zaposlenega
  useEffect(() => {
    function onStorage(ev: StorageEvent) {
      if (!ev.key || !EMP_KEYS.includes(ev.key)) return;
      const next = readFirst<Employee[]>(EMP_KEYS, []);
      setEmployees(next.filter(e => e?.active !== false));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => { document.title = "McPlaner — Urnik"; }, []);

  function setCell(empId: string, day: DayKey, field: "in" | "out", value: string) {
    setWeek(w => ({
      ...w,
      [empId]: { ...(w[empId] ?? emptyWeekFor(empId)), [day]: { ...(w[empId]?.[day] ?? {}), [field]: value } }
    }));
  }

  function saveWeek() {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(week));
  }
  function resetWeek() {
    const fresh: WeekData = {};
    for (const e of employees) fresh[e.id] = emptyWeekFor(e.id);
    setWeek(fresh);
  }

  const activeCount = employees.length;

  return (
    <Page
      title="Urnik"
      subtitle="IN / OUT polja po dnevih; shranjevanje v localStorage"
      actions={
        <div className="flex gap-2">
          <button onClick={resetWeek} className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50">Počisti</button>
          <button onClick={saveWeek} className="px-3 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700">Shrani</button>
        </div>
      }
    >
      <div className="mb-4 text-sm text-slate-600">
        Aktivni zaposleni: <b>{activeCount}</b>
      </div>

      <div className="overflow-auto rounded-2xl border bg-white">
        <table className="min-w-[920px] w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-3 py-3 w-64">Zaposleni</th>
              {DAYS.map(d => (
                <th key={d.key} className="text-center px-3 py-3">{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id} className="border-t">
                <td className="px-3 py-3">
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-slate-500">{e.group ?? "—"}</div>
                </td>
                {DAYS.map(d => {
                  const c = week[e.id]?.[d.key] ?? {};
                  return (
                    <td key={d.key} className="px-2 py-2 align-top">
                      <div className="border rounded-xl px-2 py-2">
                        <div className="text-[10px] uppercase tracking-wide text-slate-500">IN</div>
                        <input
                          type="time"
                          value={c.in ?? ""}
                          onChange={(ev) => setCell(e.id, d.key, "in", ev.target.value)}
                          className="w-full border rounded-lg px-2 py-1 mt-1"
                        />
                        <div className="text-[10px] uppercase tracking-wide text-slate-500 mt-2">OUT</div>
                        <input
                          type="time"
                          value={c.out ?? ""}
                          onChange={(ev) => setCell(e.id, d.key, "out", ev.target.value)}
                          className="w-full border rounded-lg px-2 py-1 mt-1"
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 mt-3">
        * Podatki se shranijo lokalno (ključ <code>{SCHEDULE_KEY}</code>). Dodan/odstranjen zaposleni v Nastavitvah se takoj prikaže tukaj.
      </p>
    </Page>
  );
}