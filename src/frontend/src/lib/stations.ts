import { useEffect, useState } from "react";

export interface Station {
  id: string;       // npr. "B"
  name: string;     // npr. "Blagajna"
  short?: string;   // npr. "B"
  active: boolean;
}

const KEY = "mc.v1.stations";

export function getStations(): Station[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setStations(list: Station[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("mc:stations"));
}

export function upsertStation(s: Station) {
  const arr = getStations();
  const i = arr.findIndex(x => x.id === s.id);
  if (i >= 0) arr[i] = s; else arr.push(s);
  setStations(arr);
}

export function removeStation(id: string) {
  const arr = getStations().filter(x => x.id !== id);
  setStations(arr);
}

export function useStations() {
  const [stations, setState] = useState<Station[]>(getStations());
  useEffect(() => {
    const update = () => setState(getStations());
    const onCustom = () => update();
    window.addEventListener("storage", update);
    window.addEventListener("mc:stations", onCustom as any);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("mc:stations", onCustom as any);
    };
  }, []);
  return {
    stations,
    setAll: setStations,
    upsert: upsertStation,
    remove: removeStation,
  };
}
