import {
  Bath,
  Building2,
  Car,
  Check,
  ChevronDown,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { locations, properties } from "../data/properties";

export type SearchPurpose =
  | "comprar"
  | "arrendar"
  | "empreendimentos"
  | "curta-estadia";

export type SearchOrigin = "todos" | "verificados" | "particulares" | "profissionais";

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
  amenities: [],
};

export const PURPOSE_OPTIONS: { id: SearchPurpose; label: string; badge?: string }[] = [
  { id: "comprar", label: "Comprar" },
  { id: "arrendar", label: "Arrendar" },
  { id: "empreendimentos", label: "Empreendimentos", badge: "Novos" },
  { id: "curta-estadia", label: "Curta Estadia" },
];

export const ORIGIN_OPTIONS: { id: SearchOrigin; label: string; icon?: typeof ShieldCheck }[] = [
  { id: "todos", label: "Todos os anúncios" },
  { id: "verificados", label: "Verificados ONDJO", icon: ShieldCheck },
  { id: "particulares", label: "Direto c/ Proprietário" },
  { id: "profissionais", label: "Profissionais & Agências" },
];

export const PROPERTY_TYPES = [
  { value: "", label: "Todos os tipos" },
  { value: "Apartamento", label: "Apartamento" },
  { value: "Casa", label: "Casa" },
  { value: "Moradia", label: "Moradia" },
  { value: "Terreno", label: "Terreno" },
];

export const BEDROOM_OPTIONS = [
  { value: "", label: "Qualquer tipologia" },
  { value: "0", label: "T0 / Estúdio" },
  { value: "1", label: "T1 (1 quarto)" },
  { value: "2", label: "T2 (2 quartos)" },
  { value: "3", label: "T3 (3 quartos)" },
  { value: "4", label: "T4 ou mais" },
];

export const BATHROOM_OPTIONS = [
  { value: "", label: "Qualquer" },
  { value: "1", label: "1+ wc" },
  { value: "2", label: "2+ wc" },
  { value: "3", label: "3+ wc" },
];

export const PARKING_OPTIONS = [
  { value: "", label: "Qualquer" },
  { value: "1", label: "1+ vaga" },
  { value: "2", label: "2+ vagas" },
];

export const LUANDA_AMENITIES = [
  { id: "Gerador", label: "Gerador" },
  { id: "Segurança 24h", label: "Segurança 24h" },
  { id: "Água canalizada", label: "Tanque / Água" },
  { id: "Ar condicionado", label: "Ar Condicionado" },
  { id: "Garagem", label: "Garagem privativa" },
  { id: "Piscina", label: "Piscina" },
  { id: "Cozinha equipada", label: "Cozinha equipada" },
  { id: "Varanda", label: "Varanda" },
];

const BUY_PRESETS = [
  { label: "Até 10 milhões Kz", value: "10000000" },
  { label: "Até 25 milhões Kz", value: "25000000" },
  { label: "Até 50 milhões Kz", value: "50000000" },
  { label: "Até 100 milhões Kz", value: "100000000" },
  { label: "Até 250 milhões Kz", value: "250000000" },
  { label: "Até 500 milhões Kz", value: "500000000" },
];

const RENT_PRESETS = [
  { label: "Até 150 mil Kz/mês", value: "150000" },
  { label: "Até 300 mil Kz/mês", value: "300000" },
  { label: "Até 600 mil Kz/mês", value: "600000" },
  { label: "Até 1,2 milhões Kz/mês", value: "1200000" },
  { label: "Até 2,5 milhões Kz/mês", value: "2500000" },
];

export function defaultSearchFilters(): SearchFilters {
  return { ...emptyFilters };
}

const formatKzValue = (val: string) => {
  const num = Number(val);
  if (!num || Number.isNaN(num)) return "";
  return `${new Intl.NumberFormat("pt-AO").format(num)} Kz`;
};

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
  const priceId = useId();
  const bedroomsId = useId();

  // Fechar dropdown de sugestões ao clicar fora
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
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const set = (key: keyof SearchFilters, next: unknown) => {
    onChange({ ...value, [key]: next });
  };

  const currentPurpose = value.purpose || "comprar";
  const currentOrigin = value.origin || "todos";
  const currentAmenities = value.amenities ?? [];

  const toggleAmenity = (amenityId: string) => {
    const next = currentAmenities.includes(amenityId)
      ? currentAmenities.filter((item) => item !== amenityId)
      : [...currentAmenities, amenityId];
    set("amenities", next);
  };

  // Contagem dinâmica de imóveis que coincidem com os filtros em tempo real
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
      const matchPark =
        !value.parking || item.parking >= Number(value.parking);

      const matchVerified =
        currentOrigin === "verificados" ? Boolean(item.verified) : true;

      const matchAmenities =
        currentAmenities.length === 0 ||
        currentAmenities.every((amenity) =>
          item.features?.some(
            (f) => f.toLowerCase() === amenity.toLowerCase(),
          ),
        );

      return (
        matchQ &&
        matchLoc &&
        matchType &&
        matchPrice &&
        matchBed &&
        matchBath &&
        matchPark &&
        matchVerified &&
        matchAmenities
      );
    }).length;
  }, [value, currentOrigin, currentAmenities]);

  const activeAdvancedCount = [
    value.minPrice,
    value.maxPrice,
    value.bathrooms,
    value.parking,
    currentAmenities.length > 0,
    currentOrigin !== "todos",
  ].filter(Boolean).length;

  const searchText = value.location || value.query;

  const filteredLocations = locations
    .filter((loc) => loc.toLowerCase().includes(searchText.trim().toLowerCase()))
    .slice(0, 6);

  const pricePresets = currentPurpose === "arrendar" ? RENT_PRESETS : BUY_PRESETS;

  const clearAllFilters = () => {
    onChange({
      ...emptyFilters,
      purpose: currentPurpose, // mantém a intenção de negócio selecionada
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
      {/* 1. TABS SUPERIORES SEGMENTADAS (Comprar, Arrendar, Empreendimentos, Curta Estadia) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-ondjo-border/60 pb-3.5">
        <div
          role="tablist"
          aria-label="Tipo de negócio"
          className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-ondjo-bg p-1 text-xs font-bold text-ondjo-muted"
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
                  "relative flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-all outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ondjo-blue focus-visible:ring-offset-1",
                  isSelected
                    ? "bg-white font-extrabold text-ondjo-navy shadow-sm"
                    : "hover:text-ondjo-ink",
                ].join(" ")}
              >
                <span>{opt.label}</span>
                {opt.badge && (
                  <span className="rounded-full bg-ondjo-blue-soft px-1.5 py-0.5 text-[10px] font-bold text-ondjo-blue">
                    {opt.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Badges Rápidas: Verificados e Particulares */}
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
                  "inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all",
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
                    className={isSelected ? "text-ondjo-green" : "text-ondjo-muted"}
                  />
                )}
                <span>{orig.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. BARRA PRINCIPAL: GRID RESPONSIVA DE CAMPOS ESTATÉGICOS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_auto]">
        {/* Campo 1: Localização Inteligente (Bairro / Município) */}
        <div ref={locationRef} className="relative min-w-0">
          <label
            htmlFor={locationId}
            className="mb-1.5 flex items-center justify-between text-xs font-bold text-ondjo-ink"
          >
            <span>Onde quer morar?</span>
            <span className="text-[11px] font-normal text-ondjo-muted">
              Luanda & Províncias
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

          {/* Popover de Sugestões / Zonas Populares */}
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
                  {searchText ? "Zonas correspondentes" : "Zonas em destaque em Luanda"}
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
                      Nenhuma zona específica encontrada. Carregue em "Pesquisar" para buscar pelo texto digitado.
                    </div>
                  )}
                </div>

                {/* Atalhos rápidos em chips */}
                <div className="mt-2 border-t border-ondjo-border/60 pt-2 px-1">
                  <div className="mb-1 text-[10px] font-bold uppercase text-ondjo-muted">
                    Atalhos frequentes:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Talatona", "Maianga", "Kilamba", "Benfica"].map((chip) => (
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
                    ))}
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

        {/* Campo 4: Orçamento Máximo */}
        <div className="min-w-0">
          <label
            htmlFor={priceId}
            className="mb-1.5 flex items-center justify-between text-xs font-bold text-ondjo-ink"
          >
            <span>Orçamento</span>
            <span className="text-[11px] font-normal text-ondjo-muted">
              {currentPurpose === "arrendar" ? "Mensal" : "Valor total"}
            </span>
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-ondjo-blue">
              Kz
            </div>
            <select
              id={priceId}
              value={value.maxPrice}
              onChange={(e) => set("maxPrice", e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-ondjo-border bg-white pl-9 pr-9 text-sm font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus-visible:border-ondjo-blue focus-visible:ring-2 focus-visible:ring-ondjo-blue focus-visible:ring-offset-1"
            >
              <option value="">Qualquer valor</option>
              {value.maxPrice &&
                !pricePresets.some((p) => p.value === value.maxPrice) && (
                  <option value={value.maxPrice}>
                    Até {formatKzValue(value.maxPrice)}
                  </option>
                )}
              {pricePresets.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
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

        {/* Campo 5: Botão CTA com Contador Dinâmico de Resultados */}
        <div className="flex flex-col justify-end">
          <button
            type="submit"
            className={[
              "group relative flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold text-white shadow-sm transition-all",
              "bg-ondjo-blue hover:bg-ondjo-blue-dark active:scale-[0.98]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue",
            ].join(" ")}
          >
            <Search size={18} aria-hidden="true" className="shrink-0 transition-transform group-hover:scale-110" />
            <span className="whitespace-nowrap">
              {matchingCount > 0 ? `Ver ${matchingCount} imóveis` : "Pesquisar"}
            </span>
          </button>
        </div>
      </div>

      {/* 3. BARRA DE FILTROS AVANÇADOS / TOGGLES */}
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
          <span>{advancedOpen ? "Ocultar filtros avançados" : "Mais filtros (Comodidades, WC, Vagas)"}</span>

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

        {/* Resumo ou Limpar */}
        <div className="flex items-center gap-2">
          {matchingCount > 0 && (
            <span className="hidden text-xs text-ondjo-muted sm:inline">
              <strong className="text-ondjo-ink">{matchingCount}</strong> disponíveis
            </span>
          )}

          {(activeAdvancedCount > 0 || value.location || value.type || value.bedrooms) && (
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

      {/* 4. PAINEL EXPANSÍVEL: DETALHES AVANÇADOS & COMODIDADES DE LUANDA */}
      <AnimatePresence initial={false}>
        {advancedOpen && (
          <motion.div
            id={advancedId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3.5 space-y-4 rounded-2xl border border-ondjo-border/80 bg-ondjo-bg/60 p-4">
              {/* Linha 1: Preço Customizado, Casas de Banho e Vagas */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Preço Mínimo */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-ondjo-ink">
                    Preço mínimo (Kz)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={value.minPrice}
                    onChange={(e) => set("minPrice", e.target.value.replace(/\D/g, ""))}
                    placeholder="Ex.: 50 000 000"
                    className="h-11 w-full rounded-xl border border-ondjo-border bg-white px-3 text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus-visible:border-ondjo-blue focus-visible:ring-2 focus-visible:ring-ondjo-blue/20"
                  />
                </div>

                {/* Preço Máximo Preciso */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-ondjo-ink">
                    Preço máximo (Kz)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={value.maxPrice}
                    onChange={(e) => set("maxPrice", e.target.value.replace(/\D/g, ""))}
                    placeholder="Sem limite"
                    className="h-11 w-full rounded-xl border border-ondjo-border bg-white px-3 text-xs font-semibold text-ondjo-ink outline-none transition-colors hover:border-ondjo-muted focus-visible:border-ondjo-blue focus-visible:ring-2 focus-visible:ring-ondjo-blue/20"
                  />
                </div>

                {/* Casas de Banho */}
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-ondjo-ink">
                    <Bath size={14} className="text-ondjo-blue" aria-hidden="true" />
                    <span>Casas de banho</span>
                  </label>
                  <div className="flex gap-1.5">
                    {BATHROOM_OPTIONS.map((opt) => {
                      const isSel = (value.bathrooms || "") === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => set("bathrooms", opt.value)}
                          className={[
                            "flex-1 min-h-[42px] rounded-xl border text-xs font-bold transition-all",
                            "focus-visible:outline-2 focus-visible:outline-ondjo-blue",
                            isSel
                              ? "border-ondjo-blue bg-ondjo-blue-soft text-ondjo-blue"
                              : "border-ondjo-border bg-white text-ondjo-ink hover:bg-ondjo-bg",
                          ].join(" ")}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vagas de Estacionamento */}
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-ondjo-ink">
                    <Car size={14} className="text-ondjo-blue" aria-hidden="true" />
                    <span>Estacionamento</span>
                  </label>
                  <div className="flex gap-1.5">
                    {PARKING_OPTIONS.map((opt) => {
                      const isSel = (value.parking || "") === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => set("parking", opt.value)}
                          className={[
                            "flex-1 min-h-[42px] rounded-xl border text-xs font-bold transition-all",
                            "focus-visible:outline-2 focus-visible:outline-ondjo-blue",
                            isSel
                              ? "border-ondjo-blue bg-ondjo-blue-soft text-ondjo-blue"
                              : "border-ondjo-border bg-white text-ondjo-ink hover:bg-ondjo-bg",
                          ].join(" ")}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Linha 2: Comodidades Críticas de Luanda (Gerador, Tanque de Água, Segurança, etc.) */}
              <div className="border-t border-ondjo-border/60 pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ondjo-ink">
                    <Zap size={14} className="text-ondjo-blue" aria-hidden="true" />
                    <span>Comodidades Essenciais em Luanda</span>
                  </div>
                  {currentAmenities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => set("amenities", [])}
                      className="text-[11px] font-semibold text-ondjo-muted hover:text-ondjo-blue"
                    >
                      Limpar ({currentAmenities.length})
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {LUANDA_AMENITIES.map((am) => {
                    const isChecked = currentAmenities.includes(am.id);
                    return (
                      <button
                        key={am.id}
                        type="button"
                        onClick={() => toggleAmenity(am.id)}
                        aria-pressed={isChecked}
                        className={[
                          "inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ondjo-blue",
                          isChecked
                            ? "border-ondjo-blue bg-ondjo-blue-soft text-ondjo-blue font-bold shadow-xs"
                            : "border-ondjo-border bg-white text-ondjo-ink hover:border-ondjo-muted hover:bg-ondjo-bg",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "flex size-4 items-center justify-center rounded border transition-colors",
                            isChecked
                              ? "border-ondjo-blue bg-ondjo-blue text-white"
                              : "border-ondjo-border bg-transparent",
                          ].join(" ")}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span>{am.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botão de Aplicar no painel avançado (Mobile) */}
              <div className="flex items-center justify-end gap-2 pt-1 sm:hidden">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen(false)}
                  className="rounded-xl border border-ondjo-border bg-white px-4 py-2.5 text-xs font-bold text-ondjo-ink"
                >
                  Concluir
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-ondjo-blue px-4 py-2.5 text-xs font-bold text-white"
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
