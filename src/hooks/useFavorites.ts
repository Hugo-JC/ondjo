import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ondjo-favorite-properties";
const CHANGE_EVENT = "ondjo:favorites-changed";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value)
      ? value.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** Shared, persistent favorites state for property cards and the saved page. */
export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(readFavorites);

  useEffect(() => {
    const sync = () => setFavoriteIds(readFavorites());
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const current = readFavorites();
    const next = current.includes(id)
      ? current.filter((savedId) => savedId !== id)
      : [id, ...current];
    writeFavorites(next);
    setFavoriteIds(next);
  }, []);

  const removeFavorite = useCallback((id: string) => {
    const next = readFavorites().filter((savedId) => savedId !== id);
    writeFavorites(next);
    setFavoriteIds(next);
  }, []);

  const clearFavorites = useCallback(() => {
    writeFavorites([]);
    setFavoriteIds([]);
  }, []);

  return {
    favoriteIds,
    favoriteCount: favoriteIds.length,
    isFavorite: (id: string) => favoriteIds.includes(id),
    toggleFavorite,
    removeFavorite,
    clearFavorites,
  };
}
