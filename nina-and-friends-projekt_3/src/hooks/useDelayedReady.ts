import { useEffect, useState } from "react";

// Simulierter Ladezustand, damit Skeletons und Uebergaenge sichtbar sind.
export function useDelayedReady(ms = 350) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return ready;
}
