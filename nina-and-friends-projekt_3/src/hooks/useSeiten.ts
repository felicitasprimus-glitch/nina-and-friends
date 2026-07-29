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

// Laedt die im Baukasten angelegten Seiten (einmal pro Sitzung).
export function useSeiten() {
  const [seiten, setSeiten] = useState<SeitenEintrag[]>(zwischenspeicher || []);
  const [laedt, setLaedt] = useState(zwischenspeicher === null);

  useEffect(() => {
    if (zwischenspeicher !== null) return;
    let abgebrochen = false;

    fetch("/api/seiten")
      .then((r) => r.json())
      .then((daten) => {
        if (abgebrochen) return;
        const liste: SeitenEintrag[] = daten.seiten || [];
        zwischenspeicher = liste;
        setSeiten(liste);
      })
      .catch(() => {
        if (!abgebrochen) zwischenspeicher = [];
      })
      .finally(() => {
        if (!abgebrochen) setLaedt(false);
      });

    return () => {
      abgebrochen = true;
    };
  }, []);

  return { seiten, laedt };
}

export function useSeitenImBereich(bereich: string) {
  const { seiten, laedt } = useSeiten();
  return { seiten: seiten.filter((s) => s.bereich === bereich), laedt };
}
