// Liest die Inhalte aus Airtable.
// Der API-Key bleibt hier auf dem Server und ist im Browser NICHT sichtbar.
//
// Benoetigte Umgebungsvariablen bei Netlify:
//   AIRTABLE_TOKEN    - Personal Access Token aus Airtable
//   AIRTABLE_BASE_ID  - ID der Base (steht in der Airtable-URL, beginnt mit "app")
//   AIRTABLE_TABLE    - optional, Standard: "Inhalte"

const TABLE_DEFAULT = "Inhalte";

// Airtable-Feld -> App-Feld
function mapRecord(rec) {
  const f = rec.fields || {};
  const anhang = Array.isArray(f.Anhang) ? f.Anhang : [];
  const ersterAnhang = anhang.length > 0 ? anhang[0] : null;

  return {
    id: rec.id,
    title: f.Titel || "",
    categorySlug: f.Bereich || "",
    type: (f.Typ || "artikel").toLowerCase(),
    description: f.Beschreibung || "",
    body: f.Inhalt || "",
    date: f.Datum || undefined,
    time: f.Uhrzeit || undefined,
    subtitle: f.Untertitel || undefined,
    visibility: f.Sichtbarkeit || "Alle",
    fileUrl: ersterAnhang ? ersterAnhang.url : undefined,
    fileName: ersterAnhang ? ersterAnhang.filename : undefined,
    linkUrl: f.Link || undefined,
    forCustomers: f.FuerKunden === true,
    shareText: f.Kundentext || undefined,
    show: f.Show || undefined,
    imageUrl:
      ersterAnhang && ersterAnhang.type && ersterAnhang.type.startsWith("image/")
        ? ersterAnhang.url
        : undefined,
  };
}

export default async function handler() {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE || TABLE_DEFAULT;

  // Noch nicht eingerichtet -> App nutzt weiter die Demo-Daten
  if (!token || !baseId) {
    return Response.json(
      { configured: false, items: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const items = [];
    let offset;

    // Airtable liefert max. 100 Datensaetze pro Anfrage -> alle Seiten holen
    do {
      const url = new URL(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`
      );
      url.searchParams.set("pageSize", "100");
      if (offset) url.searchParams.set("offset", offset);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const detail = await res.text();
        return Response.json(
          { configured: true, error: "Airtable: " + res.status, detail, items: [] },
          { status: 502, headers: { "Cache-Control": "no-store" } }
        );
      }

      const data = await res.json();
      for (const rec of data.records || []) {
        const f = rec.fields || {};
        // "Aktiv" leer lassen = sichtbar; nur explizit false blendet aus
        if (f.Aktiv === false) continue;
        if (!f.Titel) continue;
        items.push(mapRecord(rec));
      }
      offset = data.offset;
    } while (offset);

    return Response.json(
      { configured: true, items },
      {
        headers: {
          // 60 Sek. zwischenspeichern - entlastet Airtable, Aenderungen
          // sind trotzdem schnell sichtbar
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    return Response.json(
      { configured: true, error: String(err), items: [] },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
