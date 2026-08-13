import { useEffect, useState } from "react";
import { eingebauteDateien } from "../data/content";

export interface DateiEintrag {
  id: string;
  art: string;
  bereich: string;
  titel: string;
  dateiname: string;
  typ: string;
  groesse: number;
  erstellt: number;
  url: string;
  vorschauUrl: string;
  istBild: boolean;
}

let zwischenspeicher: DateiEintrag[] | null = null;

// Fest im Code hinterlegte Links vorne anstellen, ohne Doppelte
function mitEingebauten(liste: DateiEintrag[]): DateiEintrag[] {
  const vorhanden = new Set(liste.map((d) => d.id));
  const fix = eingebauteDateien.filter((d) => !vorhanden.has(d.id));
  return [...fix, ...liste];
}

export function useDateien() {
  const [dateien, setDateien] = useState<DateiEintrag[]>(
    zwischenspeicher || mitEingebauten([])
  );
  const [laedt, setLaedt] = useState(!zwischenspeicher);

  useEffect(() => {
    let aktiv = true;
    const laden = () => {
      fetch("/api/dateien", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (!aktiv) return;
          const liste: DateiEintrag[] = mitEingebauten(d.dateien || []);
          zwischenspeicher = liste;
          setDateien(liste);
        })
        .catch(() => {})
        .finally(() => {
          if (aktiv) setLaedt(false);
        });
    };

    laden();

    // Automatisch aktualisieren: bei Rueckkehr zur App und regelmaessig
    const beiFokus = () => {
      if (document.visibilityState === "visible") laden();
    };
    window.addEventListener("focus", beiFokus);
    document.addEventListener("visibilitychange", beiFokus);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") laden();
    }, 60000);

    return () => {
      aktiv = false;
      window.removeEventListener("focus", beiFokus);
      document.removeEventListener("visibilitychange", beiFokus);
      window.clearInterval(timer);
    };
  }, []);

  return { dateien, laedt };
}

export function useDateienImBereich(bereich: string) {
  const { dateien, laedt } = useDateien();
  return { dateien: dateien.filter((d) => d.bereich === bereich), laedt };
}
