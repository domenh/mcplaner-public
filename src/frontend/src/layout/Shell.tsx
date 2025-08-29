import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { clearToken } from "../auth";

export default function Shell(){
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="topbar">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
            <div className="font-semibold">McPlaner</div>
            <button
              onClick={()=>{ clearToken(); nav('/prijava'); }}
              className="text-[color:var(--navy-ink)]/80 hover:underline">
              Odjava
            </button>
          </div>
        </header>
        <main className="app-bg flex-1">
          <div className="mx-auto max-w-7xl p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}