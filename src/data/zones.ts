import { locations, properties } from "./properties";

export interface ZoneData {
  name: string;
  municipality: string;
  province: string;
  popular: boolean;
}

export interface MunicipalityData {
  name: string;
  province: string;
  zones: string[];
}

export const LUANDA_MUNICIPALITIES: MunicipalityData[] = [
  {
    name: "Talatona",
    province: "Luanda",
    zones: ["Talatona", "Camama", "Benfica", "Morro Bento"],
  },
  {
    name: "Belas",
    province: "Luanda",
    zones: ["Kilamba", "Belas", "Cabolombo"],
  },
  {
    name: "Luanda",
    province: "Luanda",
    zones: ["Maianga", "Ingombota", "Alvalade", "Maculusso", "Miramar"],
  },
  {
    name: "Viana",
    province: "Luanda",
    zones: ["Viana", "Zango", "Vila Flor"],
  },
  {
    name: "Cazenga",
    province: "Luanda",
    zones: ["Cazenga"],
  },
  {
    name: "Cacuaco",
    province: "Luanda",
    zones: ["Cacuaco"],
  },
];

export interface ZoneSummary {
  name: string;
  municipality?: string;
  count: number;
  minPrice: number | null;
}

export function getZoneSummaries(): ZoneSummary[] {
  return locations.map((name) => {
    const inZone = properties.filter((p) => p.neighborhood.toLowerCase() === name.toLowerCase());
    const muni = LUANDA_MUNICIPALITIES.find((m) =>
      m.zones.some((z) => z.toLowerCase() === name.toLowerCase())
    )?.name;

    return {
      name,
      municipality: muni,
      count: inZone.length,
      minPrice: inZone.length
        ? Math.min(...inZone.map((p) => p.price))
        : null,
    };
  });
}

export const formatCount = (count: number) =>
  count === 1 ? "1 imóvel" : `${count} imóveis`;
