import { SCHEMA_VERSION, defaultState, DEFAULT_GROUPS, newId } from "./contracts";
const STORAGE_KEY = "mcplaner@state";
const safeParse = (j)=>{ try{ return JSON.parse(j) }catch{ return null } };
const clone = (v)=> JSON.parse(JSON.stringify(v));

// v0 -> v1
function migrateV0toV1(state){
  return {
    version: 1,
    employees: Array.isArray(state?.employees) ? state.employees : [],
    groups: Array.isArray(state?.groups) ? state.groups : DEFAULT_GROUPS.slice(),
    assignments: Array.isArray(state?.assignments) ? state.assignments : [],
  };
}
function normalizeGroups(groups){
  const gs = (Array.isArray(groups)?groups:[]).slice()
    .map((g,i)=>({ id: g?.id || newId("grp"), name: g?.name || `Group ${i+1}`, order: Number(g?.order ?? (i+1)) }))
    .sort((a,b)=>a.order-b.order)
    .map((g,i)=>({ ...g, order:i+1 }));
  return gs;
}
function normalizeAssignment(a){
  if(!a || typeof a!=="object") return null;
  const id = a.id || newId("asg");
  const date = (typeof a.date==="string" && /^\d{4}-\d{2}-\d{2}$/.test(a.date)) ? a.date : null;
  const employeeId = a.employeeId || null;
  if(!date || !employeeId) return null;
  const stationId = ("stationId" in a) ? a.stationId : null;
  const inn = ("in" in a) ? a.in : null;
  const out = ("out" in a) ? a.out : null;
  const kind = (a.kind==="B"||a.kind==="D"||a.kind==="X") ? a.kind : null;
  return { id, date, employeeId, stationId, in: inn, out, kind };
}
// v1 -> v2
function migrateV1toV2(state){
  const out = { version: 2, employees: [], groups: [], assignments: [] };
  if(Array.isArray(state.employees)){
    out.employees = state.employees.filter(Boolean).map(e=>({
      id: e.id || newId("emp"), name: e.name || "Unnamed", groupId: e.groupId || "grp-crew"
    }));
  }
  out.groups = normalizeGroups(state.groups);
  if(Array.isArray(state.assignments)){
    out.assignments = state.assignments.map(normalizeAssignment).filter(Boolean);
  }
  return out;
}
export function migrate(state){
  if(!state || typeof state!=="object") return defaultState();
  let v = state.version ?? 0; let cur = clone(state);
  if(v < 1){ cur = migrateV0toV1(cur); v = 1; }
  if(v < 2){ cur = migrateV1toV2(cur); v = 2; }
  cur.version = SCHEMA_VERSION;
  return cur;
}
export function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return defaultState();
  const parsed = safeParse(raw);
  const migrated = migrate(parsed);
  saveState(migrated); // idempotentno po migraciji
  return migrated;
}
export function saveState(state){
  const safe = {
    version: SCHEMA_VERSION,
    employees: Array.isArray(state?.employees)?state.employees:[],
    groups: Array.isArray(state?.groups)?state.groups:[],
    assignments: Array.isArray(state?.assignments)?state.assignments:[],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
}