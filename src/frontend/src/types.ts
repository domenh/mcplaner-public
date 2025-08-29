export type ShiftCode = "B" | "D" | "X";
export type Shift =
  | { kind: "range"; in: number; out: number }   // ure 1–24, in < out
  | { kind: "code"; code: ShiftCode }            // B/D/X
  | { kind: "empty" };

export interface Employee {
  id: string;
  name: string;
  group: "Crew" | "Manager" | "Trainer" | "Assistant";
  active?: boolean;
}

export interface Station {
  id: string;   // npr. B, K, S, V
  name: string; // Blagajna, Kuhinja, ...
  active?: boolean;
}

export interface WeekDay {
  iso: string;        // 2025-08-24
  labelShort: string; // Pon, Tor ...
  dayNum: number;     // 24
}

export type WeekId = string; // npr. 2025-W34

export interface WeekAssignments {
  weekId: WeekId;
  // employeeId -> dayIndex(0..6) -> Shift
  matrix: Record<string, Record<number, Shift>>;
}