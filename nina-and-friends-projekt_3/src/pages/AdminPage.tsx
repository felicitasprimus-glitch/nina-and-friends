import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Heading,
  Image as ImageIcon,
  Loader2,
  Lock,
  LogOut,
  Minus,
  MousePointerClick,
  Plus,
  Save,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { alleKategorien, getCategory } from "../data/content";

/* ---------- Typen ---------- */

type Bausteintyp =
  | "Text"
  | "Ueberschrift"
  | "Bild"
  | "Video"
  | "Datei"
  | "Knopf"
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

      {baustein.typ !== "Trenner" ? (
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

      {baustein.typ === "Bild" || baustein.typ === "Datei" || baustein.typ === "Video" ? (
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
              ? "Datei ersetzen"
              : baustein.typ === "Bild"
              ? "Bild hochladen"
              : "Datei hochladen"}
            <input
              type="file"
              onChange={dateiWaehlen}
              accept={baustein.typ === "Bild" ? "image/*" : undefined}
              className="hidden"
            />
          </label>
        </div>
      ) : null}

      <p className="mt-2 text-[11.5px] leading-snug text-ink-mute">{info.hilfe}</p>
    </div>
  );
}

/* ---------- Baukasten ---------- */

const DESIGNS = [
  { id: "creme", name: "K\u00FCche & Creme", bg: "#FBF9F5", akzent: "#948A7C", serif: true },
  { id: "klar", name: "Klar & Modern", bg: "#FFFFFF", akzent: "#3C7A5A", serif: false },
  { id: "fest", name: "Fest & Gold", bg: "#FBF7F1", akzent: "#7A2E3A", serif: true },
  { id: "blush", name: "Warm & Verspielt", bg: "#F6F1EC", akzent: "#8B5E73", serif: true },
];

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
          className="mb-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-taupe-500 text-[15px] font-medium text-offwhite transition hover:bg-taupe-600"
        >
          <Plus className="h-[18px] w-[18px]" />
          Neue Seite anlegen
        </button>

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
                    {getCategory(s.bereich)?.title || "Ohne Kategorie"}
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
      <button
        type="button"
        onClick={() => {
          setSeite(null);
          setBausteine([]);
        }}
        className="mb-4 text-[13.5px] font-medium text-taupe-600 transition hover:text-taupe-700"
      >
        &larr; Alle Seiten
      </button>

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
        <div className="mb-3 grid grid-cols-2 gap-2">
          {DESIGNS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDesign(d.id)}
              className={
                "flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition " +
                (design === d.id
                  ? "border-taupe-500 ring-1 ring-taupe-400"
                  : "border-greige-200 hover:bg-greige-100")
              }
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-greige-200"
                style={{ background: d.bg }}
              >
                <span
                  className="text-[15px] leading-none"
                  style={{
                    color: d.akzent,
                    fontFamily: d.serif ? "Georgia, serif" : "system-ui, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Aa
                </span>
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-ink">
                  {d.name}
                </span>
                {design === d.id ? (
                  <span className="block text-[11px] text-taupe-600">{"Ausgew\u00E4hlt"}</span>
                ) : null}
              </span>
            </button>
          ))}
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
          {alleKategorien.map((k) => (
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
  const [dateien, setDateien] = useState<DateiInfo[]>([]);
  const [laedt, setLaedt] = useState(true);
  const [bereich, setBereich] = useState("");
  const [titel, setTitel] = useState("");
  const [datei, setDatei] = useState<File | null>(null);
  const [vorschau, setVorschau] = useState<File | null>(null);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");

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

  const hochladen = async () => {
    setFehler("");
    if (!datei) {
      setFehler("Bitte zuerst eine Datei waehlen.");
      return;
    }
    if (datei.size > 5 * 1024 * 1024) {
      setFehler("Die Datei ist zu gross. Erlaubt sind hoechstens 5 MB.");
      return;
    }
    setLaeuft(true);
    try {
      const base64 = await dateiZuBase64(datei);
      let vorschauB64: string | undefined;
      let vorschauTyp: string | undefined;
      if (vorschau) {
        vorschauB64 = await dateiZuBase64(vorschau);
        vorschauTyp = vorschau.type;
      }
      await api("dateien", {
        method: "POST",
        body: JSON.stringify({
          bereich,
          titel: titel.trim(),
          datei: base64,
          dateiname: datei.name,
          typ: datei.type,
          vorschau: vorschauB64,
          vorschauTyp,
        }),
      });
      setTitel("");
      setDatei(null);
      setVorschau(null);
      await laden();
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Upload fehlgeschlagen.");
    } finally {
      setLaeuft(false);
    }
  };

  const loeschen = async (id: string) => {
    if (!window.confirm("Diese Datei wirklich loeschen?")) return;
    setFehler("");
    try {
      await api("dateien?id=" + encodeURIComponent(id), { method: "DELETE" });
      setDateien((liste) => liste.filter((d) => d.id !== id));
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Loeschen fehlgeschlagen.");
    }
  };

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
          Neue Datei hochladen
        </h2>
        <p className="mb-4 text-[12.5px] text-ink-mute">
          {"Erscheint direkt in der gew\u00E4hlten Kategorie \u2013 mit Vorschau."}
        </p>

        <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
          Kategorie
        </label>
        <select
          value={bereich}
          onChange={(e) => setBereich(e.target.value)}
          className="mb-3 h-11 w-full rounded-md border border-greige-200 bg-offwhite px-3 text-[14.5px] outline-none focus:border-taupe-400"
        >
          <option value="">Keine Kategorie</option>
          {alleKategorien.map((k) => (
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

        <label className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
          Datei (PDF, Bild u. a., max. 5 MB)
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
          {"Vorschaubild (optional \u2013 f\u00FCr PDFs sch\u00F6n)"}
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

        {fehler ? (
          <p className="mb-3 rounded-md border border-greige-200 bg-offwhite px-3 py-2 text-[13px] text-ink-soft">
            {fehler}
          </p>
        ) : null}

        <button
          type="button"
          onClick={hochladen}
          disabled={laeuft || !datei}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-taupe-500 text-[15px] font-medium text-offwhite transition hover:bg-taupe-600 disabled:opacity-50"
        >
          {laeuft ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <Upload className="h-[18px] w-[18px]" />
          )}
          Hochladen
        </button>
      </div>

      <h2 className="mb-3 text-[15px] font-semibold text-ink">
        Hochgeladene Dateien
      </h2>
      {laedt ? (
        <div className="flex items-center justify-center gap-2 py-8 text-ink-mute">
          <Loader2 className="h-5 w-5 animate-spin" />
          Wird geladen ...
        </div>
      ) : dateien.length === 0 ? (
        <div className="rounded-xl border border-dashed border-greige-300 px-6 py-10 text-center text-[13.5px] text-ink-mute">
          Noch keine Dateien hochgeladen.
        </div>
      ) : (
        <div className="space-y-2.5">
          {dateien.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 rounded-xl border border-greige-200 bg-white p-3"
            >
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-greige-100 text-taupe-600"
              >
                {d.vorschauUrl ? (
                  <img
                    src={d.vorschauUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </a>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-ink">
                  {d.titel}
                </span>
                <span className="block truncate text-[12px] text-ink-mute">
                  {getCategory(d.bereich)?.title || "Ohne Kategorie"}
                  {" \u00B7 "}
                  {groesseText(d.groesse)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => loeschen(d.id)}
                aria-label="Datei loeschen"
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

  const [reiter, setReiter] = useState<"seiten" | "dateien">("seiten");

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
      </div>
      {reiter === "seiten" ? (
        <Baukasten token={token} abmelden={abmelden} />
      ) : (
        <DateiVerwaltung token={token} abmelden={abmelden} />
      )}
    </div>
  );
}
