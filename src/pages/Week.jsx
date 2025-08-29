import React, { useMemo, useState, useEffect } from "react";
import { useEmployees, useSchedule, useActions } from "../model/store";
function todayISO(){ const d = new Date(); const mm = String(d.getMonth()+1).padStart(2,"0"); const dd = String(d.getDate()).padStart(2,"0"); return `${d.getFullYear()}-${mm}-${dd}`; }
export default function Week(){
  const { grouped } = useEmployees();
  const { byGroupForDate } = useSchedule();
  const { upsertAssignment } = useActions();
  const [date, setDate] = useState(todayISO());
  const [edits, setEdits] = useState({});
  const [saved, setSaved] = useState(false);
  const rowsByGroup = useMemo(()=> byGroupForDate(date), [date, byGroupForDate]);
  useEffect(()=>{
    const next = {};
    for(const g of rowsByGroup){ for(const r of g.rows){ next[r.employee.id] = { in: r.assignment?.in ?? "", out: r.assignment?.out ?? "" }; } }
    setEdits(next);
  }, [date, grouped, rowsByGroup.length]);
  function change(empId, field, value){ setEdits(prev => ({ ...prev, [empId]: { ...(prev[empId]||{}), [field]: value }})); }
  function onSave(){
    for(const g of rowsByGroup){ for(const r of g.rows){
      const e = edits[r.employee.id] || {};
      upsertAssignment({ date, employeeId: r.employee.id, in: e.in ?? null, out: e.out ?? null });
    } }
    setSaved(true); setTimeout(()=>setSaved(false), 1000);
  }
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Week</h1>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border rounded px-2 py-1" />
        <button onClick={onSave} className="px-3 py-2 rounded bg-amber-500 text-white hover:opacity-90">Save</button>
        {saved && <span className="text-green-600"> Shranjeno</span>}
      </div>
      <div className="space-y-6">
        {rowsByGroup.map(({group, rows})=>(
          <div key={group.id} className="border rounded">
            <div className="px-3 py-2 font-medium bg-slate-100">{group.name}</div>
            <table className="w-full">
              <thead>
                <tr className="text-left border-b"><th className="px-3 py-2">Zaposleni</th><th className="px-3 py-2">IN</th><th className="px-3 py-2">OUT</th></tr>
              </thead>
              <tbody>
                {rows.map(({employee})=>{
                  const e = edits[employee.id] || {};
                  return (
                    <tr key={employee.id} className="border-b">
                      <td className="px-3 py-2">{employee.name}</td>
                      <td className="px-3 py-2"><input className="border rounded px-2 py-1 w-24" value={e.in ?? ""}  onChange={ev=>change(employee.id,"in",ev.target.value)} /></td>
                      <td className="px-3 py-2"><input className="border rounded px-2 py-1 w-24" value={e.out ?? ""} onChange={ev=>change(employee.id,"out",ev.target.value)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}