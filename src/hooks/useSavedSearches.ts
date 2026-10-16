import { useState, useEffect } from "react";
import type { SearchFilters } from "../types";

const SAVED_SEARCHES_KEY = "ondjo-saved-searches";

export interface SavedSearchItem {
  id: string;
  createdAt: string;
  label: string;
  filters: Partial<SearchFilters>;
}

export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearchItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(SAVED_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
    } catch {
      // Ignorar falhas de quota de localStorage
    }
  }, [searches]);

  const saveSearch = (filters: Partial<SearchFilters>, label?: string) => {
    const computedLabel =
      label ||
      [
        filters.location || "Luanda",
        filters.type ? filters.type : null,
        filters.bedrooms ? `T${filters.bedrooms}` : null,
        filters.purpose === "arrendamento" ? "Arrendar" : filters.purpose === "venda" ? "Comprar" : null,
      ]
        .filter(Boolean)
        .join(" · ") || "Pesquisa geral";

    const newItem: SavedSearchItem = {
      id: `search-${Date.now()}`,
      createdAt: new Date().toISOString(),
      label: computedLabel,
      filters,
    };

    setSearches((prev) => [newItem, ...prev.filter((s) => s.label !== computedLabel)].slice(0, 10));
  };

  const removeSearch = (id: string) => {
    setSearches((prev) => prev.filter((s) => s.id !== id));
  };

  const clearSearches = () => {
    setSearches([]);
  };

  return { searches, saveSearch, removeSearch, clearSearches };
}
