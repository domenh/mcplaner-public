import { Navigate, Outlet, useLocation } from "react-router-dom";
export default function RequireAuth(){
  const loc = useLocation();
  const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
  if(!token) return <Navigate to="/prijava" replace state={{ from: loc }} />;
  return <Outlet/>;
}