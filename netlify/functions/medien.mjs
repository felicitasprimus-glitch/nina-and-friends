// Liefert hochgeladene Bilder/Dateien aus dem Netlify-Speicher aus.
//   GET /api/medien/<id>

import { getStore } from "@netlify/blobs";

export default async function handler(request) {
  const url = new URL(request.url);
  const key = decodeURIComponent(url.pathname.replace(/^\/api\/medien\//, ""));
  if (!key) return new Response("Nicht gefunden", { status: 404 });

  const store = getStore({ name: "nina-medien", consistency: "strong" });
  const res = await store.getWithMetadata(key, { type: "arrayBuffer" });
  if (!res || !res.data) return new Response("Nicht gefunden", { status: 404 });

  const contentType =
    (res.metadata && res.metadata.contentType) || "application/octet-stream";

  return new Response(res.data, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export const config = { path: "/api/medien/*" };
