import { useEffect, useState } from "react";
import Page from "../components/Page";

/**
 * Settings — vizualno usklajen z McPlaner temo.
 * DODANO: zavihek "Zaposleni" (dodaj/odstrani) -> piše v localStorage (mc_employees + zrcalni ključi).
 */

type Tab = "general" | "employees" | "groups" | "stations" | "wishes" | "notifications";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type Employee = { id: string; name: string; group?: string; active?: boolean };

const EMP_KEYS = ["mc_employees", "employees", "mcplaner_employees"];

function readFirst<T>(keys: string[], fallback: T): T {
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw) as T;
    } catch {}
  }
  return fallback;
}
function writeAll(keys: string[], value: unknown) {
  const s = JSON.stringify(value);
  for (const k of keys) localStorage.setItem(k, s);
}

export default function Settings() {
  const [tab, setTab] = useState<Tab>("general");

  useEffect(() => { document.title = "McPlaner — Nastavitve"; }, []);

  const tabs = [
    { k: "general", label: "Splošno" },
    { k: "employees", label: "Zaposleni" },
    { k: "groups", label: "Skupine" },
    { k: "stations", label: "Postaje" },
    { k: "wishes", label: "Omejitve želja" },
    { k: "notifications", label: "Notifikacije" },
  ] as const;

  return (
    <Page title="Nastavitve" subtitle="Konfiguracija aplikacije">
      {/* TAB BAR */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        {tabs.map((b) => (
          <button
            key={b.k}
            onClick={() => setTab(b.k as Tab)}
            className={cx(
              "rounded-full px-4 py-2 border text-sm font-medium transition",
              tab === (b.k as Tab)
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-white hover:bg-amber-50 border-slate-300 text-slate-700"
            )}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* PANEL */}
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        {tab === "general" && <GeneralTab />}
        {tab === "employees" && <EmployeesTab />}
        {tab === "groups" && <GroupsTab />}
        {tab === "stations" && <StationsTab />}
        {tab === "wishes" && <WishesTab />}
        {tab === "notifications" && <NotificationsTab />}
      </div>
    </Page>
  );
}

/* ======================= HELPERS ======================= */
function SectionTitle({ children }: { children: string }) {
  return <h2 className="text-lg font-semibold mb-3">{children}</h2>;
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col md:flex-row md:items-center gap-2 py-2">{children}</div>;
}
function Label({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (<label htmlFor={htmlFor} className="w-56 text-sm text-slate-600">{children}</label>);
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (<input {...props} className={cx("border rounded-lg px-3 py-2 w-full md:w-60",(props.className as string)||"")} />);
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (<select {...props} className={cx("border rounded-lg px-3 py-2 w-full md:w-60 bg-white",(props.className as string)||"")} />);
}

/* --- SPLOŠNO ---------------------------------------------------- */
function GeneralTab() {
  return (
    <div>
      <SectionTitle>Splošne nastavitve</SectionTitle>
      <Row>
        <Label htmlFor="lang">Jezik</Label>
        <Select id="lang" defaultValue="sl">
          <option value="sl">Slovenščina</option>
          <option value="en">English</option>
        </Select>
      </Row>
      <Row>
        <Label htmlFor="theme">Videz</Label>
        <Select id="theme" defaultValue="light">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </Select>
      </Row>
      <Row>
        <Label htmlFor="logo">Logotip (URL)</Label>
        <Input id="logo" placeholder="https://..." />
      </Row>
    </div>
  );
}

/* --- ZAPOSLENI (NOVO) ------------------------------------------- */
function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>(
    () => readFirst<Employee[]>(EMP_KEYS, []).sort((a,b)=>a.name.localeCompare(b.name,'sl'))
  );
  const [name, setName] = useState("");
  const [group, setGroup] = useState("Crew");

  function persist(next: Employee[]) {
    const sorted = [...next].sort((a,b)=>a.name.localeCompare(b.name,'sl'));
    setEmployees(sorted);
    writeAll(EMP_KEYS, sorted);
    // sproži storage event tudi na isti tab (manu.) – za enoten refresh
    window.dispatchEvent(new StorageEvent("storage", { key: "mc_employees", newValue: JSON.stringify(sorted) }));
  }

  function add() {
    const n = name.trim();
    if (!n) return;
    const id = "emp_" + Math.random().toString(36).slice(2,9);
    persist([...employees, { id, name: n, group, active: true }]);
    setName("");
  }

  function remove(id: string) {
    persist(employees.filter(e => e.id !== id));
  }

  return (
    <div>
      <SectionTitle>Zaposleni</SectionTitle>
      <Row>
        <Label htmlFor="empName">Ime in priimek</Label>
        <Input id="empName" value={name} onChange={e=>setName(e.target.value)} placeholder="npr. Janez Novak" />
      </Row>
      <Row>
        <Label htmlFor="empGroup">Skupina</Label>
        <Select id="empGroup" value={group} onChange={e=>setGroup(e.target.value)}>
          <option>Manager</option>
          <option>Assistant</option>
          <option>Trainer</option>
          <option>Crew</option>
          <option>Delivery</option>
        </Select>
      </Row>
      <div className="flex gap-2 mt-2">
        <button onClick={add} className="px-3 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700">Dodaj zaposlenega</button>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Seznam</h3>
        <div className="divide-y border rounded-xl overflow-hidden bg-white">
          {employees.length === 0 && <div className="px-3 py-3 text-slate-500 text-sm">Ni zaposlenih.</div>}
          {employees.map(e => (
            <div key={e.id} className="px-3 py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{e.name}</div>
                <div className="text-xs text-slate-500">{e.group ?? "—"}</div>
              </div>
              <button onClick={()=>remove(e.id)} className="text-sm px-2 py-1 border rounded-lg hover:bg-slate-50">Odstrani</button>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">* Seznam se zapiše v localStorage in je takoj viden v Urniku.</p>
      </div>
    </div>
  );
}

/* --- SKUPINE ---------------------------------------------------- */
function GroupsTab() {
  const [groups, setGroups] = useState<string[]>(["Manager","Assistant","Trainer","Crew"]);
  const [val, setVal] = useState("");
  function add(){ const v=val.trim(); if(!v||groups.includes(v))return; setGroups(g=>[...g,v]); setVal(""); }
  function remove(name:string){ setGroups(g=>g.filter(x=>x!==name)); }
  return (
    <div>
      <SectionTitle>Skupine &amp; pravice</SectionTitle>
      <Row>
        <Label htmlFor="newGroup">Dodaj skupino</Label>
        <div className="flex gap-2">
          <Input id="newGroup" value={val} onChange={e=>setVal(e.target.value)} placeholder="npr. Delivery" />
          <button onClick={add} className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50">Dodaj</button>
        </div>
      </Row>
      <div className="mt-4">
        <ul className="space-y-2">
          {groups.map(g=>(
            <li key={g} className="flex items-center justify-between border rounded-lg px-3 py-2">
              <span>{g}</span>
              <button onClick={()=>remove(g)} className="text-sm px-2 py-1 border rounded-lg hover:bg-slate-50">Odstrani</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* --- POSTAJE ---------------------------------------------------- */
function StationsTab() {
  const [stations, setStations] = useState<string[]>(["Front","Drive","Kitchen","Lobby","Delivery","Kiosk"]);
  const [val, setVal] = useState("");
  function add(){ const v=val.trim(); if(!v||stations.includes(v))return; setStations(s=>[...s,v]); setVal(""); }
  function remove(name:string){ setStations(s=>s.filter(x=>x!==name)); }
  return (
    <div>
      <SectionTitle>Postaje</SectionTitle>
      <Row>
        <Label htmlFor="newStation">Dodaj postajo</Label>
        <div className="flex gap-2">
          <Input id="newStation" value={val} onChange={e=>setVal(e.target.value)} placeholder="npr. Grill" />
          <button onClick={add} className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50">Dodaj</button>
        </div>
      </Row>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {stations.map(s=>(
          <div key={s} className="border rounded-lg px-3 py-2 flex items-center justify-between">
            <span>{s}</span>
            <button onClick={()=>remove(s)} className="text-sm px-2 py-1 border rounded-lg hover:bg-slate-50">Odstrani</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- OMEJITVE ŽELJA -------------------------------------------- */
function WishesTab() {
  return (
    <div>
      <SectionTitle>Omejitve želja</SectionTitle>
      <Row>
        <Label htmlFor="deadline">Deadline (dan v mesecu)</Label>
        <Input id="deadline" type="number" min={1} max={28} defaultValue={20} />
      </Row>
      <Row>
        <Label htmlFor="maxD">Max D/leto</Label>
        <Input id="maxD" type="number" min={0} defaultValue={25} />
      </Row>
      <Row>
        <Label htmlFor="maxX">Max X/mesec</Label>
        <Input id="maxX" type="number" min={0} defaultValue={2} />
      </Row>
    </div>
  );
}

/* --- NOTIFIKACIJE ---------------------------------------------- */
function NotificationsTab() {
  return (
    <div>
      <SectionTitle>Notifikacije</SectionTitle>
      <Row>
        <Label htmlFor="channel">Kanal</Label>
        <Select id="channel" defaultValue="app">
          <option value="app">In-app</option>
          <option value="push">Push</option>
          <option value="sms">SMS</option>
          <option value="email">Email</option>
        </Select>
      </Row>
      <Row>
        <Label htmlFor="critical">Kritične objave ob loginu</Label>
        <Select id="critical" defaultValue="on">
          <option value="on">Vključeno</option>
          <option value="off">Izključeno</option>
        </Select>
      </Row>
    </div>
  );
}