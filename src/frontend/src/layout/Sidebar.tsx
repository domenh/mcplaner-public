import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Heart, Users, Network, Map,
  MessageSquare, Megaphone, BarChart3, Settings, Bot
} from "lucide-react";

const items = [
  { to: "/dashboard", label: "Nadzorna plošča", icon: LayoutDashboard },
  { to: "/schedule",  label: "Urnik",            icon: CalendarDays },
  { to: "/wishes/self", label: "Moje želje",     icon: Heart },
  { to: "/wishes/team", label: "Želje ekipe",    icon: Users },
  { to: "/employees", label: "Zaposleni",        icon: Users },
  { to: "/hierarchy", label: "Hierarhija",       icon: Network },
  { to: "/floorplan", label: "Tloris",           icon: Map },
  { to: "/chat",      label: "Klepet",           icon: MessageSquare },
  { to: "/announcements", label: "Obvestila",    icon: Megaphone },
  { to: "/reports",   label: "Poročila",         icon: BarChart3 },
  { to: "/settings",  label: "Nastavitve",       icon: Settings },
  { to: "/ai",        label: "AI pomočnik",      icon: Bot }
];

export default function Sidebar(){
  return (
    <aside className="w-64 shrink-0 bg-[color:var(--navy)] text-white min-h-screen">
      <div className="px-4 pt-4 pb-2">
        <div className="text-xl font-extrabold tracking-tight">McPlaner</div>
        <div className="h-1.5 w-16 rounded-full mt-2" style={{background:"var(--amber)"}} />
      </div>
      <nav className="px-2 py-2 space-y-1">
        {items.map(({to,label,icon:Icon})=>(
          <NavLink
            key={to}
            to={to}
            className={({isActive}) =>
              "flex items-center gap-3 rounded-xl px-3 py-2 transition " +
              (isActive
                ? "bg-white/15 text-white font-semibold"
                : "text-white/90 hover:bg-white/10 hover:text-white")
            }>
            <Icon size={18}/>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}