import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker fuer Installierbarkeit / Home-Bildschirm registrieren
if ("serviceWorker" in navigator) {
  // Wenn eine neue Version aktiv wird, App einmal automatisch neu laden,
  // damit alle sofort den aktuellen Stand sehen (kein manuelles Neuladen noetig).
  let neuGeladen = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (neuGeladen) return;
    neuGeladen = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Regelmaessig auf eine neue Version pruefen
        reg.update();
        window.setInterval(() => reg.update(), 60 * 60 * 1000);
      })
      .catch(() => {
        // Registrierung fehlgeschlagen - App funktioniert trotzdem normal
      });
  });
}
