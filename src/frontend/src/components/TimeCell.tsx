import { useEffect, useMemo, useRef, useState } from "react";
import type { Shift, ShiftCode, WeekId } from "../types";
import { setCell } from "../store/schedule";

function toDisplay(s: Shift): { text: string; badge?: ShiftCode } {
  if (s.kind === "range") return { text: `${s.in} ${s.out}` };
  if (s.kind === "code") return { text: s.code, badge: s.code };
  return { text: "—" };
}

/** Pametni parser:
 * - B/D/X
 * - "8 16" ali z vsakim ne-številski ločilnikom ("8-16", "8_16")
 * - stisnjeno: "1624" -> 16 24; "816" -> 8 16 (poskusi 1+2, nato 2+1)
 */
function parseInput(v: string): Shift | null {
  const t = v.trim();
  if (!t) return { kind: "empty" };
  const up = t.toUpperCase();

  // Kode
  if (["B", "D", "X"].includes(up)) return { kind: "code", code: up as ShiftCode };

  // Števili ločeni z ne-številsko ločnico (presledek, pomišljaj ipd.)
  const mSep = /^(\d{1,2})\D+(\d{1,2})$/.exec(t);
  if (mSep) {
    const a = parseInt(mSep[1], 10), b = parseInt(mSep[2], 10);
    if (a >= 1 && a <= 24 && b >= 1 && b <= 24 && a < b) return { kind: "range", in: a, out: b };
    return null;
  }

  // Stisnjene števke (brez ločil) — npr. 1624 ali 816
  const digitsOnly = t.replace(/\D/g, "");
  if (digitsOnly.length === 4) {
    const a = parseInt(digitsOnly.slice(0, 2), 10);
    const b = parseInt(digitsOnly.slice(2, 4), 10);
    if (a >= 1 && a <= 24 && b >= 1 && b <= 24 && a < b) return { kind: "range", in: a, out: b };
    return null;
  }
  if (digitsOnly.length === 3) {
    // poskusi 1+2
    let a = parseInt(digitsOnly.slice(0, 1), 10);
    let b = parseInt(digitsOnly.slice(1, 3), 10);
    if (a >= 1 && a <= 24 && b >= 1 && b <= 24 && a < b) return { kind: "range", in: a, out: b };
    // poskusi 2+1
    a = parseInt(digitsOnly.slice(0, 2), 10);
    b = parseInt(digitsOnly.slice(2, 3), 10);
    if (a >= 1 && a <= 24 && b >= 1 && b <= 24 && a < b) return { kind: "range", in: a, out: b };
    return null;
  }

  return null;
}

export default function TimeCell({
  weekId, employeeId, dayIndex, value
}:{
  weekId: WeekId; employeeId: string; dayIndex: number; value: Shift;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      const d = toDisplay(value).text;
      setText(d === "—" ? "" : d);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [editing]);

  const disp = useMemo(() => toDisplay(value), [value]);

  function commit(v: string) {
    const parsed = parseInput(v);
    if (parsed === null) { setErr("Neveljavno (npr. '8 16' ali B/D/X)"); return; }
    setErr(null);
    setCell(weekId, employeeId, dayIndex, parsed);
    setEditing(false);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { commit(text); }
    else if (e.key === "Escape") { setEditing(false); setErr(null); }
  }

  function quick(code: ShiftCode) { commit(code); }
  function clear() { commit(""); }

  // širina + brez preloma + monospaced številke
  const base = "inline-flex items-center justify-center rounded-xl px-3 h-9 text-sm border transition whitespace-nowrap font-mono tabular-nums min-w-[64px]";
  const codeCls =
    disp.badge === "B" ? "bg-blue-600 text-white border-blue-600"
    : disp.badge === "D" ? "bg-amber-400 text-slate-900 border-amber-400"
    : disp.badge === "X" ? "bg-slate-500 text-white border-slate-500"
    : "bg-white text-slate-900 border-slate-300";

  if (!editing) {
    return (
      <button
        className={base + " " + codeCls + " hover:border-[color:var(--amber)]"}
        onClick={() => setEditing(true)}
        onKeyDown={(e) => {
          if (e.key.toLowerCase() === "b") quick("B");
          if (e.key.toLowerCase() === "d") quick("D");
          if (e.key.toLowerCase() === "x") quick("X");
          if (e.key === "Backspace" || e.key === "Delete") clear();
        }}
        title="Klikni za urejanje. Tipke: B/D/X, Del za brisanje."
      >
        {disp.text}
      </button>
    );
  }
  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={text}
        onChange={(e)=> setText(e.target.value.toUpperCase())}  // vedno VELIKE črke
        onKeyDown={onKey}
        className={"w-24 min-w-[64px] rounded-xl border px-3 h-9 text-sm outline-none uppercase whitespace-nowrap font-mono tabular-nums " + (err ? "border-red-400 ring-2 ring-red-100" : "border-slate-300 focus:ring-2 focus:ring-[color:var(--amber)]")}
        placeholder="8 16 ali B/D/X"
      />
      <div className="absolute left-[102%] top-0 flex gap-1">
        <button className="rounded-xl px-2 h-9 bg-blue-600 text-white" onClick={()=>quick("B")}>B</button>
        <button className="rounded-xl px-2 h-9 bg-amber-400 text-slate-900" onClick={()=>quick("D")}>D</button>
        <button className="rounded-xl px-2 h-9 bg-slate-500 text-white" onClick={()=>quick("X")}>X</button>
        <button className="rounded-xl px-2 h-9 bg-slate-200" onClick={()=>clear()}>Clear</button>
      </div>
      {err && <div className="absolute top-10 left-0 text-xs text-red-600">{err}</div>}
    </div>
  );
}