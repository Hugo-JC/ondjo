import { useRef } from "react";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { Property } from "../types";
import { formatKz } from "../utils/format";
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
      className="group relative flex min-w-0 w-full max-w-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-transparent transition-transform duration-300 hover:-translate-y-0.5 focus-ring"
    >
      <div className="relative overflow-hidden rounded-2xl bg-slate-100">
        <PropertyImageCarousel
          propertyId={property.id}
          images={property.images}
          title={property.title}
          aspectRatio="aspect-square"
          priority={index < 2}
          showLightboxButton={false}
        />

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[calc(100%-4rem)] flex-wrap items-center gap-1.5">
          {property.verified ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-md">
              <ShieldCheck
                size={13}
                className="shrink-0 text-ondjo-blue"
                aria-hidden="true"
              />
              <span>Verificado</span>
            </div>
          ) : property.featured ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-md">
              <Sparkles
                size={13}
                className="shrink-0 text-amber-500"
                aria-hidden="true"
              />
              <span>Destaque</span>
            </div>
          ) : null}

          <span className="inline-flex items-center rounded-full bg-ondjo-navy/85 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-md">
            {isArrendamento ? "Arrendar" : "Venda"}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className="focus-ring absolute right-2 top-2 z-20 flex size-11 items-center justify-center rounded-full text-white transition hover:scale-110 active:scale-90 cursor-pointer"
          aria-label={
            favorite
              ? `Remover ${property.title} dos favoritos`
              : `Guardar ${property.title} nos favoritos`
          }
          aria-pressed={favorite}
        >
          <Heart
            size={24}
            strokeWidth={2.5}
            className={`transition-colors duration-200 ${
              favorite
                ? "fill-ondjo-danger text-ondjo-danger drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                : "fill-black/20 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
            }`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-between px-0.5 pt-2.5">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3
              className="truncate text-sm font-semibold leading-5 text-slate-900"
              title={`${property.type} · ${property.neighborhood}, ${property.city}`}
            >
              {property.type} · {property.neighborhood}
            </h3>
          </div>

          <p
            className="mt-0.5 line-clamp-1 text-sm leading-5 text-slate-500"
            title={property.title}
          >
            {property.title}
          </p>

          <p className="mt-0.5 truncate text-sm leading-5 text-slate-500">
            {property.bedrooms > 0 ? `T${property.bedrooms} · ` : ""}
            {property.bathrooms > 0 ? `${property.bathrooms} WC · ` : ""}
            {property.area} m²
          </p>
        </div>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-1 text-sm text-slate-900">
          <span className="font-semibold">
            {formatKz(property.price, { perMonth: isArrendamento })}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
