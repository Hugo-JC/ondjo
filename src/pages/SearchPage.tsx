import { ArrowDownUp, Grid2X2, List, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { properties } from "../data/properties";
import { PropertyCard } from "../components/PropertyCard";
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

  useEffect(() => {
    setFilters(readFilters());
  }, []);

  const results = useMemo(() => {
    const query = (filters.query || filters.location).trim().toLowerCase();
    const min = Number(filters.minPrice) || 0;
    const max = Number(filters.maxPrice) || Number.POSITIVE_INFINITY;

    const filtered = properties.filter((property) => {
      const matchesQuery =
        !query ||
        property.title.toLowerCase().includes(query) ||
        property.neighborhood.toLowerCase().includes(query) ||
        property.city.toLowerCase().includes(query);
      const matchesLocation =
        !filters.location || property.neighborhood === filters.location;
      const matchesType = !filters.type || property.type === filters.type;
      const matchesPrice = property.price >= min && property.price <= max;
      const matchesBedrooms =
        !filters.bedrooms ||
        (filters.bedrooms === "4"
          ? property.bedrooms >= 4
          : property.bedrooms === Number(filters.bedrooms));
      const matchesBathrooms =
        !filters.bathrooms || property.bathrooms >= Number(filters.bathrooms);
      const matchesParking =
        !filters.parking || property.parking >= Number(filters.parking);
      const matchesVerified =
        filters.origin === "verificados" ? Boolean(property.verified) : true;

      return (
        matchesQuery &&
        matchesLocation &&
        matchesType &&
        matchesPrice &&
        matchesBedrooms &&
        matchesBathrooms &&
        matchesParking &&
        matchesVerified
      );
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
    filters.minPrice && `≥ ${Number(filters.minPrice).toLocaleString("pt-AO")} Kz`,
    filters.maxPrice && `≤ ${Number(filters.maxPrice).toLocaleString("pt-AO")} Kz`,
    filters.bedrooms &&
      `${filters.bedrooms === "4" ? "4+" : filters.bedrooms} quartos`,
    filters.bathrooms && `${filters.bathrooms}+ WC`,
    filters.parking && `${filters.parking}+ Vagas`,
    filters.origin === "verificados" && "Verificados",
  ].filter(Boolean) as string[];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          onClick={() => navigate("")}
          className="focus-ring text-xs font-bold text-ondjo-blue hover:underline"
        >
          ← Início
        </button>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-ondjo-ink sm:text-3xl">
          Encontre o seu imóvel
        </h1>
        <p className="mt-1 text-sm text-ondjo-muted">
          Refine por localização, modalidade e características específicas.
        </p>
      </div>

      <div className="sticky top-18 z-30 -mx-4 border-y border-ondjo-border bg-ondjo-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <SearchBar
          value={filters}
          onChange={setFilters}
          onSearch={apply}
          compact
        />
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-[260px_1fr]">
        <aside className="hidden rounded-2xl border border-ondjo-border bg-white p-5 lg:block">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-ondjo-ink">Filtros Rápidos</h2>
            <button
              onClick={clear}
              className="text-xs font-bold text-ondjo-blue hover:underline"
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

        <section aria-label="Resultados de imóveis">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-ondjo-ink">
                {results.length} {results.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
              </p>
              {chips.length > 0 && (
                <p className="mt-1 text-xs text-ondjo-muted">
                  Filtros aplicados em baixo
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFilters(true)}
                className="focus-ring flex items-center gap-2 rounded-xl border border-ondjo-border bg-white px-3 py-2 text-sm font-bold text-ondjo-ink lg:hidden"
              >
                <SlidersHorizontal size={16} /> Filtros
              </button>
              <label className="flex items-center gap-2 rounded-xl border border-ondjo-border bg-white px-3 py-2 text-sm font-semibold text-ondjo-ink">
                <ArrowDownUp size={15} className="text-ondjo-muted" />
                <span className="hidden sm:inline">Ordenar:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent font-bold outline-none text-ondjo-ink"
                >
                  <option value="relevance">Relevantes</option>
                  <option value="price-low">Menor preço</option>
                  <option value="price-high">Maior preço</option>
                  <option value="area">Maior área</option>
                </select>
              </label>
              <div className="hidden rounded-xl border border-ondjo-border bg-white p-1 sm:flex">
                <button
                  onClick={() => setView("grid")}
                  className={`focus-ring rounded-lg p-2 ${view === "grid" ? "bg-ondjo-blue-soft text-ondjo-blue" : "text-ondjo-muted"}`}
                  aria-label="Vista em grelha"
                >
                  <Grid2X2 size={16} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`focus-ring rounded-lg p-2 ${view === "list" ? "bg-ondjo-blue-soft text-ondjo-blue" : "text-ondjo-muted"}`}
                  aria-label="Vista em lista"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center rounded-full bg-ondjo-blue-soft px-3 py-1.5 text-xs font-bold text-ondjo-blue"
                >
                  {chip}
                </span>
              ))}
              <button
                onClick={clear}
                className="focus-ring inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-bold text-ondjo-muted hover:bg-ondjo-bg"
              >
                <X size={13} /> Limpar todos
              </button>
            </div>
          )}

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
            <div className="mt-6 rounded-3xl border border-dashed border-ondjo-border bg-white px-6 py-16 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-ondjo-blue-soft text-ondjo-blue">
                <SlidersHorizontal size={22} />
              </div>
              <h2 className="mt-4 text-lg font-extrabold text-ondjo-ink">
                Nenhum imóvel encontrado
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ondjo-muted">
                Tente ajustar a faixa de preço, selecionar outra localização ou
                remover algum filtro.
              </p>
              <button
                onClick={clear}
                className="focus-ring mt-5 rounded-xl bg-ondjo-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ondjo-blue-dark"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {mobileFilters && (
          <motion.div
            className="fixed inset-0 z-70 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute inset-0 bg-ondjo-navy/60 backdrop-blur-xs"
              onClick={() => setMobileFilters(false)}
              aria-label="Fechar filtros"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl"
            >
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-ondjo-border" />
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-ondjo-ink">Filtros de Pesquisa</h2>
                <button
                  onClick={() => setMobileFilters(false)}
                  className="focus-ring grid size-10 place-items-center rounded-xl bg-ondjo-bg text-ondjo-muted hover:text-ondjo-ink"
                >
                  <X size={18} />
                </button>
              </div>
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onApply={apply}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className="mt-5 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-ondjo-ink">
          Localização
        </span>
        <input
          value={filters.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="Ex.: Talatona, Maianga"
          className="h-11 w-full rounded-xl border border-ondjo-border bg-white px-3 text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus-visible:border-ondjo-blue focus-visible:ring-2 focus-visible:ring-ondjo-blue/20"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-ondjo-ink">
          Tipo de imóvel
        </span>
        <select
          value={filters.type}
          onChange={(e) => set("type", e.target.value)}
          className="h-11 w-full rounded-xl border border-ondjo-border bg-white px-3 text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus-visible:border-ondjo-blue focus-visible:ring-2 focus-visible:ring-ondjo-blue/20"
        >
          <option value="">Todos os tipos</option>
          <option>Apartamento</option>
          <option>Casa</option>
          <option>Moradia</option>
          <option>Terreno</option>
        </select>
      </label>

      <div>
        <span className="mb-1.5 block text-xs font-bold text-ondjo-ink">
          Faixa de Preço (Kz)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <input
            inputMode="numeric"
            value={filters.minPrice}
            onChange={(e) => set("minPrice", e.target.value.replace(/\D/g, ""))}
            placeholder="Mínimo"
            className="h-11 w-full rounded-xl border border-ondjo-border bg-white px-3 text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus-visible:border-ondjo-blue focus-visible:ring-2 focus-visible:ring-ondjo-blue/20"
          />
          <input
            inputMode="numeric"
            value={filters.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value.replace(/\D/g, ""))}
            placeholder="Máximo"
            className="h-11 w-full rounded-xl border border-ondjo-border bg-white px-3 text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus-visible:border-ondjo-blue focus-visible:ring-2 focus-visible:ring-ondjo-blue/20"
          />
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-ondjo-ink">
          Tipologia (Quartos)
        </span>
        <select
          value={filters.bedrooms}
          onChange={(e) => set("bedrooms", e.target.value)}
          className="h-11 w-full rounded-xl border border-ondjo-border bg-white px-3 text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus-visible:border-ondjo-blue focus-visible:ring-2 focus-visible:ring-ondjo-blue/20"
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
        className="focus-ring mt-3 w-full rounded-xl bg-ondjo-blue py-3 text-xs font-extrabold text-white transition-colors hover:bg-ondjo-blue-dark"
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
      className="focus-ring grid w-full gap-4 rounded-2xl border border-ondjo-border bg-white p-3 text-left transition-all hover:shadow-md sm:grid-cols-[230px_1fr]"
    >
      <img
        src={property.images[0]}
        alt={property.title}
        className="aspect-[1.35/1] w-full rounded-xl object-cover"
        loading="lazy"
      />
      <div className="flex flex-col justify-center py-1 sm:py-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-ondjo-green">
              {property.type}
            </p>
            <h3 className="mt-1 text-lg font-extrabold text-ondjo-ink">
              {property.title}
            </h3>
            <p className="mt-1 text-sm text-ondjo-muted">
              {property.neighborhood}, {property.city}
            </p>
          </div>
          {property.verified && (
            <span className="shrink-0 rounded-full bg-ondjo-green-soft px-2.5 py-1 text-[10px] font-extrabold text-ondjo-green">
              Verificado
            </span>
          )}
        </div>
        <p className="mt-4 text-lg font-black text-ondjo-navy">
          {new Intl.NumberFormat("pt-AO").format(property.price)} Kz
        </p>
        <p className="mt-2 text-xs font-semibold text-ondjo-muted">
          {property.bedrooms} quartos · {property.bathrooms} casas de banho ·{" "}
          {property.area} m²
        </p>
      </div>
    </motion.button>
  );
}
