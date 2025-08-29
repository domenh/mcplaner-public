import { FormEvent, useState } from "react";
import { login } from "../auth";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Login(){
  const [username,setUsername]   = useState("");
  const [password,setPassword]   = useState("");
  const [showPw,setShowPw]       = useState(false);
  const [remember,setRemember]   = useState(true);
  const [loading,setLoading]     = useState(false);
  const [error,setError]         = useState<string|null>(null);

  async function onSubmit(e: FormEvent){
    e.preventDefault();
    setLoading(true); setError(null);
    try{
      await login(username, password, remember);
      window.location.href = "/dashboard";
    }catch(err:any){
      setError(err?.message || "Prijava ni uspela. Preveri podatke in poskusi znova.");
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center login-hero">
      <div className="bg-white login-card w-full p-8 md:p-10">
        {/* Brand header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="h1-brand">
            <span className="underline-amber">McPlaner</span>
          </h1>
          <div className="mt-8 h2-brand">Prijava</div>
          <p className="mt-3 subtle text-lg">Vpiši se v svoj račun McPlaner.</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={onSubmit}>
          {/* Username */}
          <div className="input-wrap">
            <div className="input-icon"><Mail size={20} /></div>
            <input
              className="input-lg"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              placeholder="E-pošta ali uporabniško ime"
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="input-wrap">
            <div className="input-icon"><Lock size={20} /></div>
            <input
              type={showPw ? "text" : "password"}
              className="input-lg"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder="Geslo"
              autoComplete="current-password"
            />
            <div className="input-eye" onClick={()=>setShowPw(v=>!v)} aria-label="toggle password">
              {showPw ? <EyeOff size={20}/> : <Eye size={20}/>}
            </div>
          </div>

          {/* Remember / Forgot */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-base">
              <input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} />
              Zapomni si me
            </label>
            <a className="link-amber text-base" href="#">Pozabljeno geslo?</a>
          </div>

          {/* Error block (hidden until error) */}
          {error && (
            <div className="alert alert-error flex items-start gap-2">
              <AlertCircle className="mt-0.5 shrink-0" size={20}/>
              <div>{error}</div>
            </div>
          )}

          {/* Submit */}
          <button className="btn btn-navy btn-xl" disabled={loading}>
            {loading ? "Prijavljam..." : "Prijava"}
          </button>

          {/* Footers */}
          <div className="text-center text-sm subtle mt-1">Dev namig: admin / 1234</div>
          <div className="text-center text-base mt-1">
            Težave s prijavo? <a className="link-amber" href="#">Kontakt podpora</a>
          </div>
        </form>
      </div>
    </div>
  );
}