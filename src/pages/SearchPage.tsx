import { ArrowDownUp, Grid2X2, List, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { properties } from "../data/properties";
import { filterProperties } from "../utils/filterProperties";
import { formatKz } from "../utils/format";
import { PropertyCard } from "../components/PropertyCard";
import { Chip, EmptyState, Badge, Button } from "../components/ui";
import {
  SearchBar,
  defaultSearchFilters,
  type SearchFilters,
} from "../components/SearchBar";
import { navigate } from "../hooks/useHashRoute";
import { motion, AnimatePresence } from "framer-motion";

function readFilters(): SearchFilters {
  const params = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
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
  const [filters, setFilters] = useState<SearchFilters>(readFilters);
  const [sort, setSort] = useState("relevance");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFilters, setMobileFilters] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setFilters(readFilters());
  }, []);

  // Header inteligente: esconde no scroll para baixo e revela no scroll para cima
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY < 60) {
            setIsHeaderVisible(true);
          } else if (currentScrollY > lastScrollY.current + 8) {
            // A scrollar para baixo: oculta para libertar espaço visual no telemóvel
            setIsHeaderVisible(false);
          } else if (currentScrollY < lastScrollY.current - 8) {
            // A scrollar para cima: revela
            setIsHeaderVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bloqueio de scroll do body quando o modal de filtros está aberto
  useEffect(() => {
    if (!mobileFilters) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileFilters]);

  const results = useMemo(() => {
    const filtered = filterProperties(properties, {
      ...filters,
      query: filters.query || filters.location,
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "area") return b.area - a.area;
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [filters, sort]);

  const apply = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      }
    });
    navigate(`pesquisar?${params.toString()}`);
    setMobileFilters(false);
  };

  const clear = () => {
    setFilters(defaultSearchFilters());
    navigate("pesquisar");
  };

  const chips = [
    filters.location && filters.location,
    filters.type && filters.type,
    filters.minPrice && `≥ ${formatKz(Number(filters.minPrice))}`,
    filters.maxPrice && `≤ ${formatKz(Number(filters.maxPrice))}`,
    filters.bedrooms &&
      `${filters.bedrooms === "5" ? "5+" : filters.bedrooms === "4" ? "4+" : filters.bedrooms} quartos`,
    filters.bathrooms && `${filters.bathrooms}+ WC`,
    filters.parking && `${filters.parking}+ Vagas`,
    filters.origin === "verificados" && "Verificados",
    filters.origin === "proprietario" && "Proprietário",
    filters.origin === "agentes" && "Agentes",
  ].filter(Boolean) as string[];

  return (
    <main className="mx-auto max-w-7xl w-full px-3.5 pb-16 pt-5 sm:px-6 sm:pt-7 lg:px-8">
      {/* Título & Breadcrumb */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => navigate("")}
          className="focus-ring text-xs font-bold text-ondjo-blue hover:underline cursor-pointer"
        >
          ← Início
        </button>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ondjo-ink sm:text-3xl">
          Encontre o seu imóvel
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-ondjo-muted">
          Refine por localização, modalidade e características específicas em Luanda.
        </p>
      </div>

      {/* Header Inteligente com Barra de Pesquisa
          - Sticky suave com compensação da altura do topo (h-14 / 56px em mobile)
          - No scroll down oculta suavemente para poupar espaço
          - No scroll up reaparece de imediato
      */}
      <div
        className={[
          "sticky top-14 sm:top-18 lg:top-20 z-30 transition-all duration-300 ease-out",
          "w-full bg-ondjo-bg/95 py-2.5 backdrop-blur-md border-b border-ondjo-border/80 lg:static lg:bg-transparent lg:border-0 lg:p-0 lg:backdrop-blur-none",
          isHeaderVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto",
        ].join(" ")}
      >
        <SearchBar
          value={filters}
          onChange={setFilters}
          onSearch={apply}
          compact
        />
      </div>

      <div className="mt-6 sm:mt-7 grid gap-6 sm:gap-7 lg:grid-cols-[260px_1fr]">
        {/* Painel lateral de filtros em Desktop */}
        <aside className="hidden rounded-3xl border border-ondjo-border bg-white p-5 lg:block h-fit shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-extrabold text-ondjo-ink text-sm">Filtros Rápidos</h2>
            <button
              onClick={clear}
              className="text-xs font-bold text-ondjo-blue hover:underline cursor-pointer"
            >
              Limpar
            </button>
          </div>
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onApply={apply}
          />
        </aside>

        {/* Secção de Resultados */}
        <section aria-label="Resultados de imóveis" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-ondjo-ink">
                {results.length} {results.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
              </p>
              {chips.length > 0 && (
                <p className="mt-0.5 text-xs text-ondjo-muted">
                  Filtros aplicados em baixo
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Botão de Filtros no Mobile */}
              <button
                onClick={() => setMobileFilters(true)}
                className="focus-ring flex min-h-11 items-center gap-2 rounded-xl border border-ondjo-border bg-white px-3.5 py-2 text-xs font-bold text-ondjo-ink lg:hidden cursor-pointer shadow-2xs hover:bg-slate-50 active:scale-95"
              >
                <SlidersHorizontal size={15} className="text-ondjo-blue" />
                <span>Filtros</span>
              </button>

              {/* Ordenação */}
              <label className="flex min-h-11 items-center gap-1.5 rounded-xl border border-ondjo-border bg-white px-3 py-2 text-xs font-semibold text-ondjo-ink shadow-2xs">
                <ArrowDownUp size={14} className="text-ondjo-muted shrink-0" />
                <span className="hidden sm:inline">Ordenar:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent font-bold outline-none text-ondjo-ink cursor-pointer"
                >
                  <option value="relevance">Relevantes</option>
                  <option value="price-low">Menor preço</option>
                  <option value="price-high">Maior preço</option>
                  <option value="area">Maior área</option>
                </select>
              </label>

              {/* Alternador de visualização Grelha / Lista */}
              <div className="hidden rounded-xl border border-ondjo-border bg-white p-1 sm:flex shadow-2xs">
                <button
                  onClick={() => setView("grid")}
                  className={`focus-ring rounded-lg p-2 cursor-pointer transition ${view === "grid" ? "bg-ondjo-blue-soft text-ondjo-blue" : "text-ondjo-muted hover:text-ondjo-ink"}`}
                  aria-label="Vista em grelha"
                >
                  <Grid2X2 size={16} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`focus-ring rounded-lg p-2 cursor-pointer transition ${view === "list" ? "bg-ondjo-blue-soft text-ondjo-blue" : "text-ondjo-muted hover:text-ondjo-ink"}`}
                  aria-label="Vista em lista"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Chips de filtros ativos */}
          {chips.length > 0 && (
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
              {chips.map((chip) => (
                <Chip
                  key={chip}
                  variant="soft"
                  active
                  className="cursor-default text-xs"
                >
                  {chip}
                </Chip>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                leftIcon={<X size={13} aria-hidden="true" />}
              >
                Limpar todos
              </Button>
            </div>
          )}

          {/* Lista de Imóveis */}
          {results.length > 0 ? (
            <div
              className={`mt-5 ${view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-4"}`}
            >
              {results.map((property, index) =>
                view === "grid" ? (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    index={index}
                  />
                ) : (
                  <ListProperty key={property.id} property={property} />
                ),
              )}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                icon={<SlidersHorizontal size={24} />}
                title="Nenhum imóvel encontrado"
                description="Tente ajustar a faixa de preço, selecionar outra localização ou remover algum filtro."
                actionLabel="Limpar filtros"
                onAction={clear}
              />
            </div>
          )}
        </section>
      </div>

      {/* Sheet de Filtros Mobile com createPortal e AnimatePresence */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {mobileFilters && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Filtros avançados de pesquisa"
                className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-xs lg:hidden"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 cursor-pointer"
                  onClick={() => setMobileFilters(false)}
                  aria-label="Fechar filtros"
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="relative z-10 flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl pb-safe"
                >
                  <div className="pt-3 pb-1 flex justify-center shrink-0">
                    <div className="h-1.5 w-12 rounded-full bg-slate-300" />
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 shrink-0">
                    <h2 className="text-base font-extrabold text-ondjo-ink">Filtros de Pesquisa</h2>
                    <button
                      onClick={() => setMobileFilters(false)}
                      aria-label="Fechar painel de filtros"
                      className="focus-ring grid size-11 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 overscroll-contain">
                    <FilterPanel
                      filters={filters}
                      onChange={setFilters}
                      onApply={apply}
                    />
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

function FilterPanel({
  filters,
  onChange,
  onApply,
}: {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
  onApply: () => void;
}) {
  const set = (key: keyof SearchFilters, value: unknown) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-ondjo-ink uppercase tracking-wider">
          Localização
        </span>
        <input
          value={filters.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="Ex.: Talatona, Maianga"
          className="h-11 w-full rounded-xl border border-ondjo-border bg-slate-50/70 px-3 text-base sm:text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus:border-ondjo-blue focus:bg-white"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-ondjo-ink uppercase tracking-wider">
          Tipo de imóvel
        </span>
        <select
          value={filters.type}
          onChange={(e) => set("type", e.target.value)}
          className="h-11 w-full rounded-xl border border-ondjo-border bg-slate-50/70 px-3 text-base sm:text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus:border-ondjo-blue focus:bg-white cursor-pointer"
        >
          <option value="">Todos os tipos</option>
          <option>Apartamento</option>
          <option>Casa</option>
          <option>Moradia</option>
          <option>Terreno</option>
        </select>
      </label>

      <div>
        <span className="mb-1.5 block text-xs font-bold text-ondjo-ink uppercase tracking-wider">
          Faixa de Preço (Kz)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <input
            inputMode="numeric"
            value={filters.minPrice}
            onChange={(e) => set("minPrice", e.target.value.replace(/\D/g, ""))}
            placeholder="Mínimo"
            className="h-11 w-full rounded-xl border border-ondjo-border bg-slate-50/70 px-3 text-base sm:text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus:border-ondjo-blue focus:bg-white"
          />
          <input
            inputMode="numeric"
            value={filters.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value.replace(/\D/g, ""))}
            placeholder="Máximo"
            className="h-11 w-full rounded-xl border border-ondjo-border bg-slate-50/70 px-3 text-base sm:text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus:border-ondjo-blue focus:bg-white"
          />
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-ondjo-ink uppercase tracking-wider">
          Tipologia (Quartos)
        </span>
        <select
          value={filters.bedrooms}
          onChange={(e) => set("bedrooms", e.target.value)}
          className="h-11 w-full rounded-xl border border-ondjo-border bg-slate-50/70 px-3 text-base sm:text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus:border-ondjo-blue focus:bg-white cursor-pointer"
        >
          <option value="">Qualquer número</option>
          <option value="0">T0 / Estúdio</option>
          <option value="1">1 quarto (T1)</option>
          <option value="2">2 quartos (T2)</option>
          <option value="3">3 quartos (T3)</option>
          <option value="4">4+ quartos (T4+)</option>
        </select>
      </label>

      <button
        onClick={onApply}
        className="focus-ring mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-ondjo-blue py-3 text-sm font-extrabold text-white transition-colors hover:bg-ondjo-blue-dark active:scale-98 cursor-pointer shadow-sm"
      >
        Aplicar filtros
      </button>
    </div>
  );
}

function ListProperty({ property }: { property: (typeof properties)[number] }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      onClick={() => navigate(`imovel/${property.id}`)}
      className="focus-ring grid w-full gap-3.5 rounded-2xl border border-ondjo-border bg-white p-3 text-left transition-all hover:shadow-md sm:grid-cols-[230px_1fr] cursor-pointer"
    >
      <img
        src={property.images[0]}
        alt={property.title}
        className="aspect-[4/3] w-full rounded-xl object-cover"
        loading="lazy"
      />
      <div className="flex flex-col justify-center py-1 sm:py-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-ondjo-blue">
              {property.type}
            </p>
            <h3 className="mt-1 text-base font-extrabold text-ondjo-ink line-clamp-1">
              {property.title}
            </h3>
            <p className="mt-0.5 text-xs text-ondjo-muted truncate">
              {property.neighborhood}, {property.city}
            </p>
          </div>
          {property.verified && (
            <Badge variant="verified" size="sm" title="Imóvel Verificado ONDJO" className="shrink-0">
              Verificado
            </Badge>
          )}
        </div>
        <p className="mt-3 text-base sm:text-lg font-black text-ondjo-navy">
          {formatKz(property.price, { perMonth: property.purpose === "arrendamento" })}
        </p>
        <p className="mt-1 text-xs font-semibold text-ondjo-muted">
          {property.bedrooms} quartos · {property.bathrooms} casas de banho ·{" "}
          {property.area} m²
        </p>
      </div>
    </motion.button>
  );
}
