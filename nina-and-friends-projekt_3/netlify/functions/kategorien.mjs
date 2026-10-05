// Liefert die selbst angelegten Kategorien an die App (nur Lesezugriff).
//   GET /api/kategorien

import { getStore } from "@netlify/blobs";

export default async function handler() {
  try {
    const store = getStore({ name: "nina-kategorien", consistency: "strong" });
    const { blobs } = await store.list();
    const alle = (
      await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))
    ).filter(Boolean);
    alle.sort((a, b) => (a.erstellt || 0) - (b.erstellt || 0));

    let versteckt = [];
    try {
      const vs = getStore({ name: "nina-kat-versteckt", consistency: "strong" });
      const res = await vs.list();
      versteckt = res.blobs.map((b) => b.key);
    } catch {
      versteckt = [];
    }

    // Im Admin vergebene Namen und Beschreibungen
    let namen = {};
    let beschreibungen = {};
    try {
      const ns = getStore({ name: "nina-kat-namen", consistency: "strong" });
      const res = await ns.list();
      for (const b of res.blobs) {
        const wert = await ns.get(b.key, { type: "json" });
        if (!wert) continue;
        if (wert.titel) namen[b.key] = wert.titel;
        if (typeof wert.beschreibung === "string")
          beschreibungen[b.key] = wert.beschreibung;
      }
    } catch {
      namen = {};
      beschreibungen = {};
    }

    // Schnellzugriffe der Startseite (null = die eingebauten verwenden)
    let schnellzugriffe = null;
    try {
      const ss = getStore({ name: "nina-schnellzugriffe", consistency: "strong" });
      const liste = await ss.get("liste", { type: "json" });
      if (Array.isArray(liste)) schnellzugriffe = liste;
    } catch {
      schnellzugriffe = null;
    }

    // Selbst festgelegte Reihenfolge
    let reihe = {};
    try {
      const rs = getStore({ name: "nina-kat-reihe", consistency: "strong" });
      const res = await rs.list();
      for (const b of res.blobs) {
        const wert = await rs.get(b.key, { type: "json" });
        if (wert && typeof wert.pos === "number") reihe[b.key] = wert.pos;
      }
    } catch {
      reihe = {};
    }

    return new Response(
      JSON.stringify({
        kategorien: alle,
        versteckt,
        namen,
        beschreibungen,
        reihe,
        schnellzugriffe,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          // Nicht zwischenspeichern: neue Eintraege sollen sofort sichtbar sein
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ kategorien: [], error: String(err.message || err) }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}

export const config = { path: "/api/kategorien" };
