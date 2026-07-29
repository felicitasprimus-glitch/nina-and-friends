import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Name des oeffentlichen Buckets in Supabase Storage
export const BUCKET = "dateien";

let client: SupabaseClient | null = null;

export function supabaseAktiv(): boolean {
  return Boolean(url && key);
}

function holeClient(): SupabaseClient {
  if (!url || !key) throw new Error("Supabase ist nicht eingerichtet.");
  if (!client) client = createClient(url, key);
  return client;
}

// Dateinamen fuer den Speicherpfad bereinigen (keine Umlaute/Sonderzeichen)
function sicherer(name: string): string {
  return name
    .toLowerCase()
    .replace(/\u00E4/g, "ae")
    .replace(/\u00F6/g, "oe")
    .replace(/\u00FC/g, "ue")
    .replace(/\u00DF/g, "ss")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Datei nach Supabase hochladen, gibt die oeffentliche URL zurueck.
export async function supabaseUpload(
  daten: Blob,
  dateiname: string,
  contentType: string
): Promise<string> {
  const sb = holeClient();
  const pfad =
    "uploads/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "-" + sicherer(dateiname);
  const { error } = await sb.storage.from(BUCKET).upload(pfad, daten, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(error.message);
  const { data } = sb.storage.from(BUCKET).getPublicUrl(pfad);
  return data.publicUrl;
}

// Base64 (ohne Praefix) zu einem Blob machen
export function base64ZuBlob(base64: string, typ: string): Blob {
  const roh = atob(base64);
  const arr = new Uint8Array(roh.length);
  for (let i = 0; i < roh.length; i += 1) arr[i] = roh.charCodeAt(i);
  return new Blob([arr], { type: typ });
}
