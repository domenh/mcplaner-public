import { Navigate } from "react-router-dom";
import { isAuthed } from "../auth";

export default function Protected({children}:{children:JSX.Element}) {
  return isAuthed() ? children : <Navigate to="/prijava" replace />;
}
