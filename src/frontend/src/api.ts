import axios from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: false
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("jwt");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export async function login(username: string, password: string) {
  const r = await api.post("/auth/login", { username, password });
  return r.data as { token: string; role: string; username: string };
}
