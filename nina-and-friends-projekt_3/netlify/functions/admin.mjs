// Admin-Schnittstelle fuer den Seiten-Baukasten.
//
// Speicher: Netlify Blobs (kein Airtable noetig).
// Benoetigte Umgebungsvariablen bei Netlify:
//   ADMIN_PASSWORT   - Passwort fuer den Admin-Bereich
//   ADMIN_GEHEIMNIS  - lange Zeichenfolge zum Signieren der Sitzung

import { getStore } from "@netlify/blobs";

const SITZUNG_STUNDEN = 12;
const enc = new TextEncoder();

function bausteinStore() {
  return getStore({ name: "nina-bausteine", consistency: "strong" });
}
function medienStore() {
  return getStore({ name: "nina-medien", consistency: "strong" });
}
function dateienStore() {
  return getStore({ name: "nina-dateien", consistency: "strong" });
}

// Datei-Datensatz in die Form fuer App/Admin bringen
function dateiAusgabe(r) {
  const istBild = String(r.typ || "").startsWith("image/");
  return {
    id: r.id,
    bereich: r.bereich || "",
    titel: r.titel || r.dateiname,
    dateiname: r.dateiname,
    typ: r.typ,
    groesse: r.groesse || 0,
    erstellt: r.erstellt || 0,
    url: "/api/medien/" + r.medienKey,
    vorschauUrl: r.vorschauKey
      ? "/api/medien/" + r.vorschauKey
      : istBild
      ? "/api/medien/" + r.medienKey
      : "",
    istBild,
  };
}

/* ---------- Anmeldung (HMAC-signierte Sitzung) ---------- */

async function signiere(daten, geheimnis) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(geheimnis),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(daten));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function erstelleToken(geheimnis) {
  const ablauf = Date.now() + SITZUNG_STUNDEN * 3600 * 1000;
  const daten = String(ablauf);
  return daten + "." + (await signiere(daten, geheimnis));
}

async function tokenGueltig(token, geheimnis) {
  if (!token || !geheimnis) return false;
  const teile = String(token).split(".");
  if (teile.length !== 2) return false;
  const [daten, sig] = teile;
  const erwartet = await signiere(daten, geheimnis);
  if (sig !== erwartet) return false;
  return Number(daten) > Date.now();
}

function json(inhalt, status = 200) {
  return new Response(JSON.stringify(inhalt), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/* ---------- Bausteine (in Netlify Blobs) ---------- */

function neuerBaustein(body, id) {
  return {
    id,
    seite: body.seite || "",
    reihenfolge: Number(body.reihenfolge) || 0,
    typ: body.typ || "Text",
    text: body.text || "",
    link: body.link || "",
    knopftext: body.knopftext || "",
    seitentitel: body.seitentitel || "",
    seitentext: body.seitentext || "",
    design: body.design || "",
    bereich: body.bereich || "",
    fuerKunden: body.fuerKunden === true,
    aktiv: body.aktiv !== false,
    medienUrl: "",
    medienName: "",
    medienTyp: "",
  };
}

// Aenderbare Felder aus dem Baukasten uebernehmen (Seite und Medien bleiben erhalten)
function uebernehmen(alt, b) {
  const neu = { ...alt };
  if (b.reihenfolge !== undefined) neu.reihenfolge = Number(b.reihenfolge) || 0;
  if (b.typ !== undefined) neu.typ = b.typ;
  if (b.text !== undefined) neu.text = b.text;
  if (b.link !== undefined) neu.link = b.link;
  if (b.knopftext !== undefined) neu.knopftext = b.knopftext;
  if (b.seitentitel !== undefined) neu.seitentitel = b.seitentitel;
  if (b.seitentext !== undefined) neu.seitentext = b.seitentext;
  if (b.design !== undefined) neu.design = b.design;
  if (b.bereich !== undefined) neu.bereich = b.bereich;
  if (b.fuerKunden !== undefined) neu.fuerKunden = b.fuerKunden === true;
  if (b.aktiv !== undefined) neu.aktiv = b.aktiv !== false;
  return neu;
}

async function alleBausteine() {
  const store = bausteinStore();
  const { blobs } = await store.list();
  const alle = await Promise.all(
    blobs.map((b) => store.get(b.key, { type: "json" }))
  );
  return alle.filter(Boolean);
}

/* ---------- Anfragen ---------- */

export default async function handler(request) {
  const passwort = process.env.ADMIN_PASSWORT;
  const geheimnis = process.env.ADMIN_GEHEIMNIS;

  const url = new URL(request.url);
  const aktion = url.pathname.replace(/^\/api\/admin\/?/, "").replace(/\/$/, "");

  // --- Anmelden ---
  if (aktion === "login") {
    if (request.method !== "POST") return json({ error: "Nur POST" }, 405);
    if (!passwort || !geheimnis) {
      return json(
        { error: "Admin-Bereich ist noch nicht eingerichtet (ADMIN_PASSWORT fehlt)." },
        503
      );
    }
    let koerper = {};
    try {
      koerper = await request.json();
    } catch {
      return json({ error: "Ungueltige Anfrage" }, 400);
    }
    if (!koerper.passwort || koerper.passwort !== passwort) {
      await new Promise((r) => setTimeout(r, 700));
      return json({ error: "Passwort stimmt nicht." }, 401);
    }
    return json({ token: await erstelleToken(geheimnis) });
  }

  // --- Ab hier: Anmeldung noetig ---
  const kopf = request.headers.get("authorization") || "";
  const sitzung = kopf.replace(/^Bearer\s+/i, "");
  if (!(await tokenGueltig(sitzung, geheimnis))) {
    return json({ error: "Nicht angemeldet" }, 401);
  }

  try {
    const store = bausteinStore();

    // --- Alle Seiten auflisten ---
    if (aktion === "seiten" && request.method === "GET") {
      const alle = await alleBausteine();
      const namen = new Map();
      for (const b of alle) {
        if (!b.seite) continue;
        const v = namen.get(b.seite) || { name: b.seite, anzahl: 0, titel: "", bereich: "" };
        v.anzahl += 1;
        if (b.seitentitel) v.titel = b.seitentitel;
        if (b.bereich) v.bereich = b.bereich;
        namen.set(b.seite, v);
      }
      return json({ seiten: [...namen.values()] });
    }

    // --- Bausteine einer Seite ---
    if (aktion === "bausteine" && request.method === "GET") {
      const seite = url.searchParams.get("seite") || "";
      const alle = await alleBausteine();
      const bausteine = alle
        .filter((b) => b.seite === seite)
        .sort((a, b) => a.reihenfolge - b.reihenfolge);
      return json({ bausteine });
    }

    // --- Baustein anlegen ---
    if (aktion === "bausteine" && request.method === "POST") {
      const body = await request.json();
      const id = crypto.randomUUID();
      const baustein = neuerBaustein(body, id);
      await store.setJSON(id, baustein);
      return json({ baustein });
    }

    // --- Baustein(e) aendern ---
    if (aktion === "bausteine" && request.method === "PATCH") {
      const body = await request.json();
      const liste = Array.isArray(body.bausteine) ? body.bausteine : [body];
      const ergebnis = [];
      for (const b of liste) {
        if (!b.id) continue;
        const alt = await store.get(b.id, { type: "json" });
        if (!alt) continue;
        const neu = uebernehmen(alt, b);
        await store.setJSON(b.id, neu);
        ergebnis.push(neu);
      }
      return json({ bausteine: ergebnis });
    }

    // --- Baustein loeschen (samt Medien) ---
    if (aktion === "bausteine" && request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "id fehlt" }, 400);
      await store.delete(id);
      try {
        await medienStore().delete(id);
      } catch {
        // kein Medium vorhanden - egal
      }
      return json({ ok: true });
    }

    // --- Bild oder Datei hochladen ---
    if (aktion === "upload" && request.method === "POST") {
      const body = await request.json();
      if (!body.id || !body.datei || !body.dateiname) {
        return json({ error: "id, datei und dateiname noetig" }, 400);
      }
      const alt = await store.get(body.id, { type: "json" });
      if (!alt) return json({ error: "Baustein nicht gefunden" }, 404);

      const bytes = Buffer.from(body.datei, "base64");
      if (bytes.length > 5 * 1024 * 1024) {
        return json({ error: "Die Datei ist zu gross. Erlaubt sind hoechstens 5 MB." }, 413);
      }
      const typ = body.typ || "application/octet-stream";
      await medienStore().set(body.id, bytes, {
        metadata: { contentType: typ, filename: body.dateiname },
      });

      alt.medienUrl = "/api/medien/" + body.id;
      alt.medienName = body.dateiname;
      alt.medienTyp = typ;
      await store.setJSON(body.id, alt);

      return json({ ok: true });
    }

    // --- Dateien pro Kategorie: auflisten ---
    if (aktion === "dateien" && request.method === "GET") {
      const ds = dateienStore();
      const { blobs } = await ds.list();
      const alle = (
        await Promise.all(blobs.map((b) => ds.get(b.key, { type: "json" })))
      ).filter(Boolean);
      alle.sort((a, b) => (b.erstellt || 0) - (a.erstellt || 0));
      return json({ dateien: alle.map(dateiAusgabe) });
    }

    // --- Datei hochladen (in eine Kategorie) ---
    if (aktion === "dateien" && request.method === "POST") {
      const body = await request.json();
      if (!body.datei || !body.dateiname) {
        return json({ error: "datei und dateiname noetig" }, 400);
      }
      const bytes = Buffer.from(body.datei, "base64");
      if (bytes.length > 5 * 1024 * 1024) {
        return json({ error: "Die Datei ist zu gross. Erlaubt sind hoechstens 5 MB." }, 413);
      }
      const id = crypto.randomUUID();
      const typ = body.typ || "application/octet-stream";
      const ms = medienStore();
      const medienKey = "d_" + id;
      await ms.set(medienKey, bytes, {
        metadata: { contentType: typ, filename: body.dateiname },
      });

      let vorschauKey = "";
      if (body.vorschau) {
        const vbytes = Buffer.from(body.vorschau, "base64");
        if (vbytes.length <= 5 * 1024 * 1024) {
          vorschauKey = "dv_" + id;
          await ms.set(vorschauKey, vbytes, {
            metadata: { contentType: body.vorschauTyp || "image/jpeg", filename: "vorschau" },
          });
        }
      }

      const rec = {
        id,
        bereich: body.bereich || "",
        titel: body.titel || body.dateiname,
        dateiname: body.dateiname,
        typ,
        groesse: bytes.length,
        erstellt: Date.now(),
        medienKey,
        vorschauKey,
      };
      await dateienStore().setJSON(id, rec);
      return json({ datei: dateiAusgabe(rec) });
    }

    // --- Datei loeschen ---
    if (aktion === "dateien" && request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "id fehlt" }, 400);
      const ds = dateienStore();
      const rec = await ds.get(id, { type: "json" });
      await ds.delete(id);
      if (rec) {
        const ms = medienStore();
        try {
          await ms.delete(rec.medienKey);
        } catch {
          // egal
        }
        if (rec.vorschauKey) {
          try {
            await ms.delete(rec.vorschauKey);
          } catch {
            // egal
          }
        }
      }
      return json({ ok: true });
    }

    return json({ error: "Unbekannte Aktion" }, 404);
  } catch (err) {
    return json({ error: String(err.message || err) }, 500);
  }
}

export const config = { path: "/api/admin/*" };
