import {
  ArrowDownUp,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  Grid2X2,
  Heart,
  List,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { properties } from "../data/properties";
import { formatKz } from "../utils/format";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyImageCarousel } from "../components/PropertyImageCarousel";
import {
  defaultSearchFilters,
  type SearchFilters,
  PROPERTY_TYPES,
  BEDROOM_OPTIONS,
  AMENITY_OPTIONS,
  ORIGIN_OPTIONS,
  PriceDualRangeSlider,
} from "../components/SearchBar";
import {
  AmenitiesSelector,
  OriginSelector,
  formatCompactKz,
  type SearchOrigin,
} from "../components/FilterControls";
import { navigate } from "../hooks/useHashRoute";
import { useFavorites } from "../hooks/useFavorites";
import { useSavedSearches } from "../hooks/useSavedSearches";
import {
  useFilteredPropertiesQuery,
  type SortOption,
} from "../hooks/usePropertiesQuery";
import {
  SearchPageSkeleton,
  SearchResultsSkeleton,
} from "../components/ui/ondjo-skeletons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const POPULAR_NEIGHBORHOODS = [
  "Talatona",
  "Kilamba",
  "Maianga",
  "Benfica",
  "Camama",
  "Viana",
  "Alvalade",
  "Belas",
];

const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Mais relevantes",
  "price-low": "Menor preço",
  "price-high": "Maior preço",
  area: "Maior área (m²)",
};

function normalizePurposeParam(raw: string | null): "comprar" | "arrendar" {
  const val = (raw ?? "").toLowerCase().trim();
  if (val === "arrendar" || val === "arrendamento") return "arrendar";
  return "comprar";
}

function readFiltersFromUrl(): SearchFilters {
  const hash = window.location.hash || "";
  const queryPart = hash.includes("?") ? hash.split("?")[1] : "";
  const params = new URLSearchParams(queryPart);

  return {
    query: params.get("query") ?? "",
    location: params.get("location") ?? "",
    type: params.get("type") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    bedrooms: params.get("bedrooms") ?? "",
    purpose: normalizePurposeParam(params.get("purpose")),
    origin: params.get("origin") ?? "todos",
    bathrooms: params.get("bathrooms") ?? "",
    parking: params.get("parking") ?? "",
    amenities: params.get("amenities")
      ? params.get("amenities")!.split(",").filter(Boolean)
      : [],
  };
}

export function SearchPage() {
  const { saveSearch } = useSavedSearches();
  const [savedSearchToast, setSavedSearchToast] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(readFiltersFromUrl);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [activePopover, setActivePopover] = useState<
    "type" | "bedrooms" | "price" | null
  >(null);

  const savedToastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (savedToastTimerRef.current !== null) {
        window.clearTimeout(savedToastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setFilters(readFiltersFromUrl());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const updateUrlFilters = (next: SearchFilters) => {
    const params = new URLSearchParams();
    if (next.query) params.set("query", next.query);
    if (next.location) params.set("location", next.location);
    if (next.type) params.set("type", next.type);
    if (next.minPrice) params.set("minPrice", next.minPrice);
    if (next.maxPrice) params.set("maxPrice", next.maxPrice);
    if (next.bedrooms) params.set("bedrooms", next.bedrooms);
    if (next.purpose && next.purpose !== "comprar")
      params.set("purpose", next.purpose);
    if (next.origin && next.origin !== "todos")
      params.set("origin", next.origin);
    if (next.bathrooms) params.set("bathrooms", next.bathrooms);
    if (next.parking) params.set("parking", next.parking);
    if (next.amenities && next.amenities.length > 0) {
      params.set("amenities", next.amenities.join(","));
    }

    const queryString = params.toString();
    navigate(queryString ? `pesquisar?${queryString}` : "pesquisar");
  };

  const handleFilterChange = (next: SearchFilters) => {
    setFilters(next);
    updateUrlFilters(next);
  };

  const setFilterField = (key: keyof SearchFilters, value: unknown) => {
    const next = { ...filters, [key]: value };
    handleFilterChange(next);
  };

  const clearAllFilters = () => {
    const reset = defaultSearchFilters();
    setFilters(reset);
    updateUrlFilters(reset);
    setActivePopover(null);
  };

  const {
    data: results = [],
    isPending,
    isFetching,
  } = useFilteredPropertiesQuery(filters, sort);

  const recommendedProperties = useMemo(() => {
    return properties.filter((p) => p.verified).slice(0, 3);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.type) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.bedrooms) count++;
    if (filters.origin && filters.origin !== "todos") count++;
    if (filters.bathrooms) count++;
    if (filters.parking) count++;
    if (filters.amenities && filters.amenities.length > 0) {
      count += filters.amenities.length;
    }
    return count;
  }, [filters]);

  const activeChips = useMemo(() => {
    const list: { id: string; label: string; onRemove: () => void }[] = [];

    if (filters.location) {
      list.push({
        id: "location",
        label: `Em ${filters.location}`,
        onRemove: () => setFilterField("location", ""),
      });
    }
    if (filters.type) {
      list.push({
        id: "type",
        label: filters.type,
        onRemove: () => setFilterField("type", ""),
      });
    }
    if (filters.bedrooms) {
      list.push({
        id: "bedrooms",
        label:
          filters.bedrooms === "5" ? "T5 ou mais" : `T${filters.bedrooms}`,
        onRemove: () => setFilterField("bedrooms", ""),
      });
    }
    if (filters.minPrice || filters.maxPrice) {
      const minNum = filters.minPrice ? Number(filters.minPrice) : 0;
      const maxNum = filters.maxPrice ? Number(filters.maxPrice) : 0;
      const label =
        minNum > 0 && maxNum > 0
          ? `${formatCompactKz(minNum).replace(" Kz", "")} – ${formatCompactKz(maxNum)}`
          : minNum > 0
            ? `Desde ${formatCompactKz(minNum)}`
            : `Até ${formatCompactKz(maxNum)}`;
      list.push({
        id: "price",
        label,
        onRemove: () => {
          const next = { ...filters, minPrice: "", maxPrice: "" };
          handleFilterChange(next);
        },
      });
    }
    if (filters.bathrooms) {
      list.push({
        id: "bathrooms",
        label: `${filters.bathrooms}+ WC`,
        onRemove: () => setFilterField("bathrooms", ""),
      });
    }
    if (filters.parking) {
      list.push({
        id: "parking",
        label: `${filters.parking}+ Vagas`,
        onRemove: () => setFilterField("parking", ""),
      });
    }
    if (filters.origin && filters.origin !== "todos") {
      const matchOrigin = ORIGIN_OPTIONS.find((o) => o.id === filters.origin);
      list.push({
        id: "origin",
        label: matchOrigin ? matchOrigin.shortLabel : "Origem",
        onRemove: () => setFilterField("origin", "todos"),
      });
    }

    if (filters.amenities && filters.amenities.length > 0) {
      filters.amenities.forEach((amenity) => {
        const matched = AMENITY_OPTIONS.find(
          (opt) => opt.id === amenity || opt.label === amenity,
        );
        list.push({
          id: `amenity-${amenity}`,
          label: matched ? matched.shortLabel || matched.label : amenity,
          onRemove: () => {
            const next = {
              ...filters,
              amenities:
                filters.amenities?.filter((a) => a !== amenity) || [],
            };
            handleFilterChange(next);
          },
        });
      });
    }

    return list;
  }, [filters]);

  const isArrendamento = filters.purpose === "arrendar";

  if (isPending) {
    return <SearchPageSkeleton view={view} />;
  }

  return (
    <main className="min-h-screen w-full bg-ondjo-bg pb-24 lg:pb-16">
      {/* ===================================
           BARRA DE FILTROS RÁPIDOS (STICKY)
          =================================== */}
      <section
        aria-label="Filtros rápidos de pesquisa"
        className="sticky top-14 lg:top-16 z-40 w-full border-b border-ondjo-border bg-white shadow-[0_2px_10px_rgba(16,42,67,0.04)]"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2.5 sm:gap-3 px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          {/* Scroll horizontal fluido no mobile */}
          <div className="flex flex-1 min-w-0 items-center gap-2 overflow-x-auto md:overflow-visible no-scrollbar snap-x py-0.5">
            {/* 1. Toggle Segmentado shadcn Tabs: Comprar / Arrendar */}
            <Tabs
              value={isArrendamento ? "arrendar" : "comprar"}
              onValueChange={(val) => setFilterField("purpose", String(val))}
              className="shrink-0 snap-start"
            >
              <TabsList
                variant="pill"
                aria-label="Finalidade da pesquisa"
                className="border border-ondjo-border bg-slate-100 p-1"
              >
                <TabsTrigger
                  value="comprar"
                  className="min-h-8.5 px-3.5 sm:px-4 rounded-full text-xs font-bold"
                >
                  Comprar
                </TabsTrigger>
                <TabsTrigger
                  value="arrendar"
                  className="min-h-8.5 px-3.5 sm:px-4 rounded-full text-xs font-bold"
                >
                  Arrendar
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Separator
              orientation="vertical"
              className="hidden sm:block h-5 bg-ondjo-border shrink-0"
            />

            {/* 2. Popover shadcn: Tipo de Imóvel */}
            <Popover
              open={activePopover === "type"}
              onOpenChange={(open) => {
                if (
                  open &&
                  typeof window !== "undefined" &&
                  window.innerWidth < 768
                ) {
                  setMobileModalOpen(true);
                  return;
                }
                setActivePopover(open ? "type" : null);
              }}
            >
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "shrink-0 snap-start rounded-full px-3.5 text-xs font-semibold",
                      filters.type
                        ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue font-bold hover:bg-ondjo-blue-soft"
                        : "border-ondjo-border bg-white text-ondjo-ink hover:bg-slate-50",
                    )}
                  />
                }
              >
                <span>{filters.type || "Tipo de imóvel"}</span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-slate-500 transition-transform duration-150",
                    activePopover === "type" && "rotate-180",
                  )}
                />
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={8}
                className="w-56 p-2 rounded-2xl border-ondjo-border"
              >
                <div className="flex flex-col gap-1">
                  {PROPERTY_TYPES.map((pt) => {
                    const isSelected = filters.type === pt.value;
                    return (
                      <Button
                        key={pt.value}
                        type="button"
                        variant={isSelected ? "secondary" : "ghost"}
                        onClick={() => {
                          setFilterField("type", pt.value);
                          setActivePopover(null);
                        }}
                        className={cn(
                          "justify-between rounded-xl px-3 py-2 text-xs font-semibold",
                          isSelected
                            ? "text-ondjo-blue font-bold"
                            : "text-ondjo-ink hover:bg-slate-100",
                        )}
                      >
                        <span>{pt.label}</span>
                        {isSelected && (
                          <Check size={14} className="text-ondjo-blue" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* 3. Popover shadcn: Tipologia (Quartos) */}
            <Popover
              open={activePopover === "bedrooms"}
              onOpenChange={(open) => {
                if (
                  open &&
                  typeof window !== "undefined" &&
                  window.innerWidth < 768
                ) {
                  setMobileModalOpen(true);
                  return;
                }
                setActivePopover(open ? "bedrooms" : null);
              }}
            >
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "shrink-0 snap-start rounded-full px-3.5 text-xs font-semibold",
                      filters.bedrooms
                        ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue font-bold hover:bg-ondjo-blue-soft"
                        : "border-ondjo-border bg-white text-ondjo-ink hover:bg-slate-50",
                    )}
                  />
                }
              >
                <span>
                  {filters.bedrooms
                    ? filters.bedrooms === "5"
                      ? "T5+"
                      : `T${filters.bedrooms}`
                    : "Quartos"}
                </span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-slate-500 transition-transform duration-150",
                    activePopover === "bedrooms" && "rotate-180",
                  )}
                />
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={8}
                className="w-52 p-2 rounded-2xl border-ondjo-border"
              >
                <div className="flex flex-col gap-1">
                  {BEDROOM_OPTIONS.map((bed) => {
                    const isSelected = filters.bedrooms === bed.value;
                    return (
                      <Button
                        key={bed.value}
                        type="button"
                        variant={isSelected ? "secondary" : "ghost"}
                        onClick={() => {
                          setFilterField("bedrooms", bed.value);
                          setActivePopover(null);
                        }}
                        className={cn(
                          "justify-between rounded-xl px-3 py-2 text-xs font-semibold",
                          isSelected
                            ? "text-ondjo-blue font-bold"
                            : "text-ondjo-ink hover:bg-slate-100",
                        )}
                      >
                        <span>{bed.label}</span>
                        {isSelected && (
                          <Check size={14} className="text-ondjo-blue" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* 4. Popover shadcn: Preço */}
            <Popover
              open={activePopover === "price"}
              onOpenChange={(open) => {
                if (
                  open &&
                  typeof window !== "undefined" &&
                  window.innerWidth < 768
                ) {
                  setMobileModalOpen(true);
                  return;
                }
                setActivePopover(open ? "price" : null);
              }}
            >
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "shrink-0 snap-start rounded-full px-3.5 text-xs font-semibold",
                      filters.minPrice || filters.maxPrice
                        ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue font-bold hover:bg-ondjo-blue-soft"
                        : "border-ondjo-border bg-white text-ondjo-ink hover:bg-slate-50",
                    )}
                  />
                }
              >
                <span>
                  {filters.minPrice && filters.maxPrice
                    ? `${formatCompactKz(Number(filters.minPrice)).replace(" Kz", "")} – ${formatCompactKz(Number(filters.maxPrice))}`
                    : filters.minPrice
                      ? `Desde ${formatCompactKz(Number(filters.minPrice))}`
                      : filters.maxPrice
                        ? `Até ${formatCompactKz(Number(filters.maxPrice))}`
                        : "Preço"}
                </span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-slate-500 transition-transform duration-150",
                    activePopover === "price" && "rotate-180",
                  )}
                />
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={8}
                className="w-[22rem] sm:w-[25rem] max-w-[92vw] rounded-3xl border-ondjo-border p-5"
              >
                <PriceDualRangeSlider
                  purpose={filters.purpose}
                  minPrice={filters.minPrice}
                  maxPrice={filters.maxPrice}
                  onChangeMin={(val) => setFilterField("minPrice", val)}
                  onChangeMax={(val) => setFilterField("maxPrice", val)}
                />
              </PopoverContent>
            </Popover>

            {/* 5. Chip Rápido: Verificados ONDJO */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={filters.origin === "verificados"}
              onClick={() => {
                const nextOrigin =
                  filters.origin === "verificados" ? "todos" : "verificados";
                setFilterField("origin", nextOrigin);
              }}
              className={cn(
                "shrink-0 snap-start rounded-full px-3.5 text-xs font-semibold",
                filters.origin === "verificados"
                  ? "border-emerald-600/40 bg-emerald-50 text-emerald-900 font-bold hover:bg-emerald-100"
                  : "border-ondjo-border bg-white text-ondjo-ink hover:bg-slate-50",
              )}
            >
              <ShieldCheck
                size={14}
                className={
                  filters.origin === "verificados"
                    ? "text-emerald-700"
                    : "text-slate-500"
                }
              />
              <span>Verificados</span>
            </Button>
          </div>

          {/* Lado Direito: Botão "Mais filtros" + Limpar */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMobileModalOpen(true)}
              leftIcon={
                <SlidersHorizontal size={14} className="text-ondjo-blue" />
              }
              aria-label="Abrir todos os filtros de pesquisa"
              className="rounded-full border-ondjo-border bg-white text-ondjo-navy font-bold"
            >
              <span className="hidden sm:inline">Mais filtros</span>
              <span className="sm:hidden">Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge variant="navy" size="xs" className="px-1.5 min-w-4.5">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={clearAllFilters}
                title="Limpar todos os filtros"
                leftIcon={<RotateCcw size={12} />}
                className="hidden md:inline-flex font-bold text-ondjo-blue hover:text-ondjo-blue-dark"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTEÚDO PRINCIPAL: RESULTADOS & ORDENAÇÃO
          ========================================================= */}
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Cabeçalho de Resultados & Controlos */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ondjo-navy">
              {results.length > 0 ? (
                <>
                  {results.length}{" "}
                  {results.length === 1
                    ? "imóvel encontrado"
                    : "imóveis encontrados"}{" "}
                  {filters.location ? `em ${filters.location}` : "em Luanda"}
                </>
              ) : (
                "Nenhum imóvel disponível"
              )}
            </h1>
            {results.length > 0 && (
              <Badge
                variant="secondary"
                size="sm"
                className="hidden sm:inline-flex shrink-0"
              >
                {isArrendamento ? "Para Arrendar" : "Para Comprar"}
              </Badge>
            )}
          </div>

          {/* Controlos compactos: Guardar pesquisa + Ordenar + Visualização */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              {results.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    saveSearch(filters);
                    setSavedSearchToast(true);
                    if (savedToastTimerRef.current !== null) {
                      window.clearTimeout(savedToastTimerRef.current);
                    }
                    savedToastTimerRef.current = window.setTimeout(() => {
                      setSavedSearchToast(false);
                      savedToastTimerRef.current = null;
                    }, 2800);
                  }}
                  aria-label={
                    savedSearchToast ? "Pesquisa guardada" : "Guardar pesquisa"
                  }
                  title="Guardar pesquisa atual"
                  className={cn(
                    "h-9.5 w-9.5 sm:w-auto sm:px-3 rounded-full p-0 text-xs font-semibold shadow-2xs shrink-0",
                    savedSearchToast
                      ? "border-emerald-600/40 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "border-ondjo-border bg-white text-ondjo-ink hover:text-ondjo-blue",
                  )}
                >
                  {savedSearchToast ? (
                    <>
                      <BookmarkCheck size={14} className="text-emerald-600 shrink-0" />
                      <span className="hidden sm:inline">Guardada</span>
                    </>
                  ) : (
                    <>
                      <Bookmark size={14} className="text-ondjo-blue shrink-0" />
                      <span className="hidden sm:inline">Guardar</span>
                    </>
                  )}
                </Button>
              )}

              <Select
                value={sort}
                onValueChange={(val) => {
                  if (val) setSort(val as SortOption);
                }}
              >
                <SelectTrigger
                  aria-label="Ordenar resultados"
                  className="min-h-9.5 h-9.5 w-auto rounded-full border-ondjo-border bg-white px-3.5 text-xs font-bold text-ondjo-ink shadow-2xs hover:bg-slate-50 gap-1.5 cursor-pointer"
                >
                  <ArrowDownUp size={13} className="text-ondjo-blue shrink-0" />
                  <span className="hidden md:inline font-semibold text-ondjo-muted">
                    Ordenar:
                  </span>
                  <SelectValue>{SORT_LABELS[sort]}</SelectValue>
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="relevance">Mais relevantes</SelectItem>
                  <SelectItem value="price-low">Menor preço</SelectItem>
                  <SelectItem value="price-high">Maior preço</SelectItem>
                  <SelectItem value="area">Maior área (m²)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs
              value={view}
              onValueChange={(val) => setView(String(val) as "grid" | "list")}
            >
              <TabsList
                variant="pill"
                aria-label="Modo de visualização"
                className="border border-ondjo-border bg-slate-100 p-1"
              >
                <TabsTrigger
                  value="grid"
                  className="size-8 p-0 rounded-full"
                  aria-label="Visualização em grelha"
                  title="Grelha"
                >
                  <Grid2X2 size={16} />
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="size-8 p-0 rounded-full"
                  aria-label="Visualização em lista"
                  title="Lista"
                >
                  <List size={16} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Barra de Chips de Filtros Ativos */}
        {activeChips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-ondjo-border/60">
            <span className="text-xs font-semibold text-ondjo-muted mr-1">
              Filtros:
            </span>
            {activeChips.map((chip) => (
              <Chip
                key={chip.id}
                onRemove={chip.onRemove}
                className="min-h-8 text-xs font-bold bg-white border-ondjo-border"
              >
                {chip.label}
              </Chip>
            ))}
            <Button
              type="button"
              variant="link"
              size="xs"
              onClick={clearAllFilters}
              className="ml-1 font-bold text-ondjo-blue"
            >
              Limpar todos
            </Button>
          </div>
        )}

        {/* =========================================================
            GRELHA OU LISTA DE RESULTADOS
            ========================================================= */}
        {isFetching && results.length === 0 ? (
          <SearchResultsSkeleton view={view} count={6} />
        ) : results.length > 0 ? (
          <div
            className={cn(
              "mt-6",
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
                : "flex flex-col gap-4",
            )}
          >
            {results.map((property, idx) =>
              view === "grid" ? (
                <PropertyCard
                  key={property.id}
                  property={property}
                  index={idx}
                />
              ) : (
                <ListPropertyCard key={property.id} property={property} />
              ),
            )}
          </div>
        ) : (
          <div className="mt-8">
            <div className="rounded-3xl bg-white p-8 sm:p-12 text-center shadow-ondjo-card ondjo-border-surface max-w-2xl mx-auto">
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-ondjo-blue-soft text-ondjo-blue">
                <Search size={28} />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-ondjo-navy">
                Nenhum imóvel corresponde aos seus filtros
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-ondjo-muted max-w-md mx-auto leading-relaxed">
                Não encontramos opções em Luanda com a combinação selecionada.
                Experimente limpar os filtros ou selecionar uma das sugestões
                abaixo.
              </p>
              <div className="mt-5 flex justify-center">
                <Button
                  type="button"
                  variant="navy"
                  size="sm"
                  onClick={clearAllFilters}
                  leftIcon={<RotateCcw size={14} />}
                  className="px-5 py-2.5"
                >
                  Limpar todos os filtros
                </Button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-semibold text-ondjo-muted">
                Tente também:
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = {
                    ...defaultSearchFilters(),
                    location: "Talatona",
                  };
                  handleFilterChange(next);
                }}
                className="rounded-full font-bold text-ondjo-ink hover:text-ondjo-blue"
              >
                Imóveis em Talatona
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = {
                    ...defaultSearchFilters(),
                    location: "Kilamba",
                  };
                  handleFilterChange(next);
                }}
                className="rounded-full font-bold text-ondjo-ink hover:text-ondjo-blue"
              >
                Apartamentos no Kilamba
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = {
                    ...defaultSearchFilters(),
                    purpose: "arrendar",
                  };
                  handleFilterChange(next);
                }}
                className="rounded-full font-bold text-ondjo-ink hover:text-ondjo-blue"
              >
                Ver opções para Arrendar
              </Button>
            </div>

            <div className="mt-14 pt-10 border-t border-ondjo-border/70">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-ondjo-navy">
                    Outros imóveis disponíveis em Luanda
                  </h2>
                  <p className="mt-0.5 text-xs text-ondjo-muted">
                    Opções auditadas que podem interessar-lhe
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {recommendedProperties.map((prop, idx) => (
                  <PropertyCard key={prop.id} property={prop} index={idx} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          MODAL COMPLETO VIA SHADCN DIALOG: "FILTRAR PESQUISA"
          ========================================================= */}
      <Dialog open={mobileModalOpen} onOpenChange={setMobileModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[90dvh] w-full max-w-xl p-0 gap-0 overflow-hidden rounded-3xl flex flex-col"
        >
          <DialogHeader className="flex-row items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-4 shrink-0">
            <div>
              <DialogTitle className="text-base font-bold tracking-tight text-ondjo-navy">
                Filtrar pesquisa
              </DialogTitle>
              <DialogDescription className="text-xs text-ondjo-muted tabular-nums">
                {results.length}{" "}
                {results.length === 1
                  ? "imóvel disponível"
                  : "imóveis disponíveis"}
              </DialogDescription>
            </div>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Fechar filtros (Esc)"
                  className="size-9.5 rounded-full bg-slate-100 text-ondjo-ink hover:bg-slate-200"
                />
              }
            >
              <X size={18} />
            </DialogClose>
          </DialogHeader>

          {/* Corpo Rolável */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6 overscroll-contain">
            {/* 1. Modalidade */}
            <div>
              <span className="block text-xs font-bold text-ondjo-navy mb-2">
                Modalidade
              </span>
              <Tabs
                value={isArrendamento ? "arrendar" : "comprar"}
                onValueChange={(val) => setFilterField("purpose", String(val))}
                className="w-full"
              >
                <TabsList
                  aria-label="Modalidade do imóvel"
                  className="grid w-full grid-cols-2 rounded-xl border border-ondjo-border bg-slate-100 p-1"
                >
                  <TabsTrigger
                    value="comprar"
                    className="min-h-10 rounded-lg text-xs font-bold"
                  >
                    Comprar
                  </TabsTrigger>
                  <TabsTrigger
                    value="arrendar"
                    className="min-h-10 rounded-lg text-xs font-bold"
                  >
                    Arrendar
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Separator />

            {/* 2. Localização & Bairros Populares */}
            <div>
              <label className="block">
                <span className="block text-xs font-bold text-ondjo-navy mb-2">
                  Localização em Luanda
                </span>
                <div className="relative flex items-center">
                  <MapPin
                    size={16}
                    className="pointer-events-none absolute left-3.5 text-slate-400"
                  />
                  <Input
                    value={filters.location}
                    onChange={(e) => setFilterField("location", e.target.value)}
                    placeholder="Ex.: Talatona, Maianga, Kilamba..."
                    className="pl-10 pr-9"
                  />
                  {filters.location && (
                    <button
                      type="button"
                      onClick={() => setFilterField("location", "")}
                      aria-label="Limpar localização"
                      className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-ondjo-ink cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </label>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {POPULAR_NEIGHBORHOODS.map((neigh) => {
                  const isSel = filters.location === neigh;
                  return (
                    <button
                      key={neigh}
                      type="button"
                      onClick={() =>
                        setFilterField("location", isSel ? "" : neigh)
                      }
                      className={cn(
                        "focus-ring min-h-8.5 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer",
                        isSel
                          ? "ondjo-border-selected bg-ondjo-navy text-white"
                          : "ondjo-border-interactive bg-white text-ondjo-ink hover:bg-slate-50",
                      )}
                    >
                      {neigh}
                    </button>
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
                {PROPERTY_TYPES.map((pt) => {
                  const isSelected = filters.type === pt.value;
                  return (
                    <button
                      key={pt.value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setFilterField("type", pt.value)}
                      className={cn(
                        "focus-ring flex min-h-10.5 items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer",
                        isSelected
                          ? "ondjo-border-selected bg-ondjo-blue-50/75 text-ondjo-blue font-bold"
                          : "ondjo-border-interactive bg-white text-ondjo-ink hover:bg-slate-50",
                      )}
                    >
                      {pt.label}
                    </button>
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
                value={filters.origin || "todos"}
                onChange={(orig: SearchOrigin) => setFilterField("origin", orig)}
              />
            </div>

            <Separator />

            {/* 5. Preço em Kwanzas (Kz) */}
            <div>
              <PriceDualRangeSlider
                purpose={filters.purpose}
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onChangeMin={(val) => setFilterField("minPrice", val)}
                onChangeMax={(val) => setFilterField("maxPrice", val)}
              />
            </div>

            <Separator />

            {/* 6. Quartos, Casas de Banho & Estacionamento */}
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-bold text-ondjo-navy mb-2">
                  Quartos (Tipologia)
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {BEDROOM_OPTIONS.map((bed) => {
                    const isSelected = filters.bedrooms === bed.value;
                    return (
                      <button
                        key={bed.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setFilterField("bedrooms", bed.value)}
                        className={cn(
                          "focus-ring min-h-10 rounded-xl px-2 text-xs font-semibold cursor-pointer",
                          isSelected
                            ? "ondjo-border-selected bg-ondjo-blue-50/75 text-ondjo-blue font-bold"
                            : "ondjo-border-interactive bg-white text-ondjo-ink hover:bg-slate-50",
                        )}
                      >
                        {bed.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-bold text-ondjo-navy mb-2">
                    Casas de banho
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["", "1", "2", "3"].map((val) => {
                      const isSelected = filters.bathrooms === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setFilterField("bathrooms", val)}
                          className={cn(
                            "focus-ring min-h-10 rounded-xl text-xs font-semibold cursor-pointer",
                            isSelected
                              ? "ondjo-border-selected bg-ondjo-blue-50/75 text-ondjo-blue font-bold"
                              : "ondjo-border-interactive bg-white text-ondjo-ink hover:bg-slate-50",
                          )}
                        >
                          {val ? `${val}+` : "Todas"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-bold text-ondjo-navy mb-2">
                    Estacionamento
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["", "1", "2"].map((val) => {
                      const isSelected = filters.parking === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setFilterField("parking", val)}
                          className={cn(
                            "focus-ring min-h-10 rounded-xl text-xs font-semibold cursor-pointer",
                            isSelected
                              ? "ondjo-border-selected bg-ondjo-blue-50/75 text-ondjo-blue font-bold"
                              : "ondjo-border-interactive bg-white text-ondjo-ink hover:bg-slate-50",
                          )}
                        >
                          {val ? `${val}+` : "Todas"}
                        </button>
                      );
                    })}
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
                  {filters.amenities && filters.amenities.length > 0
                    ? ` (${filters.amenities.length})`
                    : ""}
                </span>
                {filters.amenities && filters.amenities.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setFilterField("amenities", [])}
                    className="text-ondjo-blue hover:bg-ondjo-blue-50"
                  >
                    Limpar
                  </Button>
                )}
              </div>
              <AmenitiesSelector
                selected={filters.amenities || []}
                onToggle={(amenityId) => {
                  const cur = filters.amenities || [];
                  const matched = AMENITY_OPTIONS.find(
                    (a) => a.id === amenityId,
                  );
                  const isSelected =
                    cur.includes(amenityId) ||
                    (matched ? cur.includes(matched.label) : false);
                  const next = isSelected
                    ? cur.filter(
                        (a) =>
                          a !== amenityId && (!matched || a !== matched.label),
                      )
                    : [...cur, amenityId];
                  setFilterField("amenities", next);
                }}
              />
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-3xl border-t border-slate-100 bg-white px-5 sm:px-6 py-4 flex-row items-center justify-between gap-3">
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
              onClick={() => setMobileModalOpen(false)}
              className="flex-1 h-11 rounded-xl px-5 text-sm font-bold shadow-sm tabular-nums"
            >
              Mostrar {results.length}{" "}
              {results.length === 1 ? "imóvel" : "imóveis"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function ListPropertyCard({
  property,
}: {
  property: (typeof properties)[number];
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(property.id);
  const isArrendamento = property.purpose === "arrendamento";

  return (
    <article
      onClick={() => navigate(`imovel/${property.id}`)}
      className="focus-ring group grid w-full gap-4 sm:gap-5 rounded-3xl bg-white p-3.5 sm:p-4 shadow-ondjo-card hover:shadow-ondjo-card-hover hover:-translate-y-0.5 ondjo-border-interactive transition-[transform,box-shadow,border-color] duration-150 sm:grid-cols-[260px_1fr] cursor-pointer relative"
    >
      <div className="relative overflow-hidden rounded-2xl bg-slate-100 aspect-4/3 w-full sm:aspect-auto sm:h-full">
        <PropertyImageCarousel
          propertyId={property.id}
          images={property.images}
          title={property.title}
          aspectRatio="aspect-4/3 sm:h-full w-full"
          showLightboxButton={false}
        />

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5">
          {property.verified && (
            <Badge
              variant="verified"
              size="sm"
              className="bg-white border-ondjo-border shadow-xs py-0.5 px-2.5 text-[11px]"
            >
              Verificado
            </Badge>
          )}
          <Badge variant="navy" size="sm" className="py-0.5 px-2.5 text-[10px]">
            {isArrendamento ? "Arrendamento" : "Venda"}
          </Badge>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className="focus-ring absolute right-3 top-3 z-20 flex size-8.5 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm transition-transform duration-150 hover:scale-110 active:scale-90 cursor-pointer"
          aria-label={
            favorite ? "Remover dos favoritos" : "Guardar nos favoritos"
          }
        >
          <Heart
            size={16}
            className={
              favorite ? "fill-ondjo-danger text-ondjo-danger" : "text-slate-600"
            }
          />
        </button>
      </div>

      <div className="flex flex-col justify-between py-1 sm:py-2">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base sm:text-lg text-ondjo-navy group-hover:text-ondjo-blue transition-colors line-clamp-1">
              {property.type} · {property.neighborhood}, {property.city}
            </h3>
          </div>

          <p className="mt-1 text-xs sm:text-sm text-ondjo-muted line-clamp-1 font-medium">
            {property.title}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="rounded-lg ondjo-border-hairline bg-slate-100/80 px-2 py-0.5 text-slate-700">
              T{property.bedrooms}
            </span>
            <span className="rounded-lg ondjo-border-hairline bg-slate-100/80 px-2 py-0.5 text-slate-700">
              {property.bathrooms} WC
            </span>
            <span className="rounded-lg ondjo-border-hairline bg-slate-100/80 px-2 py-0.5 text-slate-700">
              {property.area} m²
            </span>
            {property.parking > 0 && (
              <span className="rounded-lg ondjo-border-hairline bg-slate-100/80 px-2 py-0.5 text-slate-700">
                {property.parking} Vaga{property.parking > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-lg sm:text-xl font-extrabold text-ondjo-navy tracking-tight">
            {formatKz(property.price, { perMonth: isArrendamento })}
          </span>
          <span className="text-xs font-bold text-ondjo-blue bg-ondjo-blue-soft/60 group-hover:bg-ondjo-blue group-hover:text-white px-3 py-1.5 rounded-full transition-colors duration-150 inline-flex items-center gap-1">
            Ver detalhes →
          </span>
        </div>
      </div>
    </article>
  );
}
