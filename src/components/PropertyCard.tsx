import { BedDouble, ChevronRight, Heart, MapPin, Ruler, ShowerHead } from "lucide-react";
import { motion } from "framer-motion";
import type { Property } from "../types";
import { formatKz } from "../utils/format";
import { Badge } from "./ui/Badge";
import { navigate } from "../hooks/useHashRoute";
import { useFavorites } from "../hooks/useFavorites";
import { PropertyImageCarousel } from "./PropertyImageCarousel";
import { setActiveCard, getActiveCardId } from "../utils/cardActiveState";

export function PropertyCard({
  property,
  index = 0,
}: {
  property: Property;
  index?: number;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(property.id);

  // Ao retirar o cursor do cartão, reseta o estado ativo caso seja este cartão
  const handleMouseLeave = () => {
    if (getActiveCardId() === property.id) {
      setActiveCard(null);
    }
  };

  const handleCardClick = () => {
    navigate(`imovel/${property.id}`);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`imovel/${property.id}`);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px" }}
      transition={{ duration: 0.24, ease: "easeOut", delay: Math.min(index * 0.035, 0.12) }}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
      role="link"
      aria-label={`${property.title}, ${property.neighborhood}, ${property.city}. Preço: ${formatKz(property.price, { perMonth: property.purpose === "arrendamento" })}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ondjo-border/80 bg-white shadow-ondjo-card hover:shadow-ondjo-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer focus-ring"
    >
      {/* Carrossel de Fotos estilo Airbnb / Mobbin (Aspect 4:3, Swipe, Hover Chevrons e Dots) */}
      <div className="relative overflow-hidden bg-slate-100">
        <PropertyImageCarousel
          propertyId={property.id}
          images={property.images}
          title={property.title}
          aspectRatio="aspect-[4/3]"
          priority={index < 2}
          showLightboxButton={false}
        />

        {/* Badges no topo esquerdo: Destaque e Modalidade */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5">
          {property.featured && (
            <Badge variant="featured" size="sm">
              Destaque
            </Badge>
          )}
          <Badge variant="neutral" size="sm">
            {property.purpose === "arrendamento" ? "Arrendamento" : "Venda"}
          </Badge>
        </div>

        {/* Botão de Favoritos estilo Airbnb no topo direito (Toque mínimo >= 44px) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className="focus-ring absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur-xs transition hover:scale-110 hover:bg-white active:scale-90 cursor-pointer before:absolute before:-inset-1.5 before:content-['']"
          aria-label={
            favorite
              ? `Remover ${property.title} dos favoritos`
              : `Guardar ${property.title} nos favoritos`
          }
          aria-pressed={favorite}
        >
          <Heart
            size={18}
            className={`transition-colors duration-200 ${
              favorite
                ? "fill-ondjo-danger text-ondjo-danger"
                : "text-slate-600 hover:text-ondjo-ink"
            }`}
          />
        </button>
      </div>

      {/* Conteúdo Informativo do Imóvel com Hierarquia Limpa */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          {/* Linha 1: Localização & Verificação */}
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-1 text-xs font-medium text-ondjo-muted truncate">
              <MapPin size={13} aria-hidden="true" className="shrink-0 text-slate-400" />
              <span className="truncate">{property.neighborhood}, {property.city}</span>
            </p>
            {property.verified && (
              <Badge variant="verified" size="sm" title="Imóvel Verificado ONDJO" className="shrink-0">
                Verificado
              </Badge>
            )}
          </div>

          {/* Linha 2: Título do Imóvel */}
          <h3
            className="mt-1 font-semibold text-[15px] sm:text-[16px] text-ondjo-ink leading-snug line-clamp-1 group-hover:text-ondjo-blue transition-colors"
            title={property.title}
          >
            {property.title}
          </h3>

          {/* Linha 3: Especificações Limpas (Quartos · WC · Área) */}
          <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble size={14} className="text-slate-400" aria-hidden="true" />
                <span>T{property.bedrooms}</span>
              </span>
            )}
            {property.bedrooms > 0 && property.bathrooms > 0 && (
              <span className="text-slate-300" aria-hidden="true">·</span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <ShowerHead size={14} className="text-slate-400" aria-hidden="true" />
                <span>{property.bathrooms} WC</span>
              </span>
            )}
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Ruler size={14} className="text-slate-400" aria-hidden="true" />
              <span>{property.area} m²</span>
            </span>
          </div>
        </div>

        {/* Linha 4: Preço em Navy e Convite Visual */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-[17px] sm:text-[18px] font-bold text-ondjo-navy tracking-tight">
              {formatKz(property.price, { perMonth: property.purpose === "arrendamento" })}
            </span>
          </div>
          <span className="text-xs font-semibold text-ondjo-blue group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
            Ver detalhes
            <ChevronRight size={13} aria-hidden="true" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
