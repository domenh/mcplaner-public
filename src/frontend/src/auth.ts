export type Token = { jwt: string; role: "Admin" | "Manager" | "Assistant" | "Crew" | "Trainer"; userId?: string };

const KEY = "jwt";
function storage() { return (window.localStorage ?? window.sessionStorage); }

export function getToken(): Token | null {
  try { const raw = storage().getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function clearToken() {
  try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch {}
}
export async function login(username: string, password: string, remember = true): Promise<Token> {
  try {
    const res = await fetch("/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    if (!res.ok) throw new Error("AUTH_FALLBACK");
    const data = await res.json();
    const token: Token = { jwt: data.token, role: data.role, userId: data.userId };
    (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(token));
    return token;
  } catch {
    // DEV FALLBACK: admin/1234 → Admin
    if (username === "admin" && password === "1234") {
      const token: Token = { jwt: "dev-token", role: "Admin", userId: "admin" };
      (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(token));
      return token;
    }
    throw new Error("Neuspešna prijava");
  }
}
