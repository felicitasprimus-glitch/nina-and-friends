// Oeffentliche Kunden-Seite, z. B. /s/airfryer-sommer-show
//
// Aufbau: eine durchgehende Seite zum Scrollen.
// Text, Bilder und Videos wechseln sich ab, Videos sind direkt abspielbar.
// Verschickt wird nur der Link - die Vorschau in WhatsApp entsteht automatisch.
//
// Gepflegt wird in der Airtable-Tabelle "Showseiten": jede Zeile ist ein
// Baustein der Seite (Text, Ueberschrift, Bild, Video, Datei oder Knopf).

import { getStore } from "@netlify/blobs";

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function esc(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Erkennt YouTube / Vimeo und liefert die Einbett-Adresse
function embedUrl(link) {
  if (!link) return null;
  const u = String(link).trim();

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

// Einen Baustein in HTML umwandeln
function bausteinHtml(b) {
  const typ = (b.typ || "text").toLowerCase();

  if (typ === "ueberschrift" || typ === "\u00FCberschrift") {
    return `<h2>${esc(b.text)}</h2>`;
  }

  if (typ === "bild") {
    if (!b.medien) return "";
    return `<figure><img src="${esc(b.medien)}" alt="${esc(b.text || "")}" loading="lazy">${
      b.text ? `<figcaption>${esc(b.text)}</figcaption>` : ""
    }</figure>`;
  }

  if (typ === "video") {
    const vorText = b.text ? `<p>${esc(b.text)}</p>` : "";
    const einbetten = embedUrl(b.link);
    if (einbetten) {
      return `${vorText}
      <div class="video"><iframe src="${esc(einbetten)}" title="Video"
        loading="lazy" allowfullscreen
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>`;
    }
    if (b.medien) {
      return `${vorText}
      <video controls playsinline preload="metadata"${
        b.vorschau ? ` poster="${esc(b.vorschau)}"` : ""
      }><source src="${esc(b.medien)}"></video>`;
    }
    if (b.link) {
      return `${vorText}<a class="knopf" href="${esc(
        b.link
      )}" target="_blank" rel="noopener">Video ansehen</a>`;
    }
    return vorText;
  }

  if (typ === "datei" || typ === "pdf") {
    const ziel = b.medien || b.link;
    if (!ziel) return "";
    return `${b.text ? `<p>${esc(b.text)}</p>` : ""}<a class="knopf" href="${esc(
      ziel
    )}" target="_blank" rel="noopener">${esc(
      b.knopftext || b.dateiname || "Herunterladen"
    )}</a>`;
  }

  if (typ === "link" || typ === "knopf") {
    if (!b.link) return "";
    return `${b.text ? `<p>${esc(b.text)}</p>` : ""}<a class="knopf" href="${esc(
      b.link
    )}" target="_blank" rel="noopener">${esc(
      b.knopftext || "Jetzt ansehen"
    )}</a>`;
  }

  if (typ === "trenner") return `<hr>`;

  // Standard: Text. Absaetze und Zeilenumbrueche bleiben erhalten.
  if (!b.text) return "";
  return String(b.text)
    .split(/\n{2,}/)
    .map((absatz) => `<p>${esc(absatz).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

const THEMES = {
  creme: {
    bg: "#FBF9F5", ink: "#2E2B26", muted: "#5C564E", accent: "#948A7C",
    accentInk: "#F8F6F2", rule: "#EAE3D8", radius: "12px",
    display: "'Cormorant Garamond',Georgia,serif", body: "Poppins,system-ui,sans-serif",
    eyebrow: "letter-spacing:.34em;text-transform:uppercase;color:#847A6D",
    headWeight: "600",
    fonts: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Poppins:wght@300;400;500;600&display=swap",
    extra: "",
  },
  klar: {
    bg: "#FFFFFF", ink: "#1B1B1A", muted: "#55524C", accent: "#3C7A5A",
    accentInk: "#FFFFFF", rule: "#E7E4DE", radius: "8px",
    display: "'Outfit',system-ui,sans-serif", body: "'Inter',system-ui,sans-serif",
    eyebrow: "letter-spacing:.2em;text-transform:uppercase;color:#3C7A5A",
    headWeight: "700",
    fonts: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Inter:wght@400;500;600&display=swap",
    extra: "h1{letter-spacing:-.015em}header h1::after{content:'';display:block;width:52px;height:3px;background:var(--accent);margin:16px auto 0;border-radius:2px}h2{letter-spacing:-.01em}",
  },
  fest: {
    bg: "#FBF7F1", ink: "#34252A", muted: "#6E5A5E", accent: "#7A2E3A",
    accentInk: "#FBF7F1", rule: "#E7D9C7", radius: "4px",
    display: "'Playfair Display',Georgia,serif", body: "Poppins,system-ui,sans-serif",
    eyebrow: "letter-spacing:.3em;text-transform:uppercase;color:#B08A3E",
    headWeight: "700",
    fonts: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@300;400;500&display=swap",
    extra: "header{border-bottom-color:#D9BE86}hr{border-top-color:#D9BE86}h2{color:#7A2E3A}footer{border-top-color:#D9BE86}",
  },
  blush: {
    bg: "#F6F1EC", ink: "#3D3229", muted: "#6B5B4E", accent: "#8B5E73",
    accentInk: "#FBF7F4", rule: "#E7DDD2", radius: "18px",
    display: "'Fraunces',Georgia,serif", body: "'Outfit',system-ui,sans-serif",
    eyebrow: "letter-spacing:.22em;text-transform:uppercase;color:#8B5E73",
    headWeight: "600",
    fonts: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Outfit:wght@300;400;500&display=swap",
    extra: ".knopf{border-radius:999px}",
  },
};

function seiteHtml({ titel, beschreibung, vorschaubild, bausteine, url, design }) {
  const t = THEMES[design] || THEMES.creme;
  const inhalt = bausteine.map(bausteinHtml).join("\n");

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(beschreibung)}">
<meta name="theme-color" content="${t.bg}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(titel)}">
<meta property="og:description" content="${esc(beschreibung)}">
<meta property="og:url" content="${esc(url)}">
${vorschaubild ? `<meta property="og:image" content="${esc(vorschaubild)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(titel)}">
<meta name="twitter:description" content="${esc(beschreibung)}">
${vorschaubild ? `<meta name="twitter:image" content="${esc(vorschaubild)}">` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${t.fonts}" rel="stylesheet">
<style>
  :root{
    --bg:${t.bg};--ink:${t.ink};--muted:${t.muted};--accent:${t.accent};
    --accentInk:${t.accentInk};--rule:${t.rule};--radius:${t.radius};
    --display:${t.display};--body:${t.body};
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:var(--body);color:var(--ink);background:var(--bg);
    line-height:1.6;-webkit-font-smoothing:antialiased}
  .huelle{max-width:620px;margin:0 auto;padding:26px 18px 64px}

  header{text-align:center;padding-bottom:26px;margin-bottom:26px;
    border-bottom:1px solid var(--rule)}
  .marke{font-family:var(--display);font-size:12px;${t.eyebrow}}
  h1{font-family:var(--display);font-size:38px;font-weight:${t.headWeight};
    line-height:1.08;margin:14px 0 0;color:var(--ink)}
  header p{font-size:15px;color:var(--muted);margin-top:10px}

  h2{font-family:var(--display);font-size:27px;font-weight:${t.headWeight};
    line-height:1.15;margin:34px 0 12px;color:var(--ink)}
  p{font-size:16px;color:var(--ink);margin:0 0 16px}

  figure{margin:22px 0}
  figure img,video{width:100%;display:block;border-radius:var(--radius);
    border:1px solid var(--rule);background:#0000000a}
  figcaption{font-size:13px;color:var(--muted);margin-top:8px;text-align:center}
  video{margin:22px 0}

  .video{position:relative;width:100%;padding-top:56.25%;margin:22px 0;
    border-radius:var(--radius);overflow:hidden;border:1px solid var(--rule);background:#0000000a}
  .video iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}

  .knopf{display:inline-block;background:var(--accent);color:var(--accentInk);
    text-decoration:none;padding:13px 26px;border-radius:var(--radius);
    font-size:15px;font-weight:500;margin:4px 0 22px}
  .knopf:hover{filter:brightness(.94)}

  hr{border:0;border-top:1px solid var(--rule);margin:32px 0}

  footer{text-align:center;margin-top:44px;padding-top:24px;
    border-top:1px solid var(--rule);font-size:13px;color:var(--muted)}

  .leer{border:1px dashed var(--rule);border-radius:var(--radius);padding:40px 20px;
    text-align:center;color:var(--muted);font-size:15px}

  @media(min-width:640px){h1{font-size:44px}h2{font-size:30px}p{font-size:16.5px}}
  ${t.extra}
</style>
</head>
<body>
  <div class="huelle">
    <header>
      <div class="marke">Nina and Friends</div>
      <h1>${esc(titel)}</h1>
      ${beschreibung ? `<p>${esc(beschreibung)}</p>` : ""}
    </header>
    ${inhalt || '<div class="leer">Hier werden gerade Inhalte vorbereitet.</div>'}
    <footer>Zusammengestellt mit &#9825; von Nina and Friends</footer>
  </div>
</body>
</html>`;
}

export default async function handler(request) {
  const url = new URL(request.url);
  const kennung = decodeURIComponent(
    url.pathname.replace(/^\/s\//, "").replace(/\/$/, "")
  );

  const hinweisSeite = (titel, text, status) =>
    new Response(
      seiteHtml({
        titel,
        beschreibung: text,
        vorschaubild: "",
        bausteine: [],
        url: url.href,
        design: "creme",
      }),
      { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );

  try {
    const store = getStore({ name: "nina-bausteine", consistency: "strong" });
    const { blobs } = await store.list();
    const alle = (
      await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))
    ).filter(Boolean);

    const passend = alle
      .filter((b) => b.aktiv !== false && b.seite && slugify(b.seite) === kennung)
      .sort((a, b) => (a.reihenfolge ?? 9999) - (b.reihenfolge ?? 9999));

    if (passend.length === 0) {
      return hinweisSeite(
        "Seite nicht gefunden",
        "Dieser Link ist nicht mehr aktuell.",
        404
      );
    }

    const bausteine = passend.map((b) => ({
      typ: b.typ || "Text",
      text: b.text || "",
      link: b.link || "",
      knopftext: b.knopftext || "",
      medien: b.medienUrl || "",
      dateiname: b.medienName || "",
      vorschau: "",
      istBild: b.medienTyp ? String(b.medienTyp).startsWith("image/") : false,
    }));

    const kopf = passend.find((b) => b.seitentitel);
    const seitenName = passend[0].seite;
    const titel = kopf ? kopf.seitentitel : seitenName;
    const beschreibung = kopf ? kopf.seitentext || "" : "";
    const design = (kopf && kopf.design) || passend[0].design || "creme";

    const erstesBild = bausteine.find((b) => b.istBild && b.medien);
    const vorschaubild = erstesBild
      ? new URL(erstesBild.medien, url.origin).href
      : "";

    return new Response(
      seiteHtml({
        titel,
        beschreibung,
        vorschaubild,
        bausteine,
        url: url.href,
        design,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return hinweisSeite(
      "Kurz nicht erreichbar",
      "Bitte versuche es in einem Moment noch einmal.",
      500
    );
  }
}

export const config = { path: "/s/*" };
