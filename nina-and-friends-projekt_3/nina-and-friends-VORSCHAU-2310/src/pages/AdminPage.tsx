import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Heading,
  Heart,
  Image as ImageIcon,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  Minus,
  MousePointerClick,
  Plus,
  Save,
  Tags,
  Trash2,
  Upload,
  UserRound,
  Video,
} from "lucide-react";
import { useKategorien } from "../hooks/useKategorien";
import { hauptKategorien as eingebauteHaupt } from "../data/content";
import { CategoryIcon, KundenTeilen } from "../components/ui";
import { supabaseAktiv, supabaseUploadSigniert, base64ZuBlob } from "../lib/supabase";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

/* ---------- Typen ---------- */

type Bausteintyp =
  | "Text"
  | "Ueberschrift"
  | "Bild"
  | "Video"
  | "Datei"
  | "Knopf"
  | "Profil"
  | "Trenner";

interface Baustein {
  id: string;
  seite: string;
  reihenfolge: number;
  typ: Bausteintyp;
  text: string;
  link: string;
  knopftext: string;
  seitentitel: string;
  seitentext: string;
  design: string;
  aktiv: boolean;
  medienUrl: string;
  medienName: string;
  medienTyp: string;
  bereich: string;
  fuerKunden: boolean;
}

interface SeitenInfo {
  name: string;
  anzahl: number;
  titel: string;
  bereich: string;
}

const TOKEN_KEY = "naf-admin-token";

const typInfo: Record<Bausteintyp, { label: string; icon: typeof FileText; hilfe: string }> = {
  Text: { label: "Text", icon: FileText, hilfe: "Leerzeile = neuer Absatz. Emojis sind erlaubt." },
  Ueberschrift: { label: "Ueberschrift", icon: Heading, hilfe: "Kurze, kraeftige Zwischenueberschrift." },
  Bild: { label: "Bild", icon: ImageIcon, hilfe: "Bild hochladen. Der Text wird zur Bildunterschrift." },
  Video: { label: "Video", icon: Video, hilfe: "YouTube- oder Vimeo-Link einfuegen - wird direkt abspielbar." },
  Datei: { label: "Datei / PDF", icon: FileText, hilfe: "PDF hochladen. Erscheint als Knopf zum Herunterladen." },
  Knopf: { label: "Knopf", icon: MousePointerClick, hilfe: "Zum Beispiel Bestell-Link oder WhatsApp." },
  Profil: { label: "Profil-Karte", icon: UserRound, hilfe: "Foto, Name, Rolle und Knoepfe (WhatsApp, Instagram, Shop ...)." },
  Trenner: { label: "Trennlinie", icon: Minus, hilfe: "Feine Linie zwischen zwei Abschnitten." },
};

function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .replace(/\u00E4/g, "ae")
    .replace(/\u00F6/g, "oe")
    .replace(/\u00FC/g, "ue")
    .replace(/\u00DF/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ---------- API ---------- */

function useApi(token: string | null, abmelden: () => void) {
  return useCallback(
    async (pfad: string, optionen: RequestInit = {}) => {
      const res = await fetch("/api/admin/" + pfad, {
        ...optionen,
        headers: {
          ...(optionen.headers || {}),
          ...(token ? { Authorization: "Bearer " + token } : {}),
          ...(optionen.body ? { "Content-Type": "application/json" } : {}),
        },
      });
      if (res.status === 401) {
        abmelden();
        throw new Error("Sitzung abgelaufen - bitte neu anmelden.");
      }
      const daten = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(daten.error || "Es ist ein Fehler aufgetreten.");
      return daten;
    },
    [token, abmelden]
  );
}

/* ---------- Anmeldung ---------- */

function Anmeldung({ onToken }: { onToken: (t: string) => void }) {
  const [passwort, setPasswort] = useState("");
  const [zeigen, setZeigen] = useState(false);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState("");

  const anmelden = async () => {
    setLaedt(true);
    setFehler("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwort }),
      });
      const daten = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(daten.error || "Anmeldung fehlgeschlagen.");
      onToken(daten.token);
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Anmeldung fehlgeschlagen.");
    } finally {
      setLaedt(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-offwhite px-4">
      <div className="w-full max-w-sm rounded-xl border border-greige-200 bg-white p-7 shadow-soft">
        <div className="mb-5 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-greige-100 text-taupe-600">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="serif text-[26px] font-semibold text-ink">Admin-Bereich</h1>
          <p className="text-[13px] text-ink-mute">
            Nur fuer die Seiten-Pflege von Nina and Friends.
          </p>
        </div>

        <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
          Passwort
        </label>
        <div className="relative">
          <input
            type={zeigen ? "text" : "password"}
            value={passwort}
            onChange={(e) => setPasswort(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") anmelden();
            }}
            autoFocus
            className="h-12 w-full rounded-lg border border-greige-200 bg-offwhite pl-4 pr-11 text-[15px] outline-none transition focus:border-taupe-400 focus:ring-2 focus:ring-taupe-400/25"
          />
          <button
            type="button"
            onClick={() => setZeigen((z) => !z)}
            aria-label={zeigen ? "Passwort verbergen" : "Passwort anzeigen"}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-ink-mute transition hover:bg-greige-100"
          >
            {zeigen ? <EyeOff className="h-4.5 w-4.5 h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>

        {fehler ? (
          <p className="mt-3 rounded-lg bg-greige-100 px-3 py-2 text-[13px] text-ink-soft">
            {fehler}
          </p>
        ) : null}

        <button
          type="button"
          onClick={anmelden}
          disabled={laedt || !passwort}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-taupe-500 text-[15px] font-medium text-offwhite transition hover:bg-taupe-600 disabled:opacity-50"
        >
          {laedt ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : null}
          Anmelden
        </button>
      </div>
    </div>
  );
}

/* ---------- Baustein bearbeiten ---------- */

const PROFIL_DESIGNS = [
  { id: "warm", name: "Warm", bg: "#FBF9F5", akzent: "#948A7C" },
  { id: "elegant", name: "Elegant", bg: "#FBF7F1", akzent: "#7A2E3A" },
  { id: "klar", name: "Klar", bg: "#FFFFFF", akzent: "#3C7A5A" },
  { id: "blush", name: "Verspielt", bg: "#F6F1EC", akzent: "#8B5E73" },
];

const PROFIL_FELDER = [
  { key: "whatsapp", label: "WhatsApp-Nummer (z. B. 491701234567)" },
  { key: "instagram", label: "Instagram (Benutzername ohne @)" },
  { key: "shop", label: "Shop-Link (https://...)" },
  { key: "email", label: "E-Mail" },
  { key: "telefon", label: "Telefon" },
  { key: "website", label: "Website (https://...)" },
];

function profilLesen(text: string): Record<string, string> {
  try {
    const o = JSON.parse(text);
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

function ProfilFelder({
  baustein,
  onAendern,
}: {
  baustein: Baustein;
  onAendern: (aenderung: Partial<Baustein>) => void;
}) {
  const daten = profilLesen(baustein.text);
  const design = daten.design || "warm";
  const setzen = (key: string, wert: string) => {
    onAendern({ text: JSON.stringify({ ...daten, [key]: wert }) });
  };

  return (
    <div className="mt-2 space-y-3">
      <input
        value={daten.name || ""}
        onChange={(e) => setzen("name", e.target.value)}
        placeholder="Name"
        className="h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[14px] outline-none focus:border-taupe-400"
      />
      <input
        value={daten.rolle || ""}
        onChange={(e) => setzen("rolle", e.target.value)}
        placeholder="Rolle, z. B. Pampered Chef Beraterin"
        className="h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[14px] outline-none focus:border-taupe-400"
      />

      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-ink-soft">
          Design
        </label>
        <div className="grid grid-cols-4 gap-2">
          {PROFIL_DESIGNS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setzen("design", d.id)}
              className={
                "flex flex-col items-center gap-1 rounded-lg border p-2 transition " +
                (design === d.id
                  ? "border-taupe-500 ring-1 ring-taupe-400"
                  : "border-greige-200 hover:bg-greige-100")
              }
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full border border-greige-200"
                style={{ background: d.bg }}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ background: d.akzent }}
                />
              </span>
              <span className="text-[11px] text-ink-soft">{d.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[12px] font-medium text-ink-soft">
          {"Kn\u00F6pfe (leere Felder werden nicht angezeigt)"}
        </p>
        {PROFIL_FELDER.map((f) => (
          <input
            key={f.key}
            value={daten[f.key] || ""}
            onChange={(e) => setzen(f.key, e.target.value)}
            placeholder={f.label}
            className="h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[14px] outline-none focus:border-taupe-400"
          />
        ))}
      </div>
    </div>
  );
}

function BausteinKarte({
  baustein,
  onAendern,
  onLoeschen,
  onHoch,
  onRunter,
  onUpload,
  istErster,
  istLetzter,
}: {
  baustein: Baustein;
  onAendern: (aenderung: Partial<Baustein>) => void;
  onLoeschen: () => void;
  onHoch: () => void;
  onRunter: () => void;
  onUpload: (datei: File) => Promise<void>;
  istErster: boolean;
  istLetzter: boolean;
}) {
  const [laedtHoch, setLaedtHoch] = useState(false);
  const info = typInfo[baustein.typ] || typInfo.Text;
  const Icon = info.icon;

  const dateiWaehlen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const datei = e.target.files?.[0];
    if (!datei) return;
    setLaedtHoch(true);
    try {
      await onUpload(datei);
    } finally {
      setLaedtHoch(false);
      e.target.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-greige-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-greige-100 text-taupe-600">
          <Icon className="h-4 w-4" />
        </span>
        <select
          value={baustein.typ}
          onChange={(e) => onAendern({ typ: e.target.value as Bausteintyp })}
          className="h-9 flex-1 rounded-md border border-greige-200 bg-offwhite px-2 text-[13.5px] outline-none focus:border-taupe-400"
        >
          {Object.entries(typInfo).map(([wert, i]) => (
            <option key={wert} value={wert}>
              {i.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onHoch}
          disabled={istErster}
          aria-label="Nach oben"
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink-mute transition hover:bg-greige-100 disabled:opacity-30"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRunter}
          disabled={istLetzter}
          aria-label="Nach unten"
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink-mute transition hover:bg-greige-100 disabled:opacity-30"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onLoeschen}
          aria-label="Loeschen"
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink-mute transition hover:bg-greige-100 hover:text-ink"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {baustein.typ !== "Trenner" && baustein.typ !== "Profil" ? (
        <textarea
          value={baustein.text}
          onChange={(e) => onAendern({ text: e.target.value })}
          rows={baustein.typ === "Text" ? 5 : 2}
          placeholder={
            baustein.typ === "Bild"
              ? "Bildunterschrift (optional)"
              : baustein.typ === "Ueberschrift"
              ? "Ueberschrift"
              : "Text"
          }
          className="w-full resize-y rounded-md border border-greige-200 bg-offwhite p-3 text-[14px] leading-relaxed outline-none transition focus:border-taupe-400"
        />
      ) : null}

      {baustein.typ === "Video" || baustein.typ === "Knopf" ? (
        <input
          type="url"
          value={baustein.link}
          onChange={(e) => onAendern({ link: e.target.value })}
          placeholder={
            baustein.typ === "Video"
              ? "https://youtu.be/..."
              : "https://... (Ziel des Knopfes)"
          }
          className="mt-2 h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[14px] outline-none focus:border-taupe-400"
        />
      ) : null}

      {baustein.typ === "Knopf" ? (
        <input
          type="text"
          value={baustein.knopftext}
          onChange={(e) => onAendern({ knopftext: e.target.value })}
          placeholder="Beschriftung, z. B. Jetzt bestellen"
          className="mt-2 h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[14px] outline-none focus:border-taupe-400"
        />
      ) : null}

      {baustein.typ === "Bild" ||
      baustein.typ === "Datei" ||
      baustein.typ === "Video" ||
      baustein.typ === "Profil" ? (
        <div className="mt-2">
          {baustein.medienUrl ? (
            <div className="mb-2 flex items-center gap-3 rounded-md border border-greige-200 bg-offwhite p-2">
              {baustein.medienTyp.startsWith("image/") ? (
                <img
                  src={baustein.medienUrl}
                  alt=""
                  className="h-14 w-14 rounded object-cover"
                />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded bg-greige-100 text-taupe-600">
                  <FileText className="h-5 w-5" />
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft">
                {baustein.medienName}
              </span>
            </div>
          ) : null}
          <label className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-greige-300 bg-offwhite text-[13.5px] font-medium text-ink-soft transition hover:border-taupe-400">
            {laedtHoch ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {laedtHoch
              ? "Wird hochgeladen ..."
              : baustein.medienUrl
              ? baustein.typ === "Profil"
                ? "Foto ersetzen"
                : "Datei ersetzen"
              : baustein.typ === "Bild"
              ? "Bild hochladen"
              : baustein.typ === "Profil"
              ? "Foto hochladen"
              : "Datei hochladen"}
            <input
              type="file"
              onChange={dateiWaehlen}
              accept={
                baustein.typ === "Bild" || baustein.typ === "Profil"
                  ? "image/*"
                  : undefined
              }
              className="hidden"
            />
          </label>
        </div>
      ) : null}

      {baustein.typ === "Profil" ? (
        <ProfilFelder baustein={baustein} onAendern={onAendern} />
      ) : null}

      <p className="mt-2 text-[11.5px] leading-snug text-ink-mute">{info.hilfe}</p>
    </div>
  );
}

/* ---------- Baukasten ---------- */

const DESIGNS = [
  { id: "creme", name: "K\u00FCche & Creme", bg: "#FBF9F5", ink: "#2E2B26", muted: "#5C564E", akzent: "#948A7C", akzentInk: "#F8F6F2", radius: 12, font: "'Cormorant Garamond',Georgia,serif" },
  { id: "klar", name: "Klar & Modern", bg: "#FFFFFF", ink: "#1B1B1A", muted: "#55524C", akzent: "#3C7A5A", akzentInk: "#FFFFFF", radius: 8, font: "'Outfit',system-ui,sans-serif" },
  { id: "fest", name: "Fest & Gold", bg: "#FBF7F1", ink: "#34252A", muted: "#6E5A5E", akzent: "#7A2E3A", akzentInk: "#FBF7F1", radius: 4, font: "'Playfair Display',Georgia,serif" },
  { id: "blush", name: "Warm & Verspielt", bg: "#F6F1EC", ink: "#3D3229", muted: "#6B5B4E", akzent: "#8B5E73", akzentInk: "#FBF7F4", radius: 18, font: "'Fraunces',Georgia,serif" },
];

const VORLAGEN_KATEGORIEN = [
  { id: "alle", label: "Alle Vorlagen" },
  { id: "kochevents", label: "Kochevents" },
  { id: "backevents", label: "Backevents" },
  { id: "verkostungen", label: "Verkostungen" },
  { id: "specials", label: "Specials" },
];

const VORLAGE_PALETTE: Record<
  string,
  { g1: string; g2: string; badge: string; knopf: string }
> = {
  blush: { g1: "#EFD9E1", g2: "#DCBBC9", badge: "#9A6F82", knopf: "#8B5E73" },
  warm: { g1: "#EEE1CD", g2: "#E0CBA6", badge: "#A88C63", knopf: "#8A7350" },
  klar: { g1: "#DCE9DF", g2: "#C4DBCA", badge: "#4F8468", knopf: "#3C7A5A" },
  fest: { g1: "#ECD4D9", g2: "#D9B2BB", badge: "#9C5560", knopf: "#7A2E3A" },
};

const VORLAGEN = [
  { id: "kochevent", kategorie: "kochevents", design: "blush", emoji: "\uD83C\uDF7D\uFE0F", name: "Kochevent mit Freunden", haupt: "Kochevent", akzent: "mit Freunden", badge: "Gemeinsam genie\u00DFen", untertitel: "Gemeinsam genie\u00DFen", beschreibung: "Ein Abend voller Genuss, guter Gespr\u00E4che und leckerer Rezepte.", dauer: "ca. 3 Stunden" },
  { id: "backevent", kategorie: "backevents", design: "warm", emoji: "\uD83C\uDF5E", name: "Backevent", haupt: "Backevent", akzent: "Sauerteig & mehr", badge: "", untertitel: "Sauerteig & mehr", beschreibung: "Lerne, backe und genie\u00DFe gemeinsam mit anderen Backbegeisterten.", dauer: "ca. 4 Stunden" },
  { id: "celebrate", kategorie: "specials", design: "fest", emoji: "\uD83E\uDD42", name: "Let\u2019s celebrate!", haupt: "Let\u2019s", akzent: "celebrate!", badge: "", untertitel: "Besondere Momente", beschreibung: "Ein besonderer Anlass verdient besondere Momente.", dauer: "ca. 3 Stunden" },
  { id: "verkostung", kategorie: "verkostungen", design: "klar", emoji: "\uD83C\uDF77", name: "Verkostung & Entdecken", haupt: "Verkostung", akzent: "& Entdecken", badge: "", untertitel: "Probieren & staunen", beschreibung: "Probieren, staunen und neue Lieblingsprodukte finden.", dauer: "ca. 2 Stunden" },
  { id: "brunch", kategorie: "kochevents", design: "warm", emoji: "\uD83E\uDD50", name: "Brunch mit Freunden", haupt: "Brunch", akzent: "mit Freunden", badge: "", untertitel: "Entspannter Vormittag", beschreibung: "Leckere Rezepte f\u00FCr einen entspannten Vormittag.", dauer: "ca. 3 Stunden" },
  { id: "kreativkueche", kategorie: "kochevents", design: "klar", emoji: "\uD83C\uDF3F", name: "Kreativk\u00FCche", haupt: "Kreativk\u00FCche", akzent: "Gew\u00FCrze & mehr", badge: "", untertitel: "Neue Aromen entdecken", beschreibung: "Entdecke neue Aromen und kreiere deine eigenen Lieblingsrezepte.", dauer: "ca. 3 Stunden" },
  { id: "special", kategorie: "specials", design: "fest", emoji: "\uD83C\uDF81", name: "Special nur f\u00FCr dich", haupt: "Special", akzent: "nur f\u00FCr dich", badge: "F\u00DCR DICH", untertitel: "Nur f\u00FCr dich", beschreibung: "Ein exklusives Event mit besonderen Highlights und \u00DCberraschungen.", dauer: "ca. 2-3 Stunden" },
  { id: "produkt", kategorie: "verkostungen", design: "blush", emoji: "\u2728", name: "Produkt-Highlight", haupt: "Produkt-Highlight", akzent: "Live erleben", badge: "PRODUKT-HIGHLIGHT", untertitel: "Live erleben", beschreibung: "Erlebe unsere Produkte live und lass dich begeistern.", dauer: "ca. 2 Stunden" },
];

function VorschauBaustein({
  b,
  d,
}: {
  b: Baustein;
  d: (typeof DESIGNS)[number];
}) {
  const typ = (b.typ || "Text").toLowerCase();

  if (typ === "ueberschrift") {
    return b.text ? (
      <div style={{ color: d.ink, fontFamily: d.font, fontWeight: 600, fontSize: 20, marginTop: 12, lineHeight: 1.2 }}>
        {b.text}
      </div>
    ) : null;
  }
  if (typ === "trenner") {
    return <div style={{ borderTop: "1px solid rgba(0,0,0,.1)", margin: "14px 0" }} />;
  }
  if (typ === "bild") {
    return b.medienUrl ? (
      <img src={b.medienUrl} alt="" style={{ width: "100%", borderRadius: 12, display: "block", marginTop: 10 }} />
    ) : null;
  }
  if (typ === "video") {
    return (
      <div style={{ marginTop: 10, borderRadius: 12, background: "rgba(0,0,0,.06)", padding: "24px 12px", textAlign: "center", color: d.muted, fontSize: 13 }}>
        {"\u25B6  Video"}
      </div>
    );
  }
  if (typ === "datei") {
    return (
      <div style={{ marginTop: 10, borderRadius: d.radius, border: "1px solid rgba(0,0,0,.12)", padding: "11px 14px", fontSize: 13.5, color: d.ink }}>
        {b.medienName || b.knopftext || "Datei"}
      </div>
    );
  }
  if (typ === "knopf" || typ === "link") {
    return b.knopftext ? (
      <div style={{ marginTop: 12, background: d.akzent, color: d.akzentInk, borderRadius: d.radius, padding: "12px 16px", textAlign: "center", fontWeight: 600, fontSize: 14 }}>
        {b.knopftext}
      </div>
    ) : null;
  }
  if (typ === "profil") {
    const p = profilLesen(b.text);
    const pd = PROFIL_DESIGNS.find((x) => x.id === (p.design || "warm")) || PROFIL_DESIGNS[0];
    const knoepfe = [
      p.whatsapp && "WhatsApp",
      p.instagram && "Instagram",
      p.shop && "Zum Shop",
      p.email && "E-Mail",
      p.telefon && "Anrufen",
      p.website && "Website",
    ].filter(Boolean) as string[];
    return (
      <div style={{ marginTop: 12, background: pd.bg, border: "1px solid rgba(0,0,0,.08)", borderRadius: 16, padding: "20px 16px", textAlign: "center" }}>
        {b.medienUrl ? (
          <img src={b.medienUrl} alt="" style={{ width: 72, height: 72, borderRadius: 999, objectFit: "cover", margin: "0 auto 8px", display: "block" }} />
        ) : null}
        <div style={{ fontFamily: d.font, fontWeight: 600, fontSize: 18, color: "#2E2B26" }}>{p.name || "Name"}</div>
        {p.rolle ? <div style={{ fontSize: 13, color: pd.akzent, marginTop: 2 }}>{p.rolle}</div> : null}
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {knoepfe.map((k, i) => (
            <div key={i} style={{ background: pd.akzent, color: "#fff", borderRadius: 999, padding: "9px 12px", fontSize: 12.5, fontWeight: 600 }}>
              {k}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Text
  if (!b.text) return null;
  return (
    <div style={{ marginTop: 6 }}>
      {b.text.split(/\n{2,}/).map((abs, i) => (
        <p key={i} style={{ color: d.muted, fontSize: 14.5, lineHeight: 1.55, whiteSpace: "pre-line", margin: i > 0 ? "8px 0 0" : "6px 0 0" }}>
          {abs}
        </p>
      ))}
    </div>
  );
}

function SeitenVorschau({
  titel,
  untertitel,
  design,
  bausteine,
}: {
  titel: string;
  untertitel: string;
  design: string;
  bausteine: Baustein[];
}) {
  const d = DESIGNS.find((x) => x.id === design) || DESIGNS[0];
  const sichtbar = bausteine.filter((b) => b.aktiv !== false);
  return (
    <div className="overflow-hidden rounded-2xl border border-greige-200">
      <div style={{ background: d.bg, padding: "24px 20px" }}>
        {titel ? (
          <div style={{ color: d.ink, fontFamily: d.font, fontWeight: 600, fontSize: 26, lineHeight: 1.15, textAlign: "center" }}>
            {titel}
          </div>
        ) : null}
        {untertitel ? (
          <div style={{ color: d.muted, fontSize: 14.5, textAlign: "center", marginTop: 5 }}>
            {untertitel}
          </div>
        ) : null}
        <div>
          {sichtbar.map((b) => (
            <VorschauBaustein key={b.id} b={b} d={d} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Baukasten({ token, abmelden }: { token: string; abmelden: () => void }) {
  const api = useApi(token, abmelden);

  const [seiten, setSeiten] = useState<SeitenInfo[]>([]);
  const [seite, setSeite] = useState<string | null>(null);
  const [bausteine, setBausteine] = useState<Baustein[]>([]);
  const [titel, setTitel] = useState("");
  const [untertitel, setUntertitel] = useState("");
  const [bereich, setBereich] = useState("");
  const [fuerKunden, setFuerKunden] = useState(false);
  const [design, setDesign] = useState("creme");
  const [laedt, setLaedt] = useState(true);
  const [speichert, setSpeichert] = useState(false);
  const [meldung, setMeldung] = useState("");
  const [fehler, setFehler] = useState("");
  const [kopiert, setKopiert] = useState(false);
  const [vorlageFilter, setVorlageFilter] = useState("alle");
  const [vorschauOffen, setVorschauOffen] = useState(true);
  const { alle: kategorien, finde: kategorieFinden } = useKategorien();

  const seitenLaden = useCallback(async () => {
    setLaedt(true);
    setFehler("");
    try {
      const daten = await api("seiten");
      setSeiten(daten.seiten || []);
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Fehler beim Laden.");
    } finally {
      setLaedt(false);
    }
  }, [api]);

  useEffect(() => {
    seitenLaden();
  }, [seitenLaden]);

  const seiteOeffnen = async (name: string) => {
    setLaedt(true);
    setFehler("");
    try {
      const daten = await api("bausteine?seite=" + encodeURIComponent(name));
      const liste: Baustein[] = daten.bausteine || [];
      setBausteine(liste);
      setSeite(name);
      const kopf = liste.find((b) => b.seitentitel);
      setTitel(kopf?.seitentitel || name);
      setUntertitel(kopf?.seitentext || "");
      setDesign(kopf?.design || "creme");
      const meta = liste.find((b) => b.bereich) || liste[0];
      setBereich(meta?.bereich || "");
      setFuerKunden(liste.some((b) => b.fuerKunden));
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Fehler beim Laden.");
    } finally {
      setLaedt(false);
    }
  };

  const neueSeite = async () => {
    const name = window.prompt("Wie soll die neue Seite heissen?");
    if (!name || !name.trim()) return;
    setLaedt(true);
    setFehler("");
    try {
      const daten = await api("bausteine", {
        method: "POST",
        body: JSON.stringify({
          seite: name.trim(),
          reihenfolge: 1,
          typ: "Text",
          text: "",
          seitentitel: name.trim(),
          aktiv: true,
        }),
      });
      setBausteine([daten.baustein]);
      setSeite(name.trim());
      setTitel(name.trim());
      setUntertitel("");
      setDesign("creme");
      setBereich("");
      setFuerKunden(false);
      await seitenLaden();
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Anlegen fehlgeschlagen.");
    } finally {
      setLaedt(false);
    }
  };

  const vorlageWaehlen = async (v: (typeof VORLAGEN)[number]) => {
    const name = window.prompt("Wie soll dein Event heissen?", v.name);
    if (!name || !name.trim()) return;
    setLaedt(true);
    setFehler("");
    try {
      const kopf = await api("bausteine", {
        method: "POST",
        body: JSON.stringify({
          seite: name.trim(),
          reihenfolge: 1,
          typ: "Text",
          text: "",
          seitentitel: name.trim(),
          seitentext: v.untertitel,
          design: v.design,
          fuerKunden: true,
          aktiv: true,
        }),
      });
      const neu: Baustein[] = [kopf.baustein];

      const weitere: Partial<Baustein>[] = [
        { typ: "Text", text: v.beschreibung },
        { typ: "Ueberschrift", text: "Termin & Details" },
        {
          typ: "Text",
          text:
            "\uD83D\uDCC5 Datum: [bitte eintragen]\n\u23F0 Dauer: " +
            v.dauer +
            "\n\uD83D\uDCCD Ort: [bitte eintragen]",
        },
        { typ: "Knopf", text: "", knopftext: "Ich bin dabei", link: "" },
      ];

      let r = 2;
      for (const b of weitere) {
        const res = await api("bausteine", {
          method: "POST",
          body: JSON.stringify({ seite: name.trim(), reihenfolge: r, aktiv: true, ...b }),
        });
        neu.push(res.baustein);
        r += 1;
      }

      setBausteine(neu);
      setSeite(name.trim());
      setTitel(name.trim());
      setUntertitel(v.untertitel);
      setDesign(v.design);
      setBereich("");
      setFuerKunden(true);
      await seitenLaden();
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Anlegen fehlgeschlagen.");
    } finally {
      setLaedt(false);
    }
  };

  const bausteinHinzufuegen = async (typ: Bausteintyp) => {
    if (!seite) return;
    setFehler("");
    try {
      const daten = await api("bausteine", {
        method: "POST",
        body: JSON.stringify({
          seite,
          reihenfolge: bausteine.length + 1,
          typ,
          text: "",
          aktiv: true,
        }),
      });
      setBausteine((b) => [...b, daten.baustein]);
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Hinzufuegen fehlgeschlagen.");
    }
  };

  const aendern = (id: string, aenderung: Partial<Baustein>) => {
    setBausteine((liste) =>
      liste.map((b) => (b.id === id ? { ...b, ...aenderung } : b))
    );
  };

  const verschieben = (index: number, richtung: -1 | 1) => {
    setBausteine((liste) => {
      const neu = [...liste];
      const ziel = index + richtung;
      if (ziel < 0 || ziel >= neu.length) return liste;
      [neu[index], neu[ziel]] = [neu[ziel], neu[index]];
      return neu.map((b, i) => ({ ...b, reihenfolge: i + 1 }));
    });
  };

  const loeschen = async (id: string) => {
    if (!window.confirm("Diesen Baustein wirklich loeschen?")) return;
    setFehler("");
    try {
      await api("bausteine?id=" + encodeURIComponent(id), { method: "DELETE" });
      setBausteine((liste) => liste.filter((b) => b.id !== id));
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Loeschen fehlgeschlagen.");
    }
  };

  const seiteLoeschen = async () => {
    if (!seite) return;
    if (
      !window.confirm(
        "Die ganze Seite wirklich loeschen? Das kann nicht rueckgaengig gemacht werden."
      )
    )
      return;
    setSpeichert(true);
    setFehler("");
    try {
      for (const b of bausteine) {
        if (b.id) {
          await api("bausteine?id=" + encodeURIComponent(b.id), { method: "DELETE" });
        }
      }
      setSeite(null);
      setBausteine([]);
      await seitenLaden();
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Loeschen fehlgeschlagen.");
    } finally {
      setSpeichert(false);
    }
  };

  const hochladen = async (id: string, datei: File) => {
    setFehler("");
    if (datei.size > 5 * 1024 * 1024) {
      setFehler("Die Datei ist zu gross. Erlaubt sind hoechstens 5 MB.");
      return;
    }
    try {
      const base64 = await new Promise<string>((loesen, ablehnen) => {
        const leser = new FileReader();
        leser.onload = () => loesen(String(leser.result).split(",")[1]);
        leser.onerror = () => ablehnen(new Error("Datei konnte nicht gelesen werden."));
        leser.readAsDataURL(datei);
      });
      await api("upload", {
        method: "POST",
        body: JSON.stringify({
          id,
          datei: base64,
          dateiname: datei.name,
          typ: datei.type,
        }),
      });
      // Nach dem Upload die Bausteine neu holen, damit die Adresse stimmt
      const daten = await api("bausteine?seite=" + encodeURIComponent(seite || ""));
      setBausteine(daten.bausteine || []);
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Upload fehlgeschlagen.");
    }
  };

  const speichern = async () => {
    if (!seite) return;
    setSpeichert(true);
    setFehler("");
    setMeldung("");
    try {
      const zuSpeichern = bausteine.map((b, i) => ({
        id: b.id,
        reihenfolge: i + 1,
        typ: b.typ,
        text: b.text,
        link: b.link,
        knopftext: b.knopftext,
        aktiv: b.aktiv,
        // Titel und Untertitel nur beim ersten Baustein
        seitentitel: i === 0 ? titel : "",
        seitentext: i === 0 ? untertitel : "",
        design: i === 0 ? design : "",
        bereich: i === 0 ? bereich : "",
        fuerKunden: i === 0 ? fuerKunden : false,
      }));
      await api("bausteine", {
        method: "PATCH",
        body: JSON.stringify({ bausteine: zuSpeichern }),
      });
      setMeldung("Gespeichert");
      window.setTimeout(() => setMeldung(""), 2500);
      await seitenLaden();
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
    } finally {
      setSpeichert(false);
    }
  };

  const adresse = seite ? window.location.origin + "/s/" + slugify(seite) : "";

  const linkKopieren = async () => {
    try {
      await navigator.clipboard.writeText(adresse);
      setKopiert(true);
      window.setTimeout(() => setKopiert(false), 2000);
    } catch {
      // Zwischenablage nicht verfuegbar
    }
  };

  /* --- Seitenuebersicht --- */
  if (!seite) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="serif text-[30px] font-semibold leading-tight text-ink">
              Kunden-Seiten
            </h1>
            <p className="mt-1 text-[14px] text-ink-mute">
              Seiten zum Verschicken an Kundinnen.
            </p>
          </div>
          <button
            type="button"
            onClick={abmelden}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-greige-200 bg-white px-3 text-[13px] font-medium text-ink-soft transition hover:bg-greige-100"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </div>

        {fehler ? (
          <p className="mb-4 rounded-lg border border-greige-200 bg-white px-4 py-3 text-[13.5px] text-ink-soft">
            {fehler}
          </p>
        ) : null}

        <button
          type="button"
          onClick={neueSeite}
          className="mb-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-taupe-500 text-[15px] font-medium text-offwhite transition hover:bg-taupe-600"
        >
          <Plus className="h-[18px] w-[18px]" />
          Leere Seite anlegen
        </button>

        <div className="mb-7">
          <p className="serif text-center text-[22px] font-semibold leading-tight text-ink">
            {"W\u00E4hle eine Vorlage"}
          </p>
          <p className="mb-4 mt-1 text-center text-[13px] text-ink-mute">
            Gestalte dein Event in wenigen Schritten
          </p>

          <div className="mb-4 flex flex-wrap justify-center gap-1.5">
            {VORLAGEN_KATEGORIEN.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setVorlageFilter(k.id)}
                className={
                  "rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition " +
                  (vorlageFilter === k.id
                    ? "bg-taupe-500 text-offwhite"
                    : "border border-greige-200 bg-white text-ink-soft hover:bg-greige-100")
                }
              >
                {k.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {VORLAGEN.filter(
              (v) => vorlageFilter === "alle" || v.kategorie === vorlageFilter
            ).map((v) => {
              const p = VORLAGE_PALETTE[v.design] || VORLAGE_PALETTE.blush;
              return (
                <div
                  key={v.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-greige-200 bg-white shadow-sm"
                >
                  <div
                    className="relative h-28 overflow-hidden"
                    style={{ background: "linear-gradient(135deg, " + p.g1 + ", " + p.g2 + ")" }}
                  >
                    <span className="pointer-events-none absolute -right-3 -top-4 select-none text-[72px] opacity-25">
                      {v.emoji}
                    </span>
                    {v.badge ? (
                      <span
                        className="absolute bottom-2.5 right-2.5 flex h-14 w-14 items-center justify-center rounded-full px-1 text-center text-[8px] font-semibold uppercase leading-tight tracking-wide text-white"
                        style={{ background: p.badge }}
                      >
                        {v.badge}
                      </span>
                    ) : (
                      <span className="absolute bottom-3 right-3 text-white/70">
                        <Heart className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-2.5">
                    <div className="serif text-[19px] font-semibold leading-none text-ink">
                      {v.haupt}
                    </div>
                    <div
                      className="mt-0.5 text-[20px] leading-tight"
                      style={{ color: p.knopf, fontFamily: "'Dancing Script', cursive" }}
                    >
                      {v.akzent}
                    </div>
                    <p className="mt-2 text-[12px] leading-snug text-ink-mute">
                      {v.beschreibung}
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-ink-mute">
                      <Clock className="h-3.5 w-3.5" />
                      {"Dauer: " + v.dauer}
                    </div>
                    <button
                      type="button"
                      onClick={() => vorlageWaehlen(v)}
                      className="mt-3 h-10 w-full rounded-lg text-[13px] font-medium text-white transition hover:brightness-95"
                      style={{ background: p.knopf }}
                    >
                      {"Diese Vorlage w\u00E4hlen"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {seiten.length > 0 ? (
          <p className="mb-3 text-[13px] font-semibold text-ink-soft">
            Deine Seiten
          </p>
        ) : null}

        {laedt ? (
          <div className="flex items-center justify-center gap-2 py-10 text-ink-mute">
            <Loader2 className="h-5 w-5 animate-spin" />
            Wird geladen ...
          </div>
        ) : seiten.length === 0 ? (
          <div className="rounded-xl border border-dashed border-greige-300 px-6 py-12 text-center">
            <p className="text-[15px] font-semibold text-ink">Noch keine Seite</p>
            <p className="mt-1 text-[13.5px] text-ink-mute">
              Lege oben deine erste Kunden-Seite an.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {seiten.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => seiteOeffnen(s.name)}
                className="flex w-full items-center gap-3 rounded-xl border border-greige-200 bg-white p-4 text-left transition hover:border-taupe-300"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-ink">
                    {s.titel || s.name}
                  </span>
                  <span className="block truncate text-[12.5px] text-ink-mute">
                    {kategorieFinden(s.bereich)?.title || "Ohne Kategorie"}
                    {" \u00B7 "}
                    {s.anzahl} Bausteine
                  </span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-greige-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* --- Baukasten einer Seite --- */
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-32">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setSeite(null);
            setBausteine([]);
          }}
          className="text-[13.5px] font-medium text-taupe-600 transition hover:text-taupe-700"
        >
          &larr; Alle Seiten
        </button>
        <button
          type="button"
          onClick={seiteLoeschen}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-greige-200 bg-white px-3 text-[12.5px] font-medium text-ink-mute transition hover:border-red-300 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          {"Seite l\u00F6schen"}
        </button>
      </div>

      <div className="mb-5 rounded-xl border border-greige-200 bg-white p-4">
        <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
          Titel der Seite
        </label>
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          className="mb-3 h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[15px] outline-none focus:border-taupe-400"
        />
        <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
          Untertitel
        </label>
        <input
          value={untertitel}
          onChange={(e) => setUntertitel(e.target.value)}
          placeholder="Kurzer Satz unter dem Titel"
          className="mb-3 h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[15px] outline-none focus:border-taupe-400"
        />

        <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
          Design-Vorlage
        </label>
        <div className="mb-3 grid grid-cols-2 gap-2.5">
          {DESIGNS.map((d) => {
            const aktiv = design === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDesign(d.id)}
                className={
                  "overflow-hidden rounded-xl border text-left transition " +
                  (aktiv
                    ? "border-taupe-500 ring-2 ring-taupe-400"
                    : "border-greige-200 hover:border-taupe-300")
                }
              >
                <div
                  className="px-3 pb-3.5 pt-4"
                  style={{ background: d.bg, fontFamily: d.font }}
                >
                  <span
                    className="mx-auto mb-2 block h-9 w-9 rounded-full"
                    style={{ background: d.akzent, opacity: 0.9 }}
                  />
                  <div
                    className="text-center leading-tight"
                    style={{ color: d.ink, fontWeight: 600, fontSize: 14 }}
                  >
                    Dein Titel
                  </div>
                  <div
                    className="mb-2.5 text-center"
                    style={{ color: d.muted, fontSize: 9 }}
                  >
                    Kurzer Untertitel
                  </div>
                  <span
                    className="mx-auto flex h-[18px] w-[85%] items-center justify-center"
                    style={{
                      background: d.akzent,
                      color: d.akzentInk,
                      borderRadius: d.radius,
                      fontSize: 8,
                      fontWeight: 600,
                    }}
                  >
                    Knopf
                  </span>
                  <span
                    className="mx-auto mt-1.5 block h-[18px] w-[85%]"
                    style={{
                      background: d.akzent,
                      opacity: 0.75,
                      borderRadius: d.radius,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between gap-1 px-2.5 py-2">
                  <span className="truncate text-[12px] font-medium text-ink">
                    {d.name}
                  </span>
                  {aktiv ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-taupe-600" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
          In welcher Kategorie soll die Seite erscheinen?
        </label>
        <select
          value={bereich}
          onChange={(e) => setBereich(e.target.value)}
          className="h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[14.5px] outline-none focus:border-taupe-400"
        >
          <option value="">Keine Kategorie</option>
          {kategorien.map((k) => (
            <option key={k.slug} value={k.slug}>
              {k.parent ? "\u00A0\u00A0\u00A0\u2014 " : ""}
              {k.title}
            </option>
          ))}
        </select>

        <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-md border border-greige-200 bg-offwhite p-3">
          <input
            type="checkbox"
            checked={fuerKunden}
            onChange={(e) => setFuerKunden(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#948A7C]"
          />
          <span>
            <span className="block text-[13.5px] font-medium text-ink">
              Darf an Kundinnen weitergeleitet werden
            </span>
            <span className="block text-[12px] leading-snug text-ink-mute">
              Zeigt in der App den Knopf zum Weiterleiten.
            </span>
          </span>
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-greige-100 pt-3">
          <a
            href={adresse}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center gap-1.5 rounded-lg border border-taupe-400 bg-white px-3 text-[13px] font-medium text-ink transition hover:bg-greige-100"
          >
            <Eye className="h-4 w-4" />
            Seite ansehen
          </a>
          <button
            type="button"
            onClick={linkKopieren}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-greige-200 bg-white px-3 text-[13px] font-medium text-ink-soft transition hover:bg-greige-100"
          >
            {kopiert ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {kopiert ? "Kopiert" : "Link kopieren"}
          </button>
          <button
            type="button"
            onClick={() =>
              window.open(
                "https://wa.me/?text=" +
                  encodeURIComponent(
                    (untertitel ? untertitel + "\n" : "") + adresse
                  ),
                "_blank",
                "noopener"
              )
            }
            className="flex h-10 items-center gap-1.5 rounded-lg bg-[#25D366] px-3 text-[13px] font-semibold text-white transition hover:brightness-95"
          >
            <MessageCircle className="h-4 w-4" />
            An Kundin (WhatsApp)
          </button>
        </div>
      </div>

      {fehler ? (
        <p className="mb-4 rounded-lg border border-greige-200 bg-white px-4 py-3 text-[13.5px] text-ink-soft">
          {fehler}
        </p>
      ) : null}

      {laedt ? (
        <div className="flex items-center justify-center gap-2 py-10 text-ink-mute">
          <Loader2 className="h-5 w-5 animate-spin" />
          Wird geladen ...
        </div>
      ) : (
        <div className="space-y-3">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft">
              <Eye className="h-4 w-4" />
              Live-Vorschau
            </h3>
            <button
              type="button"
              onClick={() => setVorschauOffen((o) => !o)}
              className="text-[12.5px] font-medium text-taupe-600 transition hover:text-taupe-700"
            >
              {vorschauOffen ? "ausblenden" : "anzeigen"}
            </button>
          </div>
          {vorschauOffen ? (
            <div className="mb-2">
              <SeitenVorschau
                titel={titel}
                untertitel={untertitel}
                design={design}
                bausteine={bausteine}
              />
              <p className="mt-1.5 text-center text-[11px] text-ink-mute">
                {"So sieht deine Seite aus \u2013 sie aktualisiert sich beim Tippen."}
              </p>
            </div>
          ) : null}
          {bausteine.map((b, i) => (
            <BausteinKarte
              key={b.id}
              baustein={b}
              istErster={i === 0}
              istLetzter={i === bausteine.length - 1}
              onAendern={(a) => aendern(b.id, a)}
              onLoeschen={() => loeschen(b.id)}
              onHoch={() => verschieben(i, -1)}
              onRunter={() => verschieben(i, 1)}
              onUpload={(datei) => hochladen(b.id, datei)}
            />
          ))}
        </div>
      )}

      <div className="mt-5">
        <p className="mb-2 text-[12.5px] font-medium text-ink-soft">
          Baustein hinzufuegen
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(typInfo) as Bausteintyp[]).map((typ) => {
            const Icon = typInfo[typ].icon;
            return (
              <button
                key={typ}
                type="button"
                onClick={() => bausteinHinzufuegen(typ)}
                className="flex h-[72px] flex-col items-center justify-center gap-1.5 rounded-lg border border-greige-200 bg-white text-[12px] font-medium text-ink-soft transition hover:border-taupe-300 hover:bg-offwhite"
              >
                <Icon className="h-4.5 w-4.5 h-[18px] w-[18px] text-taupe-600" />
                {typInfo[typ].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Speicherleiste */}
      <div className="fixed inset-x-0 bottom-0 border-t border-greige-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-mute">
            {meldung ? (
              <span className="flex items-center gap-1.5 font-medium text-ink">
                <Check className="h-4 w-4" />
                {meldung}
              </span>
            ) : (
              <>/s/{slugify(seite)}</>
            )}
          </span>
          <button
            type="button"
            onClick={speichern}
            disabled={speichert}
            className="flex h-11 shrink-0 items-center gap-2 rounded-lg bg-taupe-500 px-5 text-[14px] font-medium text-offwhite transition hover:bg-taupe-600 disabled:opacity-50"
          >
            {speichert ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
            ) : (
              <Save className="h-[18px] w-[18px]" />
            )}
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Datei-Verwaltung (Direkt-Uploads pro Kategorie) ---------- */

interface DateiInfo {
  id: string;
  art: string;
  bereich: string;
  titel: string;
  dateiname: string;
  typ: string;
  groesse: number;
  url: string;
  vorschauUrl: string;
  istBild: boolean;
}

function dateiZuBase64(datei: File): Promise<string> {
  return new Promise((loesen, ablehnen) => {
    const leser = new FileReader();
    leser.onload = () => loesen(String(leser.result).split(",")[1]);
    leser.onerror = () => ablehnen(new Error("Datei konnte nicht gelesen werden."));
    leser.readAsDataURL(datei);
  });
}

// Erste Seite eines PDFs zu einem JPEG-Vorschaubild rendern (im Browser).
// Gibt Base64 zurueck oder null, wenn es nicht klappt.
async function pdfVorschauBase64(datei: File): Promise<string | null> {
  try {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    const puffer = await datei.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: puffer }).promise;
    const seite = await doc.getPage(1);
    const basis = seite.getViewport({ scale: 1 });
    const skala = Math.min(2, 900 / basis.width);
    const viewport = seite.getViewport({ scale: skala });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    await seite.render({ canvas, canvasContext: ctx, viewport }).promise;
    const daten = canvas.toDataURL("image/jpeg", 0.82);
    return daten.split(",")[1] || null;
  } catch {
    return null;
  }
}

function istPdf(datei: File): boolean {
  return (
    datei.type === "application/pdf" ||
    datei.name.toLowerCase().endsWith(".pdf")
  );
}

function istVideo(datei: File): boolean {
  return (
    datei.type.startsWith("video/") ||
    /\.(mp4|mov|m4v|webm|ogg|avi|mkv)$/i.test(datei.name)
  );
}

// Aus einem Video ein Standbild (JPEG) als Vorschau erzeugen.
function videoVorschauBase64(datei: File): Promise<string | null> {
  return new Promise((loesen) => {
    try {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      (video as HTMLVideoElement & { playsInline: boolean }).playsInline = true;
      const url = URL.createObjectURL(datei);
      let fertig = false;
      const beenden = (wert: string | null) => {
        if (fertig) return;
        fertig = true;
        try {
          URL.revokeObjectURL(url);
        } catch {
          // egal
        }
        loesen(wert);
      };
      video.onloadeddata = () => {
        try {
          video.currentTime = Math.min(1, (video.duration || 2) / 2);
        } catch {
          beenden(null);
        }
      };
      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          const breite = video.videoWidth || 640;
          const hoehe = video.videoHeight || 360;
          const skala = Math.min(1, 900 / breite);
          canvas.width = Math.round(breite * skala);
          canvas.height = Math.round(hoehe * skala);
          const ctx = canvas.getContext("2d");
          if (!ctx) return beenden(null);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const daten = canvas.toDataURL("image/jpeg", 0.8);
          beenden(daten.split(",")[1] || null);
        } catch {
          beenden(null);
        }
      };
      video.onerror = () => beenden(null);
      window.setTimeout(() => beenden(null), 8000);
      video.src = url;
    } catch {
      loesen(null);
    }
  });
}

function groesseText(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

function DateiVerwaltung({
  token,
  abmelden,
}: {
  token: string;
  abmelden: () => void;
}) {
  const api = useApi(token, abmelden);
  const { alle: kategorien, finde: kategorieFinden } = useKategorien();
  const [dateien, setDateien] = useState<DateiInfo[]>([]);
  const [laedt, setLaedt] = useState(true);
  const [art, setArt] = useState<"datei" | "youtube" | "link">("datei");
  const [bereich, setBereich] = useState("");
  const [titel, setTitel] = useState("");
  const [datei, setDatei] = useState<File | null>(null);
  const [vorschau, setVorschau] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const [filter, setFilter] = useState("");

  const laden = useCallback(async () => {
    setLaedt(true);
    setFehler("");
    try {
      const d = await api("dateien");
      setDateien(d.dateien || []);
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Fehler beim Laden.");
    } finally {
      setLaedt(false);
    }
  }, [api]);

  useEffect(() => {
    laden();
  }, [laden]);

  const zuruecksetzen = () => {
    setTitel("");
    setDatei(null);
    setVorschau(null);
    setYoutubeUrl("");
    setLinkUrl("");
  };

  const hochladen = async () => {
    setFehler("");
    const body: Record<string, unknown> = { art, bereich, titel: titel.trim() };
    try {
      if (art === "datei") {
        if (!datei) {
          setFehler("Bitte zuerst eine Datei waehlen.");
          return;
        }
        setLaeuft(true);
        if (supabaseAktiv()) {
          // Grosse Dateien: signierte URL vom Server holen (umgeht RLS)
          const sig = await api("signed-upload", {
            method: "POST",
            body: JSON.stringify({ dateiname: datei.name }),
          });
          await supabaseUploadSigniert(
            sig.pfad,
            sig.token,
            datei,
            datei.type || "application/octet-stream"
          );
          body.urlExtern = sig.publicUrl;
          body.dateiname = datei.name;
          body.typ = datei.type;
          body.groesse = datei.size;

          // Vorschau (manuell, oder automatisch aus PDF-Seite 1)
          let vorschauBlob: Blob | null = null;
          let vTyp = "image/jpeg";
          let vName = datei.name + "-vorschau.jpg";
          if (vorschau) {
            vorschauBlob = vorschau;
            vTyp = vorschau.type;
            vName = vorschau.name;
          } else if (istPdf(datei)) {
            const b64 = await pdfVorschauBase64(datei);
            if (b64) vorschauBlob = base64ZuBlob(b64, "image/jpeg");
          } else if (istVideo(datei)) {
            const b64 = await videoVorschauBase64(datei);
            if (b64) vorschauBlob = base64ZuBlob(b64, "image/jpeg");
          }
          if (vorschauBlob) {
            const sigV = await api("signed-upload", {
              method: "POST",
              body: JSON.stringify({ dateiname: vName }),
            });
            await supabaseUploadSigniert(sigV.pfad, sigV.token, vorschauBlob, vTyp);
            body.vorschauExtern = sigV.publicUrl;
          }
        } else {
          // Ohne Supabase: max. 5 MB ueber Netlify
          if (datei.size > 5 * 1024 * 1024) {
            setFehler(
              "Datei zu gross (max. 5 MB ohne Supabase). Richte Supabase ein oder nutze YouTube/Link."
            );
            return;
          }
          body.datei = await dateiZuBase64(datei);
          body.dateiname = datei.name;
          body.typ = datei.type;
          if (vorschau) {
            body.vorschau = await dateiZuBase64(vorschau);
            body.vorschauTyp = vorschau.type;
          } else if (istPdf(datei)) {
            const auto = await pdfVorschauBase64(datei);
            if (auto) {
              body.vorschau = auto;
              body.vorschauTyp = "image/jpeg";
            }
          } else if (istVideo(datei)) {
            const auto = await videoVorschauBase64(datei);
            if (auto) {
              body.vorschau = auto;
              body.vorschauTyp = "image/jpeg";
            }
          }
        }
      } else if (art === "youtube") {
        if (!youtubeUrl.trim()) {
          setFehler("Bitte einen YouTube-Link eingeben.");
          return;
        }
        setLaeuft(true);
        body.youtubeUrl = youtubeUrl.trim();
      } else {
        if (!linkUrl.trim()) {
          setFehler("Bitte einen Link eingeben.");
          return;
        }
        setLaeuft(true);
        body.linkUrl = linkUrl.trim();
        if (vorschau) {
          body.vorschau = await dateiZuBase64(vorschau);
          body.vorschauTyp = vorschau.type;
        }
      }
      await api("dateien", { method: "POST", body: JSON.stringify(body) });
      zuruecksetzen();
      await laden();
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Hat nicht geklappt.");
    } finally {
      setLaeuft(false);
    }
  };

  const loeschen = async (id: string) => {
    if (!window.confirm("Diesen Eintrag wirklich loeschen?")) return;
    setFehler("");
    try {
      await api("dateien?id=" + encodeURIComponent(id), { method: "DELETE" });
      setDateien((liste) => liste.filter((d) => d.id !== id));
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Loeschen fehlgeschlagen.");
    }
  };

  const bereicheMitDateien = Array.from(new Set(dateien.map((d) => d.bereich)));
  const gefiltert = filter ? dateien.filter((d) => d.bereich === filter) : dateien;

  const artKnopf = (wert: "datei" | "youtube" | "link", label: string) => (
    <button
      type="button"
      onClick={() => setArt(wert)}
      className={
        "flex h-9 flex-1 items-center justify-center rounded-md text-[13px] font-medium transition " +
        (art === wert
          ? "bg-taupe-500 text-offwhite"
          : "text-ink-soft hover:bg-greige-100")
      }
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="serif text-[22px] font-semibold text-ink">Dateien</h1>
        <button
          type="button"
          onClick={abmelden}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-greige-200 bg-white px-3 text-[13px] font-medium text-ink-soft transition hover:bg-greige-100"
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </button>
      </div>

      <div className="mb-5 rounded-xl border border-greige-200 bg-white p-4">
        <h2 className="mb-1 text-[16px] font-semibold text-ink">
          Neuer Eintrag
        </h2>
        <p className="mb-3 text-[12.5px] text-ink-mute">
          {"Erscheint direkt in der gew\u00E4hlten Kategorie \u2013 mit Vorschau."}
        </p>

        <div className="mb-3 flex gap-1 rounded-lg border border-greige-200 bg-offwhite p-1">
          {artKnopf("datei", "Datei")}
          {artKnopf("youtube", "YouTube")}
          {artKnopf("link", "Link")}
        </div>

        <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
          Kategorie
        </label>
        <select
          value={bereich}
          onChange={(e) => setBereich(e.target.value)}
          className="mb-3 h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[14.5px] outline-none focus:border-taupe-400"
        >
          <option value="">Keine Kategorie</option>
          {kategorien.map((k) => (
            <option key={k.slug} value={k.slug}>
              {k.parent ? "\u00A0\u00A0\u00A0\u2014 " : ""}
              {k.title}
            </option>
          ))}
        </select>

        <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
          Titel (optional)
        </label>
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          placeholder="z. B. Produktfolie Sommer 2026"
          className="mb-3 h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[15px] outline-none focus:border-taupe-400"
        />

        {art === "datei" ? (
          <>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
              {supabaseAktiv()
                ? "Datei (PDF, Bild, Video u. a. \u2013 auch gro\u00DF)"
                : "Datei (PDF, Bild u. a., max. 5 MB)"}
            </label>
            <label className="mb-3 flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-greige-300 bg-offwhite p-3 text-[13.5px] text-ink-soft transition hover:border-taupe-400">
              <Upload className="h-5 w-5 shrink-0 text-taupe-600" />
              <span className="min-w-0 flex-1 truncate">
                {datei ? datei.name : "Datei ausw\u00E4hlen"}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setDatei(e.target.files?.[0] || null)}
              />
            </label>

            <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
              {"Vorschaubild (optional \u2013 bei PDFs automatisch aus Seite 1)"}
            </label>
            <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-greige-300 bg-offwhite p-3 text-[13.5px] text-ink-soft transition hover:border-taupe-400">
              <ImageIcon className="h-5 w-5 shrink-0 text-taupe-600" />
              <span className="min-w-0 flex-1 truncate">
                {vorschau ? vorschau.name : "Bild ausw\u00E4hlen"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setVorschau(e.target.files?.[0] || null)}
              />
            </label>
          </>
        ) : art === "youtube" ? (
          <>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
              YouTube-Link
            </label>
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mb-4 h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[15px] outline-none focus:border-taupe-400"
            />
            <p className="mb-4 -mt-2 text-[12px] text-ink-mute">
              {"Vorschaubild kommt automatisch von YouTube. Ideal f\u00FCr gro\u00DFe Videos."}
            </p>
          </>
        ) : (
          <>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
              Link (z. B. gro\u00DFes PDF, Webseite)
            </label>
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="mb-3 h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[15px] outline-none focus:border-taupe-400"
            />
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
              Vorschaubild (optional)
            </label>
            <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-greige-300 bg-offwhite p-3 text-[13.5px] text-ink-soft transition hover:border-taupe-400">
              <ImageIcon className="h-5 w-5 shrink-0 text-taupe-600" />
              <span className="min-w-0 flex-1 truncate">
                {vorschau ? vorschau.name : "Bild ausw\u00E4hlen"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setVorschau(e.target.files?.[0] || null)}
              />
            </label>
          </>
        )}

        {fehler ? (
          <p className="mb-3 rounded-md border border-greige-200 bg-offwhite px-3 py-2 text-[13px] text-ink-soft">
            {fehler}
          </p>
        ) : null}

        <button
          type="button"
          onClick={hochladen}
          disabled={laeuft}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-taupe-500 text-[15px] font-medium text-offwhite transition hover:bg-taupe-600 disabled:opacity-50"
        >
          {laeuft ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <Plus className="h-[18px] w-[18px]" />
          )}
          {art === "datei" ? "Hochladen" : "Hinzuf\u00FCgen"}
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-ink">{"Eintr\u00E4ge"}</h2>
        {bereicheMitDateien.length > 1 ? (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 max-w-[55%] rounded-md border border-greige-200 bg-white px-2 text-[13px] text-ink-soft outline-none"
          >
            <option value="">Alle Kategorien</option>
            {bereicheMitDateien.map((b) => (
              <option key={b} value={b}>
                {kategorieFinden(b)?.title || "Ohne Kategorie"}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {laedt ? (
        <div className="flex items-center justify-center gap-2 py-8 text-ink-mute">
          <Loader2 className="h-5 w-5 animate-spin" />
          Wird geladen ...
        </div>
      ) : gefiltert.length === 0 ? (
        <div className="rounded-xl border border-dashed border-greige-300 px-6 py-10 text-center text-[13.5px] text-ink-mute">
          {"Noch keine Eintr\u00E4ge."}
        </div>
      ) : (
        <div className="space-y-2.5">
          {gefiltert.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-greige-200 bg-white p-3"
            >
              <div className="flex items-center gap-3">
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-greige-100 text-taupe-600"
                >
                  {d.vorschauUrl ? (
                    <img src={d.vorschauUrl} alt="" className="h-full w-full object-cover" />
                  ) : d.art === "youtube" ? (
                    <Video className="h-5 w-5" />
                  ) : d.art === "link" ? (
                    <ExternalLink className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                  {d.art === "youtube" ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white">
                        <Video className="h-3.5 w-3.5" />
                      </span>
                    </span>
                  ) : null}
                </a>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-ink">
                    {d.titel}
                  </span>
                  <span className="block truncate text-[12px] text-ink-mute">
                    {kategorieFinden(d.bereich)?.title || "Ohne Kategorie"}
                    {" \u00B7 "}
                    {d.art === "youtube"
                      ? "YouTube"
                      : d.art === "link"
                      ? "Link"
                      : groesseText(d.groesse)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => loeschen(d.id)}
                  aria-label="Eintrag loeschen"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-mute transition hover:bg-greige-100 hover:text-ink"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2.5">
                <KundenTeilen
                  url={d.url.startsWith("http") ? d.url : window.location.origin + d.url}
                  title={d.titel}
                  text={d.titel}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Kategorie-Verwaltung ---------- */

const ICON_AUSWAHL = [
  "Sparkles", "Heart", "ShoppingBag", "ChefHat", "BookOpen", "Newspaper",
  "CalendarDays", "Leaf", "Pizza", "GraduationCap", "Megaphone", "Send",
];

interface EigeneKat {
  slug: string;
  title: string;
  icon?: string;
  parent?: string;
}

function KategorieVerwaltung({
  token,
  abmelden,
}: {
  token: string;
  abmelden: () => void;
}) {
  const api = useApi(token, abmelden);
  const { haupt } = useKategorien();
  const [eigene, setEigene] = useState<EigeneKat[]>([]);
  const [versteckt, setVersteckt] = useState<string[]>([]);
  const [laedt, setLaedt] = useState(true);
  const [titel, setTitel] = useState("");
  const [icon, setIcon] = useState("Sparkles");
  const [parent, setParent] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");

  const laden = useCallback(async () => {
    setLaedt(true);
    setFehler("");
    try {
      const d = await api("kategorien");
      setEigene(d.kategorien || []);
      const v = await api("versteckt");
      setVersteckt(v.versteckt || []);
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Fehler beim Laden.");
    } finally {
      setLaedt(false);
    }
  }, [api]);

  useEffect(() => {
    laden();
  }, [laden]);

  const anlegen = async () => {
    if (!titel.trim()) {
      setFehler("Bitte einen Namen eingeben.");
      return;
    }
    setLaeuft(true);
    setFehler("");
    try {
      await api("kategorien", {
        method: "POST",
        body: JSON.stringify({ titel: titel.trim(), icon, parent }),
      });
      setTitel("");
      setParent("");
      await laden();
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Anlegen fehlgeschlagen.");
    } finally {
      setLaeuft(false);
    }
  };

  const loeschen = async (slug: string) => {
    if (
      !window.confirm(
        "Diese Kategorie wirklich loeschen? Eigene Unterkategorien werden mit entfernt."
      )
    )
      return;
    setFehler("");
    try {
      await api("kategorien?slug=" + encodeURIComponent(slug), { method: "DELETE" });
      setEigene((l) => l.filter((k) => k.slug !== slug && k.parent !== slug));
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Loeschen fehlgeschlagen.");
    }
  };

  const umschalten = async (slug: string, ausblenden: boolean) => {
    setFehler("");
    // sofort im UI umschalten
    setVersteckt((l) =>
      ausblenden ? [...l, slug] : l.filter((s) => s !== slug)
    );
    try {
      if (ausblenden) {
        await api("versteckt", {
          method: "POST",
          body: JSON.stringify({ slug }),
        });
      } else {
        await api("versteckt?slug=" + encodeURIComponent(slug), {
          method: "DELETE",
        });
      }
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Hat nicht geklappt.");
      await laden();
    }
  };

  const parentTitel = (slug?: string) =>
    slug ? haupt.find((h) => h.slug === slug)?.title || slug : "";

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="serif text-[22px] font-semibold text-ink">Kategorien</h1>
        <button
          type="button"
          onClick={abmelden}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-greige-200 bg-white px-3 text-[13px] font-medium text-ink-soft transition hover:bg-greige-100"
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </button>
      </div>

      <div className="mb-5 rounded-xl border border-greige-200 bg-white p-4">
        <h2 className="mb-3 text-[16px] font-semibold text-ink">
          Neue Kategorie
        </h2>

        <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
          Name
        </label>
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          placeholder="z. B. Weihnachtsaktionen"
          className="mb-3 h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[15px] outline-none focus:border-taupe-400"
        />

        <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
          Symbol
        </label>
        <div className="mb-3 flex flex-wrap gap-2">
          {ICON_AUSWAHL.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setIcon(name)}
              className={
                "flex h-10 w-10 items-center justify-center rounded-lg border transition " +
                (icon === name
                  ? "border-taupe-500 bg-taupe-50 text-taupe-700 ring-1 ring-taupe-400"
                  : "border-greige-200 text-ink-soft hover:bg-greige-100")
              }
            >
              <CategoryIcon name={name} className="h-5 w-5" />
            </button>
          ))}
        </div>

        <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
          {"Geh\u00F6rt zu"}
        </label>
        <select
          value={parent}
          onChange={(e) => setParent(e.target.value)}
          className="mb-4 h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[14.5px] outline-none focus:border-taupe-400"
        >
          <option value="">Eigene Hauptkategorie</option>
          {haupt.map((h) => (
            <option key={h.slug} value={h.slug}>
              {"Unterkategorie von: " + h.title}
            </option>
          ))}
        </select>

        {fehler ? (
          <p className="mb-3 rounded-md border border-greige-200 bg-offwhite px-3 py-2 text-[13px] text-ink-soft">
            {fehler}
          </p>
        ) : null}

        <button
          type="button"
          onClick={anlegen}
          disabled={laeuft || !titel.trim()}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-taupe-500 text-[15px] font-medium text-offwhite transition hover:bg-taupe-600 disabled:opacity-50"
        >
          {laeuft ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <Plus className="h-[18px] w-[18px]" />
          )}
          Kategorie anlegen
        </button>
      </div>

      <h2 className="mb-2 text-[15px] font-semibold text-ink">
        Eingebaute Kategorien
      </h2>
      <p className="mb-3 text-[12.5px] text-ink-mute">
        {"Diese kannst du ausblenden (dann verschwinden sie \u00FCberall) und jederzeit wieder einblenden."}
      </p>
      <div className="mb-6 space-y-2">
        {eingebauteHaupt.map((k) => {
          const aus = versteckt.includes(k.slug);
          return (
            <div
              key={k.slug}
              className={
                "flex items-center gap-3 rounded-xl border bg-white p-3 " +
                (aus ? "border-greige-200 opacity-60" : "border-greige-200")
              }
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-greige-100 text-taupe-600">
                <CategoryIcon name={k.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">
                {k.title}
              </span>
              <button
                type="button"
                onClick={() => umschalten(k.slug, !aus)}
                className={
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-medium transition " +
                  (aus
                    ? "border-taupe-400 bg-taupe-50 text-taupe-700 hover:bg-taupe-100"
                    : "border-greige-200 text-ink-soft hover:bg-greige-100")
                }
              >
                {aus ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Einblenden
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Ausblenden
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <h2 className="mb-3 text-[15px] font-semibold text-ink">
        Eigene Kategorien
      </h2>
      {laedt ? (
        <div className="flex items-center justify-center gap-2 py-8 text-ink-mute">
          <Loader2 className="h-5 w-5 animate-spin" />
          Wird geladen ...
        </div>
      ) : eigene.length === 0 ? (
        <div className="rounded-xl border border-dashed border-greige-300 px-6 py-10 text-center text-[13.5px] text-ink-mute">
          Noch keine eigenen Kategorien. Die eingebauten Kategorien bleiben
          erhalten und lassen sich nicht loeschen.
        </div>
      ) : (
        <div className="space-y-2.5">
          {eigene.map((k) => (
            <div
              key={k.slug}
              className="flex items-center gap-3 rounded-xl border border-greige-200 bg-white p-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-greige-100 text-taupe-600">
                <CategoryIcon name={k.icon || "Folder"} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-ink">
                  {k.title}
                </span>
                {k.parent ? (
                  <span className="block truncate text-[12px] text-ink-mute">
                    {parentTitel(k.parent)}
                  </span>
                ) : (
                  <span className="block text-[12px] text-ink-mute">Hauptkategorie</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => loeschen(k.slug)}
                aria-label="Kategorie loeschen"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-mute transition hover:bg-greige-100 hover:text-ink"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Einstieg ---------- */

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const merken = (t: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, t);
    } catch {
      // Speicher nicht verfuegbar - Sitzung gilt nur bis zum Neuladen
    }
    setToken(t);
  };

  const abmelden = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // nichts zu tun
    }
    setToken(null);
  }, []);

  const [reiter, setReiter] = useState<"seiten" | "dateien" | "kategorien">(
    "seiten"
  );

  if (!token) return <Anmeldung onToken={merken} />;
  return (
    <div className="min-h-screen bg-offwhite">
      <div className="mx-auto flex max-w-2xl gap-2 px-4 pt-4">
        <button
          type="button"
          onClick={() => setReiter("seiten")}
          className={
            "flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-[14px] font-medium transition " +
            (reiter === "seiten"
              ? "bg-taupe-500 text-offwhite"
              : "border border-greige-200 bg-white text-ink-soft hover:bg-greige-100")
          }
        >
          <ExternalLink className="h-4 w-4" />
          Seiten
        </button>
        <button
          type="button"
          onClick={() => setReiter("dateien")}
          className={
            "flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-[14px] font-medium transition " +
            (reiter === "dateien"
              ? "bg-taupe-500 text-offwhite"
              : "border border-greige-200 bg-white text-ink-soft hover:bg-greige-100")
          }
        >
          <Upload className="h-4 w-4" />
          Dateien
        </button>
        <button
          type="button"
          onClick={() => setReiter("kategorien")}
          className={
            "flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-[14px] font-medium transition " +
            (reiter === "kategorien"
              ? "bg-taupe-500 text-offwhite"
              : "border border-greige-200 bg-white text-ink-soft hover:bg-greige-100")
          }
        >
          <Tags className="h-4 w-4" />
          Kategorien
        </button>
      </div>
      {reiter === "seiten" ? (
        <Baukasten token={token} abmelden={abmelden} />
      ) : reiter === "dateien" ? (
        <DateiVerwaltung token={token} abmelden={abmelden} />
      ) : (
        <KategorieVerwaltung token={token} abmelden={abmelden} />
      )}
    </div>
  );
}
