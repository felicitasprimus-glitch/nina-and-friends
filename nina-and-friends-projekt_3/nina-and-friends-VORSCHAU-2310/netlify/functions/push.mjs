// Nimmt neue Push-Abos entgegen und legt sie im Netlify-Speicher ab.
//   POST /api/push/subscribe   Body: { subscription }

import { getStore } from "@netlify/blobs";

function json(inhalt, status = 200) {
  return new Response(JSON.stringify(inhalt), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function schluessel(endpoint) {
  const daten = new TextEncoder().encode(endpoint);
  const hash = await crypto.subtle.digest("SHA-256", daten);
  return [...new Uint8Array(hash)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export default async function handler(req) {
  if (req.method !== "POST") return json({ error: "Nur POST erlaubt" }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Ungueltiger Koerper" }, 400);
  }

  const sub = body && body.subscription;
  if (!sub || !sub.endpoint) return json({ error: "Kein gueltiges Abo" }, 400);

  const store = getStore({ name: "nina-pushabos", consistency: "strong" });
  const key = await schluessel(sub.endpoint);
  await store.setJSON(key, sub);

  return json({ ok: true });
}

export const config = { path: "/api/push/*" };
