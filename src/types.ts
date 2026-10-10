export type PropertyType = "Apartamento" | "Casa" | "Moradia" | "Terreno";

export type Purpose = "venda" | "arrendamento";

export type SearchOrigin =
  | "todos"
  | "verificados"
  | "proprietario"
  | "agentes"
  | "particulares";

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
  purpose?: Purpose;
  priceUnit?: "total" | "mes";
  advertiser?: {
    name: string;
    type: "particular" | "agente" | "empresa";
    verified: boolean;
    phone?: string;
    whatsapp?: string;
  };
}
