import {
  ArrowDownUp,
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
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { properties } from "../data/properties";
import { filterProperties } from "../utils/filterProperties";
import { formatKz } from "../utils/format";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyImageCarousel } from "../components/PropertyImageCarousel";
import { Chip, EmptyState, Badge, Button } from "../components/ui";
import {
  defaultSearchFilters,
  type SearchFilters,
  PROPERTY_TYPES,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
} from "../components/SearchBar";
import { navigate } from "../hooks/useHashRoute";
import { useFavorites } from "../hooks/useFavorites";

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

const PRICE_PRESETS = [
  { label: "Até 50M Kz", max: "50000000" },
  { label: "50M – 150M Kz", min: "50000000", max: "150000000" },
  { label: "150M – 300M Kz", min: "150000000", max: "300000000" },
  { label: "Mais de 300M Kz", min: "300000000" },
];

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
    purpose: params.get("purpose") ?? "comprar",
    origin: params.get("origin") ?? "todos",
    bathrooms: params.get("bathrooms") ?? "",
    parking: params.get("parking") ?? "",
  };
}

export function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>(readFiltersFromUrl);
  const [sort, setSort] = useState<"relevance" | "price-low" | "price-high" | "area">("relevance");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [activePopover, setActivePopover] = useState<"type" | "bedrooms" | "price" | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Sincroniza filtros ao mudar a hash (ex.: voltar no navegador)
  useEffect(() => {
    const handleHashChange = () => {
      setFilters(readFiltersFromUrl());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Fechar popover ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };
    if (activePopover) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activePopover]);

  // Bloqueio do scroll do body quando modal móvel está aberto
  useEffect(() => {
    if (!mobileModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileModalOpen]);

  // Atualiza a URL mantendo a rota limpa
  const updateUrlFilters = (next: SearchFilters) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, val]) => {
      if (val && val !== "todos") {
        params.set(key, String(val));
      }
    });
    const queryString = params.toString();
    navigate(`pesquisar${queryString ? `?${queryString}` : ""}`);
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
    handleFilterChange(reset);
    setActivePopover(null);
  };

  // Imóveis filtrados e ordenados
  const results = useMemo(() => {
    const filtered = filterProperties(properties, {
      ...filters,
      query: filters.query || filters.location,
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "area") return b.area - a.area;
      // Relevância: destaques primeiro, seguidos por verificados
      if (b.featured !== a.featured) return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      return Number(Boolean(b.verified)) - Number(Boolean(a.verified));
    });
  }, [filters, sort]);

  // Imóveis sugeridos caso a pesquisa volte vazia
  const recommendedProperties = useMemo(() => {
    return properties.filter((p) => p.featured || p.verified).slice(0, 3);
  }, []);

  // Contagem de filtros ativos para badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.type) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.parking) count++;
    if (filters.origin && filters.origin !== "todos") count++;
    return count;
  }, [filters]);

  // Lista de chips visíveis e removíveis
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
        label: filters.bedrooms === "5" ? "T5 ou mais" : `T${filters.bedrooms}`,
        onRemove: () => setFilterField("bedrooms", ""),
      });
    }
    if (filters.minPrice || filters.maxPrice) {
      const minText = filters.minPrice ? `≥ ${formatKz(Number(filters.minPrice))}` : "";
      const maxText = filters.maxPrice ? `≤ ${formatKz(Number(filters.maxPrice))}` : "";
      list.push({
        id: "price",
        label: [minText, maxText].filter(Boolean).join(" · "),
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
    if (filters.origin === "verificados") {
      list.push({
        id: "origin",
        label: "Só Verificados",
        onRemove: () => setFilterField("origin", "todos"),
      });
    }

    return list;
  }, [filters]);

  const isArrendamento = filters.purpose === "arrendar";

  return (
    <main className="min-h-screen w-full bg-ondjo-bg pb-20">
      {/* =========================================================
          BARRA DE FILTROS RÁPIDOS ESTILO AIRBNB (STICKY)
          ========================================================= */}
      <section
        aria-label="Filtros rápidos de pesquisa"
        className="sticky top-14 sm:top-18 lg:top-20 z-30 w-full border-b border-ondjo-border/80 bg-white/95 backdrop-blur-md shadow-2xs transition-all"
        ref={popoverRef}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          {/* Scroll horizontal fluido no mobile com snap */}
          <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar snap-x py-0.5">
            {/* 1. Toggle Segmentado: Comprar / Arrendar */}
            <div
              role="group"
              aria-label="Finalidade da pesquisa"
              className="flex shrink-0 items-center rounded-full border border-ondjo-border/80 bg-slate-100/90 p-0.5 shadow-2xs snap-start"
            >
              <button
                type="button"
                onClick={() => setFilterField("purpose", "comprar")}
                className={`focus-ring min-h-9 px-3.5 sm:px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  !isArrendamento
                    ? "bg-white text-ondjo-navy shadow-xs"
                    : "text-ondjo-muted hover:text-ondjo-ink"
                }`}
              >
                Comprar
              </button>
              <button
                type="button"
                onClick={() => setFilterField("purpose", "arrendar")}
                className={`focus-ring min-h-9 px-3.5 sm:px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isArrendamento
                    ? "bg-white text-ondjo-navy shadow-xs"
                    : "text-ondjo-muted hover:text-ondjo-ink"
                }`}
              >
                Arrendar
              </button>
            </div>

            {/* Separador vertical subtil no desktop */}
            <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" aria-hidden="true" />

            {/* 2. Chip: Tipo de Imóvel */}
            <div className="relative shrink-0 snap-start">
              <button
                type="button"
                onClick={() =>
                  setActivePopover(activePopover === "type" ? null : "type")
                }
                className={`focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold transition-all cursor-pointer select-none ${
                  filters.type
                    ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue shadow-2xs"
                    : "border-ondjo-border bg-white text-ondjo-ink hover:border-slate-300 hover:bg-slate-50"
                }`}
                aria-expanded={activePopover === "type"}
                aria-haspopup="true"
              >
                <span>{filters.type || "Tipo de imóvel"}</span>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform ${
                    activePopover === "type" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Popover Dropdown de Tipo */}
              {activePopover === "type" && (
                <div className="absolute left-0 top-full mt-2 z-50 w-52 rounded-2xl border border-ondjo-border bg-white p-2 shadow-ondjo-popover">
                  <div className="flex flex-col gap-1">
                    {PROPERTY_TYPES.map((pt) => {
                      const isSelected = filters.type === pt.value;
                      return (
                        <button
                          key={pt.value}
                          type="button"
                          onClick={() => {
                            setFilterField("type", pt.value);
                            setActivePopover(null);
                          }}
                          className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                            isSelected
                              ? "bg-ondjo-blue-50 text-ondjo-blue font-bold"
                              : "text-ondjo-ink hover:bg-slate-50"
                          }`}
                        >
                          <span>{pt.label}</span>
                          {isSelected && <Check size={14} className="text-ondjo-blue" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Chip: Tipologia (Quartos) */}
            <div className="relative shrink-0 snap-start">
              <button
                type="button"
                onClick={() =>
                  setActivePopover(activePopover === "bedrooms" ? null : "bedrooms")
                }
                className={`focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold transition-all cursor-pointer select-none ${
                  filters.bedrooms
                    ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue shadow-2xs"
                    : "border-ondjo-border bg-white text-ondjo-ink hover:border-slate-300 hover:bg-slate-50"
                }`}
                aria-expanded={activePopover === "bedrooms"}
                aria-haspopup="true"
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
                  className={`text-slate-400 transition-transform ${
                    activePopover === "bedrooms" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Popover Dropdown de Quartos */}
              {activePopover === "bedrooms" && (
                <div className="absolute left-0 top-full mt-2 z-50 w-48 rounded-2xl border border-ondjo-border bg-white p-2 shadow-ondjo-popover">
                  <div className="flex flex-col gap-1">
                    {BEDROOM_OPTIONS.map((bed) => {
                      const isSelected = filters.bedrooms === bed.value;
                      return (
                        <button
                          key={bed.value}
                          type="button"
                          onClick={() => {
                            setFilterField("bedrooms", bed.value);
                            setActivePopover(null);
                          }}
                          className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                            isSelected
                              ? "bg-ondjo-blue-50 text-ondjo-blue font-bold"
                              : "text-ondjo-ink hover:bg-slate-50"
                          }`}
                        >
                          <span>{bed.label}</span>
                          {isSelected && <Check size={14} className="text-ondjo-blue" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Chip: Preço */}
            <div className="relative shrink-0 snap-start">
              <button
                type="button"
                onClick={() =>
                  setActivePopover(activePopover === "price" ? null : "price")
                }
                className={`focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold transition-all cursor-pointer select-none ${
                  filters.minPrice || filters.maxPrice
                    ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue shadow-2xs"
                    : "border-ondjo-border bg-white text-ondjo-ink hover:border-slate-300 hover:bg-slate-50"
                }`}
                aria-expanded={activePopover === "price"}
                aria-haspopup="true"
              >
                <span>
                  {filters.minPrice || filters.maxPrice ? "Preço definido" : "Preço"}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform ${
                    activePopover === "price" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Popover de Preço */}
              {activePopover === "price" && (
                <div className="absolute left-0 top-full mt-2 z-50 w-72 rounded-2xl border border-ondjo-border bg-white p-4 shadow-ondjo-popover">
                  <p className="text-xs font-extrabold text-ondjo-ink uppercase tracking-wider mb-2">
                    Faixa de Preço (Kz)
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <input
                      inputMode="numeric"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilterField("minPrice", e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Mínimo"
                      className="h-9 w-full rounded-xl border border-ondjo-border bg-slate-50 px-2.5 text-xs font-semibold text-ondjo-ink outline-none focus:border-ondjo-blue focus:bg-white"
                    />
                    <input
                      inputMode="numeric"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilterField("maxPrice", e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Máximo"
                      className="h-9 w-full rounded-xl border border-ondjo-border bg-slate-50 px-2.5 text-xs font-semibold text-ondjo-ink outline-none focus:border-ondjo-blue focus:bg-white"
                    />
                  </div>

                  {/* Presets Rápidos */}
                  <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
                    {PRICE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          const next = {
                            ...filters,
                            minPrice: preset.min || "",
                            maxPrice: preset.max || "",
                          };
                          handleFilterChange(next);
                          setActivePopover(null);
                        }}
                        className="text-left px-2 py-1.5 rounded-lg text-xs font-medium text-ondjo-muted hover:text-ondjo-blue hover:bg-ondjo-blue-50 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. Chip Rápido: Verificados ONDJO */}
            <button
              type="button"
              onClick={() => {
                const nextOrigin =
                  filters.origin === "verificados" ? "todos" : "verificados";
                setFilterField("origin", nextOrigin);
              }}
              className={`focus-ring shrink-0 snap-start inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold transition-all cursor-pointer select-none ${
                filters.origin === "verificados"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-2xs"
                  : "border-ondjo-border bg-white text-ondjo-ink hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <ShieldCheck
                size={14}
                className={
                  filters.origin === "verificados" ? "text-emerald-600" : "text-slate-400"
                }
              />
              <span>Verificados</span>
            </button>
          </div>

          {/* Lado Direito: Botão "Mais Filtros" com badge de contagem */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileModalOpen(true)}
              className="focus-ring relative inline-flex min-h-9.5 items-center gap-2 rounded-full border border-ondjo-border bg-white px-3.5 py-1.5 text-xs font-bold text-ondjo-ink shadow-2xs hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              aria-label="Abrir todos os filtros de pesquisa"
            >
              <SlidersHorizontal size={14} className="text-ondjo-blue" />
              <span>Mais filtros</span>
              {activeFiltersCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-ondjo-navy text-white text-[10px] font-black">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Botão rápido para limpar tudo caso haja filtros */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                title="Limpar todos os filtros"
                className="focus-ring hidden md:inline-flex items-center gap-1 text-xs font-bold text-ondjo-blue hover:underline cursor-pointer px-1 py-1"
              >
                <RotateCcw size={12} />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTEÚDO PRINCIPAL: RESULTADOS & ORDENAÇÃO
          ========================================================= */}
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-5 sm:pt-7">
        {/* Breadcrumb e Resumo */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-ondjo-muted">
              <a href="#/" className="hover:text-ondjo-blue transition-colors">
                Início
              </a>
              <span className="text-slate-300">/</span>
              <span className="text-ondjo-ink">Pesquisa</span>
              {filters.location && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="text-ondjo-blue font-bold">{filters.location}</span>
                </>
              )}
            </div>

            <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-ondjo-navy">
              {results.length > 0 ? (
                <>
                  {results.length}{" "}
                  {results.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}{" "}
                  {filters.location ? `em ${filters.location}` : "em Luanda"}
                </>
              ) : (
                "Nenhum imóvel disponível"
              )}
            </h1>
          </div>

          {/* Controlos de Ordenação & Alternador de Visualização */}
          <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-2.5">
            {/* Seletor de Ordenação */}
            <label className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-full border border-ondjo-border bg-white px-3.5 py-1 text-xs font-semibold text-ondjo-ink shadow-2xs hover:border-slate-300 cursor-pointer">
              <ArrowDownUp size={13} className="text-ondjo-muted shrink-0" />
              <span className="hidden sm:inline text-ondjo-muted">Ordenar:</span>
              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value as "relevance" | "price-low" | "price-high" | "area")
                }
                className="bg-transparent font-bold outline-none text-ondjo-ink cursor-pointer"
              >
                <option value="relevance">Mais relevantes</option>
                <option value="price-low">Menor preço</option>
                <option value="price-high">Maior preço</option>
                <option value="area">Maior área (m²)</option>
              </select>
            </label>

            {/* Alternador Grelha / Lista */}
            <div
              role="group"
              aria-label="Modo de visualização"
              className="inline-flex rounded-full border border-ondjo-border bg-white p-1 shadow-2xs"
            >
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`focus-ring grid size-8 place-items-center rounded-full transition-colors cursor-pointer ${
                  view === "grid"
                    ? "bg-ondjo-blue-soft text-ondjo-blue shadow-xs"
                    : "text-ondjo-muted hover:text-ondjo-ink"
                }`}
                aria-label="Visualização em grelha"
                title="Grelha"
              >
                <Grid2X2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`focus-ring grid size-8 place-items-center rounded-full transition-colors cursor-pointer ${
                  view === "list"
                    ? "bg-ondjo-blue-soft text-ondjo-blue shadow-xs"
                    : "text-ondjo-muted hover:text-ondjo-ink"
                }`}
                aria-label="Visualização em lista"
                title="Lista"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Chips de Filtros Ativos com Remoção Individual */}
        {activeChips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-200/60">
            <span className="text-xs font-semibold text-ondjo-muted mr-1">Filtros:</span>
            {activeChips.map((chip) => (
              <span
                key={chip.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-ondjo-border/80 bg-white pl-3 pr-1.5 py-1 text-xs font-bold text-ondjo-ink shadow-2xs"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="grid size-4 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-90 transition-colors"
                  aria-label={`Remover filtro ${chip.label}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-1 text-xs font-bold text-ondjo-blue hover:underline cursor-pointer"
            >
              Limpar todos
            </button>
          </div>
        )}

        {/* =========================================================
            GRELHA OU LISTA DE RESULTADOS
            ========================================================= */}
        {results.length > 0 ? (
          <div
            className={`mt-6 ${
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
                : "flex flex-col gap-4"
            }`}
          >
            {results.map((property, idx) =>
              view === "grid" ? (
                <PropertyCard key={property.id} property={property} index={idx} />
              ) : (
                <ListPropertyCard key={property.id} property={property} />
              ),
            )}
          </div>
        ) : (
          /* =========================================================
             ESTADO VAZIO INTELIGENTE COM SUGESTÕES ACIONÁVEIS
             ========================================================= */
          <div className="mt-8">
            <EmptyState
              icon={<Search size={28} className="text-ondjo-blue" />}
              title="Nenhum imóvel corresponde aos seus filtros"
              description="Não encontramos opções em Luanda com a combinação selecionada. Experimente limpar os filtros ou selecionar uma das sugestões abaixo."
              actionLabel="Limpar todos os filtros"
              onAction={clearAllFilters}
              className="border-dashed border-2 border-slate-200 py-12"
            />

            {/* Sugestões Rápidas de Pesquisa */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-semibold text-ondjo-muted">Tente também:</span>
              <button
                type="button"
                onClick={() => {
                  const next = { ...defaultSearchFilters(), location: "Talatona" };
                  handleFilterChange(next);
                }}
                className="rounded-full border border-ondjo-border bg-white px-3 py-1 text-xs font-bold text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue transition-colors cursor-pointer"
              >
                Imóveis em Talatona
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = { ...defaultSearchFilters(), location: "Kilamba" };
                  handleFilterChange(next);
                }}
                className="rounded-full border border-ondjo-border bg-white px-3 py-1 text-xs font-bold text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue transition-colors cursor-pointer"
              >
                Apartamentos no Kilamba
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = { ...defaultSearchFilters(), purpose: "arrendar" };
                  handleFilterChange(next);
                }}
                className="rounded-full border border-ondjo-border bg-white px-3 py-1 text-xs font-bold text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue transition-colors cursor-pointer"
              >
                Ver opções para Arrendar
              </button>
            </div>

            {/* Secção de Imóveis Recomendados para o utilizador nunca ficar preso */}
            <div className="mt-14 pt-10 border-t border-slate-200">
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
          DRAWER / MODAL COMPLETO: "MAIS FILTROS"
          ========================================================= */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {mobileModalOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Todos os filtros de pesquisa"
                className="fixed inset-0 z-100 flex flex-col justify-end lg:items-center lg:justify-center bg-black/60 backdrop-blur-xs p-0 lg:p-4"
              >
                {/* Backdrop clicável */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0"
                  onClick={() => setMobileModalOpen(false)}
                  aria-label="Fechar painel de filtros"
                />

                {/* Conteúdo do Sheet / Modal */}
                <motion.div
                  initial={{ y: "100%", opacity: 0.8 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 28, stiffness: 280 }}
                  className="relative z-10 flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] lg:rounded-3xl bg-white shadow-2xl"
                >
                  {/* Pega no mobile */}
                  <div className="pt-3 pb-1 flex justify-center shrink-0 lg:hidden">
                    <div className="h-1.5 w-12 rounded-full bg-slate-300" />
                  </div>

                  {/* Topo: Título + Botão Fechar */}
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-ondjo-navy">
                        Filtros de Pesquisa
                      </h2>
                      <p className="text-xs text-ondjo-muted">
                        Personalize a sua procura de imóveis em Angola
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileModalOpen(false)}
                      className="focus-ring grid size-10 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-colors cursor-pointer"
                      aria-label="Fechar filtros (Esc)"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Corpo Rolável */}
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 overscroll-contain">
                    {/* 1. Modalidade */}
                    <div>
                      <span className="block text-xs font-bold text-ondjo-ink uppercase tracking-wider mb-2">
                        Finalidade
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFilterField("purpose", "comprar")}
                          className={`min-h-11 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            !isArrendamento
                              ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue shadow-2xs"
                              : "border-ondjo-border text-ondjo-muted hover:bg-slate-50"
                          }`}
                        >
                          Comprar
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterField("purpose", "arrendar")}
                          className={`min-h-11 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isArrendamento
                              ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue shadow-2xs"
                              : "border-ondjo-border text-ondjo-muted hover:bg-slate-50"
                          }`}
                        >
                          Arrendar
                        </button>
                      </div>
                    </div>

                    {/* 2. Localização & Bairros Populares */}
                    <div>
                      <label className="block">
                        <span className="block text-xs font-bold text-ondjo-ink uppercase tracking-wider mb-2">
                          Localização em Luanda
                        </span>
                        <div className="relative">
                          <MapPin
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            value={filters.location}
                            onChange={(e) => setFilterField("location", e.target.value)}
                            placeholder="Ex.: Talatona, Maianga, Kilamba..."
                            className="h-11 w-full rounded-xl border border-ondjo-border bg-slate-50/70 pl-10 pr-3 text-sm font-semibold text-ondjo-ink outline-none transition-colors focus:border-ondjo-blue focus:bg-white"
                          />
                        </div>
                      </label>

                      {/* Chips rápidos de bairros */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {POPULAR_NEIGHBORHOODS.map((neigh) => (
                          <button
                            key={neigh}
                            type="button"
                            onClick={() => setFilterField("location", neigh)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                              filters.location === neigh
                                ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue font-bold"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {neigh}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Tipo de Imóvel */}
                    <div>
                      <span className="block text-xs font-bold text-ondjo-ink uppercase tracking-wider mb-2">
                        Tipo de Imóvel
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PROPERTY_TYPES.map((pt) => {
                          const isSelected = filters.type === pt.value;
                          return (
                            <button
                              key={pt.value}
                              type="button"
                              onClick={() => setFilterField("type", pt.value)}
                              className={`min-h-10 rounded-xl px-3 text-xs font-semibold border transition-all cursor-pointer text-center ${
                                isSelected
                                  ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue font-bold shadow-2xs"
                                  : "border-ondjo-border text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {pt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 4. Tipologia (Quartos) */}
                    <div>
                      <span className="block text-xs font-bold text-ondjo-ink uppercase tracking-wider mb-2">
                        Quartos (Tipologia)
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {BEDROOM_OPTIONS.map((bed) => {
                          const isSelected = filters.bedrooms === bed.value;
                          return (
                            <button
                              key={bed.value}
                              type="button"
                              onClick={() => setFilterField("bedrooms", bed.value)}
                              className={`min-h-10 rounded-xl px-2 text-xs font-semibold border transition-all cursor-pointer ${
                                isSelected
                                  ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue font-bold shadow-2xs"
                                  : "border-ondjo-border text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {bed.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 5. Faixa de Preço */}
                    <div>
                      <span className="block text-xs font-bold text-ondjo-ink uppercase tracking-wider mb-2">
                        Faixa de Preço (Kz)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          inputMode="numeric"
                          value={filters.minPrice}
                          onChange={(e) =>
                            setFilterField("minPrice", e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="Mínimo (Kz)"
                          className="h-11 w-full rounded-xl border border-ondjo-border bg-slate-50/70 px-3 text-sm font-semibold text-ondjo-ink outline-none transition-colors focus:border-ondjo-blue focus:bg-white"
                        />
                        <input
                          inputMode="numeric"
                          value={filters.maxPrice}
                          onChange={(e) =>
                            setFilterField("maxPrice", e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="Máximo (Kz)"
                          className="h-11 w-full rounded-xl border border-ondjo-border bg-slate-50/70 px-3 text-sm font-semibold text-ondjo-ink outline-none transition-colors focus:border-ondjo-blue focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* 6. Casas de Banho & Estacionamento */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-xs font-bold text-ondjo-ink uppercase tracking-wider mb-2">
                          Casas de Banho
                        </span>
                        <div className="flex gap-1.5">
                          {["", "1", "2", "3"].map((val) => {
                            const isSelected = filters.bathrooms === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setFilterField("bathrooms", val)}
                                className={`flex-1 min-h-10 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue font-bold shadow-2xs"
                                    : "border-ondjo-border text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {val ? `${val}+` : "Todas"}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <span className="block text-xs font-bold text-ondjo-ink uppercase tracking-wider mb-2">
                          Estacionamento
                        </span>
                        <div className="flex gap-1.5">
                          {["", "1", "2"].map((val) => {
                            const isSelected = filters.parking === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setFilterField("parking", val)}
                                className={`flex-1 min-h-10 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue font-bold shadow-2xs"
                                    : "border-ondjo-border text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {val ? `${val}+` : "Todas"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 7. Origem / Verificação */}
                    <div>
                      <span className="block text-xs font-bold text-ondjo-ink uppercase tracking-wider mb-2">
                        Auditoria & Verificação
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFilterField("origin", "todos")}
                          className={`min-h-10 rounded-xl px-3 text-xs font-semibold border transition-all cursor-pointer ${
                            filters.origin !== "verificados"
                              ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue font-bold shadow-2xs"
                              : "border-ondjo-border text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          Todos os Anúncios
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterField("origin", "verificados")}
                          className={`min-h-10 rounded-xl px-3 text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            filters.origin === "verificados"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800 font-bold shadow-2xs"
                              : "border-ondjo-border text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <ShieldCheck size={14} className="text-emerald-600" />
                          <span>Só Verificados</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé Fixo do Modal */}
                  <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 flex items-center justify-between gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-xs font-bold text-ondjo-muted hover:text-ondjo-ink hover:underline cursor-pointer"
                    >
                      Limpar tudo
                    </button>

                    <button
                      type="button"
                      onClick={() => setMobileModalOpen(false)}
                      className="focus-ring flex min-h-11 items-center justify-center rounded-xl bg-ondjo-navy px-6 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-slate-800 active:scale-98 transition-all cursor-pointer"
                    >
                      Ver {results.length} {results.length === 1 ? "imóvel" : "imóveis"}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </main>
  );
}

// Visualização em Linha (Lista) estilo Airbnb Standard Search
function ListPropertyCard({ property }: { property: (typeof properties)[number] }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(property.id);
  const isArrendamento = property.purpose === "arrendamento";

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`imovel/${property.id}`)}
      className="focus-ring group grid w-full gap-4 rounded-3xl border border-ondjo-border/80 bg-white p-3.5 sm:p-4 shadow-ondjo-card hover:shadow-ondjo-card-hover transition-all duration-300 sm:grid-cols-[240px_1fr] cursor-pointer relative"
    >
      <div className="relative overflow-hidden rounded-2xl bg-slate-100 aspect-4/3 w-full sm:aspect-auto sm:h-full">
        <PropertyImageCarousel
          propertyId={property.id}
          images={property.images}
          title={property.title}
          aspectRatio="aspect-4/3 sm:h-full w-full"
          showLightboxButton={false}
        />

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5">
          {property.verified && (
            <div className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-ondjo-navy shadow-xs backdrop-blur-md">
              <ShieldCheck size={12} className="text-ondjo-blue" />
              <span>Verificado</span>
            </div>
          )}
          <span className="inline-flex items-center rounded-full bg-ondjo-navy/85 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
            {isArrendamento ? "Arrendar" : "Venda"}
          </span>
        </div>

        {/* Coração */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className="focus-ring absolute right-3 top-3 z-20 flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur-xs transition hover:scale-110 active:scale-90 cursor-pointer"
          aria-label={favorite ? "Remover dos favoritos" : "Guardar nos favoritos"}
        >
          <Heart
            size={16}
            className={favorite ? "fill-ondjo-danger text-ondjo-danger" : "text-slate-600"}
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

          <p className="mt-1 text-xs sm:text-sm text-ondjo-muted line-clamp-1">
            {property.title}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>T{property.bedrooms}</span>
            <span className="text-slate-300">·</span>
            <span>{property.bathrooms} WC</span>
            <span className="text-slate-300">·</span>
            <span>{property.area} m²</span>
            {property.parking > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span>{property.parking} Vaga{property.parking > 1 ? "s" : ""}</span>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between gap-2">
          <span className="text-lg sm:text-xl font-extrabold text-ondjo-navy tracking-tight">
            {formatKz(property.price, { perMonth: isArrendamento })}
          </span>
          <span className="text-xs font-bold text-ondjo-blue group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Ver detalhes →
          </span>
        </div>
      </div>
    </motion.article>
  );
}
