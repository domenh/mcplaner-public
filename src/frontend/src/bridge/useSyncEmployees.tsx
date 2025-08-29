import { useEffect } from "react";
import type { Employee } from "../types";
import { saveEmployees } from "../store/employees";

/** Kliči v komponenti Nastavitve/Zaposleni: useSyncEmployees(employees) */
export function useSyncEmployees(employees: Employee[]) {
  useEffect(() => { if (Array.isArray(employees)) saveEmployees(employees); }, [employees]);
}