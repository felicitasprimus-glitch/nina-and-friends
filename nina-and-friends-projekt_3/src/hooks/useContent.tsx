import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ContentItem, ContentType } from "../types";
import { contents as demoContents, categories } from "../data/content";

type Source = "demo" | "airtable";

interface RemoteItem {
  id: string;
  title: string;
  categorySlug: string;
  type: string;
  description: string;
  body: string;
  date?: string;
  time?: string;
  subtitle?: string;
  visibility?: string;
  fileUrl?: string;
  fileName?: string;
  imageUrl?: string;
  linkUrl?: string;
  forCustomers?: boolean;
  shareText?: string;
  show?: string;
}

const validTypes: ContentType[] = [
  "artikel",
  "pdf",
  "link",
  "rezept",
  "vorlage",
  "video",
  "termin",
  "schulung",
];

const validSlugs = new Set(categories.map((c) => c.slug));

function toContentItem(r: RemoteItem): ContentItem | null {
  if (!r.title || !validSlugs.has(r.categorySlug)) return null;

  const type = (validTypes as string[]).includes(r.type)
    ? (r.type as ContentType)
    : "artikel";

  // Datum als "15.07." fuer die Kartenanzeige
  let dateLabel: string | undefined;
  if (r.date) {
    const d = new Date(r.date);
    if (!Number.isNaN(d.getTime())) {
      dateLabel =
        String(d.getDate()).padStart(2, "0") +
        "." +
        String(d.getMonth() + 1).padStart(2, "0") +
        ".";
    }
  }

  return {
    id: r.id,
    categorySlug: r.categorySlug,
    type,
    title: r.title,
    description: r.description,
    body: r.body,
    date: r.date,
    dateLabel,
    time: r.time,
    subtitle: r.subtitle,
    fileUrl: r.fileUrl,
    fileName: r.fileName,
    imageUrl: r.imageUrl,
    linkUrl: r.linkUrl,
    forCustomers: r.forCustomers === true,
    shareText: r.shareText,
    show: r.show,
  };
}

interface ContentContextValue {
  contents: ContentItem[];
  loading: boolean;
  source: Source;
  error: string | null;
}

const ContentContext = createContext<ContentContextValue>({
  contents: demoContents,
  loading: false,
  source: "demo",
  error: null,
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const [contents, setContents] = useState<ContentItem[]>(demoContents);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<Source>("demo");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let abgebrochen = false;

    fetch("/.netlify/functions/inhalte")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("HTTP " + res.status))))
      .then((data: { configured?: boolean; items?: RemoteItem[]; error?: string }) => {
        if (abgebrochen) return;

        if (!data.configured) {
          // Airtable noch nicht eingerichtet -> Demo-Daten behalten
          setSource("demo");
          return;
        }
        if (data.error) {
          setError(data.error);
          return;
        }

        const items = (data.items || [])
          .map(toContentItem)
          .filter((c): c is ContentItem => c !== null);

        if (items.length > 0) {
          setContents(items);
          setSource("airtable");
        }
      })
      .catch(() => {
        // Offline oder Funktion nicht erreichbar -> Demo-Daten behalten
        if (!abgebrochen) setSource("demo");
      })
      .finally(() => {
        if (!abgebrochen) setLoading(false);
      });

    return () => {
      abgebrochen = true;
    };
  }, []);

  const value = useMemo(
    () => ({ contents, loading, source, error }),
    [contents, loading, source, error]
  );

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

/* ---------- Zugriff auf die Inhalte ---------- */

export function useContent() {
  return useContext(ContentContext);
}

export function useContentsByCategory(slug: string) {
  const { contents } = useContent();
  return useMemo(
    () => contents.filter((c) => c.categorySlug === slug),
    [contents, slug]
  );
}

export function useUpcomingByCategory(slug: string) {
  const { contents } = useContent();
  return useMemo(() => {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    return contents
      .filter((c) => c.categorySlug === slug && !!c.date)
      .filter((c) => new Date(c.date as string) >= heute)
      .sort((a, b) => (a.date as string).localeCompare(b.date as string));
  }, [contents, slug]);
}

export function useContentById(id: string) {
  const { contents } = useContent();
  return useMemo(() => contents.find((c) => c.id === id), [contents, id]);
}

export function useSearch(query: string) {
  const { contents } = useContent();
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return contents.filter((c) => {
      const cat = categories.find((k) => k.slug === c.categorySlug);
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.body.toLowerCase().includes(q) ||
        (cat ? cat.title.toLowerCase().includes(q) : false)
      );
    });
  }, [contents, query]);
}

// Die drei Karten auf der Startseite: naechste Termine/Schulungen.
export function useHomeTrainings() {
  const { contents } = useContent();
  return useMemo(() => {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);

    const kommend = contents
      .filter((c) => !!c.date && (c.type === "schulung" || c.type === "termin"))
      .filter((c) => new Date(c.date as string) >= heute)
      .sort((a, b) => (a.date as string).localeCompare(b.date as string));

    if (kommend.length > 0) return kommend.slice(0, 3);

    // Nichts Kommendes vorhanden -> die zuletzt angelegten zeigen
    return contents
      .filter((c) => c.type === "schulung" || c.type === "termin")
      .slice(0, 3);
  }, [contents]);
}
