import { BedDouble, Heart, MapPin, Ruler, ShowerHead, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { Property } from "../types";
import { formatKz } from "../data/properties";
import { navigate } from "../hooks/useHashRoute";
import { useFavorites } from "../hooks/useFavorites";
import { PropertyImageCarousel } from "./PropertyImageCarousel";

export function PropertyCard({
  property,
  index = 0,
}: {
  property: Property;
  index?: number;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(property.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px" }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.035, 0.12) }}
      className="group relative overflow-hidden rounded-2xl border border-ondjo-border bg-white shadow-[0_5px_18px_rgba(16,24,40,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(16,24,40,0.10)]"
    >
      {/* Carrossel de Fotos com Swipe e Lightbox */}
      <div className="relative">
        <PropertyImageCarousel
          images={property.images}
          title={property.title}
          aspectRatio="aspect-[1.38/1]"
          priority={index < 2}
        />

        {/* Badges de Destaque e Tipo de Negócio */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 z-10">
          {property.featured ? (
            <span className="rounded-full bg-ondjo-green px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs">
              Destaque
            </span>
          ) : (
            <span />
          )}
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-ondjo-ink shadow-xs backdrop-blur-xs">
            Venda
          </span>
        </div>

        {/* Botão de Favoritos */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className="focus-ring absolute right-3 top-12 z-10 grid size-9 place-items-center rounded-full bg-white/95 text-slate-600 shadow-md backdrop-blur-xs transition hover:scale-105 hover:text-ondjo-danger"
          aria-label={
            favorite
              ? `Remover ${property.title} dos favoritos`
              : `Guardar ${property.title} nos favoritos`
          }
          aria-pressed={favorite}
        >
          <Heart
            size={17}
            fill={favorite ? "currentColor" : "none"}
            className={favorite ? "text-ondjo-danger" : ""}
          />
        </button>
      </div>

      {/* Conteúdo do cartão com link para detalhes */}
      <button
        type="button"
        onClick={() => navigate(`imovel/${property.id}`)}
        className="focus-ring block w-full text-left p-4 cursor-pointer"
        aria-label={`Ver detalhes: ${property.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-extrabold text-ondjo-ink group-hover:text-ondjo-blue transition-colors">
              {property.title}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-ondjo-muted">
              <MapPin size={13} aria-hidden="true" /> {property.neighborhood},{" "}
              {property.city}
            </p>
          </div>
          {property.verified && (
            <ShieldCheck
              size={18}
              className="shrink-0 text-ondjo-green"
              aria-label="Imóvel verificado"
            />
          )}
        </div>

        <p className="mt-3 text-[17px] font-extrabold text-ondjo-green">
          {formatKz(property.price)}
        </p>

        <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble size={14} aria-hidden="true" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <ShowerHead size={14} aria-hidden="true" /> {property.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Ruler size={14} aria-hidden="true" /> {property.area} m²
          </span>
        </div>
      </button>
    </motion.article>
  );
}
