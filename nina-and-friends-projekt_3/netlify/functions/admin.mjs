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
function kategorienStore() {
  return getStore({ name: "nina-kategorien", consistency: "strong" });
}
function verstecktStore() {
  return getStore({ name: "nina-kat-versteckt", consistency: "strong" });
}
// Eigene Namen, die einen Kategorietitel ueberschreiben (auch bei
// eingebauten Kategorien, die sonst nur im Code stehen).
function namenStore() {
  return getStore({ name: "nina-kat-namen", consistency: "strong" });
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/\u00E4/g, "ae")
    .replace(/\u00F6/g, "oe")
    .replace(/\u00FC/g, "ue")
    .replace(/\u00DF/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Datei-Datensatz in die Form fuer App/Admin bringen
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

// YouTube-Video-ID aus verschiedenen Link-Formaten holen
function youtubeId(link) {
  const s = String(link || "");
  const muster = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const m of muster) {
    const t = s.match(m);
    if (t) return t[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(s.trim())) return s.trim();
  return "";
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

    // --- Signierte Upload-URL fuer Supabase erzeugen (umgeht RLS) ---
    if (aktion === "signed-upload" && request.method === "POST") {
      const SUPA_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const SERVICE = process.env.SUPABASE_SERVICE_KEY;
      if (!SUPA_URL || !SERVICE) {
        return json(
          { error: "Supabase Server-Schluessel fehlt (SUPABASE_SERVICE_KEY in Netlify setzen)." },
          503
        );
      }
      const body = await request.json();
      const name = String(body.dateiname || "datei")
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const bucket = "dateien";
      const pfad =
        "uploads/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "-" + name;

      const res = await fetch(
        SUPA_URL + "/storage/v1/object/upload/sign/" + bucket + "/" + pfad,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + SERVICE,
            "Content-Type": "application/json",
          },
          body: "{}",
        }
      );
      if (!res.ok) {
        const t = await res.text();
        return json({ error: "Supabase " + res.status + ": " + t.slice(0, 200) }, 502);
      }
      const data = await res.json();
      let token = "";
      try {
        token = new URL("http://x" + data.url).searchParams.get("token") || "";
      } catch {
        token = "";
      }
      const publicUrl =
        SUPA_URL + "/storage/v1/object/public/" + bucket + "/" + pfad;
      return json({ pfad, token, publicUrl });
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

    // --- Eintrag anlegen (Datei-Upload, YouTube oder Link) ---
    if (aktion === "dateien" && request.method === "POST") {
      const body = await request.json();
      const art = body.art || "datei";
      const id = crypto.randomUUID();
      const rec = {
        id,
        art,
        bereich: body.bereich || "",
        titel: (body.titel || "").trim(),
        erstellt: Date.now(),
        medienKey: "",
        vorschauKey: "",
        urlExtern: "",
        vorschauExtern: "",
        dateiname: "",
        typ: art,
        groesse: 0,
      };
      const ms = medienStore();

      // optionales Vorschaubild (fuer Datei und Link)
      const vorschauSpeichern = async () => {
        if (!body.vorschau) return;
        const vbytes = Buffer.from(body.vorschau, "base64");
        if (vbytes.length <= 5 * 1024 * 1024) {
          rec.vorschauKey = "dv_" + id;
          await ms.set(rec.vorschauKey, vbytes, {
            metadata: { contentType: body.vorschauTyp || "image/jpeg", filename: "vorschau" },
          });
        }
      };

      if (art === "youtube") {
        const vid = youtubeId(body.youtubeUrl || "");
        if (!vid) return json({ error: "Kein gueltiger YouTube-Link." }, 400);
        rec.urlExtern = "https://www.youtube.com/watch?v=" + vid;
        rec.vorschauExtern = "https://img.youtube.com/vi/" + vid + "/hqdefault.jpg";
        rec.titel = rec.titel || "YouTube-Video";
        rec.typ = "youtube";
      } else if (art === "link") {
        if (!body.linkUrl) return json({ error: "Bitte einen Link angeben." }, 400);
        rec.urlExtern = body.linkUrl;
        rec.titel = rec.titel || body.linkUrl;
        rec.typ = "link";
        await vorschauSpeichern();
      } else {
        // art === "datei"
        if (body.urlExtern) {
          // Datei liegt extern (z. B. Supabase) - nur Metadaten speichern
          rec.urlExtern = body.urlExtern;
          rec.dateiname = body.dateiname || "";
          rec.typ = body.typ || "application/octet-stream";
          rec.groesse = Number(body.groesse) || 0;
          rec.titel = rec.titel || rec.dateiname;
          if (body.vorschauExtern) rec.vorschauExtern = body.vorschauExtern;
          else await vorschauSpeichern();
        } else {
          if (!body.datei || !body.dateiname) {
            return json({ error: "datei und dateiname noetig" }, 400);
          }
          const bytes = Buffer.from(body.datei, "base64");
          if (bytes.length > 5 * 1024 * 1024) {
            return json(
              { error: "Die Datei ist zu gross. Fuer Grosses bitte Supabase, YouTube oder Externer Link nutzen." },
              413
            );
          }
          rec.medienKey = "d_" + id;
          rec.dateiname = body.dateiname;
          rec.typ = body.typ || "application/octet-stream";
          rec.groesse = bytes.length;
          rec.titel = rec.titel || body.dateiname;
          await ms.set(rec.medienKey, bytes, {
            metadata: { contentType: rec.typ, filename: body.dateiname },
          });
          await vorschauSpeichern();
        }
      }

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
        if (rec.medienKey) {
          try {
            await ms.delete(rec.medienKey);
          } catch {
            // egal
          }
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

    // --- Eigene Kategorien: auflisten ---
    if (aktion === "kategorien" && request.method === "GET") {
      const ks = kategorienStore();
      const { blobs } = await ks.list();
      const alle = (
        await Promise.all(blobs.map((b) => ks.get(b.key, { type: "json" })))
      ).filter(Boolean);
      alle.sort((a, b) => (a.erstellt || 0) - (b.erstellt || 0));
      return json({ kategorien: alle });
    }

    // --- Eigene Kategorie anlegen ---
    if (aktion === "kategorien" && request.method === "POST") {
      const body = await request.json();
      const titel = String(body.titel || "").trim();
      if (!titel) return json({ error: "Bitte einen Namen angeben." }, 400);
      let slug = slugify(titel);
      if (!slug) slug = "kategorie";
      const ks = kategorienStore();
      // eindeutigen Slug sicherstellen
      let s = slug;
      let n = 2;
      while (await ks.get(s, { type: "json" })) {
        s = slug + "-" + n;
        n += 1;
      }
      const rec = {
        slug: s,
        title: titel,
        icon: body.icon || "Folder",
        parent: body.parent || "",
        erstellt: Date.now(),
      };
      await ks.setJSON(s, rec);
      return json({ kategorie: rec });
    }

    // --- Eigene Kategorie loeschen ---
    if (aktion === "kategorien" && request.method === "DELETE") {
      const slug = url.searchParams.get("slug");
      if (!slug) return json({ error: "slug fehlt" }, 400);
      const ks = kategorienStore();
      // auch direkte Unterkategorien mitloeschen
      const { blobs } = await ks.list();
      for (const b of blobs) {
        const k = await ks.get(b.key, { type: "json" });
        if (k && (k.slug === slug || k.parent === slug)) {
          await ks.delete(b.key);
        }
      }
      return json({ ok: true });
    }

    // --- Eigene Kategorienamen: auflisten ---
    if (aktion === "kategorienamen" && request.method === "GET") {
      const ns = namenStore();
      const { blobs } = await ns.list();
      const namen = {};
      for (const b of blobs) {
        const wert = await ns.get(b.key, { type: "json" });
        if (wert && wert.titel) namen[b.key] = wert.titel;
      }
      return json({ namen });
    }

    // --- Kategorie umbenennen ---
    if (aktion === "kategorienamen" && request.method === "POST") {
      const body = await request.json();
      const slug = String(body.slug || "").trim();
      const titel = String(body.titel || "").trim();
      if (!slug) return json({ error: "slug fehlt" }, 400);
      if (!titel) return json({ error: "Bitte einen Namen angeben." }, 400);
      if (titel.length > 60)
        return json({ error: "Der Name ist zu lang (max. 60 Zeichen)." }, 400);

      // Eigene Kategorien direkt umbenennen, der Slug bleibt gleich,
      // damit die zugeordneten Dateien erhalten bleiben.
      const ks = kategorienStore();
      const eigene = await ks.get(slug, { type: "json" });
      if (eigene) {
        await ks.setJSON(slug, { ...eigene, title: titel });
      }
      await namenStore().setJSON(slug, { slug, titel });
      return json({ ok: true, slug, titel });
    }

    // --- Umbenennung zuruecknehmen (Originalname gilt wieder) ---
    if (aktion === "kategorienamen" && request.method === "DELETE") {
      const slug = url.searchParams.get("slug");
      if (!slug) return json({ error: "slug fehlt" }, 400);
      await namenStore().delete(slug);
      return json({ ok: true });
    }

    // --- Ausgeblendete (eingebaute) Kategorien: auflisten ---
    if (aktion === "versteckt" && request.method === "GET") {
      const vs = verstecktStore();
      const { blobs } = await vs.list();
      return json({ versteckt: blobs.map((b) => b.key) });
    }

    // --- Eingebaute Kategorie ausblenden ---
    if (aktion === "versteckt" && request.method === "POST") {
      const body = await request.json();
      if (!body.slug) return json({ error: "slug fehlt" }, 400);
      await verstecktStore().set(String(body.slug), "1");
      return json({ ok: true });
    }

    // --- Eingebaute Kategorie wieder einblenden ---
    if (aktion === "versteckt" && request.method === "DELETE") {
      const slug = url.searchParams.get("slug");
      if (!slug) return json({ error: "slug fehlt" }, 400);
      await verstecktStore().delete(slug);
      return json({ ok: true });
    }

    return json({ error: "Unbekannte Aktion" }, 404);
  } catch (err) {
    return json({ error: String(err.message || err) }, 500);
  }
}

export const config = { path: "/api/admin/*" };
