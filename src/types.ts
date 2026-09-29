export type PropertyType = "Apartamento" | "Casa" | "Moradia" | "Terreno";

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  city: string;
  province: string;
  neighborhood: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: number;
  featured?: boolean;
  verified?: boolean;
  description: string;
  features: string[];
  images: string[];
}
