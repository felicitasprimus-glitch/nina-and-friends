import { useEffect, useState } from "react";
import type { Category } from "../types";
import {
  alleKategorien as eingebautAlle,
  hauptKategorien as eingebautHaupt,
} from "../data/content";

interface EigeneKategorie {
  slug: string;
  title: string;
  icon?: string;
  parent?: string;
}

let zwischenspeicher: Category[] | null = null;
let verstecktCache: string[] = [];
let namenCache: Record<string, string> = {};
let reiheCache: Record<string, number> = {};

export function useKategorien() {
  const [eigene, setEigene] = useState<Category[]>(zwischenspeicher || []);
  const [versteckt, setVersteckt] = useState<string[]>(verstecktCache);
  const [namen, setNamen] = useState<Record<string, string>>(namenCache);
  const [reihe, setReihe] = useState<Record<string, number>>(reiheCache);

  useEffect(() => {
    let aktiv = true;
    const laden = () => {
      fetch("/api/kategorien", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (!aktiv) return;
          const liste: Category[] = ((d.kategorien || []) as EigeneKategorie[]).map(
            (k) => ({
              slug: k.slug,
              title: k.title,
              icon: k.icon || "Folder",
              description: "",
              parent: k.parent || undefined,
            })
          );
          zwischenspeicher = liste;
          verstecktCache = d.versteckt || [];
          namenCache = d.namen || {};
          reiheCache = d.reihe || {};
          setEigene(liste);
          setVersteckt(d.versteckt || []);
          setNamen(d.namen || {});
          setReihe(d.reihe || {});
        })
        .catch(() => {});
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
      aktiv = false;
      window.removeEventListener("focus", beiFokus);
      document.removeEventListener("visibilitychange", beiFokus);
      window.clearInterval(timer);
    };
  }, []);

  const sichtbar = (k: Category) => !versteckt.includes(k.slug);
  // Im Admin vergebene Namen gehen vor
  const umbenannt = (k: Category): Category =>
    namen[k.slug] ? { ...k, title: namen[k.slug] } : k;

  const roh: Category[] = [...eingebautAlle, ...eigene]
    .filter(sichtbar)
    .map(umbenannt);

  // Selbst festgelegte Reihenfolge zuerst, alles ohne Position danach
  const nachPosition = (liste: Category[]) =>
    [...liste].sort((a, b) => {
      const pa = reihe[a.slug] || 0;
      const pb = reihe[b.slug] || 0;
      if (pa && pb) return pa - pb;
      if (pa) return -1;
      if (pb) return 1;
      return 0;
    });

  // Jede Unterkategorie direkt hinter ihre Hauptkategorie stellen,
  // damit Auswahllisten die Zugehoerigkeit zeigen.
  const alle: Category[] = [];
  const schonDrin = new Set<string>();
  nachPosition(roh.filter((k) => !k.parent)).forEach((h) => {
    alle.push(h);
    schonDrin.add(h.slug);
    nachPosition(roh.filter((k) => k.parent === h.slug)).forEach((u) => {
      alle.push(u);
      schonDrin.add(u.slug);
    });
  });
  // Reste, deren Hauptkategorie fehlt oder ausgeblendet ist
  roh.forEach((k) => {
    if (!schonDrin.has(k.slug)) alle.push(k);
  });

  const haupt: Category[] = nachPosition(
    [...eingebautHaupt, ...eigene.filter((k) => !k.parent)]
      .filter(sichtbar)
      .map(umbenannt)
  );
  const finde = (slug: string) => alle.find((c) => c.slug === slug);
  const unter = (slug: string) => alle.filter((c) => c.parent === slug);

  return { alle, haupt, eigene, versteckt, namen, reihe, finde, unter };
}
