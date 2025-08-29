import { useEffectuseEffect } from "react";
import { useSyncEmployees } from "../bridge/useSyncEmployees";
import { useEffectuseEffect } from "react";
import Page from "../components/Page";
import { Employee, useEmployees } from "../lib/employees";
import { Station, useStations } from "../lib/stations";
type Tab = "emp" | "stations" | "groups" | "rules";

/* === ROW & MODALI ZA ZAPOSLENE === */
function EmpRow({ e, onEdit, onDelete }: { e: Employee; onEdit: (e: Employee)=>void; onDelete: (id:string)=>void }) {
  return (
    <tr className="border-b last:border-none">
      <td className="py-3 px-3 text-slate-500">{e.id}</td>
      <td className="py-3 px-3">{e.name}</td>
      <td className="py-3 px-3 text-slate-600">{e.username}</td>
      <td className="py-3 px-3">{e.group || "Ä‚ËĂ˘â€šÂ¬Ă˘â‚¬ĹĄ"}</td>
      <td className="py-3 px-3 text-slate-500">{e.email || "Ä‚ËĂ˘â€šÂ¬Ă˘â‚¬ĹĄ"}</td>
      <td className="py-3 px-3 text-slate-500">{e.phone || "Ä‚ËĂ˘â€šÂ¬Ă˘â‚¬ĹĄ"}</td>
      <td className="py-3 px-3">
        <span className={"inline-flex rounded-full px-2 py-0.5 text-xs " + (e.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")}>
          {e.active ? "Aktiven" : "Neaktiven"}
        </span>
      </td>
      <td className="py-3 px-3">
        <div className="flex gap-2">
          <button className="rounded-lg border px-2 py-1 text-sm hover:bg-slate-50" onClick={()=>onEdit(e)} title="Uredi">Ä‚ËÄąâ€şÄąËť</button>
          <button className="rounded-lg border px-2 py-1 text-sm hover:bg-red-50" onClick={()=>onDelete(e.id)} title="IzbriĂ„Ä…Ă‹â€ˇi">Ă„â€ÄąĹźĂ˘â‚¬â€ťĂ˘â‚¬Â</button>
        </div>
      </td>
    </tr>
  );
}

function EmpModal({
  initial, stationsAll, onClose, onSave
}: {
  initial?: Employee|null;
  stationsAll: Station[];
  onClose:()=>void;
  onSave:(e:Employee)=>void;
}) {
  const [form, setForm] = useState<Employee>(initial ?? {
    id: "", name: "", username: "", group: "Crew", email: "", phone: "",
    active: true, stations: []
  });
  const isEdit = Boolean(initial);
  const toggleStation = (sid:string) => {
    const cur = new Set(form.stations || []);
    if (cur.has(sid)) cur.delete(sid); else cur.add(sid);
    setForm({ ...form, stations: Array.from(cur) });
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/30">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">{isEdit ? "Uredi zaposlenega" : "Dodaj zaposlenega"}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">ID</label>
            <input className="input pl-3" value={form.id} onChange={e=>setForm({...form, id: e.target.value})} placeholder="npr. 1005"/>
          </div>
          <div>
            <label className="label">Uporabnik</label>
            <input className="input pl-3" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} placeholder="npr. domen"/>
          </div>
          <div className="col-span-2">
            <label className="label">Ime in priimek</label>
            <input className="input pl-3" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="npr. Domen Hacin"/>
          </div>
          <div>
            <label className="label">Skupina</label>
            <select className="input pl-3" value={form.group} onChange={e=>setForm({...form, group: e.target.value})}>
              <option value="Crew">Crew</option>
              <option value="Managerji">Managerji</option>
              <option value="Trainer">Trainer</option>
              <option value="Assistant">Assistant</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Telefon</label>
            <input className="input pl-3" value={form.phone || ""} onChange={e=>setForm({...form, phone: e.target.value})}/>
          </div>
          <div className="col-span-2">
            <label className="label">E-poĂ„Ä…Ă‹â€ˇta</label>
            <input className="input pl-3" value={form.email || ""} onChange={e=>setForm({...form, email: e.target.value})}/>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active: e.target.checked})}/>
            Aktiven
          </label>
        </div>

        <div className="mt-4">
          <div className="label mb-1">Postaje (kompetence)</div>
          <div className="flex flex-wrap gap-3">
            {stationsAll.map(s => (
              <label key={s.id} className="flex items-center gap-2 rounded-xl border px-3 py-2">
                <input
                  type="checkbox"
                  checked={(form.stations || []).includes(s.id)}
                  onChange={()=>toggleStation(s.id)}
                />
                <span>{s.name}{s.short ? ` (${s.short})` : ""}</span>
              </label>
            ))}
            {stationsAll.length===0 && <div className="text-sm text-slate-500">Najprej dodaj postaje v zavihku "Postaje".</div>}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-xl border px-4 py-2" onClick={onClose}>PrekliÄ‚â€žÄąÂ¤i</button>
          <button className="btn btn-amber" onClick={()=>{ onSave(form); onClose(); }}>{isEdit ? "Shrani" : "Dodaj"}</button>
        </div>
      </div>
    </div>
  );
}

/* === MODALI ZA POSTAJE === */
function StationRow({ s, onEdit, onDelete }: { s: Station; onEdit:(s:Station)=>void; onDelete:(id:string)=>void }) {
  return (
    <tr className="border-b last:border-none">
      <td className="py-3 px-3">{s.id}</td>
      <td className="py-3 px-3">{s.name}</td>
      <td className="py-3 px-3 text-slate-500">{s.short || "Ä‚ËĂ˘â€šÂ¬Ă˘â‚¬ĹĄ"}</td>
      <td className="py-3 px-3">
        <span className={"inline-flex rounded-full px-2 py-0.5 text-xs " + (s.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")}>
          {s.active ? "Aktivna" : "Neaktivna"}
        </span>
      </td>
      <td className="py-3 px-3">
        <div className="flex gap-2">
          <button className="rounded-lg border px-2 py-1 text-sm hover:bg-slate-50" onClick={()=>onEdit(s)} title="Uredi">Ä‚ËÄąâ€şÄąËť</button>
          <button className="rounded-lg border px-2 py-1 text-sm hover:bg-red-50" onClick={()=>onDelete(s.id)} title="IzbriĂ„Ä…Ă‹â€ˇi">Ă„â€ÄąĹźĂ˘â‚¬â€ťĂ˘â‚¬Â</button>
        </div>
      </td>
    </tr>
  );
}

function StationModal({ initial, onClose, onSave }:{
  initial?: Station|null; onClose:()=>void; onSave:(s:Station)=>void
}) {
  const [form, setForm] = useState<Station>(initial ?? { id:"", name:"", short:"", active:true });
  const isEdit = Boolean(initial);
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/30">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">{isEdit ? "Uredi postajo" : "Dodaj postajo"}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">ID</label>
            <input className="input pl-3" value={form.id} onChange={e=>setForm({...form, id: e.target.value})} placeholder="npr. B"/>
          </div>
          <div>
            <label className="label">Kratica</label>
            <input className="input pl-3" value={form.short || ""} onChange={e=>setForm({...form, short: e.target.value})} placeholder="npr. B"/>
          </div>
          <div className="col-span-2">
            <label className="label">Naziv</label>
            <input className="input pl-3" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="npr. Blagajna"/>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active: e.target.checked})}/>
            Aktivna
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-xl border px-4 py-2" onClick={onClose}>PrekliÄ‚â€žÄąÂ¤i</button>
          <button className="btn btn-amber" onClick={()=>{ onSave(form); onClose(); }}>{isEdit ? "Shrani" : "Dodaj"}</button>
        </div>
      </div>
    </div>
  );
}

/* === SETTINGS PAGE === */
/* sync employees */
  const [tab, setTab] = useState<Tab>("emp");

  const { employees, upsert, remove, setAll } = useEmployees();
  // sync employees -> bridge/localStorage
  useEffect(() => { try { useSyncEmployees(employees as any); } catch {} }, [employees]);
  const { stations, upsert: upsertSt, remove: removeSt, setAll: setStations } = useStations();

  const [showEmp, setShowEmp] = useState<null|Employee>(null);
  const [showSt, setShowSt] = useState<null|Station>(null);

  // seed zaposlene (Ä‚â€žÄąÂ¤e je prazno)
  useMemo(() => {
    if (employees.length === 0) {
      setAll([{ id: "1005", name: "Domen Hacin", username: "domen", group: "Crew", active: true } as Employee]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // seed postaje (Ä‚â€žÄąÂ¤e je prazno)
  useMemo(() => {
    if (stations.length === 0) {
      setStations([
        { id:"B", name:"Blagajna", short:"B", active:true },
        { id:"K", name:"Kuhinja",  short:"K", active:true },
        { id:"S", name:"Sala",     short:"S", active:true },
        { id:"V", name:"Vodja",    short:"V", active:true },
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page title="Nastavitve" actions={null}>
      <div className="mb-4 flex items-center gap-2">
        <button onClick={()=>setTab("emp")} className={"rounded-xl px-3 py-2 "+(tab==="emp"?"bg-slate-900 text-white":"bg-white border")}>Zaposleni</button>
        <button onClick={()=>setTab("stations")} className={"rounded-xl px-3 py-2 "+(tab==="stations"?"bg-slate-900 text-white":"bg-white border")}>Postaje</button>
        <button onClick={()=>setTab("groups")} className={"rounded-xl px-3 py-2 "+(tab==="groups"?"bg-slate-900 text-white":"bg-white border")}>Skupine & pravice</button>
        <button onClick={()=>setTab("rules")} className={"rounded-xl px-3 py-2 "+(tab==="rules"?"bg-slate-900 text-white":"bg-white border")}>Pravila urnika</button>
      </div>

      {tab==="emp" && (
        <div className="card">
          <div className="mb-4 flex justify-between">
            <h3 className="text-lg font-semibold">Zaposleni</h3>
            <button className="btn btn-amber" onClick={()=>setShowEmp({} as Employee)}>+ Dodaj zaposlenega</button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Ime</th>
                  <th className="py-2 px-3">Uporabnik</th>
                  <th className="py-2 px-3">Skupina</th>
                  <th className="py-2 px-3">E-poĂ„Ä…Ă‹â€ˇta</th>
                  <th className="py-2 px-3">Telefon</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e)=>(
                  <EmpRow key={e.id} e={e} onEdit={(v)=>setShowEmp(v)} onDelete={remove}/>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="stations" && (
        <div className="card">
          <div className="mb-4 flex justify-between">
            <h3 className="text-lg font-semibold">Postaje</h3>
            <button className="btn btn-amber" onClick={()=>setShowSt({} as Station)}>+ Dodaj postajo</button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Naziv</th>
                  <th className="py-2 px-3">Kratica</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {stations.map(s=>(
                  <StationRow key={s.id} s={s} onEdit={(v)=>setShowSt(v)} onDelete={removeSt}/>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="groups" && (
        <div className="card text-slate-500">Skupine & pravice (preview Ä‚ËĂ˘â€šÂ¬Ă˘â‚¬Ĺ› brez sprememb UI).</div>
      )}

      {tab==="rules" && (
        <div className="card text-slate-500">Pravila urnika (preview Ä‚ËĂ˘â€šÂ¬Ă˘â‚¬Ĺ› brez sprememb UI).</div>
      )}

      {showEmp!==null && (
        <EmpModal
          initial={showEmp?.id ? showEmp : null}
          stationsAll={stations}
          onClose={()=>setShowEmp(null)}
          onSave={(e)=>{ /* spelji save */ 
            const { upsert } = useEmployees(); // NOTE: hook ni dovoljen tukaj; zato ignoriraj in uporabi prop iz closure
          }}
        />
      )}

      {showEmp!==null && (
        <EmpModal
          initial={showEmp?.id ? showEmp : null}
          stationsAll={stations}
          onClose={()=>setShowEmp(null)}
          onSave={(e)=>{ 
            // ker hookov ne smemo klicati tukaj, uporabimo Ă„Ä…Ă„Äľe zunanji "upsert"
            upsert(e);
          }}
        />
      )}

      {showSt!==null && (
        <StationModal
          initial={showSt?.id ? showSt : null}
          onClose={()=>setShowSt(null)}
          onSave={(s)=>upsertSt(s)}
        />
      )}
    </Page>
  );
}
