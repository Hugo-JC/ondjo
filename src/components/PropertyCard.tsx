import { useRef } from "react";
import {
  BedDouble,
  ChevronRight,
  Heart,
  MapPin,
  Ruler,
  ShowerHead,
} from "lucide-react";
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

  const pointerDownPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Se o utilizador moveu o ponteiro mais de 10px, estava a fazer scroll/swipe e não clique
    const diffX = Math.abs(e.clientX - pointerDownPos.current.x);
    const diffY = Math.abs(e.clientY - pointerDownPos.current.y);
    if (diffX > 10 || diffY > 10) {
      return;
    }
    navigate(`imovel/${property.id}`);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`imovel/${property.id}`);
    }
  };

  const isArrendamento = property.purpose === "arrendamento";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px" }}
      transition={{
        duration: 0.24,
        ease: "easeOut",
        delay: Math.min(index * 0.035, 0.12),
      }}
      onPointerDown={handlePointerDown}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
      role="link"
      aria-label={`${property.title}, ${property.neighborhood}, ${property.city}. Preço: ${formatKz(property.price, { perMonth: isArrendamento })}`}
      className="group relative flex min-w-0 w-full max-w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-ondjo-border/80 bg-white shadow-ondjo-card transition-all duration-300 hover:-translate-y-1 hover:shadow-ondjo-card-hover focus-ring"
    >
      <div className="relative overflow-hidden bg-ondjo-blue-50">
        <PropertyImageCarousel
          propertyId={property.id}
          images={property.images}
          title={property.title}
          aspectRatio="aspect-[4/3]"
          priority={index < 2}
          showLightboxButton={false}
        />

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[calc(100%-6rem)] flex-wrap items-center gap-2">
          {property.featured && (
            <Badge variant="featured" size="sm">
              Destaque
            </Badge>
          )}
          <Badge variant="neutral" size="sm">
            {isArrendamento ? "Arrendamento" : "Venda"}
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
          className="focus-ring absolute right-3 top-3 z-20 grid size-11 place-items-center rounded-full border border-white/80 bg-white/95 text-ondjo-ink shadow-ondjo-pill backdrop-blur-sm transition hover:scale-105 hover:bg-white active:scale-95 cursor-pointer"
          aria-label={
            favorite
              ? `Remover ${property.title} dos favoritos`
              : `Guardar ${property.title} nos favoritos`
          }
          aria-pressed={favorite}
        >
          <Heart
            size={20}
            className={`transition-colors duration-200 ${
              favorite
                ? "fill-ondjo-danger text-ondjo-danger"
                : "text-ondjo-muted group-hover:text-ondjo-danger"
            }`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-ondjo-muted">
            <MapPin
              size={15}
              aria-hidden="true"
              className="shrink-0 text-ondjo-blue"
            />
            <span className="truncate">
              {property.neighborhood}, {property.city}
            </span>
          </p>
          {property.verified && (
            <Badge
              variant="verified"
              size="sm"
              title="Imóvel Verificado ONDJO"
              className="shrink-0"
            >
              Verificado
            </Badge>
          )}
        </div>

        <h3
          className="mt-2 line-clamp-2 min-h-11 text-base font-semibold leading-snug text-ondjo-ink transition-colors group-hover:text-ondjo-blue"
          title={property.title}
        >
          {property.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] font-medium text-ondjo-muted">
          {property.bedrooms > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <BedDouble
                size={15}
                className="text-ondjo-blue"
                aria-hidden="true"
              />
              <span>T{property.bedrooms}</span>
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <ShowerHead
                size={15}
                className="text-ondjo-blue"
                aria-hidden="true"
              />
              <span>{property.bathrooms} WC</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Ruler
              size={15}
              className="text-ondjo-blue"
              aria-hidden="true"
            />
            <span>{property.area} m²</span>
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-2 border-t border-ondjo-border/70 pt-3">
          <div className="min-w-0">
            <span className="sr-only">Preço</span>
            <span className="block truncate text-lg font-bold tracking-tight text-ondjo-navy sm:text-xl">
              {formatKz(property.price, {
                perMonth: isArrendamento,
              })}
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-0.5 pb-0.5 text-xs font-semibold text-ondjo-blue transition-transform group-hover:translate-x-0.5">
            Ver detalhes
            <ChevronRight size={14} aria-hidden="true" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
