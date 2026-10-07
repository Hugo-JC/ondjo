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
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ondjo-border bg-white shadow-[0_5px_18px_rgba(16,24,40,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(16,24,40,0.10)]"
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
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-ondjo-ink shadow-xs backdrop-blur-xs">
            Venda
          </span>
        </div>

        {/* Botão de Favoritos - alvo de toque otimizado (min 44px) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className="focus-ring absolute right-2.5 top-11 z-10 grid min-h-11 min-w-11 place-items-center rounded-full bg-white/95 text-slate-700 shadow-md backdrop-blur-xs transition hover:scale-105 active:scale-90 hover:text-ondjo-danger"
          aria-label={
            favorite
              ? `Remover ${property.title} dos favoritos`
              : `Guardar ${property.title} nos favoritos`
          }
          aria-pressed={favorite}
        >
          <Heart
            size={18}
            fill={favorite ? "currentColor" : "none"}
            className={favorite ? "text-ondjo-danger" : ""}
          />
        </button>
      </div>

      {/* Conteúdo do cartão com link para detalhes */}
      <button
        type="button"
        onClick={() => navigate(`imovel/${property.id}`)}
        className="focus-ring flex flex-1 flex-col justify-between w-full text-left p-4 cursor-pointer active:bg-slate-50/80 transition-colors"
        aria-label={`Ver detalhes: ${property.title}`}
      >
        <div>
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 text-[15px] font-extrabold text-ondjo-ink group-hover:text-ondjo-blue transition-colors">
                {property.title}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-ondjo-muted truncate">
                <MapPin size={13} aria-hidden="true" className="shrink-0 text-slate-400" />
                <span className="truncate">{property.neighborhood}, {property.city}</span>
              </p>
            </div>
            {property.verified && (
              <span title="Imóvel Verificado ONDJO" className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-ondjo-green">
                <ShieldCheck size={14} className="text-ondjo-green" aria-hidden="true" />
                <span className="hidden xs:inline">Verificado</span>
              </span>
            )}
          </div>

          <p className="mt-2.5 text-base sm:text-[17px] font-extrabold text-ondjo-green tracking-tight">
            {formatKz(property.price)}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-3.5 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <BedDouble size={15} aria-hidden="true" className="text-slate-400" />
              <span>T{property.bedrooms}</span>
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <ShowerHead size={15} aria-hidden="true" className="text-slate-400" />
              <span>{property.bathrooms} WC</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Ruler size={15} aria-hidden="true" className="text-slate-400" />
            <span>{property.area} m²</span>
          </span>
        </div>
      </button>
    </motion.article>
  );
}
