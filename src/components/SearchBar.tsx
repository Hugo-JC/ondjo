
import {
  ChevronDown,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { locations } from "../data/properties";

export interface SearchFilters {
  query: string;
  location: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
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
};

const PRICE_PRESETS = [
  { label: "Até 5 milhões Kz", value: "5000000" },
  { label: "Até 10 milhões Kz", value: "10000000" },
  { label: "Até 25 milhões Kz", value: "25000000" },
  { label: "Até 50 milhões Kz", value: "50000000" },
  { label: "Até 100 milhões Kz", value: "100000000" },
  { label: "Até 250 milhões Kz", value: "250000000" },
  { label: "Até 500 milhões Kz", value: "500000000" },
];

const CONTROL_CLASS =
  "h-12 w-full min-w-0 rounded-xl border border-ondjo-border " +
  "bg-white px-3 text-sm text-ondjo-ink outline-none transition-colors " +
  "hover:border-ondjo-muted focus-visible:border-ondjo-blue " +
  "focus-visible:ring-2 focus-visible:ring-ondjo-blue " +
  "focus-visible:ring-offset-1";

const formatKz = (amount: string) =>
  `${new Intl.NumberFormat("pt-AO").format(Number(amount))} Kz`;

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

  const locationRef = useRef<HTMLDivElement>(null);
  const locationId = useId();
  const suggestionsId = useId();
  const advancedId = useId();
  const typeId = useId();
  const priceId = useId();
  const minPriceId = useId();
  const maxPriceId = useId();
  const bedroomsId = useId();

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setLocationOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);

    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const set = (key: keyof SearchFilters, next: string) => {
    onChange({ ...value, [key]: next });
  };

  const activeCount = [
    value.location,
    value.query,
    value.type,
    value.minPrice,
    value.maxPrice,
    value.bedrooms,
  ].filter(Boolean).length;

  const searchText = value.location || value.query;

  const filteredLocations = locations
    .filter((location) =>
      location.toLowerCase().includes(searchText.trim().toLowerCase()),
    )
    .slice(0, 6);

  const isCustomPrice =
    value.maxPrice !== "" &&
    !PRICE_PRESETS.some((preset) => preset.value === value.maxPrice);

  const clearFilters = () => {
    onChange({ ...emptyFilters });
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
        "relative w-full",
        compact
          ? "rounded-2xl"
          : "rounded-3xl border border-ondjo-border/80 bg-white p-3 shadow-[0_16px_48px_rgba(16,42,67,0.10)] sm:p-4",
      ].join(" ")}
    >
      {/* Pesquisa principal */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto]">
        {/* Localização */}
        <div ref={locationRef} className="relative min-w-0">
          <label
            htmlFor={locationId}
            className="mb-1.5 block text-xs font-semibold text-ondjo-ink"
          >
            Onde procuras?
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
              size={19}
              aria-hidden="true"
              className="shrink-0 text-ondjo-blue"
            />

            <input
              id={locationId}
              type="text"
              value={searchText}
              onFocus={() => setLocationOpen(true)}
              onChange={(event) => {
                onChange({
                  ...value,
                  location: "",
                  query: event.target.value,
                });
                setLocationOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setLocationOpen(false);
                }
              }}
              placeholder="Ex.: Talatona, Luanda"
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls={suggestionsId}
              aria-expanded={locationOpen}
              className="min-w-0 flex-1 bg-transparent text-sm text-ondjo-ink outline-none placeholder:text-ondjo-muted"
            />

            {searchText && (
              <button
                type="button"
                onClick={() => {
                  onChange({
                    ...value,
                    location: "",
                    query: "",
                  });
                  setLocationOpen(true);
                }}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ondjo-muted transition hover:bg-ondjo-bg hover:text-ondjo-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue"
                aria-label="Limpar localização"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {locationOpen && (
              <motion.div
                id={suggestionsId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-ondjo-border bg-white p-2 shadow-[0_12px_36px_rgba(16,42,67,0.14)]"
              >
                <p className="px-3 py-2 text-xs font-semibold text-ondjo-muted">
                  {searchText ? "Locais encontrados" : "Locais populares"}
                </p>

                {filteredLocations.length > 0 ? (
                  filteredLocations.map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => {
                        onChange({
                          ...value,
                          location,
                          query: "",
                        });
                        setLocationOpen(false);
                      }}
                      className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ondjo-ink transition hover:bg-ondjo-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ondjo-blue-soft text-ondjo-blue">
                        <MapPin size={16} aria-hidden="true" />
                      </span>
                      <span>{location}, Luanda</span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-4 text-sm text-ondjo-muted">
                    Nenhuma zona encontrada. Podes pesquisar pelo texto
                    introduzido.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Orçamento */}
        <div className="min-w-0">
          <label
            htmlFor={priceId}
            className="mb-1.5 block text-xs font-semibold text-ondjo-ink"
          >
            Orçamento máximo
          </label>

          <div className="relative">
            <select
              id={priceId}
              value={value.maxPrice}
              onChange={(event) => set("maxPrice", event.target.value)}
              className={`${CONTROL_CLASS} appearance-none pr-9`}
            >
              <option value="">Sem limite</option>

              {isCustomPrice && (
                <option value={value.maxPrice}>
                  Até {formatKz(value.maxPrice)}
                </option>
              )}

              {PRICE_PRESETS.map((preset) => (
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

        {/* Tipo de imóvel */}
        <div className="min-w-0">
          <label
            htmlFor={typeId}
            className="mb-1.5 block text-xs font-semibold text-ondjo-ink"
          >
            Tipo de imóvel
          </label>

          <div className="relative">
            <select
              id={typeId}
              value={value.type}
              onChange={(event) => set("type", event.target.value)}
              className={`${CONTROL_CLASS} appearance-none pr-9`}
            >
              <option value="">Todos os tipos</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Casa">Casa</option>
              <option value="Moradia">Moradia</option>
              <option value="Terreno">Terreno</option>
            </select>

            <ChevronDown
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ondjo-muted"
            />
          </div>
        </div>

        {/* Pesquisar */}
        <div className="flex flex-col">
          <span
            aria-hidden="true"
            className="mb-1.5 hidden text-xs font-semibold text-transparent lg:block"
          >
            Pesquisar
          </span>

          <button
            type="submit"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ondjo-navy active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue"
          >
            <Search size={18} aria-hidden="true" />
            Pesquisar
          </button>
        </div>
      </div>

      {/* Filtros adicionais */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ondjo-border/70 pt-2">
        <button
          type="button"
          onClick={() => setAdvancedOpen((open) => !open)}
          aria-expanded={advancedOpen}
          aria-controls={advancedId}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-ondjo-blue transition-colors hover:bg-ondjo-blue-soft/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue"
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          {advancedOpen ? "Menos filtros" : "Mais filtros"}

          {activeCount > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-ondjo-blue-soft px-1.5 py-0.5 text-xs font-bold text-ondjo-blue">
              {activeCount}
            </span>
          )}

          <ChevronDown
            size={15}
            aria-hidden="true"
            className={`transition-transform ${advancedOpen ? "rotate-180" : ""}`}
          />
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="min-h-10 rounded-lg px-2 text-sm font-medium text-ondjo-muted underline-offset-4 transition-colors hover:text-ondjo-blue hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {advancedOpen && (
          <motion.div
            id={advancedId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 grid gap-4 border-t border-ondjo-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                id={minPriceId}
                label="Preço mínimo"
                prefix="Kz"
              >
                <input
                  id={minPriceId}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={value.minPrice}
                  onChange={(event) =>
                    set(
                      "minPrice",
                      event.target.value.replace(/\D/g, ""),
                    )
                  }
                  placeholder="Sem mínimo"
                  className={`${CONTROL_CLASS} pr-12`}
                />
              </Field>

              <Field
                id={maxPriceId}
                label="Preço máximo"
                prefix="Kz"
              >
                <input
                  id={maxPriceId}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={value.maxPrice}
                  onChange={(event) =>
                    set(
                      "maxPrice",
                      event.target.value.replace(/\D/g, ""),
                    )
                  }
                  placeholder="Sem máximo"
                  className={`${CONTROL_CLASS} pr-12`}
                />
              </Field>

              <Field id={bedroomsId} label="Número de quartos">
                <div className="relative">
                  <select
                    id={bedroomsId}
                    value={value.bedrooms}
                    onChange={(event) =>
                      set("bedrooms", event.target.value)
                    }
                    className={`${CONTROL_CLASS} appearance-none pr-9`}
                  >
                    <option value="">Qualquer número</option>
                    <option value="1">1 quarto</option>
                    <option value="2">2 quartos</option>
                    <option value="3">3 quartos</option>
                    <option value="4">4 ou mais quartos</option>
                  </select>

                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ondjo-muted"
                  />
                </div>
              </Field>
            </div>

            <p className="mt-3 text-xs leading-5 text-ondjo-muted">
              Podes combinar os filtros para encontrar imóveis que se
              ajustem à tua localização e ao teu orçamento.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

function Field({
  id,
  label,
  prefix,
  children,
}: {
  id: string;
  label: string;
  prefix?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold text-ondjo-ink"
      >
        {label}
      </label>

      <div className="relative">
        {children}

        {prefix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ondjo-muted"
          >
            {prefix}
          </span>
        )}
      </div>
    </div>
  );
}