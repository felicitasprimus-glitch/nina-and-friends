import { useCallback, useEffect, useState } from "react";

const KEY = "naf-favorites";

const read = (): string[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(read);

  useEffect(() => {
    const onStorage = () => setFavorites(read());
    window.addEventListener("storage", onStorage);
    window.addEventListener("naf-favorites-changed", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("naf-favorites-changed", onStorage);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Speicher nicht verfuegbar - Favoriten gelten nur fuer diese Sitzung
      }
      window.dispatchEvent(new Event("naf-favorites-changed"));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
}
