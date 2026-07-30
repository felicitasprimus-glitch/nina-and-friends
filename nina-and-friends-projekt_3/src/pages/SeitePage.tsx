import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, ExternalLink } from "lucide-react";
import {
  BackButton,
  CardSkeleton,
  KundenTeilen,
  EmptyState,
} from "../components/ui";

interface Baustein {
  id: string;
  typ: string;
  text: string;
  link: string;
  knopftext: string;
  medienUrl: string;
  medienName: string;
  istBild: boolean;
}

interface SeitenKopf {
  name: string;
  slug: string;
  bereich: string;
  titel: string;
  untertitel: string;
  fuerKunden: boolean;
}

// YouTube / Vimeo erkennen
function einbettung(link: string) {
  if (!link) return null;
  const u = link.trim();
  const yt =
    u.match(/youtube\.com\/watch\?v=([\w-]+)/) ||
    u.match(/youtu\.be\/([\w-]+)/) ||
    u.match(/youtube\.com\/shorts\/([\w-]+)/) ||
    u.match(/youtube\.com\/embed\/([\w-]+)/);
  if (yt) return "https://www.youtube-nocookie.com/embed/" + yt[1];
  const vi = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vi) return "https://player.vimeo.com/video/" + vi[1];
  return null;
}

function BausteinAnzeige({ b }: { b: Baustein }) {
  const typ = (b.typ || "text").toLowerCase();

  if (typ === "ueberschrift" || typ === "\u00FCberschrift") {
    return (
      <h2 className="serif mt-7 text-[24px] font-semibold leading-tight text-ink">
        {b.text}
      </h2>
    );
  }

  if (typ === "trenner") {
    return <hr className="my-7 border-greige-200" />;
  }

  if (typ === "bild") {
    if (!b.medienUrl) return null;
    return (
      <figure className="my-5">
        <img
          src={b.medienUrl}
          alt={b.text || ""}
          loading="lazy"
          className="w-full rounded-xl border border-greige-200"
        />
        {b.text ? (
          <figcaption className="mt-2 text-center text-[12.5px] text-ink-mute">
            {b.text}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (typ === "video") {
    const src = einbettung(b.link);
    return (
      <div className="my-5">
        {b.text ? (
          <p className="mb-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
            {b.text}
          </p>
        ) : null}
        {src ? (
          <div className="relative w-full overflow-hidden rounded-xl border border-greige-200 pt-[56.25%]">
            <iframe
              src={src}
              title="Video"
              loading="lazy"
              allowFullScreen
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        ) : b.medienUrl ? (
          <video
            controls
            playsInline
            preload="metadata"
            className="w-full rounded-xl border border-greige-200"
          >
            <source src={b.medienUrl} />
          </video>
        ) : b.link ? (
          <a
            href={b.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-taupe-500 px-5 text-[14px] font-medium text-offwhite"
          >
            <ExternalLink className="h-[18px] w-[18px]" />
            Video ansehen
          </a>
        ) : null}
      </div>
    );
  }

  if (typ === "datei" || typ === "pdf") {
    const ziel = b.medienUrl || b.link;
    if (!ziel) return null;
    return (
      <div className="my-5">
        {b.text ? (
          <p className="mb-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
            {b.text}
          </p>
        ) : null}
        <a
          href={ziel}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center gap-2 rounded-lg bg-taupe-500 px-5 text-[14px] font-medium text-offwhite transition hover:bg-taupe-600"
        >
          <Download className="h-[18px] w-[18px]" />
          {b.knopftext || b.medienName || "Herunterladen"}
        </a>
      </div>
    );
  }

  if (typ === "knopf" || typ === "link") {
    if (!b.link) return null;
    return (
      <div className="my-5">
        {b.text ? (
          <p className="mb-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
            {b.text}
          </p>
        ) : null}
        <a
          href={b.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center gap-2 rounded-lg bg-taupe-500 px-5 text-[14px] font-medium text-offwhite transition hover:bg-taupe-600"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
          {b.knopftext || "Jetzt ansehen"}
        </a>
      </div>
    );
  }

  if (typ === "profil") {
    let p: Record<string, string> = {};
    try {
      const o = JSON.parse(b.text || "{}");
      if (o && typeof o === "object") p = o;
    } catch {
      p = {};
    }
    const stile: Record<string, {
      karte: string;
      rand: string;
      name: string;
      rolle: string;
      knopfBg: string;
      knopfText: string;
      radius: number;
      knopfRadius: number;
    }> = {
      warm: { karte: "#FBF9F5", rand: "#EAE3D8", name: "#2E2B26", rolle: "#7A6F5C", knopfBg: "#948A7C", knopfText: "#FBF9F5", radius: 18, knopfRadius: 999 },
      elegant: { karte: "#241A1D", rand: "#3A2A2E", name: "#F6EEE2", rolle: "#C9A24B", knopfBg: "#C9A24B", knopfText: "#241A1D", radius: 6, knopfRadius: 6 },
      klar: { karte: "#FFFFFF", rand: "#E7E4DE", name: "#1B1B1A", rolle: "#3C7A5A", knopfBg: "#1B1B1A", knopfText: "#FFFFFF", radius: 14, knopfRadius: 10 },
      blush: { karte: "#F6F1EC", rand: "#E7DDD2", name: "#3D3229", rolle: "#8B5E73", knopfBg: "#8B5E73", knopfText: "#FBF7F4", radius: 24, knopfRadius: 999 },
    };
    const s = stile[p.design] || stile.warm;
    const mitHttp = (u: string) => {
      const x = (u || "").trim();
      if (!x) return "";
      return /^(https?:\/\/|mailto:|tel:)/i.test(x) ? x : "https://" + x;
    };
    const knoepfe: { href: string; label: string }[] = [];
    if (p.whatsapp) {
      const n = p.whatsapp.replace(/[^0-9]/g, "");
      if (n) knoepfe.push({ href: "https://wa.me/" + n, label: "Auf WhatsApp schreiben" });
    }
    if (p.instagram) {
      const h = p.instagram.replace(/^@/, "").trim();
      if (h) knoepfe.push({ href: "https://instagram.com/" + h, label: "Auf Instagram folgen" });
    }
    if (p.shop) knoepfe.push({ href: mitHttp(p.shop), label: "Zum Shop" });
    if (p.email) knoepfe.push({ href: "mailto:" + p.email.trim(), label: "E-Mail schreiben" });
    if (p.telefon) {
      const t = p.telefon.replace(/[^0-9+]/g, "");
      if (t) knoepfe.push({ href: "tel:" + t, label: "Anrufen" });
    }
    if (p.website) knoepfe.push({ href: mitHttp(p.website), label: "Website ansehen" });

    return (
      <div
        className="mx-auto my-6 max-w-[420px] px-6 py-7 text-center"
        style={{ background: s.karte, border: "1px solid " + s.rand, borderRadius: s.radius }}
      >
        {b.medienUrl ? (
          <img
            src={b.medienUrl}
            alt=""
            className="mx-auto mb-3.5 object-cover"
            style={{ width: 104, height: 104, borderRadius: 999, border: "3px solid rgba(255,255,255,.65)" }}
          />
        ) : null}
        <div className="serif text-[24px] font-semibold leading-tight" style={{ color: s.name }}>
          {p.name || ""}
        </div>
        {p.rolle ? (
          <div className="mt-1 text-[14px]" style={{ color: s.rolle }}>
            {p.rolle}
          </div>
        ) : null}
        {knoepfe.length > 0 ? (
          <div className="mt-4 flex flex-col gap-2.5">
            {knoepfe.map((k, i) => (
              <a
                key={i}
                href={k.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-[14.5px] font-semibold no-underline"
                style={{ background: s.knopfBg, color: s.knopfText, borderRadius: s.knopfRadius }}
              >
                {k.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  // Standard: Text
  if (!b.text) return null;
  return (
    <div className="my-4 space-y-3">
      {b.text.split(/\n{2,}/).map((absatz, i) => (
        <p
          key={i}
          className="whitespace-pre-line text-[15.5px] leading-relaxed text-ink-soft"
        >
          {absatz}
        </p>
      ))}
    </div>
  );
}

export default function SeitePage() {
  const { slug = "" } = useParams();
  const [kopf, setKopf] = useState<SeitenKopf | null>(null);
  const [bausteine, setBausteine] = useState<Baustein[]>([]);
  const [laedt, setLaedt] = useState(true);
  const [fehlt, setFehlt] = useState(false);

  useEffect(() => {
    let abgebrochen = false;
    setLaedt(true);
    setFehlt(false);

    fetch("/api/seiten?slug=" + encodeURIComponent(slug))
      .then((r) => r.json())
      .then((daten) => {
        if (abgebrochen) return;
        if (!daten.gefunden) {
          setFehlt(true);
          return;
        }
        setKopf(daten.seite);
        setBausteine(daten.bausteine || []);
      })
      .catch(() => {
        if (!abgebrochen) setFehlt(true);
      })
      .finally(() => {
        if (!abgebrochen) setLaedt(false);
      });

    return () => {
      abgebrochen = true;
    };
  }, [slug]);

  if (laedt) {
    return (
      <div className="space-y-3">
        <BackButton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (fehlt || !kopf) {
    return (
      <div>
        <BackButton />
        <EmptyState
          title="Seite nicht gefunden"
          text="Diese Seite gibt es nicht (mehr) oder sie wurde noch nicht angelegt."
        />
      </div>
    );
  }

  const oeffentlich = window.location.origin + "/s/" + kopf.slug;

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton />

      <header className="mb-6">
        <h1 className="serif text-[30px] font-semibold leading-tight text-ink">
          {kopf.titel}
        </h1>
        {kopf.untertitel ? (
          <p className="mt-2 text-[15px] leading-snug text-ink-soft">
            {kopf.untertitel}
          </p>
        ) : null}
      </header>

      <article>
        {bausteine.map((b) => (
          <BausteinAnzeige key={b.id} b={b} />
        ))}
      </article>

      {kopf.fuerKunden ? (
        <div className="mt-8 space-y-2 rounded-lg border border-greige-200 bg-white p-4">
          <p className="text-[13px] font-semibold text-ink">
            Diese Seite weiterleiten
          </p>
          <p className="text-[12.5px] leading-snug text-ink-mute">
            Deine Kundin bekommt nur diese Seite \u2013 nicht die interne Team-App.
          </p>
          <KundenTeilen
            title={kopf.titel}
            url={oeffentlich}
            text={kopf.untertitel || kopf.titel}
          />
        </div>
      ) : null}
    </div>
  );
}
