import React, { createContext, useContext, useMemo, useReducer, useEffect, useCallback, useRef } from "react";
import { defaultState, newId } from "./contracts";
import { loadState, saveState } from "./storage";

const StateCtx = createContext(null);
const ActionsCtx = createContext(null);
const A = { ADD_EMP:"ADD_EMP", SET_GRP_ORDER:"SET_GRP_ORDER", UPSERT_ASG:"UPSERT_ASG", RESET:"RESET" };

function reducer(state, action){
  switch(action.type){
    case A.ADD_EMP:{
      const { id, name, groupId } = action.payload || {};
      if(!name || !groupId) return state;
      const emp = { id: id || newId("emp"), name, groupId };
      return { ...state, employees: [...state.employees, emp] };
    }
    case A.SET_GRP_ORDER:{
      const { groupId, order } = action.payload || {};
      const groups = state.groups.map(g => g.id===groupId ? { ...g, order } : g)
        .sort((a,b)=>a.order-b.order)
        .map((g,i)=>({ ...g, order:i+1 }));
      return { ...state, groups };
    }
    case A.UPSERT_ASG:{
      const p = action.payload || {};
      const keyMatch = (x)=> x.employeeId===p.employeeId && x.date===p.date;
      let found = false;
      const next = state.assignments.map(asg=>{
        if(keyMatch(asg)){
          found = true;
          return { ...asg,
            in: ("in" in p) ? p.in : asg.in,
            out: ("out" in p) ? p.out : asg.out,
            stationId: ("stationId" in p) ? p.stationId : asg.stationId,
            kind: ("kind" in p) ? p.kind : asg.kind,
          };
        }
        return asg;
      });
      if(!found){
        next.push({ id:newId("asg"), date:p.date, employeeId:p.employeeId,
          stationId: p.stationId ?? null, in: ("in" in p)?p.in:null, out: ("out" in p)?p.out:null, kind: ("kind" in p)?p.kind:null });
      }
      return { ...state, assignments: next };
    }
    case A.RESET: return defaultState();
    default: return state;
  }
}

export function McPlanerProvider({ children }){
  const initial = useRef(loadState());
  const [state, dispatch] = useReducer(reducer, initial.current);
  useEffect(()=>{ saveState(state) }, [state]);
  const actions = useMemo(()=>({
    addEmployee: ({id, name, groupId}) => dispatch({ type:A.ADD_EMP, payload:{id,name,groupId} }),
    setGroupOrder: (groupId, order) => dispatch({ type:A.SET_GRP_ORDER, payload:{groupId,order} }),
    upsertAssignment: (p) => dispatch({ type:A.UPSERT_ASG, payload:p }),
    resetAll: () => dispatch({ type:A.RESET }),
  }),[]);
  return React.createElement(
    StateCtx.Provider, { value: state },
    React.createElement(ActionsCtx.Provider, { value: actions }, children)
  );
}

// Hooks / Selektorji
export function useActions(){ return useContext(ActionsCtx) }
export function useEmployees(){
  const { employees, groups } = useContext(StateCtx);
  const sortedGroups = useMemo(()=> groups.slice().sort((a,b)=>a.order-b.order), [groups]);
  const grouped = useMemo(()=>{
    const byGroup = new Map(sortedGroups.map(g=>[g.id, []]));
    for(const e of employees){ if(!byGroup.has(e.groupId)) byGroup.set(e.groupId, []); byGroup.get(e.groupId).push(e); }
    for(const [gid, arr] of byGroup.entries()){ arr.sort((a,b)=>a.name.localeCompare(b.name)) }
    return { groups: sortedGroups, byGroup };
  }, [employees, sortedGroups]);
  return { employees, groups: sortedGroups, grouped };
}
export function useSchedule(){
  const { assignments, employees, groups } = useContext(StateCtx);
  const assignmentsFor = useCallback((date)=> assignments.filter(a=>a.date===date), [assignments]);
  const byGroupForDate = useCallback((date)=>{
    const byEmp = new Map(assignmentsFor(date).map(a=>[a.employeeId, a]));
    const sortedGroups = groups.slice().sort((a,b)=>a.order-b.order);
    return sortedGroups.map(g=>{
      const emps = employees.filter(e=>e.groupId===g.id).sort((a,b)=>a.name.localeCompare(b.name));
      return { group:g, rows: emps.map(e=>({ employee:e, assignment: byEmp.get(e.id)||null })) };
    });
  }, [assignments, employees, groups, assignmentsFor]);
  return { assignments, assignmentsFor, byGroupForDate };
}