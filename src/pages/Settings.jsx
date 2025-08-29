import React, { useState } from "react";
import { useActions, useEmployees } from "../model/store";
export default function Settings(){
  const { groups } = useEmployees();
  const { addEmployee } = useActions();
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState(groups[0]?.id || "grp-crew");
  const [msg, setMsg] = useState("");
  function onSubmit(e){
    e.preventDefault();
    if(!name.trim()) return;
    addEmployee({ name: name.trim(), groupId });
    setName(""); setMsg("Dodano "); setTimeout(()=>setMsg(""), 1200);
  }
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label className="text-sm">Ime in priimek</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="border rounded px-2 py-1" placeholder="npr. Ana Novak" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Skupina</label>
          <select value={groupId} onChange={e=>setGroupId(e.target.value)} className="border rounded px-2 py-1">
            {groups.map(g=> <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <button type="submit" className="px-3 py-2 rounded bg-amber-500 text-white hover:opacity-90">Dodaj zaposlenega</button>
        {msg && <span className="text-green-600">{msg}</span>}
      </form>
    </div>
  );
}