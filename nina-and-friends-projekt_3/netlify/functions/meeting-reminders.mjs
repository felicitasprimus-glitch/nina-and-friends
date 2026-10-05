// netlify/functions/meeting-reminders.mjs
//
// Geplante Funktion: schickt automatisch Push-Erinnerungen zu den
// Monatsmeetings. Laeuft stuendlich und prueft, ob ein Termin ansteht.
//
// Zeitplan pro Meeting (Start 20:00 Uhr Berlin):
//   - 1 Tag vorher um 18:00 Uhr  -> "Morgen ist Meeting"
//   - am Tag selbst um 19:00 Uhr -> "In 1 Stunde geht es los"
//
// Speicher: Netlify Blobs. Benoetigte Environment-Variablen:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (z.B. mailto:...)

import webpush from "web-push";
import { getStore } from "@netlify/blobs";

// Fallback, solange im Admin keine Termine gepflegt sind
const MEETINGS_FALLBACK = [
  "2026-01-28", "2026-02-26", "2026-03-30", "2026-04-29", "2026-05-28",
  "2026-06-29", "2026-07-29", "2026-09-28", "2026-10-29", "2026-11-26",
];

// Die im Admin angelegten Termine lesen
async function termineLaden() {
  try {
    const ts = getStore({ name: "nina-termine", consistency: "strong" });
    const { blobs } = await ts.list();
    const alle = (
      await Promise.all(blobs.map((b) => ts.get(b.key, { type: "json" })))
    ).filter(Boolean);
    const gepflegt = alle.filter((t) => t && t.datum && t.erinnern !== false);
    if (gepflegt.length > 0) return gepflegt;
  } catch {
    // nicht erreichbar - dann die feste Liste nehmen
  }
  return MEETINGS_FALLBACK.map((d) => ({
    titel: "Team-Meeting",
    datum: d,
    uhrzeit: "20:00",
  }));
}

function berlinNow() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  let hour = parseInt(parts.hour, 10);
  if (hour === 24) hour = 0;
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour };
}

function dayBefore(dateStr) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function dueReminder(now, termine) {
  for (const t of termine) {
    const start = String(t.uhrzeit || "20:00");
    const startStunde = parseInt(start.slice(0, 2), 10);
    const was = t.titel || "Team-Meeting";

    // Eine Stunde vor Beginn
    if (now.date === t.datum && now.hour === startStunde - 1) {
      return {
        title: "Gleich geht\u2019s los",
        body: "In einer Stunde startet " + was + " um " + start + " Uhr.",
      };
    }
    // Am Vortag um 18 Uhr
    if (now.date === dayBefore(t.datum) && now.hour === 18) {
      return {
        title: was + " morgen",
        body: "Morgen um " + start + " Uhr treffen wir uns \u2013 sei dabei!",
      };
    }
  }
  return null;
}

export default async function handler() {
  const now = berlinNow();
  const termine = await termineLaden();
  const reminder = dueReminder(now, termine);

  if (!reminder) {
    return new Response(JSON.stringify({ sent: 0, reason: "kein Termin faellig" }), { status: 200 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const payload = JSON.stringify({
    title: reminder.title,
    body: reminder.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    url: "/benachrichtigungen",
  });

  const store = getStore({ name: "nina-pushabos", consistency: "strong" });
  const { blobs } = await store.list();

  let sent = 0;
  let removed = 0;

  await Promise.all(
    blobs.map(async ({ key }) => {
      const sub = await store.get(key, { type: "json" });
      if (!sub) return;
      try {
        await webpush.sendNotification(sub, payload);
        sent += 1;
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await store.delete(key);
          removed += 1;
        }
      }
    })
  );

  return new Response(JSON.stringify({ sent, removed }), { status: 200 });
}

export const config = { schedule: "0 * * * *" };
