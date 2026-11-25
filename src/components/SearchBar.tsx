import {
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { AMENITY_OPTIONS, type AmenityDefinition } from "../data/amenities";
import {
  AmenitiesSelector,
  ORIGIN_OPTIONS,
  OriginSelector,
  PriceDualRangeSlider,
  formatCompactKz,
  type OriginOption,
  type SearchOrigin,
} from "./FilterControls";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { locations, properties } from "../data/properties";
import { filterProperties } from "../utils/filterProperties";

export type SearchPurpose = "comprar" | "arrendar";
export type { SearchOrigin, OriginOption };
export { ORIGIN_OPTIONS, PriceDualRangeSlider };

export interface SearchFilters {
  query: string;
  location: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  purpose?: string;
  origin?: string;
  bathrooms?: string;
  parking?: string;
  amenities?: string[];
}

interface SearchBarProps {
  value: SearchFilters;
  onChange: (next: SearchFilters) => void;
  onSearch: () => void;
  compact?: boolean;
}

const emptyFilters: SearchFilters = {
  query: "",
  location: "",
  type: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  purpose: "comprar",
  origin: "todos",
  bathrooms: "",
  parking: "",
};

export const PURPOSE_OPTIONS: { id: SearchPurpose; label: string }[] = [
  { id: "comprar", label: "Comprar" },
  { id: "arrendar", label: "Arrendar" },
];

export type AmenityOption = AmenityDefinition;
export { AMENITY_OPTIONS };

export const PROPERTY_TYPES = [
  { value: "", label: "Todos os tipos" },
  { value: "Apartamento", label: "Apartamento" },
  { value: "Casa", label: "Casa" },
  { value: "Moradia", label: "Vivenda / Moradia" },
  { value: "Terreno", label: "Terreno" },
];

export const BEDROOM_OPTIONS = [
  { value: "", label: "Qualquer" },
  { value: "0", label: "T0" },
  { value: "1", label: "T1" },
  { value: "2", label: "T2" },
  { value: "3", label: "T3" },
  { value: "4", label: "T4" },
  { value: "5", label: "T5+" },
];

export const BATHROOM_OPTIONS = [
  { value: "", label: "Qualquer" },
  { value: "1", label: "1+ WC" },
  { value: "2", label: "2+ WC" },
  { value: "3", label: "3+ WC" },
  { value: "4", label: "4+ WC" },
];

function getAmenitiesSummary(
  bedrooms?: string,
  bathrooms?: string,
  parking?: string,
  amenities: string[] = [],
): string {
  const parts: string[] = [];
  if (bedrooms && bedrooms !== "0") parts.push(`T${bedrooms}`);
  if (bathrooms && bathrooms !== "0") parts.push(`${bathrooms} WC`);
  if (parking && parking !== "0")
    parts.push(`${parking} vaga${Number(parking) > 1 ? "s" : ""}`);
  if (amenities.length > 0) {
    if (parts.length === 0) {
      return `${amenities.length} comodidade${amenities.length > 1 ? "s" : ""}`;
    }
    parts.push(`+${amenities.length}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Quartos e preferências";
}

export function defaultSearchFilters(): SearchFilters {
  return { ...emptyFilters };
}

type ActiveSegment = "location" | "type" | "amenities" | "price" | null;

export function SearchBar({
  value,
  onChange,
  onSearch,
  compact = false,
}: SearchBarProps) {
  const [activeSegment, setActiveSegment] = useState<ActiveSegment>(null);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    value.amenities || [],
  );

  useEffect(() => {
    setSelectedAmenities(value.amenities || []);
  }, [value.amenities]);

  const toggleAmenity = (amenity: string) => {
    const next = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(next);
    onChange({ ...value, amenities: next });
  };

  const reduceMotion = useReducedMotion();
  const barRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const sheetCloseRef = useRef<HTMLButtonElement>(null);

  const locationId = useId();

  // Fechar dropdowns ao clicar fora em desktop
  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setActiveSegment(null);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  // Bloqueio de scroll do body quando o sheet mobile está aberto
  useEffect(() => {
    if (!mobileModalOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileModalOpen(false);
    };
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", handleEsc);
    };
  }, [mobileModalOpen]);

  const set = (key: keyof SearchFilters, next: unknown) => {
    onChange({ ...value, [key]: next });
  };

  const currentPurpose = value.purpose || "comprar";
  const currentOrigin = (value.origin || "todos") as SearchOrigin;

  // Contagem de filtros ativos (excluindo purpose padrão e origin=todos)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (value.location || value.query) count++;
    if (value.type) count++;
    if (value.bedrooms) count++;
    if (value.bathrooms) count++;
    if (value.parking) count++;
    if (value.minPrice || value.maxPrice) count++;
    if (value.origin && value.origin !== "todos") count++;
    if (value.amenities && value.amenities.length > 0) count += value.amenities.length;
    return count;
  }, [value]);

  // Contagem dinâmica usando o filtro partilhado
  const matchingCount = useMemo(() => {
    return filterProperties(properties, {
      ...value,
      query: value.query || value.location,
    }).length;
  }, [value]);

  const searchText = value.location || value.query;

  const filteredLocations = locations
    .filter((loc) =>
      loc.toLowerCase().includes(searchText.trim().toLowerCase()),
    )
    .slice(0, 8);

  const clearAllFilters = () => {
    onChange({
      ...emptyFilters,
      purpose: currentPurpose,
    });
    setActiveSegment(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setActiveSegment(null);
    setMobileModalOpen(false);
    onSearch();
  };

  // Obter label curta da origem selecionada
  const activeOriginOption = ORIGIN_OPTIONS.find((o) => o.id === currentOrigin) || ORIGIN_OPTIONS[0];

  return (
    <div
      ref={barRef}
      className={[
        "relative w-full text-left",
        compact ? "max-w-3xl mx-auto" : "",
      ].join(" ")}
    >
      {/* ========================================================
          CABEÇALHO DA BUSCA MOBILE (MODERNO, CONSISTENTE, MOBILE-FIRST)
          Linha 1: Segmented Control Comprar | Arrendar (Largura total, toque mínimo 44px)
          Linha 2: Régua horizontal de ORIGIN_OPTIONS com scroll suave e ícones consistentes
         ======================================================== */}
      <div className="mb-3 flex flex-col gap-2.5 md:hidden">
        {/* Linha 1 Mobile: Comprar / Arrendar */}
        <div
          role="tablist"
          aria-label="Modalidade de negócio"
          className="grid grid-cols-2 w-full rounded-2xl bg-slate-100 p-1 border border-ondjo-border/80 shadow-2xs"
        >
          {PURPOSE_OPTIONS.map((opt) => {
            const isSelected = currentPurpose === opt.id;
            return (
              <button
                key={opt.id}
                role="tab"
                type="button"
                aria-selected={isSelected}
                onClick={() => set("purpose", opt.id)}
                className={[
                  "flex min-h-11 items-center justify-center rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer",
                  isSelected
                    ? "bg-white text-ondjo-navy shadow-xs font-black"
                    : "text-slate-600 hover:text-ondjo-ink",
                ].join(" ")}
              >
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Linha 2 Mobile: Régua de ORIGIN_OPTIONS com scroll horizontal suave */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-0.5 px-0.5 -mx-0.5">
          {ORIGIN_OPTIONS.map((opt) => {
            const isSelected = currentOrigin === opt.id;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => set("origin", opt.id)}
                className={[
                  "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors duration-150 cursor-pointer active:scale-95",
                  isSelected
                    ? opt.id === "verificados"
                      ? "border-emerald-500/50 bg-emerald-50 text-emerald-900 font-bold shadow-2xs"
                      : opt.id === "proprietario"
                        ? "border-ondjo-blue bg-ondjo-blue-soft text-ondjo-blue font-bold shadow-2xs"
                        : opt.id === "agentes"
                          ? "border-indigo-400 bg-indigo-50 text-indigo-900 font-bold shadow-2xs"
                          : "border-ondjo-navy bg-ondjo-navy text-white font-bold shadow-2xs"
                    : "border-slate-200/90 bg-white text-slate-700 hover:border-slate-300",
                ].join(" ")}
              >
                <Icon
                  size={14}
                  className={[
                    "shrink-0",
                    isSelected
                      ? opt.id === "verificados"
                        ? "text-emerald-700"
                        : opt.id === "proprietario"
                          ? "text-ondjo-blue"
                          : opt.id === "agentes"
                            ? "text-indigo-700"
                            : "text-white"
                      : "text-slate-400",
                  ].join(" ")}
                  aria-hidden="true"
                />
                <span>{opt.shortLabel}</span>
              </button>
            );
          })}

          {/* Botão Todos os Filtros com Badge */}
          <button
            type="button"
            onClick={() => setMobileModalOpen(true)}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 text-xs font-bold text-ondjo-ink active:scale-95 cursor-pointer hover:bg-slate-50"
          >
            <SlidersHorizontal
              size={13}
              className="text-ondjo-blue"
              aria-hidden="true"
            />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="grid size-4.5 place-items-center rounded-full bg-ondjo-navy text-[10px] font-black text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================
          CABEÇALHO DA BUSCA: DESKTOP (LINHA ÚNICA DISTRIBUÍDA)
         ======================================================== */}
      <div className="hidden md:flex mb-3.5 items-center justify-between px-2 sm:px-4">
        {/* Tabs Comprar / Arrendar */}
        <div
          role="tablist"
          aria-label="Modalidade de negócio"
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 p-1 border border-slate-200/60 shadow-xs"
        >
          {PURPOSE_OPTIONS.map((opt) => {
            const isSelected = currentPurpose === opt.id;
            return (
              <button
                key={opt.id}
                role="tab"
                type="button"
                aria-selected={isSelected}
                onClick={() => set("purpose", opt.id)}
                className={[
                  "relative flex min-h-8.5 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-colors duration-150 cursor-pointer",
                  isSelected
                    ? "bg-white text-ondjo-navy shadow-sm"
                    : "text-slate-600 hover:text-ondjo-ink",
                ].join(" ")}
              >
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Régua de ORIGIN_OPTIONS no Desktop */}
        <div className="flex items-center gap-1.5">
          {ORIGIN_OPTIONS.map((orig) => {
            const isSelected = currentOrigin === orig.id;
            const Icon = orig.icon;

            return (
              <button
                key={orig.id}
                type="button"
                onClick={() => set("origin", orig.id)}
                className={[
                  "inline-flex min-h-8.5 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors duration-150 cursor-pointer",
                  isSelected
                    ? orig.id === "verificados"
                      ? "border-emerald-500/40 bg-emerald-50 text-emerald-900 font-bold shadow-xs"
                      : orig.id === "proprietario"
                        ? "border-ondjo-blue bg-ondjo-blue-soft text-ondjo-blue font-bold shadow-xs"
                        : orig.id === "agentes"
                          ? "border-indigo-300 bg-indigo-50 text-indigo-900 font-bold shadow-xs"
                          : "border-ondjo-navy bg-ondjo-navy text-white font-bold shadow-xs"
                    : "border-slate-200/80 bg-white/90 text-slate-600 hover:border-slate-300 hover:text-ondjo-ink",
                ].join(" ")}
              >
                <Icon
                  size={14}
                  aria-hidden="true"
                  className={
                    isSelected
                      ? orig.id === "todos"
                        ? "text-white"
                        : orig.id === "verificados"
                          ? "text-emerald-700"
                          : orig.id === "proprietario"
                            ? "text-ondjo-blue"
                            : "text-indigo-700"
                      : "text-slate-400"
                  }
                />
                <span>{orig.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          DESKTOP: GRANDE BARRA EM PÍLULA FLUTUANTE (AIRBNB STYLE)
         ======================================================== */}
      <div className="hidden md:block">
        <div
          className={[
            "relative z-30 flex items-center rounded-full bg-white transition-[background-color,box-shadow] duration-150",
            "border border-slate-200/80 shadow-[0_16px_40px_rgba(16,42,67,0.08)] hover:shadow-[0_20px_50px_rgba(16,42,67,0.14)]",
            activeSegment ? "bg-slate-50/50" : "",
          ].join(" ")}
        >
          {/* SEGMENTO 1: ONDE */}
          <button
            type="button"
            onClick={() => {
              setActiveSegment(
                activeSegment === "location" ? null : "location",
              );
              requestAnimationFrame(() => locationInputRef.current?.focus());
            }}
            className={[
              "group relative flex-1 rounded-full px-6 py-3.5 text-left transition-[background-color,box-shadow] duration-150 cursor-pointer",
              activeSegment === "location"
                ? "bg-white shadow-[0_8px_24px_rgba(16,42,67,0.12)] z-20 ring-1 ring-slate-200"
                : "hover:bg-slate-100/70",
            ].join(" ")}
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Onde
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold text-ondjo-ink">
              {searchText || "Explorar Luanda ou zonas"}
            </span>
          </button>

          <div
            className={`h-8 w-px bg-slate-200/80 shrink-0 transition-opacity duration-150 ${
              activeSegment === "location" || activeSegment === "type"
                ? "opacity-0"
                : "opacity-100"
            }`}
          />

          {/* SEGMENTO 2: TIPO */}
          <button
            type="button"
            onClick={() =>
              setActiveSegment(activeSegment === "type" ? null : "type")
            }
            className={[
              "group relative flex-1 rounded-full px-6 py-3.5 text-left transition-[background-color,box-shadow] duration-150 cursor-pointer",
              activeSegment === "type"
                ? "bg-white shadow-[0_8px_24px_rgba(16,42,67,0.12)] z-20 ring-1 ring-slate-200"
                : "hover:bg-slate-100/70",
            ].join(" ")}
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tipo de Imóvel
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold text-ondjo-ink">
              {value.type || "Todos os tipos"}
            </span>
          </button>

          <div
            className={`h-8 w-px bg-slate-200/80 shrink-0 transition-opacity duration-150 ${
              activeSegment === "type" || activeSegment === "amenities"
                ? "opacity-0"
                : "opacity-100"
            }`}
          />

          {/* SEGMENTO 3: COMODIDADES */}
          <button
            type="button"
            onClick={() =>
              setActiveSegment(
                activeSegment === "amenities" ? null : "amenities",
              )
            }
            className={[
              "group relative flex-1 rounded-full px-6 py-3.5 text-left transition-[background-color,box-shadow] duration-150 cursor-pointer",
              activeSegment === "amenities"
                ? "bg-white shadow-[0_8px_24px_rgba(16,42,67,0.12)] z-20 ring-1 ring-slate-200"
                : "hover:bg-slate-100/70",
            ].join(" ")}
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Comodidades
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold text-ondjo-ink">
              {getAmenitiesSummary(
                value.bedrooms,
                value.bathrooms,
                value.parking,
                selectedAmenities,
              )}
            </span>
          </button>

          <div
            className={`h-8 w-px bg-slate-200/80 shrink-0 transition-opacity duration-150 ${
              activeSegment === "amenities" || activeSegment === "price"
                ? "opacity-0"
                : "opacity-100"
            }`}
          />

          {/* SEGMENTO 4: ORÇAMENTO */}
          <button
            type="button"
            onClick={() =>
              setActiveSegment(activeSegment === "price" ? null : "price")
            }
            className={[
              "group relative flex-1 rounded-full px-6 py-3.5 text-left transition-[background-color,box-shadow] duration-150 cursor-pointer",
              activeSegment === "price"
                ? "bg-white shadow-[0_8px_24px_rgba(16,42,67,0.12)] z-20 ring-1 ring-slate-200"
                : "hover:bg-slate-100/70",
            ].join(" ")}
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Orçamento
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold text-ondjo-ink tabular-nums">
              {value.maxPrice
                ? `Até ${formatCompactKz(Number(value.maxPrice))}`
                : value.minPrice
                  ? `Desde ${formatCompactKz(Number(value.minPrice))}`
                  : "Sem limite"}
            </span>
          </button>

          {/* BOTÃO PRINCIPAL */}
          <div className="p-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="flex min-h-12 items-center gap-2 rounded-full bg-ondjo-blue hover:bg-ondjo-blue-dark active:scale-95 px-6 py-3 font-bold text-white shadow-md transition-[background-color,box-shadow,transform] duration-150 cursor-pointer hover:shadow-lg"
              aria-label="Pesquisar imóveis"
            >
              <Search size={18} aria-hidden="true" className="shrink-0" />
              <span className="whitespace-nowrap text-sm">
                {matchingCount > 0 ? `Ver ${matchingCount}` : "Pesquisar"}
              </span>
            </button>
          </div>
        </div>

        {/* POPOVERS DESKTOP */}
        <AnimatePresence>
          {activeSegment === "location" && (
            <m.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: reduceMotion ? 0 : 0.1, ease: "easeOut" }}
              className="absolute left-0 top-full mt-3 w-96 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_50px_rgba(16,42,67,0.22)] z-50"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin size={18} className="text-ondjo-blue shrink-0" />
                <input
                  ref={locationInputRef}
                  id={locationId}
                  type="text"
                  value={searchText}
                  onChange={(e) => {
                    onChange({ ...value, location: "", query: e.target.value });
                  }}
                  placeholder="Pesquisar município ou bairro..."
                  className="w-full bg-transparent text-sm font-semibold text-ondjo-ink outline-none placeholder:text-slate-400"
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ ...value, location: "", query: "" })
                    }
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="mt-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {searchText
                    ? "Zonas correspondentes"
                    : "Zonas populares em Luanda"}
                </span>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {(filteredLocations.length > 0
                    ? filteredLocations
                    : [
                        "Talatona",
                        "Kilamba",
                        "Maianga",
                        "Benfica",
                        "Camama",
                        "Viana",
                        "Alvalade",
                        "Miramar",
                      ]
                  ).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        onChange({ ...value, location: loc, query: "" });
                        setActiveSegment("type");
                      }}
                      className={[
                        "flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-left transition-colors duration-150 cursor-pointer",
                        value.location === loc
                          ? "bg-ondjo-blue-soft text-ondjo-blue font-bold"
                          : "text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{loc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </m.div>
          )}

          {activeSegment === "type" && (
            <m.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: reduceMotion ? 0 : 0.1, ease: "easeOut" }}
              className="absolute left-1/4 top-full mt-3 w-80 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_20px_50px_rgba(16,42,67,0.22)] z-50"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                Selecione o tipo
              </span>
              <div className="space-y-1">
                {PROPERTY_TYPES.map((t) => {
                  const isSelected = value.type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        set("type", t.value);
                        setActiveSegment("amenities");
                      }}
                      className={[
                        "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150 cursor-pointer",
                        isSelected
                          ? "bg-ondjo-blue text-white shadow-xs font-bold"
                          : "text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <span>{t.label}</span>
                      {isSelected && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
            </m.div>
          )}

          {activeSegment === "amenities" && (
            <m.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: reduceMotion ? 0 : 0.1, ease: "easeOut" }}
              className="absolute left-1/2 top-full mt-3 w-[25rem] sm:w-[29rem] max-w-[94vw] -translate-x-1/2 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-[0_20px_50px_rgba(16,42,67,0.2)] z-50 max-h-[82vh] overflow-y-auto no-scrollbar"
            >
              <div className="space-y-5">
                {/* Tipologia & Espaços limpos */}
                <div className="divide-y divide-slate-100">
                  <div className="flex items-center justify-between pb-3">
                    <div>
                      <span className="block text-sm font-semibold text-ondjo-navy">
                        Quartos
                      </span>
                      <span className="text-xs text-ondjo-muted">
                        Tipologia (T1 a T5+)
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const cur = parseInt(value.bedrooms || "0", 10);
                          const next = Math.max(0, cur - 1);
                          set("bedrooms", next === 0 ? "" : String(next));
                        }}
                        className="focus-ring grid size-8 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue transition-colors active:scale-90 cursor-pointer"
                        aria-label="Diminuir quartos"
                      >
                        <Minus size={14} strokeWidth={2.2} />
                      </button>
                      <span className="w-14 text-center text-xs font-bold text-ondjo-navy tabular-nums">
                        {value.bedrooms ? `T${value.bedrooms}` : "Qualquer"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = parseInt(value.bedrooms || "0", 10);
                          set("bedrooms", String(cur + 1));
                        }}
                        className="focus-ring grid size-8 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue transition-colors active:scale-90 cursor-pointer"
                        aria-label="Aumentar quartos"
                      >
                        <Plus size={14} strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="block text-sm font-semibold text-ondjo-navy">
                        Casas de banho
                      </span>
                      <span className="text-xs text-ondjo-muted">
                        Mínimo de WC
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const cur = parseInt(value.bathrooms || "0", 10);
                          const next = Math.max(0, cur - 1);
                          set("bathrooms", next === 0 ? "" : String(next));
                        }}
                        className="focus-ring grid size-8 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue transition-colors active:scale-90 cursor-pointer"
                        aria-label="Diminuir casas de banho"
                      >
                        <Minus size={14} strokeWidth={2.2} />
                      </button>
                      <span className="w-14 text-center text-xs font-bold text-ondjo-navy tabular-nums">
                        {value.bathrooms ? `${value.bathrooms}+` : "Qualquer"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = parseInt(value.bathrooms || "0", 10);
                          set("bathrooms", String(cur + 1));
                        }}
                        className="focus-ring grid size-8 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue transition-colors active:scale-90 cursor-pointer"
                        aria-label="Aumentar casas de banho"
                      >
                        <Plus size={14} strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <span className="block text-sm font-semibold text-ondjo-navy">
                        Estacionamento
                      </span>
                      <span className="text-xs text-ondjo-muted">
                        Vagas privativas
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const cur = parseInt(value.parking || "0", 10);
                          const next = Math.max(0, cur - 1);
                          set("parking", next === 0 ? "" : String(next));
                        }}
                        className="focus-ring grid size-8 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue transition-colors active:scale-90 cursor-pointer"
                        aria-label="Diminuir vagas"
                      >
                        <Minus size={14} strokeWidth={2.2} />
                      </button>
                      <span className="w-14 text-center text-xs font-bold text-ondjo-navy tabular-nums">
                        {value.parking ? `${value.parking}+` : "Qualquer"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = parseInt(value.parking || "0", 10);
                          set("parking", String(cur + 1));
                        }}
                        className="focus-ring grid size-8 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue transition-colors active:scale-90 cursor-pointer"
                        aria-label="Aumentar vagas"
                      >
                        <Plus size={14} strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grelha compacta de Comodidades */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-ondjo-navy">
                      Comodidades
                      {selectedAmenities.length > 0 &&
                        ` (${selectedAmenities.length})`}
                    </span>
                    {selectedAmenities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAmenities([]);
                          onChange({ ...value, amenities: [] });
                        }}
                        className="text-xs font-semibold text-ondjo-blue hover:underline cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  <AmenitiesSelector
                    selected={selectedAmenities}
                    onToggle={toggleAmenity}
                  />
                </div>

                {/* Rodapé */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAmenities([]);
                      onChange({
                        ...value,
                        bedrooms: "",
                        bathrooms: "",
                        parking: "",
                        amenities: [],
                      });
                    }}
                    className="text-xs font-semibold text-ondjo-muted hover:text-ondjo-navy transition-colors cursor-pointer"
                  >
                    Limpar tudo
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSegment(null)}
                    className="rounded-xl bg-ondjo-navy hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 transition-colors active:scale-95 cursor-pointer"
                  >
                    Concluído
                  </button>
                </div>
              </div>
            </m.div>
          )}

          {activeSegment === "price" && (
            <m.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: reduceMotion ? 0 : 0.1, ease: "easeOut" }}
              className="absolute right-0 top-full mt-3 w-[23rem] sm:w-[25rem] max-w-[92vw] rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_20px_50px_rgba(16,42,67,0.2)] z-50"
            >
              <PriceDualRangeSlider
                purpose={value.purpose}
                minPrice={value.minPrice}
                maxPrice={value.maxPrice}
                onChangeMin={(min) => set("minPrice", min)}
                onChangeMax={(max) => set("maxPrice", max)}
              />

              <button
                type="button"
                onClick={() => handleSubmit()}
                className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-ondjo-blue font-bold text-xs text-white hover:bg-ondjo-blue-dark transition-colors cursor-pointer"
              >
                Ver{" "}
                {matchingCount > 0 ? `${matchingCount} imóveis` : "Resultados"}
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================
          MOBILE: BARRA TOUCH COMPACTA EM PÍLULA (MODERNO E ELEGANTE)
         ======================================================== */}
      <div className="block md:hidden">
        <button
          type="button"
          onClick={() => setMobileModalOpen(true)}
          className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-ondjo-border/90 bg-white p-2.5 shadow-[0_8px_24px_rgba(16,42,67,0.08)] active:scale-[0.99] transition-[transform,box-shadow] duration-150 cursor-pointer text-left"
          aria-label="Abrir filtros de pesquisa de imóveis"
        >
          <div className="flex size-10.5 items-center justify-center rounded-xl bg-ondjo-blue text-white shadow-xs shrink-0">
            <Search size={18} aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-ondjo-ink truncate flex items-center gap-1.5">
              {searchText ? (
                <>
                  <MapPin size={13} className="text-ondjo-blue shrink-0" />
                  <span className="truncate">{searchText}</span>
                </>
              ) : (
                "Onde quer procurar?"
              )}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 truncate mt-0.5">
              <span>{value.type || "Todos os tipos"}</span>
              <span>·</span>
              <span>{value.bedrooms ? `T${value.bedrooms}` : "Qualquer T"}</span>
              {currentOrigin !== "todos" && (
                <>
                  <span>·</span>
                  <span className="font-bold text-ondjo-blue flex items-center gap-0.5">
                    {activeOriginOption.shortLabel}
                  </span>
                </>
              )}
              {value.maxPrice && (
                <>
                  <span>·</span>
                  <span className="font-bold text-ondjo-navy">
                    Até {formatCompactKz(Number(value.maxPrice))}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="relative flex size-9 items-center justify-center rounded-xl border border-slate-200/90 text-slate-600 shrink-0">
            <SlidersHorizontal size={15} aria-hidden="true" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-ondjo-navy text-[9px] font-black text-white shadow-xs">
                {activeFiltersCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* ========================================================
          BOTTOM SHEET MOBILE VIA PORTAL COM SUPORTE TOTAL A ORIGIN_OPTIONS
         ======================================================== */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {mobileModalOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Filtros de pesquisa"
                className="fixed inset-0 z-100 flex flex-col justify-end bg-black/55"
              >
                {/* Backdrop clicável */}
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.14 }}
                  onClick={() => setMobileModalOpen(false)}
                  className="fixed inset-0 cursor-pointer"
                  aria-hidden="true"
                />

                {/* Sheet limpo e simplificado no estilo ONDJO */}
                <m.div
                  initial={{ y: 36, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 24, opacity: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.16,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative z-10 flex max-h-[90dvh] w-full max-w-xl mx-auto flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl pb-safe"
                >
                  {/* Traço indicador de arrasto */}
                  <div className="pt-3 pb-1 flex justify-center shrink-0">
                    <div className="h-1 w-10 rounded-full bg-slate-300" />
                  </div>

                  {/* Cabeçalho Fixo do Sheet */}
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-3.5 shrink-0">
                    <div>
                      <h3 className="text-base font-bold tracking-tight text-ondjo-navy">
                        Filtrar pesquisa
                      </h3>
                      <p className="text-xs text-ondjo-muted tabular-nums">
                        {matchingCount}{" "}
                        {matchingCount === 1
                          ? "imóvel disponível"
                          : "imóveis disponíveis"}
                      </p>
                    </div>
                    <button
                      ref={sheetCloseRef}
                      type="button"
                      onClick={() => setMobileModalOpen(false)}
                      aria-label="Fechar filtros"
                      className="focus-ring grid size-10 place-items-center rounded-full bg-slate-100 text-ondjo-ink hover:bg-slate-200 active:scale-95 transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Conteúdo com Espaço para Respirar */}
                  <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6 overscroll-contain">
                    {/* 1. Modalidade (Segmented Control limpo) */}
                    <div>
                      <span className="block text-xs font-bold text-ondjo-navy mb-2">
                        Modalidade
                      </span>
                      <div
                        role="group"
                        aria-label="Modalidade do imóvel"
                        className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1"
                      >
                        {PURPOSE_OPTIONS.map((opt) => {
                          const isSelected = currentPurpose === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => set("purpose", opt.id)}
                              className={[
                                "focus-ring flex min-h-10 items-center justify-center rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer",
                                isSelected
                                  ? "bg-white text-ondjo-navy shadow-xs"
                                  : "text-ondjo-muted hover:text-ondjo-ink",
                              ].join(" ")}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Localização */}
                    <div className="border-t border-slate-100 pt-5">
                      <label className="block text-xs font-bold text-ondjo-navy mb-2">
                        Localização em Luanda
                      </label>
                      <div className="relative flex items-center">
                        <MapPin
                          size={16}
                          className="pointer-events-none absolute left-3.5 text-slate-400"
                        />
                        <input
                          type="text"
                          value={searchText}
                          onChange={(e) =>
                            onChange({
                              ...value,
                              location: "",
                              query: e.target.value,
                            })
                          }
                          placeholder="Ex.: Talatona, Maianga, Kilamba..."
                          className="filter-input pl-10 pr-9"
                        />
                        {searchText && (
                          <button
                            type="button"
                            onClick={() =>
                              onChange({ ...value, location: "", query: "" })
                            }
                            aria-label="Limpar localização"
                            className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-ondjo-ink cursor-pointer"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {[
                          "Talatona",
                          "Kilamba",
                          "Maianga",
                          "Benfica",
                          "Camama",
                          "Viana",
                          "Alvalade",
                          "Miramar",
                        ].map((loc) => {
                          const isSel = value.location === loc;
                          return (
                            <button
                              key={loc}
                              type="button"
                              onClick={() =>
                                onChange({
                                  ...value,
                                  location: isSel ? "" : loc,
                                  query: "",
                                })
                              }
                              className={[
                                "focus-ring min-h-8.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-150 cursor-pointer",
                                isSel
                                  ? "border-ondjo-navy bg-ondjo-navy text-white"
                                  : "border-ondjo-border bg-white text-ondjo-ink hover:bg-slate-50",
                              ].join(" ")}
                            >
                              {loc}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Tipo de Imóvel */}
                    <div className="border-t border-slate-100 pt-5">
                      <span className="block text-xs font-bold text-ondjo-navy mb-2">
                        Tipo de imóvel
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PROPERTY_TYPES.map((t) => {
                          const isSelected = value.type === t.value;
                          return (
                            <button
                              key={t.value}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => set("type", t.value)}
                              className={[
                                "focus-ring flex min-h-10.5 items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition-colors duration-150 cursor-pointer",
                                isSelected
                                  ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue font-bold ring-1 ring-ondjo-blue/20"
                                  : "border-ondjo-border bg-white text-ondjo-ink hover:bg-slate-50",
                              ].join(" ")}
                            >
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 4. Origem do Anúncio (Unificada e Simples) */}
                    <div className="border-t border-slate-100 pt-5">
                      <span className="block text-xs font-bold text-ondjo-navy mb-2">
                        Origem do anúncio
                      </span>
                      <OriginSelector
                        value={currentOrigin}
                        onChange={(orig) => set("origin", orig)}
                      />
                    </div>

                    {/* 5. Preço em Kwanzas (Kz) */}
                    <div className="border-t border-slate-100 pt-5">
                      <PriceDualRangeSlider
                        purpose={value.purpose}
                        minPrice={value.minPrice}
                        maxPrice={value.maxPrice}
                        onChangeMin={(min) => set("minPrice", min)}
                        onChangeMax={(max) => set("maxPrice", max)}
                      />
                    </div>

                    {/* 6. Divisões & Espaços */}
                    <div className="border-t border-slate-100 pt-5">
                      <span className="block text-xs font-bold text-ondjo-navy mb-2">
                        Divisões e vagas
                      </span>

                      <div className="divide-y divide-slate-100">
                        <div className="flex items-center justify-between py-2.5">
                          <span className="text-xs sm:text-sm font-medium text-ondjo-ink">
                            Quartos
                          </span>
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                const cur = parseInt(value.bedrooms || "0", 10);
                                const next = Math.max(0, cur - 1);
                                set("bedrooms", next === 0 ? "" : String(next));
                              }}
                              aria-label="Diminuir quartos"
                              className="focus-ring grid size-8.5 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue active:scale-90 transition-colors cursor-pointer"
                            >
                              <Minus size={14} strokeWidth={2.2} />
                            </button>
                            <span className="w-14 text-center text-xs font-bold text-ondjo-navy tabular-nums">
                              {value.bedrooms ? `T${value.bedrooms}` : "Qualquer"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const cur = parseInt(value.bedrooms || "0", 10);
                                set("bedrooms", String(cur + 1));
                              }}
                              aria-label="Aumentar quartos"
                              className="focus-ring grid size-8.5 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue active:scale-90 transition-colors cursor-pointer"
                            >
                              <Plus size={14} strokeWidth={2.2} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between py-2.5">
                          <span className="text-xs sm:text-sm font-medium text-ondjo-ink">
                            Casas de banho
                          </span>
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                const cur = parseInt(value.bathrooms || "0", 10);
                                const next = Math.max(0, cur - 1);
                                set("bathrooms", next === 0 ? "" : String(next));
                              }}
                              aria-label="Diminuir casas de banho"
                              className="focus-ring grid size-8.5 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue active:scale-90 transition-colors cursor-pointer"
                            >
                              <Minus size={14} strokeWidth={2.2} />
                            </button>
                            <span className="w-14 text-center text-xs font-bold text-ondjo-navy tabular-nums">
                              {value.bathrooms ? `${value.bathrooms}+` : "Qualquer"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const cur = parseInt(value.bathrooms || "0", 10);
                                set("bathrooms", String(cur + 1));
                              }}
                              aria-label="Aumentar casas de banho"
                              className="focus-ring grid size-8.5 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue active:scale-90 transition-colors cursor-pointer"
                            >
                              <Plus size={14} strokeWidth={2.2} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between py-2.5">
                          <span className="text-xs sm:text-sm font-medium text-ondjo-ink">
                            Estacionamento
                          </span>
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                const cur = parseInt(value.parking || "0", 10);
                                const next = Math.max(0, cur - 1);
                                set("parking", next === 0 ? "" : String(next));
                              }}
                              aria-label="Diminuir vagas"
                              className="focus-ring grid size-8.5 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue active:scale-90 transition-colors cursor-pointer"
                            >
                              <Minus size={14} strokeWidth={2.2} />
                            </button>
                            <span className="w-14 text-center text-xs font-bold text-ondjo-navy tabular-nums">
                              {value.parking ? `${value.parking}+` : "Qualquer"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const cur = parseInt(value.parking || "0", 10);
                                set("parking", String(cur + 1));
                              }}
                              aria-label="Aumentar vagas"
                              className="focus-ring grid size-8.5 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue active:scale-90 transition-colors cursor-pointer"
                            >
                              <Plus size={14} strokeWidth={2.2} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 7. Comodidades Compactas */}
                    <div className="border-t border-slate-100 pt-5">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold text-ondjo-navy">
                          Comodidades
                          {selectedAmenities.length > 0 &&
                            ` (${selectedAmenities.length})`}
                        </span>
                        {selectedAmenities.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAmenities([]);
                              onChange({ ...value, amenities: [] });
                            }}
                            className="text-xs font-semibold text-ondjo-blue hover:underline cursor-pointer"
                          >
                            Limpar
                          </button>
                        )}
                      </div>

                      <AmenitiesSelector
                        selected={selectedAmenities}
                        onToggle={toggleAmenity}
                      />
                    </div>
                  </div>

                  {/* Rodapé Fixo do Sheet */}
                  <div className="shrink-0 border-t border-slate-100 bg-white px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="focus-ring min-h-11 px-3 rounded-xl text-xs font-bold text-ondjo-muted hover:text-ondjo-navy active:scale-95 transition-colors cursor-pointer"
                    >
                      Limpar tudo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmit()}
                      className="focus-ring flex-1 min-h-11 rounded-xl bg-ondjo-blue px-5 text-center text-sm font-bold text-white shadow-sm active:scale-98 cursor-pointer hover:bg-ondjo-blue-dark transition-colors tabular-nums"
                    >
                      {matchingCount > 0
                        ? `Mostrar ${matchingCount} ${matchingCount === 1 ? "imóvel" : "imóveis"}`
                        : "Pesquisar imóveis"}
                    </button>
                  </div>
                </m.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
