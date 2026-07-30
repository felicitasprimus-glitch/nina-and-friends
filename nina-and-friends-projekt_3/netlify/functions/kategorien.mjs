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
    return new Response(JSON.stringify({ kategorien: alle }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
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
