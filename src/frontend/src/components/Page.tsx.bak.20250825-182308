import React from "react";

type PageProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Minimalni "Page" wrapper za konsistentno vizualnost (navy/cream/amber).
 * - Brez zunanjih odvisnosti
 * - Uporabi ga katerikoli page: <Page title="...">...</Page>
 */
export default function Page({ title, subtitle, actions, children }: PageProps) {
  return (
    <div className="p-6">
      {/* Glava strani */}
      <div className="mb-5">
        <div className="mb-1 text-[11px] uppercase tracking-widest text-amber-700/80">
          McPlaner
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* Vsebina */}
      <div className="max-w-[1200px]">{children}</div>
    </div>
  );
}