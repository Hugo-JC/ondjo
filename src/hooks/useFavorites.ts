import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "ondjo-favorite-properties";
const CHANGE_EVENT = "ondjo:favorites-changed";
const EMPTY_FAVORITES: string[] = [];

let cachedRaw: string | null = null;
let cachedFavorites: string[] = EMPTY_FAVORITES;

function readFavorites(): string[] {
  if (typeof window === "undefined") return EMPTY_FAVORITES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedFavorites;

    cachedRaw = raw;
    if (!raw) {
      cachedFavorites = EMPTY_FAVORITES;
      return cachedFavorites;
    }

    const value: unknown = JSON.parse(raw);
    cachedFavorites = Array.isArray(value)
      ? value.filter((id): id is string => typeof id === "string")
      : EMPTY_FAVORITES;
    return cachedFavorites;
  } catch {
    cachedFavorites = EMPTY_FAVORITES;
    return cachedFavorites;
  }
}

function writeFavorites(ids: string[]) {
  const serialized = JSON.stringify(ids);
  cachedRaw = serialized;
  cachedFavorites = ids;
  window.localStorage.setItem(STORAGE_KEY, serialized);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getServerSnapshot(): string[] {
  return EMPTY_FAVORITES;
}

/** Shared, persistent favorites state for property cards and the saved page. */
export function useFavorites() {
  const favoriteIds = useSyncExternalStore(subscribe, readFavorites, getServerSnapshot);

  const toggleFavorite = useCallback((id: string) => {
    const current = readFavorites();
    const next = current.includes(id)
      ? current.filter((savedId) => savedId !== id)
      : [id, ...current];
    writeFavorites(next);
  }, []);

  const removeFavorite = useCallback((id: string) => {
    const next = readFavorites().filter((savedId) => savedId !== id);
    writeFavorites(next);
  }, []);

  const clearFavorites = useCallback(() => {
    writeFavorites([]);
  }, []);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.includes(id),
    [favoriteIds],
  );

  return {
    favoriteIds,
    favoriteCount: favoriteIds.length,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
  };
}
