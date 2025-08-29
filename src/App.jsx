import React from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";

function Sidebar() {
  const link = ({ isActive }) => "nav-link" + (isActive ? " active" : "");
  return (
    <aside className="sidebar">
      <div className="brand">MCPLANER</div>
      <nav className="nav">
        <NavLink to="/dashboard" className={link}>Nadzorna plošča</NavLink>
        <NavLink to="/schedule" className={link}>Urnik</NavLink>
        <NavLink to="/wishes/self" className={link}>Moje želje</NavLink>
        <NavLink to="/wishes/team" className={link}>Želje ekipe</NavLink>
        <NavLink to="/employees" className={link}>Zaposleni</NavLink>
        <NavLink to="/hierarchy" className={link}>Hierarhija</NavLink>
        <NavLink to="/floorplan" className={link}>Tloris</NavLink>
        <NavLink to="/chat" className={link}>Klepet</NavLink>
        <NavLink to="/announcements" className={link}>Obvestila</NavLink>
        <NavLink to="/reports" className={link}>Poročila</NavLink>
        <NavLink to="/settings" className={link}>Nastavitve</NavLink>
        <NavLink to="/ai" className={link}>AI pomočnik</NavLink>
        <NavLink to="/prijava" className={link}>Prijava</NavLink>
      </nav>
    </aside>
  );
}

function Page({ title, children }) {
  return (
    <div className="content">
      <h1>{title}</h1>
      <div className="card mt-4">
        <div className="card-body">{children}</div>
      </div>
    </div>
  );
}

function Dashboard(){ return <Page title="Nadzorna plošča">Dobrodošli na nadzorni plošči.</Page>; }

function Login(){
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="card w-full max-w-md">
        <div className="card-body">
          <h1 className="text-2xl mb-4">McPlaner</h1>
          <p className="muted mb-4">Prijava</p>
          <form className="space-y-3">
            <input type="text" placeholder="E-pošta ali uporabnik" className="w-full rounded-md border border-slate-300 px-3 py-2"/>
            <input type="password" placeholder="Geslo" className="w-full rounded-md border border-slate-300 px-3 py-2"/>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-slate-300"/> Zapomni si me</label>
            <button type="button" className="btn w-full">Prijava</button>
            <div className="text-right"><a href="#" className="text-sm">Pozabljeno geslo?</a></div>
          </form>
          <p className="muted text-sm mt-4">Dev namig: admin / 1234</p>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/prijava" element={<Login/>} />
          <Route path="*" element={<Page title="404">Stran ne obstaja.</Page>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}