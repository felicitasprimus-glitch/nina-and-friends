// Liefert die hochgeladenen Kategorie-Dateien an die App (nur Lesezugriff).
//   GET /api/dateien              -> alle Dateien
//   GET /api/dateien?bereich=xyz  -> Dateien einer Kategorie

import { getStore } from "@netlify/blobs";

function dateiAusgabe(r) {
  const art = r.art || "datei";
  const istBild = art === "datei" && String(r.typ || "").startsWith("image/");
  const url = r.urlExtern ? r.urlExtern : r.medienKey ? "/api/medien/" + r.medienKey : "";
  let vorschauUrl = "";
  if (r.vorschauKey) vorschauUrl = "/api/medien/" + r.vorschauKey;
  else if (r.vorschauExtern) vorschauUrl = r.vorschauExtern;
  else if (istBild) vorschauUrl = url;
  return {
    id: r.id,
    art,
    bereich: r.bereich || "",
    titel: r.titel || r.dateiname || "",
    dateiname: r.dateiname || "",
    typ: r.typ || art,
    groesse: r.groesse || 0,
    erstellt: r.erstellt || 0,
    url,
    vorschauUrl,
    istBild,
  };
}

function json(inhalt, status = 200) {
  return new Response(JSON.stringify(inhalt), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Nicht zwischenspeichern: neue Eintraege sollen sofort sichtbar sein
      "Cache-Control": "no-store",
    },
  });
}

export default async function handler(request) {
  const url = new URL(request.url);
  const bereich = url.searchParams.get("bereich");

  try {
    const store = getStore({ name: "nina-dateien", consistency: "strong" });
    const { blobs } = await store.list();
    let alle = (
      await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))
    ).filter(Boolean);

    if (bereich) alle = alle.filter((r) => r.bereich === bereich);
    alle.sort((a, b) => (b.erstellt || 0) - (a.erstellt || 0));

    return json({ dateien: alle.map(dateiAusgabe) });
  } catch (err) {
    return json({ dateien: [], error: String(err.message || err) }, 200);
  }
}

export const config = { path: "/api/dateien" };
