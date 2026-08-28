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

    // Im Admin vergebene Namen, die den Titel ueberschreiben
    let namen = {};
    try {
      const ns = getStore({ name: "nina-kat-namen", consistency: "strong" });
      const res = await ns.list();
      for (const b of res.blobs) {
        const wert = await ns.get(b.key, { type: "json" });
        if (wert && wert.titel) namen[b.key] = wert.titel;
      }
    } catch {
      namen = {};
    }

    return new Response(JSON.stringify({ kategorien: alle, versteckt, namen }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // Nicht zwischenspeichern: neue Eintraege sollen sofort sichtbar sein
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ kategorien: [], error: String(err.message || err) }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}

export const config = { path: "/api/kategorien" };
