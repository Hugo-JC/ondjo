import { useQuery } from "@tanstack/react-query";
import { properties } from "../data/properties";
import { filterProperties } from "../utils/filterProperties";
import type { SearchFilters } from "../components/SearchBar";

export type SortOption = "relevance" | "price-low" | "price-high" | "area";

export function useFilteredPropertiesQuery(
  filters: SearchFilters,
  sort: SortOption = "relevance",
) {
  return useQuery({
    queryKey: ["properties", "search", filters, sort],
    queryFn: () => {
      const filtered = filterProperties(properties, {
        ...filters,
        purpose: filters.purpose as "comprar" | "arrendar",
      });

      if (sort === "price-low") {
        return [...filtered].sort((a, b) => a.price - b.price);
      }
      if (sort === "price-high") {
        return [...filtered].sort((a, b) => b.price - a.price);
      }
      if (sort === "area") {
        return [...filtered].sort((a, b) => b.area - a.area);
      }
      return filtered;
    },
    initialData: () => {
      const filtered = filterProperties(properties, {
        ...filters,
        purpose: filters.purpose as "comprar" | "arrendar",
      });

      if (sort === "price-low") return [...filtered].sort((a, b) => a.price - b.price);
      if (sort === "price-high") return [...filtered].sort((a, b) => b.price - a.price);
      if (sort === "area") return [...filtered].sort((a, b) => b.area - a.area);
      return filtered;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePropertyByIdQuery(id: string) {
  return useQuery({
    queryKey: ["properties", "detail", id],
    queryFn: () => properties.find((item) => item.id === id) ?? null,
    initialData: () => properties.find((item) => item.id === id) ?? null,
    staleTime: 10 * 60 * 1000,
  });
}
