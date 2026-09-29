import { locations, properties } from "./properties";

export interface ZoneSummary {
  name: string;
  count: number;
  minPrice: number | null;
}

export function getZoneSummaries(): ZoneSummary[] {
  return locations.map((name) => {
    const inZone = properties.filter((p) => p.neighborhood === name);
    return {
      name,
      count: inZone.length,
      minPrice: inZone.length
        ? Math.min(...inZone.map((p) => p.price))
        : null,
    };
  });
}

export const formatCount = (count: number) =>
  count === 1 ? "1 imóvel" : `${count} imóveis`;