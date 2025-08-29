import { Station } from "../lib/stations";

export function StationBadges({ stationIds, stations }:{
  stationIds?: string[];
  stations: Station[];
}) {
  if (!stationIds || stationIds.length===0) return null;
  const map = new Map(stations.map(s => [s.id, s]));
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {stationIds.map(id => {
        const s = map.get(id);
        if (!s) return null;
        const label = s.short || s.id;
        return (
          <span key={id}
            className="inline-flex items-center rounded-lg bg-[color:var(--navy)]/10 text-[color:var(--navy)] px-2 py-0.5 text-[11px] font-medium">
            {label}
          </span>
        );
      })}
    </div>
  );
}
