import { useEffect, useState } from "react";

export interface SeitenEintrag {
  name: string;
  slug: string;
  bereich: string;
  titel: string;
  untertitel: string;
  fuerKunden: boolean;
  vorschaubild: string;
  anzahl: number;
}

let zwischenspeicher: SeitenEintrag[] | null = null;

// Laedt die im Baukasten angelegten Seiten und aktualisiert automatisch.
export function useSeiten() {
  const [seiten, setSeiten] = useState<SeitenEintrag[]>(zwischenspeicher || []);
  const [laedt, setLaedt] = useState(zwischenspeicher === null);

  useEffect(() => {
    let abgebrochen = false;
    const laden = () => {
      fetch("/api/seiten")
        .then((r) => r.json())
        .then((daten) => {
          if (abgebrochen) return;
          const liste: SeitenEintrag[] = daten.seiten || [];
          zwischenspeicher = liste;
          setSeiten(liste);
        })
        .catch(() => {
          if (!abgebrochen && zwischenspeicher === null) zwischenspeicher = [];
        })
        .finally(() => {
          if (!abgebrochen) setLaedt(false);
        });
    };

    laden();

    const beiFokus = () => {
      if (document.visibilityState === "visible") laden();
    };
    window.addEventListener("focus", beiFokus);
    document.addEventListener("visibilitychange", beiFokus);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") laden();
    }, 60000);

    return () => {
      abgebrochen = true;
      window.removeEventListener("focus", beiFokus);
      document.removeEventListener("visibilitychange", beiFokus);
      window.clearInterval(timer);
    };
  }, []);

  return { seiten, laedt };
}

export function useSeitenImBereich(bereich: string) {
  const { seiten, laedt } = useSeiten();
  return { seiten: seiten.filter((s) => s.bereich === bereich), laedt };
}
