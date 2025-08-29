import { loadEmployees, saveEmployees } from "./employees";

export type Station = {
  id: string;
  name: string;
  color?: string;   // optional, za kasneje
  active: boolean;
};

const KEY = "mcplaner.stations.v1";
const KEY_SEQ = "mcplaner.stations.seq";

function nextId(): string {
  const raw = localStorage.getItem(KEY_SEQ);
  const n = raw ? parseInt(raw,10) : 200;
  const nn = n + 1;
  localStorage.setItem(KEY_SEQ, String(nn));
  return String(nn);
}

export function loadStations(): Station[] {
  const raw = localStorage.getItem(KEY);
  if(!raw){
    const seed: Station[] = [
      { id: nextId(), name: "Blagajna", active: true },
      { id: nextId(), name: "Kuhinja",  active: true },
      { id: nextId(), name: "Sala",     active: true },
      { id: nextId(), name: "Vodja",    active: true },
    ];
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
  try { return JSON.parse(raw) as Station[]; } catch { return []; }
}

export function saveStations(list: Station[]){
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function createStation(data: Omit<Station,"id">): Station {
  const list = loadStations();
  const st: Station = { ...data, id: nextId() };
  list.push(st);
  saveStations(list);
  return st;
}

export function updateStation(id: string, patch: Partial<Station>){
  const list = loadStations();
  const i = list.findIndex(s=>s.id===id);
  if(i>=0){ list[i] = { ...list[i], ...patch }; saveStations(list); }
}

export function deleteStation(id: string){
  const list = loadStations().filter(s=>s.id!==id);
  saveStations(list);
  // odstrani referenco tudi pri zaposlenih (skills)
  const emps = loadEmployees();
  for(const e of emps){
    if(Array.isArray(e.skills)){
      e.skills = e.skills.filter(x => x !== id);
    }
  }
  saveEmployees(emps);
}