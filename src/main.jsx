import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { McPlanerProvider } from "./model/store";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <McPlanerProvider>
      <App />
    </McPlanerProvider>
  </React.StrictMode>
);