/**
 * McPlaner  Data Contracts (SCHEMA_VERSION = 2)
 * ENTITETE:
 *  - Employee  { id, name, groupId }
 *  - Group     { id, name, order }
 *  - Assignment{ id, date(YYYY-MM-DD), employeeId, stationId?, in?, out?, kind?('B'|'D'|'X'|null) }
 */
export const SCHEMA_VERSION = 2;
export function newId(prefix = "id"){
  const ts = Date.now().toString(36);
  const rnd = Math.floor(Math.random()*1e9).toString(36);
  return `${prefix}_${ts}_${rnd}`;
}
export const DEFAULT_GROUPS = [
  { id: "grp-crew",     name: "Crew",     order: 1 },
  { id: "grp-managers", name: "Managers", order: 2 },
];
export function defaultState(){
  return { version: SCHEMA_VERSION, employees: [], groups: DEFAULT_GROUPS.slice(), assignments: [] };
}