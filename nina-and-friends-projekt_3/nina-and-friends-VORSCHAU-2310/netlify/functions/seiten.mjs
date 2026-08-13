// Liefert die Seiten aus dem Baukasten an die App (nur Lesezugriff).
//   GET /api/seiten            -> alle Seiten
//   GET /api/seiten?slug=xyz   -> die Bausteine einer Seite
//
// Speicher: Netlify Blobs.

import { getStore } from "@netlify/blobs";

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

async function alleBausteine() {
  const store = getStore({ name: "nina-bausteine", consistency: "strong" });
  const { blobs } = await store.list();
  const alle = await Promise.all(
    blobs.map((b) => store.get(b.key, { type: "json" }))
  );
  return alle.filter(Boolean);
}

function zuBaustein(b) {
  return {
    id: b.id,
    reihenfolge: b.reihenfolge ?? 0,
    typ: b.typ || "Text",
    text: b.text || "",
    link: b.link || "",
    knopftext: b.knopftext || "",
    medienUrl: b.medienUrl || "",
    medienName: b.medienName || "",
    istBild: b.medienTyp ? String(b.medienTyp).startsWith("image/") : false,
  };
}

function json(inhalt, status = 200, cache = true) {
  return new Response(JSON.stringify(inhalt), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cache
        ? "public, max-age=60, stale-while-revalidate=300"
        : "no-store",
    },
  });
}

export default async function handler(request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  try {
    const alle = (await alleBausteine()).filter((b) => b.aktiv !== false);

    // Bausteine einer einzelnen Seite
    if (slug) {
      const passend = alle
        .filter((b) => b.seite && slugify(b.seite) === slug)
        .sort((a, b) => (a.reihenfolge ?? 9999) - (b.reihenfolge ?? 9999));

      if (passend.length === 0) {
        return json({ configured: true, gefunden: false }, 404, false);
      }

      const kopf = passend.find((b) => b.seitentitel) || passend[0];
      return json({
        configured: true,
        gefunden: true,
        seite: {
          name: passend[0].seite,
          slug,
          bereich: kopf.bereich || "",
          titel: kopf.seitentitel || passend[0].seite,
          untertitel: kopf.seitentext || "",
          fuerKunden: kopf.fuerKunden === true,
        },
        bausteine: passend.map(zuBaustein),
      });
    }

    // Uebersicht aller Seiten
    const seiten = new Map();
    for (const b of alle) {
      if (!b.seite) continue;
      const eintrag = seiten.get(b.seite) || {
        name: b.seite,
        slug: slugify(b.seite),
        bereich: "",
        titel: b.seite,
        untertitel: "",
        fuerKunden: false,
        vorschaubild: "",
        anzahl: 0,
      };
      eintrag.anzahl += 1;
      if (b.bereich) eintrag.bereich = b.bereich;
      if (b.seitentitel) eintrag.titel = b.seitentitel;
      if (b.seitentext) eintrag.untertitel = b.seitentext;
      if (b.fuerKunden === true) eintrag.fuerKunden = true;
      if (!eintrag.vorschaubild && b.medienUrl && String(b.medienTyp).startsWith("image/")) {
        eintrag.vorschaubild = b.medienUrl;
      }
      seiten.set(b.seite, eintrag);
    }

    return json({ configured: true, seiten: [...seiten.values()] });
  } catch (err) {
    return json(
      { configured: true, error: String(err.message || err), seiten: [] },
      500,
      false
    );
  }
}

export const config = { path: "/api/seiten" };
