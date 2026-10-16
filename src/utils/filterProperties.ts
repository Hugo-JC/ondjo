import type { Property, SearchOrigin } from "../types";

export interface FilterPropertiesCriteria {
  query?: string;
  location?: string;
  type?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  bedrooms?: string | number;
  purpose?: string;
  origin?: SearchOrigin | string;
  bathrooms?: string | number;
  parking?: string | number;
  amenities?: string[];
}

/**
 * Filtro único e consistente de imóveis partilhado entre SearchBar e SearchPage.
 */
export function filterProperties(
  items: Property[],
  filters: FilterPropertiesCriteria,
): Property[] {
  const q = (filters.query || "").trim().toLowerCase();
  const min = filters.minPrice ? Number(filters.minPrice) : 0;
  const max = filters.maxPrice ? Number(filters.maxPrice) : Number.POSITIVE_INFINITY;

  return items.filter((item) => {
    // Busca por texto
    if (q) {
      const matchQ =
        item.title.toLowerCase().includes(q) ||
        item.neighborhood.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));
      if (!matchQ) return false;
    }

    // Localização / Bairro
    if (filters.location && filters.location.trim()) {
      const loc = filters.location.trim().toLowerCase();
      const matchLoc =
        item.neighborhood.toLowerCase() === loc ||
        item.city.toLowerCase() === loc;
      if (!matchLoc) return false;
    }

    // Tipo
    if (filters.type && filters.type.trim() && item.type !== filters.type) {
      return false;
    }

    // Finalidade: Comprar (venda) vs Arrendar (arrendamento)
    if (filters.purpose) {
      const p = filters.purpose.trim().toLowerCase();
      if (p === "comprar" || p === "venda") {
        if (item.purpose && item.purpose !== "venda") return false;
      } else if (p === "arrendar" || p === "arrendamento") {
        if (item.purpose && item.purpose !== "arrendamento") return false;
      }
    }

    // Preço
    if (item.price < min || item.price > max) {
      return false;
    }

    // Tipologia (Quartos)
    if (filters.bedrooms !== undefined && filters.bedrooms !== "") {
      const bStr = String(filters.bedrooms).trim();
      const bNum = Number(bStr);
      if (bStr === "5" || bStr === "5+") {
        if (item.bedrooms < 5) return false;
      } else if (bStr === "4" || bStr === "4+") {
        if (item.bedrooms < 4) return false;
      } else if (!Number.isNaN(bNum)) {
        if (item.bedrooms !== bNum) return false;
      }
    }

    // Casas de banho
    if (filters.bathrooms !== undefined && filters.bathrooms !== "") {
      const bathNum = Number(filters.bathrooms);
      if (!Number.isNaN(bathNum) && item.bathrooms < bathNum) {
        return false;
      }
    }

    // Estacionamento
    if (filters.parking !== undefined && filters.parking !== "") {
      const parkNum = Number(filters.parking);
      if (!Number.isNaN(parkNum) && item.parking < parkNum) {
        return false;
      }
    }

    // Origem
    if (filters.origin && filters.origin !== "todos") {
      if (filters.origin === "verificados") {
        if (!item.verified) return false;
      } else if (filters.origin === "proprietario") {
        if (item.advertiser && item.advertiser.type !== "particular") return false;
      } else if (filters.origin === "agentes") {
        if (item.advertiser && item.advertiser.type === "particular") return false;
      }
    }

    // Comodidades / Preferências
    if (filters.amenities && filters.amenities.length > 0) {
      const featuresText = (item.features || []).map((f) => f.toLowerCase()).join(" ");
      const descText = (item.description || "").toLowerCase();
      const combined = `${featuresText} ${descText}`;

      const allMatch = filters.amenities.every((amenity) => {
        const a = amenity.toLowerCase();
        if (a.includes("ar-condicionado") || a.includes("ar condicionado")) {
          return combined.includes("ar-condicionado") || combined.includes("ar condicionado") || combined.includes("climatiz");
        }
        if (a.includes("gerador")) {
          return combined.includes("gerador") || combined.includes("energia alternativa") || combined.includes("pt");
        }
        if (a.includes("tanque") || a.includes("água")) {
          return combined.includes("tanque") || combined.includes("água") || combined.includes("cisterna") || combined.includes("electrobomba");
        }
        if (a.includes("cozinha")) {
          return combined.includes("cozinha");
        }
        if (a.includes("lavar") || a.includes("máquina")) {
          return combined.includes("lavar") || combined.includes("máquina") || combined.includes("lavandaria");
        }
        if (a.includes("segurança")) {
          return combined.includes("segurança") || combined.includes("portaria") || combined.includes("guarita") || combined.includes("cctv") || combined.includes("vigilância");
        }
        if (a.includes("piscina")) {
          return combined.includes("piscina");
        }
        if (a.includes("wi-fi") || a.includes("internet")) {
          return combined.includes("wi-fi") || combined.includes("wifi") || combined.includes("internet") || combined.includes("fibra");
        }
        if (a.includes("varanda") || a.includes("terraço")) {
          return combined.includes("varanda") || combined.includes("terraço");
        }
        if (a.includes("mobil") || a.includes("mobiliado")) {
          return combined.includes("mobil") || combined.includes("mobilado");
        }
        if (a.includes("elevador")) {
          return combined.includes("elevador");
        }
        if (a.includes("ginásio") || a.includes("fitness")) {
          return combined.includes("ginásio") || combined.includes("ginasio") || combined.includes("fitness");
        }
        if (a.includes("quintal") || a.includes("jardim")) {
          return combined.includes("quintal") || combined.includes("jardim");
        }
        if (a.includes("garagem") || a.includes("vaga") || a.includes("estacionamento")) {
          return item.parking > 0 || combined.includes("garagem") || combined.includes("estacionamento");
        }
        return combined.includes(a);
      });

      if (!allMatch) return false;
    }

    return true;
  });
}
