import {
  Bath,
  Building2,
  ChevronDown,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { locations, properties } from "../data/properties";

export type SearchPurpose = "comprar" | "arrendar";

export type SearchOrigin =
  | "todos"
  | "verificados"
  | "particulares"
  | "profissionais";

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

export const ORIGIN_OPTIONS: {
  id: SearchOrigin;
  label: string;
  icon?: typeof ShieldCheck;
}[] = [
  { id: "todos", label: "Todos os anúncios" },
  { id: "verificados", label: "Verificados ONDJO", icon: ShieldCheck },
  { id: "particulares", label: "Proprietário" },
  { id: "particulares", label: "Agentes" },
];

export const PROPERTY_TYPES = [
  { value: "", label: "Todos os tipos" },
  { value: "Apartamento", label: "Apartamentos" },
  { value: "Casa", label: "Casa" },
  { value: "Moradia", label: "Vivenda/Moradia" },
  { value: "Terreno", label: "Terreno" },
  { value: "Lojas", label: "Lojas" },
];

export const BEDROOM_OPTIONS = [
  { value: "", label: "Qualquer tipologia" },
  { value: "0", label: "T0" },
  { value: "1", label: "T1" },
  { value: "2", label: "T2" },
  { value: "3", label: "T3" },
  { value: "4", label: "T4" },
  { value: "5", label: "T5 ou mais" },
];

export const BATHROOM_OPTIONS = [
  { value: "", label: "Qualquer número" },
  { value: "1", label: "1 casa de banho" },
  { value: "2", label: "2 casas de banho" },
  { value: "3", label: "3 casas de banho" },
  { value: "4", label: "4 casas de banho" },
  { value: "5", label: "5+ casas de banho" },
];

// export const PARKING_OPTIONS = [
//   { value: "", label: "Qualquer" },
//   { value: "1", label: "1 vaga de garagem" },
//   { value: "2", label: "2 vagas de garagem" },
//   { value: "3", label: "3 vagas de garagem" },
//   { value: "4", label: "4+ vagas de garagem" },
// ];

export function defaultSearchFilters(): SearchFilters {
  return { ...emptyFilters };
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  compact = false,
}: SearchBarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const locationRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  const locationId = useId();
  const suggestionsId = useId();
  const advancedId = useId();
  const typeId = useId();
  const bedroomsId = useId();
  const bathroomsId = useId();
  const minPriceId = useId();
  const maxPriceId = useId();

  // Fechar dropdown de localização ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setLocationOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const set = (key: keyof SearchFilters, next: unknown) => {
    onChange({ ...value, [key]: next });
  };

  const currentPurpose = value.purpose || "comprar";
  const currentOrigin = value.origin || "todos";

  // Contagem dinâmica de imóveis que correspondem aos filtros
  const matchingCount = useMemo(() => {
    const q = (value.query || value.location).trim().toLowerCase();
    const min = Number(value.minPrice) || 0;
    const max = Number(value.maxPrice) || Number.POSITIVE_INFINITY;

    return properties.filter((item) => {
      const matchQ =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.neighborhood.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q);

      const matchLoc = !value.location || item.neighborhood === value.location;
      const matchType = !value.type || item.type === value.type;
      const matchPrice = item.price >= min && item.price <= max;
      const matchBed =
        !value.bedrooms ||
        (value.bedrooms === "4"
          ? item.bedrooms >= 4
          : item.bedrooms === Number(value.bedrooms));

      const matchBath =
        !value.bathrooms || item.bathrooms >= Number(value.bathrooms);
      const matchPark = !value.parking || item.parking >= Number(value.parking);

      const matchVerified =
        currentOrigin === "verificados" ? Boolean(item.verified) : true;

      return (
        matchQ &&
        matchLoc &&
        matchType &&
        matchPrice &&
        matchBed &&
        matchBath &&
        matchPark &&
        matchVerified
      );
    }).length;
  }, [value, currentOrigin]);

  const activeAdvancedCount = [
    value.minPrice,
    value.maxPrice,
    value.bathrooms,
    value.parking,
    currentOrigin !== "todos",
  ].filter(Boolean).length;

  const searchText = value.location || value.query;

  const filteredLocations = locations
    .filter((loc) =>
      loc.toLowerCase().includes(searchText.trim().toLowerCase()),
    )
    .slice(0, 6);

  const clearAllFilters = () => {
    onChange({
      ...emptyFilters,
      purpose: currentPurpose,
    });
    setLocationOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocationOpen(false);
    onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={[
        "relative w-full text-left transition-all",
        compact
          ? "rounded-2xl"
          : "rounded-3xl border border-ondjo-border/90 bg-white p-3.5 shadow-[0_20px_50px_rgba(16,42,67,0.12)] sm:p-5",
      ].join(" ")}
      aria-label="Pesquisa de imóveis ONDJO"
    >
      {/* ========================================================
          GRUPO 1: INTENÇÃO & ORIGEM (Comprar / Arrendar + Verificação)
         ======================================================== */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-ondjo-border/60 pb-3">
        {/* Tabs de Modo: Apenas Comprar e Arrendar */}
        <div
          role="tablist"
          aria-label="Modalidade de negócio"
          className="inline-flex items-center gap-1 rounded-xl bg-ondjo-bg p-1 text-xs font-bold text-ondjo-muted"
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
                  "relative flex min-h-[38px] items-center gap-1.5 rounded-lg px-4 py-1.5 transition-all outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ondjo-blue focus-visible:ring-offset-1",
                  isSelected
                    ? "bg-white font-extrabold text-ondjo-navy shadow-sm"
                    : "hover:text-ondjo-ink",
                ].join(" ")}
              >
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Toggles de Anúncios Verificados e Particulares */}
        <div className="flex flex-wrap items-center gap-1.5">
          {ORIGIN_OPTIONS.map((orig) => {
            const isSelected = currentOrigin === orig.id;
            const Icon = orig.icon;
            return (
              <button
                key={orig.id}
                type="button"
                onClick={() => set("origin", orig.id)}
                className={[
                  "inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold transition-all",
                  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ondjo-blue",
                  isSelected
                    ? "border-ondjo-blue bg-ondjo-blue-soft/70 text-ondjo-blue font-bold shadow-xs"
                    : "border-transparent bg-ondjo-bg/80 text-ondjo-muted hover:border-ondjo-border hover:text-ondjo-ink",
                ].join(" ")}
              >
                {Icon && (
                  <Icon
                    size={13}
                    aria-hidden="true"
                    className={
                      isSelected ? "text-ondjo-green" : "text-ondjo-muted"
                    }
                  />
                )}
                <span>{orig.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          GRUPO 2: CAMPOS PRINCIPAIS BEM AGRUPADOS
          (Localização + Tipo de Imóvel + Tipologia + Botão de Busca)
         ======================================================== */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_auto]">
        {/* Campo 1: Localização com Autocomplete e Atalhos Rápidos */}
        <div ref={locationRef} className="relative min-w-0">
          <label
            htmlFor={locationId}
            className="mb-1.5 flex items-center justify-between text-xs font-bold text-ondjo-ink"
          >
            <span>Onde procura?</span>
            <span className="text-[11px] font-normal text-ondjo-muted">
              Luanda & Regiões
            </span>
          </label>

          <div
            className={[
              "flex h-12 items-center gap-2.5 rounded-xl border bg-white px-3 transition-colors",
              locationOpen
                ? "border-ondjo-blue ring-2 ring-ondjo-blue/15"
                : "border-ondjo-border hover:border-ondjo-muted",
            ].join(" ")}
          >
            <MapPin
              size={18}
              aria-hidden="true"
              className="shrink-0 text-ondjo-blue"
            />

            <input
              ref={locationInputRef}
              id={locationId}
              type="text"
              value={searchText}
              onFocus={() => setLocationOpen(true)}
              onChange={(e) => {
                onChange({
                  ...value,
                  location: "",
                  query: e.target.value,
                });
                setLocationOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setLocationOpen(false);
              }}
              placeholder="Ex.: Talatona, Maianga, Kilamba"
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls={suggestionsId}
              aria-expanded={locationOpen}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ondjo-ink outline-none placeholder:text-ondjo-muted"
            />

            {searchText && (
              <button
                type="button"
                onClick={() => {
                  onChange({ ...value, location: "", query: "" });
                  locationInputRef.current?.focus();
                }}
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-ondjo-muted transition hover:bg-ondjo-bg hover:text-ondjo-ink focus-visible:outline-2 focus-visible:outline-ondjo-blue"
                aria-label="Limpar localização"
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Popover de Localizações */}
          <AnimatePresence>
            {locationOpen && (
              <motion.div
                id={suggestionsId}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-x-0 top-full z-40 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-ondjo-border bg-white p-2 shadow-[0_16px_36px_rgba(16,42,67,0.16)]"
              >
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ondjo-muted">
                  {searchText
                    ? "Zonas correspondentes"
                    : "Zonas populares em Luanda"}
                </div>

                <div className="mt-1 space-y-0.5">
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          onChange({ ...value, location: loc, query: "" });
                          setLocationOpen(false);
                        }}
                        className="flex min-h-[42px] w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-ondjo-ink transition hover:bg-ondjo-bg focus-visible:bg-ondjo-blue-soft focus-visible:outline-none"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-ondjo-blue-soft text-ondjo-blue">
                            <MapPin size={14} aria-hidden="true" />
                          </span>
                          <span className="font-semibold">{loc}</span>
                        </span>
                        <span className="text-xs text-ondjo-muted">Luanda</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-xs text-ondjo-muted">
                      Nenhuma zona específica encontrada. Clique em "Pesquisar"
                      para buscar pelo texto.
                    </div>
                  )}
                </div>

                {/* Atalhos Rápidos */}
                <div className="mt-2 border-t border-ondjo-border/60 pt-2 px-1">
                  <div className="mb-1 text-[10px] font-bold uppercase text-ondjo-muted">
                    Atalhos frequentes:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Talatona", "Maianga", "Kilamba", "Benfica"].map(
                      (chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            onChange({ ...value, location: chip, query: "" });
                            setLocationOpen(false);
                          }}
                          className="rounded-md bg-ondjo-bg px-2 py-1 text-xs font-semibold text-ondjo-ink transition hover:bg-ondjo-blue-soft hover:text-ondjo-blue"
                        >
                          {chip}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Campo 2: Tipo de Imóvel */}
        <div className="min-w-0">
          <label
            htmlFor={typeId}
            className="mb-1.5 block text-xs font-bold text-ondjo-ink"
          >
            Tipo de imóvel
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ondjo-blue">
              <Building2 size={17} aria-hidden="true" />
            </div>
            <select
              id={typeId}
              value={value.type}
              onChange={(e) => set("type", e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-ondjo-border bg-white pl-9 pr-9 text-sm font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus-visible:border-ondjo-blue focus-visible:ring-2 focus-visible:ring-ondjo-blue focus-visible:ring-offset-1"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ondjo-muted"
            />
          </div>
        </div>

        {/* Campo 3: Tipologia / Quartos */}
        <div className="min-w-0">
          <label
            htmlFor={bedroomsId}
            className="mb-1.5 block text-xs font-bold text-ondjo-ink"
          >
            Tipologia
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ondjo-blue">
              <Layers size={17} aria-hidden="true" />
            </div>
            <select
              id={bedroomsId}
              value={value.bedrooms}
              onChange={(e) => set("bedrooms", e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-ondjo-border bg-white pl-9 pr-9 text-sm font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus-visible:border-ondjo-blue focus-visible:ring-2 focus-visible:ring-ondjo-blue focus-visible:ring-offset-1"
            >
              {BEDROOM_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ondjo-muted"
            />
          </div>
        </div>

        {/* Campo 4: Botão de Ação com Contador Dinâmico */}
        <div className="flex flex-col justify-end">
          <button
            type="submit"
            className={[
              "group relative flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold text-white shadow-sm transition-all",
              "bg-ondjo-blue hover:bg-ondjo-blue-dark active:scale-[0.98]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue",
            ].join(" ")}
          >
            <Search
              size={18}
              aria-hidden="true"
              className="shrink-0 transition-transform group-hover:scale-110"
            />
            <span className="whitespace-nowrap">
              {matchingCount > 0 ? `Ver ${matchingCount} imóveis` : "Pesquisar"}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================
          BARRA DE EXPANSÃO: MAIS FILTROS & LIMPAR
         ======================================================== */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-ondjo-border/70 pt-3">
        <button
          type="button"
          onClick={() => setAdvancedOpen((prev) => !prev)}
          aria-expanded={advancedOpen}
          aria-controls={advancedId}
          className={[
            "inline-flex min-h-[38px] items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ondjo-blue",
            advancedOpen
              ? "bg-ondjo-blue-soft text-ondjo-blue"
              : "text-ondjo-ink hover:bg-ondjo-bg",
          ].join(" ")}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          <span>
            {advancedOpen
              ? "Menos filtros"
              : "Mais filtros (Preço, WC, Garagem)"}
          </span>

          {activeAdvancedCount > 0 && (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-ondjo-blue text-[11px] font-bold text-white">
              {activeAdvancedCount}
            </span>
          )}

          <ChevronDown
            size={14}
            aria-hidden="true"
            className={`transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`}
          />
        </button>

        <div className="flex items-center gap-2">
          {matchingCount > 0 && (
            <span className="hidden text-xs text-ondjo-muted sm:inline">
              <strong className="text-ondjo-ink">{matchingCount}</strong>{" "}
              disponíveis
            </span>
          )}

          {(activeAdvancedCount > 0 ||
            value.location ||
            value.type ||
            value.bedrooms) && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2 text-xs font-semibold text-ondjo-muted transition-colors hover:text-ondjo-blue focus-visible:outline-2 focus-visible:outline-ondjo-blue"
            >
              <X size={14} aria-hidden="true" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          GRUPO 3: FILTROS AVANÇADOS HARMONIOSAMENTE ORGANIZADOS
          (Preço Mín/Máx + Dropdowns de Casas de Banho e Vagas)
         ======================================================== */}
      <AnimatePresence initial={false}>
        {advancedOpen && (
          <motion.div
            id={advancedId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.22,
              ease: "easeInOut",
            }}
            className="overflow-hidden"
          >
            <div className="mt-3.5 space-y-4 rounded-2xl border border-ondjo-border/80 bg-ondjo-bg/60 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Preço Mínimo (Kz) */}
                <div>
                  <label
                    htmlFor={minPriceId}
                    className="mb-1.5 block text-xs font-bold text-ondjo-ink"
                  >
                    Preço mínimo (Kz)
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ondjo-muted">
                      Kz
                    </span>
                    <input
                      id={minPriceId}
                      type="text"
                      inputMode="numeric"
                      value={value.minPrice}
                      onChange={(e) =>
                        set("minPrice", e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Sem mínimo"
                      className="h-11 w-full rounded-xl border border-ondjo-border bg-white pl-9 pr-3 text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus-visible:border-ondjo-blue focus-visible:ring-2 focus-visible:ring-ondjo-blue/20"
                    />
                  </div>
                </div>

                {/* 2. Preço Máximo (Kz) */}
                <div>
                  <label
                    htmlFor={maxPriceId}
                    className="mb-1.5 block text-xs font-bold text-ondjo-ink"
                  >
                    Preço máximo (Kz)
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ondjo-muted">
                      Kz
                    </span>
                    <input
                      id={maxPriceId}
                      type="text"
                      inputMode="numeric"
                      value={value.maxPrice}
                      onChange={(e) =>
                        set("maxPrice", e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Sem máximo"
                      className="h-11 w-full rounded-xl border border-ondjo-border bg-white pl-9 pr-3 text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus-visible:border-ondjo-blue focus-visible:ring-2 focus-visible:ring-ondjo-blue/20"
                    />
                  </div>
                </div>

                {/* 3. Casas de Banho (Dropdown elegante com ícone) */}
                <div>
                  <label
                    htmlFor={bathroomsId}
                    className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ondjo-ink"
                  >
                    <Bath
                      size={14}
                      className="text-ondjo-blue"
                      aria-hidden="true"
                    />
                    <span>Casas de banho</span>
                  </label>
                  <div className="relative">
                    <select
                      id={bathroomsId}
                      value={value.bathrooms || ""}
                      onChange={(e) => set("bathrooms", e.target.value)}
                      className="h-11 w-full appearance-none rounded-xl border border-ondjo-border bg-white pl-3 pr-9 text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus-visible:border-ondjo-blue focus-visible:ring-2 focus-visible:ring-ondjo-blue focus-visible:ring-offset-1"
                    >
                      {BATHROOM_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ondjo-muted"
                    />
                  </div>
                </div>

                {/* 4. Estacionamento / Vagas (Dropdown elegante com ícone) */}
                {/* <div>
                  <label
                    htmlFor={parkingId}
                    className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ondjo-ink"
                  >
                    <Car
                      size={14}
                      className="text-ondjo-blue"
                      aria-hidden="true"
                    />
                    <span>Estacionamento</span>
                  </label>
                  <div className="relative">
                    <select
                      id={parkingId}
                      value={value.parking || ""}
                      onChange={(e) => set("parking", e.target.value)}
                      className="h-11 w-full appearance-none rounded-xl border border-ondjo-border bg-white pl-3 pr-9 text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus-visible:border-ondjo-blue focus-visible:ring-2 focus-visible:ring-ondjo-blue focus-visible:ring-offset-1"
                    >
                      {PARKING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ondjo-muted"
                    />
                  </div>
                </div> */}
              </div> 

              {/* Ações Rápidas no Painel Avançado (Mobile) */}
              <div className="flex items-center justify-end gap-2 pt-1 sm:hidden">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen(false)}
                  className="rounded-xl border border-ondjo-border bg-white px-4 py-2 text-xs font-bold text-ondjo-ink"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-ondjo-blue px-4 py-2 text-xs font-bold text-white"
                >
                  Ver {matchingCount} imóveis
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
