import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  sl: {
    translation: {
      nav: {
        login: "Prijava",
        dashboard: "Nadzorna plošča",
        schedule: "Urnik",
        wishesSelf: "Želje (jaz)",
        wishesTeam: "Želje (ekipa)",
        employees: "Zaposleni",
        hierarchy: "Hierarhija",
        floorplan: "Floorplan",
        chat: "Klepet",
        announcements: "Objave",
        reports: "Poročila",
        settings: "Nastavitve",
        ai: "AI"
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "sl",
  fallbackLng: "sl",
  interpolation: { escapeValue: false }
});

export default i18n;
