import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Shell from "./layout/Shell";
import { getToken } from "./auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import WishesSelf from "./pages/WishesSelf";
import WishesTeam from "./pages/WishesTeam";
import Employees from "./pages/Employees";
import Hierarchy from "./pages/Hierarchy";
import Floorplan from "./pages/Floorplan";
import Chat from "./pages/Chat";
import Announcements from "./pages/Announcements";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AI from "./pages/AI";

function Protected(){
  const token = getToken();
  const loc = useLocation();
  if (!token) return <Navigate to="/prijava" state={{from: loc}} replace />;
  return <Outlet/>;
}
export default function App(){
  return (
    <Routes>
      <Route path="/prijava" element={<Login/>}/>
      <Route element={<Protected/>}>
        <Route element={<Shell/>}>
          <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/schedule" element={<Schedule/>}/>
          <Route path="/wishes/self" element={<WishesSelf/>}/>
          <Route path="/wishes/team" element={<WishesTeam/>}/>
          <Route path="/employees" element={<Employees/>}/>
          <Route path="/hierarchy" element={<Hierarchy/>}/>
          <Route path="/floorplan" element={<Floorplan/>}/>
          <Route path="/chat" element={<Chat/>}/>
          <Route path="/announcements" element={<Announcements/>}/>
          <Route path="/reports" element={<Reports/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/ai" element={<AI/>}/>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
    </Routes>
  );
}
