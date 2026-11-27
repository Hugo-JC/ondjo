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
import { m, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { locations, properties } from "../data/properties";
import { filterProperties } from "../utils/filterProperties";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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

const POPULAR_LOCATIONS = [
  "Talatona",
  "Kilamba",
  "Maianga",
  "Benfica",
  "Camama",
  "Viana",
  "Alvalade",
  "Miramar",
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

function getOriginButtonTokens(id: SearchOrigin) {
  switch (id) {
    case "verificados":
      return {
        activePillClass: "bg-emerald-50 ring-1 ring-emerald-200/80",
        activeTextClass:
          "text-emerald-800 hover:bg-transparent hover:text-emerald-900",
        activeIconClass: "text-emerald-600",
      };
    case "proprietario":
      return {
        activePillClass: "bg-ondjo-blue-50 ring-1 ring-ondjo-blue/25",
        activeTextClass:
          "text-ondjo-blue hover:bg-transparent hover:text-ondjo-blue",
        activeIconClass: "text-ondjo-blue",
      };
    case "agentes":
      return {
        activePillClass: "bg-indigo-50 ring-1 ring-indigo-200/80",
        activeTextClass:
          "text-indigo-800 hover:bg-transparent hover:text-indigo-900",
        activeIconClass: "text-indigo-600",
      };
    default:
      return {
        activePillClass: "bg-ondjo-navy shadow-xs",
        activeTextClass: "text-white hover:bg-transparent hover:text-white",
        activeIconClass: "text-white",
      };
  }
}

type ActiveSegment = "location" | "type" | "amenities" | "price" | null;

export function SearchBar({
  value,
  onChange,
  onSearch,
  compact = false,
}: SearchBarProps) {
  const reduceMotion = useReducedMotion();
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

  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationId = useId();

  const set = (key: keyof SearchFilters, next: unknown) => {
    onChange({ ...value, [key]: next });
  };

  const currentPurpose = value.purpose || "comprar";
  const currentOrigin = (value.origin || "todos") as SearchOrigin;

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (value.location || value.query) count++;
    if (value.type) count++;
    if (value.bedrooms) count++;
    if (value.bathrooms) count++;
    if (value.parking) count++;
    if (value.minPrice || value.maxPrice) count++;
    if (value.origin && value.origin !== "todos") count++;
    if (value.amenities && value.amenities.length > 0)
      count += value.amenities.length;
    return count;
  }, [value]);

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

  const activeOriginOption =
    ORIGIN_OPTIONS.find((o) => o.id === currentOrigin) || ORIGIN_OPTIONS[0];

  return (
    <div
      className={cn("relative w-full text-left", compact && "max-w-3xl mx-auto")}
    >
      {/* ========================================================
          CABEÇALHO DA BUSCA MOBILE (Tabs shadcn + Régua de origem)
         ======================================================== */}
      <div className="mb-3.5 flex flex-col gap-2.5 md:hidden">
        <Tabs
          value={currentPurpose}
          onValueChange={(val) => set("purpose", String(val))}
          className="w-full"
        >
          <TabsList
            variant="pill"
            aria-label="Modalidade de negócio"
            className="grid w-full grid-cols-2 border border-ondjo-border bg-white p-1 shadow-xs"
          >
            {PURPOSE_OPTIONS.map((opt) => (
              <TabsTrigger
                key={opt.id}
                value={opt.id}
                className="h-10.5 rounded-full text-xs font-bold text-ondjo-muted data-active:bg-ondjo-navy data-active:text-white data-active:shadow-xs"
              >
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <m.div
          role="group"
          aria-label="Filtrar por origem do anúncio"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.28, delay: 0.08, ease: [0.22, 1, 0.36, 1] }
          }
          className="flex w-full items-center gap-0.5 overflow-x-auto no-scrollbar scrollbar-none rounded-full border border-ondjo-border bg-white p-1 shadow-xs"
        >
          {ORIGIN_OPTIONS.map((opt) => {
            const isSelected = currentOrigin === opt.id;
            const Icon = opt.icon;
            const { activePillClass, activeTextClass, activeIconClass } =
              getOriginButtonTokens(opt.id);

            return (
              <Button
                key={opt.id}
                type="button"
                variant="ghost"
                size="sm"
                aria-pressed={isSelected}
                onClick={() => set("origin", opt.id)}
                className={cn(
                  "relative h-10 flex-1 shrink-0 min-w-max rounded-full px-3 text-xs transition-colors duration-150",
                  isSelected
                    ? cn("font-bold", activeTextClass)
                    : "font-semibold text-ondjo-muted hover:bg-slate-100/80 hover:text-ondjo-navy",
                )}
              >
                {isSelected && (
                  <m.span
                    layoutId="searchbar-origin-pill-mobile"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 440, damping: 34 }
                    }
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-0 rounded-full",
                      activePillClass,
                    )}
                  />
                )}

                <span className="relative z-10 inline-flex items-center gap-1.5">
                  <Icon
                    size={14}
                    aria-hidden="true"
                    className={cn(
                      "shrink-0 transition-colors duration-150",
                      isSelected
                        ? activeIconClass
                        : "text-slate-400 group-hover/button:text-ondjo-navy",
                    )}
                  />
                  <span>{opt.shortLabel}</span>
                </span>
              </Button>
            );
          })}
        </m.div>
      </div>

      {/* ========================================================
          CABEÇALHO DA BUSCA: DESKTOP (Tabs shadcn + Origem)
         ======================================================== */}
      <div className="hidden md:flex mb-3.5 items-center justify-between gap-3 px-2 sm:px-4">
        <Tabs
          value={currentPurpose}
          onValueChange={(val) => set("purpose", String(val))}
        >
          <TabsList
            variant="pill"
            aria-label="Modalidade de negócio"
            className="inline-grid grid-cols-2 border border-ondjo-border bg-white p-1 shadow-xs"
          >
            {PURPOSE_OPTIONS.map((opt) => (
              <TabsTrigger
                key={opt.id}
                value={opt.id}
                className="h-8.5 rounded-full px-5 text-xs font-bold text-ondjo-muted data-active:bg-ondjo-navy data-active:text-white data-active:shadow-xs"
              >
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <m.div
          role="group"
          aria-label="Filtrar por origem do anúncio"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.28, delay: 0.08, ease: [0.22, 1, 0.36, 1] }
          }
          className="inline-flex flex-wrap items-center gap-0.5 rounded-full border border-ondjo-border bg-white p-1 shadow-xs"
        >
          {ORIGIN_OPTIONS.map((orig) => {
            const isSelected = currentOrigin === orig.id;
            const Icon = orig.icon;
            const { activePillClass, activeTextClass, activeIconClass } =
              getOriginButtonTokens(orig.id);

            return (
              <Button
                key={orig.id}
                type="button"
                variant="ghost"
                size="sm"
                aria-pressed={isSelected}
                onClick={() => set("origin", orig.id)}
                className={cn(
                  "relative h-8.5 rounded-full px-3.5 text-xs transition-colors duration-150",
                  isSelected
                    ? cn("font-bold", activeTextClass)
                    : "font-semibold text-ondjo-muted hover:bg-slate-100/80 hover:text-ondjo-navy",
                )}
              >
                {isSelected && (
                  <m.span
                    layoutId="searchbar-origin-pill"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 440, damping: 34 }
                    }
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-0 rounded-full",
                      activePillClass,
                    )}
                  />
                )}

                <span className="relative z-10 inline-flex items-center gap-1.5">
                  <Icon
                    size={14}
                    aria-hidden="true"
                    className={cn(
                      "shrink-0 transition-colors duration-150",
                      isSelected
                        ? activeIconClass
                        : "text-slate-400 group-hover/button:text-ondjo-navy",
                    )}
                  />
                  <span>{orig.shortLabel}</span>
                </span>
              </Button>
            );
          })}
        </m.div>
      </div>

      {/* ========================================================
          DESKTOP: BARRA INTEGRADA COM SHADCN POPOVER
         ======================================================== */}
      <div className="hidden md:block">
        <div
          className={cn(
            "relative z-30 flex items-center rounded-full border border-ondjo-border bg-white shadow-[0_16px_40px_rgba(16,42,67,0.08)] transition-shadow duration-150 hover:shadow-[0_20px_50px_rgba(16,42,67,0.12)]",
            activeSegment && "bg-slate-50",
          )}
        >
          {/* SEGMENTO 1: ONDE */}
          <Popover
            open={activeSegment === "location"}
            onOpenChange={(open) => {
              setActiveSegment(open ? "location" : null);
              if (open) {
                requestAnimationFrame(() => locationInputRef.current?.focus());
              }
            }}
          >
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    "focus-ring group relative flex-1 min-w-0 rounded-full px-6 py-3.5 text-left transition-colors duration-150 cursor-pointer",
                    activeSegment === "location"
                      ? "bg-white shadow-md z-20 ring-1 ring-ondjo-border"
                      : "hover:bg-slate-100/80",
                  )}
                />
              }
            >
              <span className="block text-[11px] font-bold uppercase tracking-wider text-ondjo-muted">
                Onde
              </span>
              <span className="mt-0.5 block truncate text-sm font-semibold text-ondjo-ink">
                {searchText || "Explorar Luanda ou zonas"}
              </span>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={12}
              className="w-96 rounded-3xl border-ondjo-border p-5"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin size={18} className="text-ondjo-blue shrink-0" />
                <Input
                  ref={locationInputRef}
                  id={locationId}
                  type="text"
                  value={searchText}
                  onChange={(e) => {
                    onChange({ ...value, location: "", query: e.target.value });
                  }}
                  placeholder="Pesquisar município ou bairro..."
                  className="h-9 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                />
                {searchText && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      onChange({ ...value, location: "", query: "" })
                    }
                    aria-label="Limpar localização"
                    className="rounded-full text-slate-400 hover:text-ondjo-ink"
                  >
                    <X size={15} />
                  </Button>
                )}
              </div>

              <div className="mt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ondjo-muted">
                  {searchText
                    ? "Zonas correspondentes"
                    : "Zonas populares em Luanda"}
                </span>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {(filteredLocations.length > 0
                    ? filteredLocations
                    : POPULAR_LOCATIONS
                  ).map((loc) => (
                    <Button
                      key={loc}
                      type="button"
                      variant={value.location === loc ? "secondary" : "ghost"}
                      onClick={() => {
                        onChange({ ...value, location: loc, query: "" });
                        setActiveSegment("type");
                      }}
                      className={cn(
                        "h-9.5 justify-start gap-2 rounded-xl px-2.5 text-xs font-semibold",
                        value.location === loc
                          ? "text-ondjo-blue font-bold"
                          : "text-ondjo-ink hover:bg-slate-100",
                      )}
                    >
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{loc}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div
            className={cn(
              "h-8 w-px bg-slate-200 shrink-0 transition-opacity duration-150",
              activeSegment === "location" || activeSegment === "type"
                ? "opacity-0"
                : "opacity-100",
            )}
          />

          {/* SEGMENTO 2: TIPO */}
          <Popover
            open={activeSegment === "type"}
            onOpenChange={(open) => setActiveSegment(open ? "type" : null)}
          >
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    "focus-ring group relative flex-1 min-w-0 rounded-full px-6 py-3.5 text-left transition-colors duration-150 cursor-pointer",
                    activeSegment === "type"
                      ? "bg-white shadow-md z-20 ring-1 ring-ondjo-border"
                      : "hover:bg-slate-100/80",
                  )}
                />
              }
            >
              <span className="block text-[11px] font-bold uppercase tracking-wider text-ondjo-muted">
                Tipo de Imóvel
              </span>
              <span className="mt-0.5 block truncate text-sm font-semibold text-ondjo-ink">
                {value.type || "Todos os tipos"}
              </span>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={12}
              className="w-72 rounded-3xl border-ondjo-border p-3.5"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-ondjo-muted block mb-1.5 px-1.5">
                Selecione o tipo
              </span>
              <div className="space-y-1">
                {PROPERTY_TYPES.map((t) => {
                  const isSelected = value.type === t.value;
                  return (
                    <Button
                      key={t.value}
                      type="button"
                      variant={isSelected ? "primary" : "ghost"}
                      onClick={() => {
                        set("type", t.value);
                        setActiveSegment("amenities");
                      }}
                      className={cn(
                        "w-full justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold",
                        !isSelected && "text-ondjo-ink hover:bg-slate-100",
                      )}
                    >
                      <span>{t.label}</span>
                      {isSelected && <Check size={16} />}
                    </Button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          <div
            className={cn(
              "h-8 w-px bg-slate-200 shrink-0 transition-opacity duration-150",
              activeSegment === "type" || activeSegment === "amenities"
                ? "opacity-0"
                : "opacity-100",
            )}
          />

          {/* SEGMENTO 3: COMODIDADES */}
          <Popover
            open={activeSegment === "amenities"}
            onOpenChange={(open) => setActiveSegment(open ? "amenities" : null)}
          >
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    "focus-ring group relative flex-1 min-w-0 rounded-full px-6 py-3.5 text-left transition-colors duration-150 cursor-pointer",
                    activeSegment === "amenities"
                      ? "bg-white shadow-md z-20 ring-1 ring-ondjo-border"
                      : "hover:bg-slate-100/80",
                  )}
                />
              }
            >
              <span className="block text-[11px] font-bold uppercase tracking-wider text-ondjo-muted">
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
            </PopoverTrigger>
            <PopoverContent
              align="center"
              sideOffset={12}
              className="w-[26rem] sm:w-[29rem] max-w-[94vw] rounded-3xl border-ondjo-border p-5 sm:p-6 max-h-[82vh] overflow-y-auto no-scrollbar"
            >
              <div className="space-y-5">
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
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => {
                          const cur = parseInt(value.bedrooms || "0", 10);
                          const next = Math.max(0, cur - 1);
                          set("bedrooms", next === 0 ? "" : String(next));
                        }}
                        aria-label="Diminuir quartos"
                      >
                        <Minus size={14} strokeWidth={2.2} />
                      </Button>
                      <span className="w-14 text-center text-xs font-bold text-ondjo-navy tabular-nums">
                        {value.bedrooms ? `T${value.bedrooms}` : "Qualquer"}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => {
                          const cur = parseInt(value.bedrooms || "0", 10);
                          set("bedrooms", String(cur + 1));
                        }}
                        aria-label="Aumentar quartos"
                      >
                        <Plus size={14} strokeWidth={2.2} />
                      </Button>
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
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => {
                          const cur = parseInt(value.bathrooms || "0", 10);
                          const next = Math.max(0, cur - 1);
                          set("bathrooms", next === 0 ? "" : String(next));
                        }}
                        aria-label="Diminuir casas de banho"
                      >
                        <Minus size={14} strokeWidth={2.2} />
                      </Button>
                      <span className="w-14 text-center text-xs font-bold text-ondjo-navy tabular-nums">
                        {value.bathrooms ? `${value.bathrooms}+` : "Qualquer"}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => {
                          const cur = parseInt(value.bathrooms || "0", 10);
                          set("bathrooms", String(cur + 1));
                        }}
                        aria-label="Aumentar casas de banho"
                      >
                        <Plus size={14} strokeWidth={2.2} />
                      </Button>
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
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => {
                          const cur = parseInt(value.parking || "0", 10);
                          const next = Math.max(0, cur - 1);
                          set("parking", next === 0 ? "" : String(next));
                        }}
                        aria-label="Diminuir vagas"
                      >
                        <Minus size={14} strokeWidth={2.2} />
                      </Button>
                      <span className="w-14 text-center text-xs font-bold text-ondjo-navy tabular-nums">
                        {value.parking ? `${value.parking}+` : "Qualquer"}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => {
                          const cur = parseInt(value.parking || "0", 10);
                          set("parking", String(cur + 1));
                        }}
                        aria-label="Aumentar vagas"
                      >
                        <Plus size={14} strokeWidth={2.2} />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-ondjo-navy">
                      Comodidades
                      {selectedAmenities.length > 0 &&
                        ` (${selectedAmenities.length})`}
                    </span>
                    {selectedAmenities.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          setSelectedAmenities([]);
                          onChange({ ...value, amenities: [] });
                        }}
                        className="text-ondjo-blue hover:bg-ondjo-blue-50"
                      >
                        Limpar
                      </Button>
                    )}
                  </div>

                  <AmenitiesSelector
                    selected={selectedAmenities}
                    onToggle={toggleAmenity}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
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
                    className="text-ondjo-muted hover:text-ondjo-navy"
                  >
                    Limpar tudo
                  </Button>
                  <Button
                    type="button"
                    variant="navy"
                    size="sm"
                    onClick={() => setActiveSegment(null)}
                    className="rounded-xl px-4"
                  >
                    Concluído
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div
            className={cn(
              "h-8 w-px bg-slate-200 shrink-0 transition-opacity duration-150",
              activeSegment === "amenities" || activeSegment === "price"
                ? "opacity-0"
                : "opacity-100",
            )}
          />

          {/* SEGMENTO 4: ORÇAMENTO */}
          <Popover
            open={activeSegment === "price"}
            onOpenChange={(open) => setActiveSegment(open ? "price" : null)}
          >
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    "focus-ring group relative flex-1 min-w-0 rounded-full px-6 py-3.5 text-left transition-colors duration-150 cursor-pointer",
                    activeSegment === "price"
                      ? "bg-white shadow-md z-20 ring-1 ring-ondjo-border"
                      : "hover:bg-slate-100/80",
                  )}
                />
              }
            >
              <span className="block text-[11px] font-bold uppercase tracking-wider text-ondjo-muted">
                Orçamento
              </span>
              <span className="mt-0.5 block truncate text-sm font-semibold text-ondjo-ink tabular-nums">
                {value.maxPrice
                  ? `Até ${formatCompactKz(Number(value.maxPrice))}`
                  : value.minPrice
                    ? `Desde ${formatCompactKz(Number(value.minPrice))}`
                    : "Sem limite"}
              </span>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={12}
              className="w-[23rem] sm:w-[25rem] max-w-[92vw] rounded-3xl border-ondjo-border p-5 sm:p-6"
            >
              <PriceDualRangeSlider
                purpose={value.purpose}
                minPrice={value.minPrice}
                maxPrice={value.maxPrice}
                onChangeMin={(min) => set("minPrice", min)}
                onChangeMax={(max) => set("maxPrice", max)}
              />

              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={() => handleSubmit()}
                className="mt-4 h-11 rounded-xl text-xs font-bold"
              >
                Ver{" "}
                {matchingCount > 0 ? `${matchingCount} imóveis` : "Resultados"}
              </Button>
            </PopoverContent>
          </Popover>

          {/* BOTÃO PRINCIPAL */}
          <div className="p-2 shrink-0">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => handleSubmit()}
              leftIcon={<Search size={18} aria-hidden="true" />}
              aria-label="Pesquisar imóveis"
              className="text-sm font-bold shadow-md hover:shadow-lg"
            >
              {matchingCount > 0 ? `Ver ${matchingCount}` : "Pesquisar"}
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MOBILE: BARRA TOUCH COMPACTA EM PÍLULA
         ======================================================== */}
      <div className="block md:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={() => setMobileModalOpen(true)}
          aria-label="Abrir filtros de pesquisa de imóveis"
          className="flex h-auto min-h-15 w-full items-center justify-between gap-3 rounded-full border-ondjo-border bg-white p-2 pr-2.5 text-left whitespace-normal shadow-[0_12px_30px_rgba(16,42,67,0.12)] hover:border-ondjo-border-strong hover:bg-slate-50 active:scale-[0.99]"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ondjo-blue text-white shadow-xs">
            <Search size={18} aria-hidden="true" />
          </span>

          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-1.5 truncate text-sm font-bold text-ondjo-navy">
              {searchText ? (
                <>
                  <MapPin size={13} className="shrink-0 text-ondjo-blue" aria-hidden="true" />
                  <span className="truncate">{searchText}</span>
                </>
              ) : (
                "Onde quer procurar?"
              )}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-ondjo-muted">
              <span>{value.type || "Todos os tipos"}</span>
              <span aria-hidden="true">·</span>
              <span>{value.bedrooms ? `T${value.bedrooms}` : "Qualquer T"}</span>
              {currentOrigin !== "todos" && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-ondjo-blue">
                    {activeOriginOption.shortLabel}
                  </span>
                </>
              )}
              {value.maxPrice && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-ondjo-navy tabular-nums">
                    Até {formatCompactKz(Number(value.maxPrice))}
                  </span>
                </>
              )}
            </span>
          </span>

          <span className="relative flex size-10.5 shrink-0 items-center justify-center rounded-full bg-ondjo-blue-50 text-ondjo-blue">
            <SlidersHorizontal size={16} aria-hidden="true" />
            {activeFiltersCount > 0 && (
              <Badge
                variant="navy"
                size="xs"
                className="absolute -top-1 -right-1 h-4.5 min-w-4.5 justify-center px-1 text-[10px] font-black shadow-xs ring-2 ring-white"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </span>
        </Button>
      </div>

      {/* ========================================================
          BOTTOM SHEET MOBILE VIA SHADCN SHEET
         ======================================================== */}
      <Sheet open={mobileModalOpen} onOpenChange={setMobileModalOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[92dvh] w-full max-w-xl mx-auto flex flex-col overflow-hidden rounded-t-[28px]"
        >
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="h-1 w-10 rounded-full bg-slate-300" />
          </div>

          <SheetHeader className="flex-row items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-3.5 shrink-0">
            <div>
              <SheetTitle className="text-base font-bold tracking-tight text-ondjo-navy">
                Filtrar pesquisa
              </SheetTitle>
              <SheetDescription className="text-xs text-ondjo-muted tabular-nums">
                {matchingCount}{" "}
                {matchingCount === 1
                  ? "imóvel disponível"
                  : "imóveis disponíveis"}
              </SheetDescription>
            </div>
            <SheetClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Fechar filtros"
                  className="size-10.5 rounded-full bg-slate-100 text-ondjo-ink hover:bg-slate-200"
                />
              }
            >
              <X size={18} />
            </SheetClose>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6 overscroll-contain">
            {/* 1. Modalidade */}
            <div>
              <span className="block text-xs font-bold text-ondjo-navy mb-2">
                Modalidade
              </span>
              <Tabs
                value={currentPurpose}
                onValueChange={(val) => set("purpose", String(val))}
                className="w-full"
              >
                <TabsList
                  aria-label="Modalidade do imóvel"
                  className="grid w-full grid-cols-2 rounded-xl border border-ondjo-border bg-slate-100 p-1"
                >
                  {PURPOSE_OPTIONS.map((opt) => (
                    <TabsTrigger
                      key={opt.id}
                      value={opt.id}
                      className="h-9.5 rounded-lg text-xs font-bold"
                    >
                      {opt.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <Separator />

            {/* 2. Localização */}
            <div>
              <label className="block text-xs font-bold text-ondjo-navy mb-2">
                Localização em Luanda
              </label>
              <div className="relative flex items-center">
                <MapPin
                  size={16}
                  className="pointer-events-none absolute left-3.5 text-slate-400"
                />
                <Input
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
                  className="pl-10 pr-9"
                />
                {searchText && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      onChange({ ...value, location: "", query: "" })
                    }
                    aria-label="Limpar localização"
                    className="absolute right-2 rounded-full text-slate-400 hover:text-ondjo-ink"
                  >
                    <X size={15} />
                  </Button>
                )}
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {POPULAR_LOCATIONS.map((loc) => {
                  const isSel = value.location === loc;
                  return (
                    <Button
                      key={loc}
                      type="button"
                      variant={isSel ? "navy" : "outline"}
                      size="sm"
                      onClick={() =>
                        onChange({
                          ...value,
                          location: isSel ? "" : loc,
                          query: "",
                        })
                      }
                      className="rounded-full px-3 text-xs font-semibold"
                    >
                      {loc}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* 3. Tipo de Imóvel */}
            <div>
              <span className="block text-xs font-bold text-ondjo-navy mb-2">
                Tipo de imóvel
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PROPERTY_TYPES.map((t) => {
                  const isSelected = value.type === t.value;
                  return (
                    <Button
                      key={t.value}
                      type="button"
                      variant="outline"
                      aria-pressed={isSelected}
                      onClick={() => set("type", t.value)}
                      className={cn(
                        "min-h-10.5 rounded-xl px-3 py-2 text-xs font-semibold",
                        isSelected
                          ? "ondjo-border-selected bg-ondjo-blue-50/75 text-ondjo-blue font-bold hover:bg-ondjo-blue-50"
                          : "bg-white text-ondjo-ink hover:bg-slate-50",
                      )}
                    >
                      {t.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* 4. Origem do Anúncio */}
            <div>
              <span className="block text-xs font-bold text-ondjo-navy mb-2">
                Origem do anúncio
              </span>
              <OriginSelector
                value={currentOrigin}
                onChange={(orig) => set("origin", orig)}
              />
            </div>

            <Separator />

            {/* 5. Preço em Kwanzas (Kz) */}
            <div>
              <PriceDualRangeSlider
                purpose={value.purpose}
                minPrice={value.minPrice}
                maxPrice={value.maxPrice}
                onChangeMin={(min) => set("minPrice", min)}
                onChangeMax={(max) => set("maxPrice", max)}
              />
            </div>

            <Separator />

            {/* 6. Divisões & Espaços */}
            <div>
              <span className="block text-xs font-bold text-ondjo-navy mb-2">
                Divisões e vagas
              </span>

              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs sm:text-sm font-medium text-ondjo-ink">
                    Quartos
                  </span>
                  <div className="flex items-center gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const cur = parseInt(value.bedrooms || "0", 10);
                        const next = Math.max(0, cur - 1);
                        set("bedrooms", next === 0 ? "" : String(next));
                      }}
                      aria-label="Diminuir quartos"
                      className="size-10 rounded-full"
                    >
                      <Minus size={15} strokeWidth={2.2} />
                    </Button>
                    <span className="w-14 text-center text-xs font-bold text-ondjo-navy tabular-nums">
                      {value.bedrooms ? `T${value.bedrooms}` : "Qualquer"}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const cur = parseInt(value.bedrooms || "0", 10);
                        set("bedrooms", String(cur + 1));
                      }}
                      aria-label="Aumentar quartos"
                      className="size-10 rounded-full"
                    >
                      <Plus size={15} strokeWidth={2.2} />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-xs sm:text-sm font-medium text-ondjo-ink">
                    Casas de banho
                  </span>
                  <div className="flex items-center gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const cur = parseInt(value.bathrooms || "0", 10);
                        const next = Math.max(0, cur - 1);
                        set("bathrooms", next === 0 ? "" : String(next));
                      }}
                      aria-label="Diminuir casas de banho"
                      className="size-10 rounded-full"
                    >
                      <Minus size={15} strokeWidth={2.2} />
                    </Button>
                    <span className="w-14 text-center text-xs font-bold text-ondjo-navy tabular-nums">
                      {value.bathrooms ? `${value.bathrooms}+` : "Qualquer"}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const cur = parseInt(value.bathrooms || "0", 10);
                        set("bathrooms", String(cur + 1));
                      }}
                      aria-label="Aumentar casas de banho"
                      className="size-10 rounded-full"
                    >
                      <Plus size={15} strokeWidth={2.2} />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-xs sm:text-sm font-medium text-ondjo-ink">
                    Estacionamento
                  </span>
                  <div className="flex items-center gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const cur = parseInt(value.parking || "0", 10);
                        const next = Math.max(0, cur - 1);
                        set("parking", next === 0 ? "" : String(next));
                      }}
                      aria-label="Diminuir vagas"
                      className="size-10 rounded-full"
                    >
                      <Minus size={15} strokeWidth={2.2} />
                    </Button>
                    <span className="w-14 text-center text-xs font-bold text-ondjo-navy tabular-nums">
                      {value.parking ? `${value.parking}+` : "Qualquer"}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const cur = parseInt(value.parking || "0", 10);
                        set("parking", String(cur + 1));
                      }}
                      aria-label="Aumentar vagas"
                      className="size-10 rounded-full"
                    >
                      <Plus size={15} strokeWidth={2.2} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 7. Comodidades Compactas */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-ondjo-navy">
                  Comodidades
                  {selectedAmenities.length > 0 &&
                    ` (${selectedAmenities.length})`}
                </span>
                {selectedAmenities.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setSelectedAmenities([]);
                      onChange({ ...value, amenities: [] });
                    }}
                    className="text-ondjo-blue hover:bg-ondjo-blue-50"
                  >
                    Limpar
                  </Button>
                )}
              </div>

              <AmenitiesSelector
                selected={selectedAmenities}
                onToggle={toggleAmenity}
              />
            </div>
          </div>

          <SheetFooter className="shrink-0 border-t border-slate-100 bg-white px-4 sm:px-6 pt-3.5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] flex-row items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={clearAllFilters}
              className="h-11 px-3 text-xs font-bold text-ondjo-muted hover:text-ondjo-navy"
            >
              Limpar tudo
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => handleSubmit()}
              className="flex-1 h-11 rounded-xl px-5 text-sm font-bold shadow-sm tabular-nums"
            >
              {matchingCount > 0
                ? `Mostrar ${matchingCount} ${matchingCount === 1 ? "imóvel" : "imóveis"}`
                : "Pesquisar imóveis"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
