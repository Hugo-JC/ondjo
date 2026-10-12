import { useRef } from "react";
import {
  BedDouble,
  ChevronRight,
  Heart,
  MapPin,
  Ruler,
  ShieldCheck,
  ShowerHead,
  Sparkles,
} from "lucide-react";
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
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-ondjo-border/80 bg-white shadow-ondjo-card hover:shadow-ondjo-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer focus-ring w-full max-w-full min-w-0"
    >
      <div className="relative overflow-hidden bg-slate-100">
        <PropertyImageCarousel
          propertyId={property.id}
          images={property.images}
          title={property.title}
          aspectRatio="aspect-[4/3]"
          priority={index < 2}
          showLightboxButton={false}
        />

        {/* Badges no topo esquerdo estilo Airbnb ("Preferido dos hóspedes") adaptado para ONDJO */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-60px)]">
          {property.verified ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-ondjo-navy shadow-xs backdrop-blur-md border border-white/60">
              <ShieldCheck size={13} className="text-ondjo-blue shrink-0" aria-hidden="true" />
              <span>Verificado</span>
            </div>
          ) : property.featured ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-ondjo-navy shadow-xs backdrop-blur-md border border-white/60">
              <Sparkles size={13} className="text-amber-500 shrink-0" aria-hidden="true" />
              <span>Destaque</span>
            </div>
          ) : null}

          <span className="inline-flex items-center rounded-full bg-ondjo-navy/85 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-md">
            {isArrendamento ? "Arrendar" : "Venda"}
          </span>
        </div>

        {/* Botão de Favoritos estilo Airbnb no topo direito (Toque mínimo >= 44px) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className="focus-ring absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur-xs transition hover:scale-110 hover:bg-white active:scale-90 cursor-pointer before:absolute before:-inset-2 before:content-['']"
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

      {/* Conteúdo Informativo do Imóvel com Hierarquia Estilo Airbnb */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          {/* Linha 1: Tipo e Localização (Estilo Airbnb: "Apartamento · Centro de Dubai") */}
          <div className="flex items-baseline justify-between gap-2">
            <h3
              className="font-bold text-[15px] sm:text-[16px] text-ondjo-navy leading-snug truncate group-hover:text-ondjo-blue transition-colors"
              title={`${property.type} · ${property.neighborhood}, ${property.city}`}
            >
              {property.type} · {property.neighborhood}
            </h3>
          </div>

          {/* Linha 2: Título do Anúncio / Descrição curta */}
          <p className="mt-0.5 text-xs text-ondjo-muted line-clamp-1" title={property.title}>
            {property.title}
          </p>

          {/* Linha 3: Especificações Limpas no Estilo Airbnb (T2 · 2 WC · 80 m²) */}
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble size={13} className="text-slate-400" aria-hidden="true" />
                <span>T{property.bedrooms}</span>
              </span>
            )}
            {property.bedrooms > 0 && property.bathrooms > 0 && (
              <span className="text-slate-300 select-none">·</span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <ShowerHead size={13} className="text-slate-400" aria-hidden="true" />
                <span>{property.bathrooms} WC</span>
              </span>
            )}
            <span className="text-slate-300 select-none">·</span>
            <span className="flex items-center gap-1">
              <Ruler size={13} className="text-slate-400" aria-hidden="true" />
              <span>{property.area} m²</span>
            </span>
          </div>
        </div>

        {/* Linha 4: Preço em Kz em grande destaque + Link para detalhes */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-baseline justify-between gap-1.5 flex-wrap">
          <div className="flex items-baseline gap-1">
            <span className="text-[17px] sm:text-[18px] font-bold text-ondjo-navy tracking-tight">
              {formatKz(property.price, { perMonth: isArrendamento })}
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
