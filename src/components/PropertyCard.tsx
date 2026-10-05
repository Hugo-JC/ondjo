import { BedDouble, Heart, MapPin, Ruler, ShowerHead, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { Property } from "../types";
import { formatKz } from "../data/properties";
import { navigate } from "../hooks/useHashRoute";
import { useFavorites } from "../hooks/useFavorites";

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
      <button
        type="button"
        onClick={() => navigate(`imovel/${property.id}`)}
        className="focus-ring block w-full text-left"
        aria-label={`Ver detalhes: ${property.title}`}
      >
        <div className="relative aspect-[1.38/1] overflow-hidden bg-slate-100">
          <img
            src={property.images[0]}
            alt={property.title}
            loading={index > 3 ? "lazy" : "eager"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            {property.featured ? (
              <span className="rounded-full bg-ondjo-green px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">Destaque</span>
            ) : <span />}
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-ondjo-ink shadow-sm backdrop-blur">Venda</span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-extrabold text-ondjo-ink">{property.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-ondjo-muted"><MapPin size={13} aria-hidden="true" /> {property.neighborhood}, {property.city}</p>
            </div>
            {property.verified && <ShieldCheck size={18} className="shrink-0 text-ondjo-green" aria-label="Imóvel verificado" />}
          </div>
          <p className="mt-3 text-[17px] font-extrabold text-ondjo-green">{formatKz(property.price)}</p>
          <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
            {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble size={14} aria-hidden="true" /> {property.bedrooms}</span>}
            {property.bathrooms > 0 && <span className="flex items-center gap-1"><ShowerHead size={14} aria-hidden="true" /> {property.bathrooms}</span>}
            <span className="flex items-center gap-1"><Ruler size={14} aria-hidden="true" /> {property.area} m²</span>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => toggleFavorite(property.id)}
        className="focus-ring absolute right-3 top-14 grid size-10 place-items-center rounded-full bg-white/95 text-slate-600 shadow-md backdrop-blur transition hover:scale-105 hover:text-ondjo-danger"
        aria-label={favorite ? `Remover ${property.title} dos favoritos` : `Guardar ${property.title} nos favoritos`}
        aria-pressed={favorite}
      >
        <Heart size={18} fill={favorite ? "currentColor" : "none"} className={favorite ? "text-ondjo-danger" : ""} />
      </button>
    </motion.article>
  );
}
