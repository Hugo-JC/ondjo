import {
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
  Check,
  Minus,
  Plus,
  BedDouble,
  Bath,
  Car,
  UserCheck,
  Building2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { AMENITY_OPTIONS, type AmenityDefinition } from "../data/amenities";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { locations, properties } from "../data/properties";
import { filterProperties } from "../utils/filterProperties";

export type SearchPurpose = "comprar" | "arrendar";

export type SearchOrigin =
  | "todos"
  | "verificados"
  | "proprietario"
  | "agentes"
  | "particulares";

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

export interface OriginOption {
  id: SearchOrigin;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

export const ORIGIN_OPTIONS: OriginOption[] = [
  {
    id: "todos",
    label: "Todos os anúncios",
    shortLabel: "Todos",
    description: "Todos os imóveis disponíveis em Luanda",
    icon: Sparkles,
  },
  {
    id: "verificados",
    label: "Verificados ONDJO",
    shortLabel: "Verificados",
    description: "Documentação e titularidade auditadas",
    icon: ShieldCheck,
    badge: "Auditado",
  },
  {
    id: "proprietario",
    label: "Direto com Proprietário",
    shortLabel: "Proprietário",
    description: "Sem taxa de agência ou intermediários",
    icon: UserCheck,
    badge: "Direto",
  },
  {
    id: "agentes",
    label: "Agências & Corretores",
    shortLabel: "Agências",
    description: "Imobiliárias e corretores credenciados",
    icon: Building2,
    badge: "Profissional",
  },
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
          className="grid grid-cols-2 w-full rounded-2xl bg-slate-100/90 p-1 backdrop-blur-xs border border-ondjo-border/80 shadow-2xs"
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
                  "flex min-h-11 items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer",
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
                  "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-all cursor-pointer active:scale-95",
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
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/90 p-1 backdrop-blur-xs border border-slate-200/60 shadow-xs"
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
                  "relative flex min-h-8.5 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-all cursor-pointer",
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
                  "inline-flex min-h-8.5 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-all cursor-pointer",
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
            "relative z-30 flex items-center rounded-full bg-white transition-all duration-300",
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
              setTimeout(() => locationInputRef.current?.focus(), 50);
            }}
            className={[
              "group relative flex-1 rounded-full px-6 py-3.5 text-left transition-all cursor-pointer",
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
            className={`h-8 w-px bg-slate-200/80 shrink-0 transition-opacity ${
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
              "group relative flex-1 rounded-full px-6 py-3.5 text-left transition-all cursor-pointer",
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
            className={`h-8 w-px bg-slate-200/80 shrink-0 transition-opacity ${
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
              "group relative flex-1 rounded-full px-6 py-3.5 text-left transition-all cursor-pointer",
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
            className={`h-8 w-px bg-slate-200/80 shrink-0 transition-opacity ${
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
              "group relative flex-1 rounded-full px-6 py-3.5 text-left transition-all cursor-pointer",
              activeSegment === "price"
                ? "bg-white shadow-[0_8px_24px_rgba(16,42,67,0.12)] z-20 ring-1 ring-slate-200"
                : "hover:bg-slate-100/70",
            ].join(" ")}
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Orçamento
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold text-ondjo-ink">
              {value.maxPrice ? `Até ${value.maxPrice} Kz` : "Sem limite"}
            </span>
          </button>

          {/* BOTÃO PRINCIPAL */}
          <div className="p-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="flex min-h-12 items-center gap-2 rounded-full bg-ondjo-blue hover:bg-ondjo-blue-dark active:scale-95 px-6 py-3 font-bold text-white shadow-md transition-all cursor-pointer hover:shadow-lg"
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
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
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
                        "flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-left transition-all cursor-pointer",
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
            </motion.div>
          )}

          {activeSegment === "type" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
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
                        "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all cursor-pointer",
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
            </motion.div>
          )}

          {activeSegment === "amenities" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
              className="absolute left-1/2 top-full mt-3 w-105 sm:w-115 max-w-[94vw] -translate-x-1/2 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_20px_50px_rgba(16,42,67,0.22)] z-50 max-h-[82vh] overflow-y-auto no-scrollbar"
            >
              <div className="space-y-4">
                {/* Linha 1: Quartos */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <BedDouble size={16} strokeWidth={2.2} />
                    </span>
                    <div>
                      <span className="block text-sm font-bold text-ondjo-navy leading-tight">
                        Quartos
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Tipologia (T0 a T5+)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseInt(value.bedrooms || "0", 10);
                        const next = Math.max(0, cur - 1);
                        set("bedrooms", next === 0 ? "" : String(next));
                      }}
                      className="grid size-8 place-items-center rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition active:scale-90 cursor-pointer disabled:opacity-40"
                      aria-label="Diminuir quartos"
                    >
                      <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-ondjo-navy">
                      {value.bedrooms ? `T${value.bedrooms}` : "0"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseInt(value.bedrooms || "0", 10);
                        set("bedrooms", String(cur + 1));
                      }}
                      className="grid size-8 place-items-center rounded-full bg-ondjo-blue hover:bg-ondjo-blue-dark text-white font-bold transition active:scale-90 cursor-pointer shadow-xs"
                      aria-label="Aumentar quartos"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Linha 2: Banheiros */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-xl bg-sky-50 text-sky-600">
                      <Bath size={16} strokeWidth={2.2} />
                    </span>
                    <div>
                      <span className="block text-sm font-bold text-ondjo-navy leading-tight">
                        Banheiros
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Casas de banho / WC
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseInt(value.bathrooms || "0", 10);
                        const next = Math.max(0, cur - 1);
                        set("bathrooms", next === 0 ? "" : String(next));
                      }}
                      className="grid size-8 place-items-center rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition active:scale-90 cursor-pointer"
                      aria-label="Diminuir banheiros"
                    >
                      <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-ondjo-navy">
                      {value.bathrooms || "0"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseInt(value.bathrooms || "0", 10);
                        set("bathrooms", String(cur + 1));
                      }}
                      className="grid size-8 place-items-center rounded-full bg-ondjo-blue hover:bg-ondjo-blue-dark text-white font-bold transition active:scale-90 cursor-pointer shadow-xs"
                      aria-label="Aumentar banheiros"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Linha 3: Vagas de Garagem */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-xl bg-amber-50 text-amber-600">
                      <Car size={16} strokeWidth={2.2} />
                    </span>
                    <div>
                      <span className="block text-sm font-bold text-ondjo-navy leading-tight">
                        Vagas de Garagem
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Estacionamento privativo
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseInt(value.parking || "0", 10);
                        const next = Math.max(0, cur - 1);
                        set("parking", next === 0 ? "" : String(next));
                      }}
                      className="grid size-8 place-items-center rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition active:scale-90 cursor-pointer"
                      aria-label="Diminuir vagas"
                    >
                      <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-ondjo-navy">
                      {value.parking || "0"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseInt(value.parking || "0", 10);
                        set("parking", String(cur + 1));
                      }}
                      className="grid size-8 place-items-center rounded-full bg-ondjo-blue hover:bg-ondjo-blue-dark text-white font-bold transition active:scale-90 cursor-pointer shadow-xs"
                      aria-label="Aumentar vagas"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Linha separadora */}
                <div className="my-2 h-px bg-slate-100" />

                {/* Grelha de Comodidades */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Comodidades & Preferências{" "}
                      {selectedAmenities.length > 0 &&
                        `(${selectedAmenities.length})`}
                    </span>
                    {selectedAmenities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAmenities([]);
                          onChange({ ...value, amenities: [] });
                        }}
                        className="text-[11px] font-bold text-ondjo-blue hover:underline cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {AMENITY_OPTIONS.map((item) => {
                      const isSelected =
                        selectedAmenities.includes(item.id) ||
                        selectedAmenities.includes(item.label);
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleAmenity(item.id)}
                          className={[
                            "focus-ring group relative flex flex-col items-center justify-center rounded-xl p-1.5 sm:p-2 transition-all cursor-pointer select-none border min-h-14.5 sm:min-h-15.5",
                            isSelected
                              ? "bg-ondjo-blue border-ondjo-blue text-white shadow-xs scale-[1.02]"
                              : "bg-slate-50/90 hover:bg-slate-100 border-slate-200/90 text-slate-700 hover:border-slate-300",
                          ].join(" ")}
                        >
                          {isSelected && (
                            <span className="absolute top-1 right-1 grid size-3.7 place-items-center rounded-full bg-white text-ondjo-blue text-[10px] shadow-2xs">
                              <Check size={10} strokeWidth={3} />
                            </span>
                          )}

                          <span
                            className={[
                              "grid size-6 place-items-center rounded-lg transition-transform mb-1 shrink-0",
                              isSelected
                                ? "bg-white/20 text-white"
                                : `${item.bgSoftClass} ${item.colorClass} group-hover:scale-105`,
                            ].join(" ")}
                          >
                            <Icon size={13} strokeWidth={2.2} />
                          </span>

                          <span
                            className={[
                              "text-[10px] sm:text-[10.5px] font-semibold text-center leading-tight tracking-tight line-clamp-2 px-0.5",
                              isSelected ? "text-white" : "text-slate-700",
                            ].join(" ")}
                          >
                            {item.shortLabel || item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rodapé com Ações */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
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
                    className="text-xs font-semibold text-slate-500 hover:text-ondjo-blue transition cursor-pointer"
                  >
                    Limpar tudo
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSegment(null)}
                    className="rounded-full bg-ondjo-navy hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    Concluído
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSegment === "price" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
              className="absolute right-0 top-full mt-3 w-88 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_50px_rgba(16,42,67,0.22)] z-50"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Faixa de preço (Kz)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Mínimo
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Sem mín."
                    value={value.minPrice}
                    onChange={(e) =>
                      set("minPrice", e.target.value.replace(/\D/g, ""))
                    }
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-ondjo-ink outline-none focus:border-ondjo-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Máximo
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Sem máx."
                    value={value.maxPrice}
                    onChange={(e) =>
                      set("maxPrice", e.target.value.replace(/\D/g, ""))
                    }
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-ondjo-ink outline-none focus:border-ondjo-blue"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSubmit()}
                className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-ondjo-blue font-bold text-xs text-white hover:bg-ondjo-blue-dark transition cursor-pointer"
              >
                Ver{" "}
                {matchingCount > 0 ? `${matchingCount} imóveis` : "Resultados"}
              </button>
            </motion.div>
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
          className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-ondjo-border/90 bg-white p-2.5 shadow-[0_8px_24px_rgba(16,42,67,0.08)] active:scale-[0.99] transition-all cursor-pointer text-left"
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
                    Até {Number(value.maxPrice).toLocaleString("pt-AO")} Kz
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
                className="fixed inset-0 z-100 flex flex-col justify-end bg-black/60 backdrop-blur-xs"
              >
                {/* Backdrop clicável */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  onClick={() => setMobileModalOpen(false)}
                  className="fixed inset-0 cursor-pointer"
                  aria-hidden="true"
                />

                {/* Sheet que desliza de baixo para cima */}
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{
                    type: "spring",
                    damping: 32,
                    stiffness: 320,
                  }}
                  className="relative z-10 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl pb-safe"
                >
                  {/* Traço indicador de arrasto */}
                  <div className="pt-3 pb-1 flex justify-center shrink-0">
                    <div className="h-1.5 w-12 rounded-full bg-slate-300" />
                  </div>

                  {/* Cabeçalho Fixo do Sheet */}
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 shrink-0">
                    <div>
                      <h3 className="text-base font-extrabold text-ondjo-navy">
                        Filtrar Pesquisa
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
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
                      className="focus-ring grid size-11 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Conteúdo com Scroll Interno Fluído */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 overscroll-contain">
                    {/* 1. Modalidade de Negócio */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                        Modalidade
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {PURPOSE_OPTIONS.map((opt) => {
                          const isSelected = currentPurpose === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => set("purpose", opt.id)}
                              className={[
                                "flex min-h-11 items-center justify-center rounded-xl text-xs font-bold border transition-all cursor-pointer",
                                isSelected
                                  ? "border-ondjo-blue bg-ondjo-blue-soft text-ondjo-blue font-black shadow-2xs"
                                  : "border-slate-200 text-slate-700 hover:bg-slate-50",
                              ].join(" ")}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Origem & Auditoria do Anúncio (ORIGIN_OPTIONS Completo) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Origem do Anúncio
                        </label>
                        <span className="text-[11px] text-slate-400">
                          Auditoria e intermediação
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ORIGIN_OPTIONS.map((opt) => {
                          const isSelected = currentOrigin === opt.id;
                          const Icon = opt.icon;

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => set("origin", opt.id)}
                              className={[
                                "relative flex items-center justify-between rounded-2xl border p-3 text-left transition-all cursor-pointer min-h-18 active:scale-[0.99]",
                                isSelected
                                  ? "border-ondjo-blue bg-ondjo-blue-soft/50 ring-2 ring-ondjo-blue/20 shadow-xs"
                                  : "border-slate-200/90 bg-white hover:bg-slate-50",
                              ].join(" ")}
                            >
                              <div className="flex items-center gap-3 min-w-0 pr-2">
                                <span
                                  className={[
                                    "grid size-9 place-items-center rounded-xl shrink-0 transition-colors",
                                    isSelected
                                      ? "bg-ondjo-blue text-white"
                                      : "bg-slate-100 text-slate-600",
                                  ].join(" ")}
                                >
                                  <Icon size={17} strokeWidth={2.2} />
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={[
                                        "text-xs font-bold truncate",
                                        isSelected
                                          ? "text-ondjo-navy"
                                          : "text-slate-800",
                                      ].join(" ")}
                                    >
                                      {opt.label}
                                    </span>
                                    {opt.badge && (
                                      <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-600">
                                        {opt.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                    {opt.description}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={[
                                  "grid size-5 place-items-center rounded-full border shrink-0 transition-colors",
                                  isSelected
                                    ? "border-ondjo-blue bg-ondjo-blue text-white"
                                    : "border-slate-300 bg-white",
                                ].join(" ")}
                              >
                                {isSelected && (
                                  <Check size={12} strokeWidth={3} />
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Localização com Auto-sugestões */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                        Localização em Luanda
                      </label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50/70 focus-within:border-ondjo-blue focus-within:bg-white transition-colors">
                        <MapPin
                          size={18}
                          className="text-ondjo-blue shrink-0"
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
                          placeholder="Ex: Talatona, Maianga, Kilamba..."
                          className="w-full bg-transparent text-base font-semibold outline-none text-ondjo-ink placeholder:text-slate-400"
                        />
                        {searchText && (
                          <button
                            type="button"
                            onClick={() =>
                              onChange({ ...value, location: "", query: "" })
                            }
                            className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      {/* Chips de Zonas Populares */}
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
                                "min-h-8 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer",
                                isSel
                                  ? "border-ondjo-blue bg-ondjo-blue-soft text-ondjo-blue font-bold shadow-2xs"
                                  : "border-slate-200 text-slate-600 hover:bg-slate-100",
                              ].join(" ")}
                            >
                              {loc}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 4. Tipo de Imóvel */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                        Tipo de Imóvel
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {PROPERTY_TYPES.map((t) => {
                          const isSelected = value.type === t.value;
                          return (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => set("type", t.value)}
                              className={[
                                "flex min-h-11 items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold border transition text-left cursor-pointer",
                                isSelected
                                  ? "border-ondjo-blue bg-ondjo-blue-soft text-ondjo-blue font-bold shadow-2xs"
                                  : "border-slate-200 text-slate-700 hover:bg-slate-50",
                              ].join(" ")}
                            >
                              <span>{t.label}</span>
                              {isSelected && <Check size={14} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 5. Quartos, Banheiros e Garagem */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                      <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                        Dimensões & Espaços
                      </label>

                      {/* Quartos */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="grid size-7 place-items-center rounded-lg bg-blue-50 text-blue-600">
                            <BedDouble size={14} strokeWidth={2.2} />
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-ondjo-navy">
                            Quartos (T0 a T5+)
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
                            className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 active:scale-90"
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>
                          <span className="w-6 text-center text-xs sm:text-sm font-bold text-ondjo-navy">
                            {value.bedrooms ? `T${value.bedrooms}` : "0"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const cur = parseInt(value.bedrooms || "0", 10);
                              set("bedrooms", String(cur + 1));
                            }}
                            className="grid size-8 place-items-center rounded-full bg-ondjo-blue text-white font-bold active:scale-90 shadow-2xs"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>

                      {/* Banheiros */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="grid size-7 place-items-center rounded-lg bg-sky-50 text-sky-600">
                            <Bath size={14} strokeWidth={2.2} />
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-ondjo-navy">
                            Banheiros (WC)
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
                            className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 active:scale-90"
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>
                          <span className="w-6 text-center text-xs sm:text-sm font-bold text-ondjo-navy">
                            {value.bathrooms || "0"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const cur = parseInt(value.bathrooms || "0", 10);
                              set("bathrooms", String(cur + 1));
                            }}
                            className="grid size-8 place-items-center rounded-full bg-ondjo-blue text-white font-bold active:scale-90 shadow-2xs"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>

                      {/* Vagas */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="grid size-7 place-items-center rounded-lg bg-amber-50 text-amber-600">
                            <Car size={14} strokeWidth={2.2} />
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-ondjo-navy">
                            Vagas de Garagem
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
                            className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 active:scale-90"
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>
                          <span className="w-6 text-center text-xs sm:text-sm font-bold text-ondjo-navy">
                            {value.parking || "0"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const cur = parseInt(value.parking || "0", 10);
                              set("parking", String(cur + 1));
                            }}
                            className="grid size-8 place-items-center rounded-full bg-ondjo-blue text-white font-bold active:scale-90 shadow-2xs"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 6. Comodidades & Preferências (15 comodidades oficiais) */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Comodidades{" "}
                          {selectedAmenities.length > 0 &&
                            `(${selectedAmenities.length})`}
                        </span>
                        {selectedAmenities.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAmenities([]);
                              onChange({ ...value, amenities: [] });
                            }}
                            className="text-[11px] font-bold text-ondjo-blue hover:underline cursor-pointer"
                          >
                            Limpar
                          </button>
                        )}
                      </div>

                      <div
                        aria-label="Opções de comodidades"
                        className="max-h-56 overflow-y-auto pr-1 scrollbar-subtle overscroll-contain"
                      >
                        <div className="grid grid-cols-3 gap-1.5">
                          {AMENITY_OPTIONS.map((item) => {
                            const isSelected =
                              selectedAmenities.includes(item.id) ||
                              selectedAmenities.includes(item.label);
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleAmenity(item.id)}
                                aria-label={item.label}
                                aria-pressed={isSelected}
                                className={[
                                  "group relative flex flex-col items-center justify-center rounded-xl p-1.5 text-center border transition-all cursor-pointer select-none min-h-14.5",
                                  isSelected
                                    ? "bg-ondjo-blue border-ondjo-blue text-white shadow-xs"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                                ].join(" ")}
                              >
                                {isSelected && (
                                  <span className="absolute top-1 right-1 grid size-3.5 place-items-center rounded-full bg-white text-ondjo-blue text-[9px] shadow-2xs">
                                    <Check size={9} strokeWidth={3} />
                                  </span>
                                )}

                                <span
                                  className={[
                                    "grid size-6 place-items-center rounded-lg mb-1 shrink-0",
                                    isSelected
                                      ? "bg-white/20 text-white"
                                      : `${item.bgSoftClass} ${item.colorClass}`,
                                  ].join(" ")}
                                >
                                  <Icon size={12} strokeWidth={2.2} />
                                </span>

                                <span
                                  className={[
                                    "text-[9.5px] font-semibold text-center leading-tight tracking-tight line-clamp-2 px-0.5",
                                    isSelected
                                      ? "text-white"
                                      : "text-slate-700",
                                  ].join(" ")}
                                >
                                  {item.shortLabel || item.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 7. Faixa de Preço em Kz */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                        Preço em Kwanzas (Kz)
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            Mínimo
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Sem mínimo"
                            value={value.minPrice}
                            onChange={(e) =>
                              set("minPrice", e.target.value.replace(/\D/g, ""))
                            }
                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold text-ondjo-ink outline-none focus:border-ondjo-blue bg-slate-50/70"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            Máximo
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Sem máximo"
                            value={value.maxPrice}
                            onChange={(e) =>
                              set("maxPrice", e.target.value.replace(/\D/g, ""))
                            }
                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold text-ondjo-ink outline-none focus:border-ondjo-blue bg-slate-50/70"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé Fixo do Sheet */}
                  <div className="shrink-0 border-t border-slate-100 bg-white p-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="min-h-12 px-3 text-xs font-bold text-slate-600 hover:text-ondjo-blue active:scale-95 cursor-pointer"
                    >
                      Limpar tudo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmit()}
                      className="flex-1 min-h-12 rounded-xl bg-ondjo-blue px-4 py-3 text-center text-sm font-bold text-white shadow-md active:scale-98 cursor-pointer hover:bg-ondjo-blue-dark transition"
                    >
                      {matchingCount > 0
                        ? `Ver ${matchingCount} imóveis`
                        : "Pesquisar imóveis"}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
