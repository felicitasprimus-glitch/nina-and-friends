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

export function useKategorien() {
  const [eigene, setEigene] = useState<Category[]>(zwischenspeicher || []);
  const [versteckt, setVersteckt] = useState<string[]>(verstecktCache);
  const [namen, setNamen] = useState<Record<string, string>>(namenCache);

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
          setEigene(liste);
          setVersteckt(d.versteckt || []);
          setNamen(d.namen || {});
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

  const alle: Category[] = [...eingebautAlle, ...eigene]
    .filter(sichtbar)
    .map(umbenannt);
  const haupt: Category[] = [
    ...eingebautHaupt,
    ...eigene.filter((k) => !k.parent),
  ]
    .filter(sichtbar)
    .map(umbenannt);
  const finde = (slug: string) => alle.find((c) => c.slug === slug);
  const unter = (slug: string) => alle.filter((c) => c.parent === slug);

  return { alle, haupt, eigene, versteckt, namen, finde, unter };
}
