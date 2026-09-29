import {
  ChevronDown,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const set = (key: keyof SearchFilters, next: string) =>
    onChange({ ...value, [key]: next });

  const activeCount = [
    value.location,
    value.type,
    value.minPrice,
    value.maxPrice,
    value.bedrooms,
  ].filter(Boolean).length;

  return (
    <div
      className={`relative ${compact ? "" : "rounded-3xl border border-white/20 bg-white p-2 shadow-[0_20px_60px_rgba(12,35,68,0.18)]"}`}
    >
      <div
        className={
          compact
            ? "grid gap-2 sm:grid-cols-[1.5fr_1fr_1fr_auto]"
            : "grid gap-2 sm:grid-cols-[1.6fr_1fr_1fr_auto]"
        }
      >
        <div ref={ref} className="relative">
          <label className="sr-only" htmlFor="ondjo-location">
            Onde procura?
          </label>
          <div
            className={`flex h-14 items-center rounded-2xl border bg-white px-4 transition focus-within:border-ondjo-blue focus-within:ring-4 focus-within:ring-blue-100 ${locationOpen ? "border-ondjo-blue ring-4 ring-blue-100" : "border-ondjo-border"}`}
          >
            <MapPin size={19} className="mr-3 shrink-0 text-ondjo-blue" />
            <input
              id="ondjo-location"
              value={value.location || value.query}
              onFocus={() => setLocationOpen(true)}
              onChange={(e) => {
                set("location", "");
                set("query", e.target.value);
                setLocationOpen(true);
              }}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="Onde procura?"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ondjo-ink outline-none placeholder:text-slate-400"
              autoComplete="off"
            />
            {(value.location || value.query) && (
              <button
                onClick={() => onChange({ ...value, location: "", query: "" })}
                className="focus-ring rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Limpar localização"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {locationOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute left-0 right-0 top-15.5 z-30 overflow-hidden rounded-2xl border border-ondjo-border bg-white p-2 shadow-xl"
              >
                <p className="px-3 pb-2 pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Locais populares
                </p>
                {locations
                  .filter((location) =>
                    location
                      .toLowerCase()
                      .includes((value.query || value.location).toLowerCase()),
                  )
                  .slice(0, 6)
                  .map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        onChange({ ...value, location, query: "" });
                        setLocationOpen(false);
                      }}
                      className="focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-slate-50"
                    >
                      <MapPin size={16} className="text-ondjo-blue" />
                      {location}, Luanda
                    </button>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <SelectField
          label="Preço"
          value={value.maxPrice ? `Até ${value.maxPrice} Kz` : "Qualquer preço"}
          onClick={() => setAdvancedOpen(true)}
        />
        <SelectField
          label="Tipo"
          value={value.type || "Todos os tipos"}
          onClick={() => setAdvancedOpen(true)}
        />

        <button
          onClick={onSearch}
          className="focus-ring flex h-14 items-center justify-center gap-2 rounded-2xl bg-ondjo-green px-5 text-sm font-extrabold text-white shadow-sm shadow-ondjo-green/20 transition hover:bg-green-700 active:scale-[.99]"
        >
          <Search size={18} />
          <span>Pesquisar</span>
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between px-1 sm:px-2">
        <button
          onClick={() => setAdvancedOpen((v) => !v)}
          className="focus-ring flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold text-ondjo-blue hover:bg-blue-50"
          aria-expanded={advancedOpen}
        >
          <SlidersHorizontal size={16} />
          Mais filtros
          {activeCount > 0 && (
            <span className="grid min-w-5 place-items-center rounded-full bg-ondjo-blue px-1.5 py-0.5 text-[11px] text-white">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button
            onClick={() => onChange({ ...emptyFilters })}
            className="focus-ring rounded-lg px-2 py-2 text-xs font-bold text-slate-500 hover:text-ondjo-ink"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <AnimatePresence>
        {advancedOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 grid gap-3 border-t border-ondjo-border px-1 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Preço mínimo" prefix="Kz">
                <input
                  inputMode="numeric"
                  value={value.minPrice}
                  onChange={(e) =>
                    set("minPrice", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Sem mínimo"
                  className="filter-input"
                />
              </Field>
              <Field label="Preço máximo" prefix="Kz">
                <input
                  inputMode="numeric"
                  value={value.maxPrice}
                  onChange={(e) =>
                    set("maxPrice", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Sem máximo"
                  className="filter-input"
                />
              </Field>
              <Field label="Tipo de imóvel">
                <select
                  value={value.type}
                  onChange={(e) => set("type", e.target.value)}
                  className="filter-input"
                >
                  <option value="">Todos os tipos</option>
                  <option>Apartamento</option>
                  <option>Casa</option>
                  <option>Moradia</option>
                  <option>Terreno</option>
                </select>
              </Field>
              <Field label="Quartos">
                <select
                  value={value.bedrooms}
                  onChange={(e) => set("bedrooms", e.target.value)}
                  className="filter-input"
                >
                  <option value="">Qualquer número</option>
                  <option value="1">1 quarto</option>
                  <option value="2">2 quartos</option>
                  <option value="3">3 quartos</option>
                  <option value="4">4+ quartos</option>
                </select>
              </Field>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectField({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="focus-ring flex h-14 items-center justify-between rounded-2xl border border-ondjo-border bg-white px-4 text-left hover:border-slate-300"
    >
      <span className="min-w-0">
        <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </span>
        <span className="block truncate text-sm font-semibold text-ondjo-ink">
          {value}
        </span>
      </span>
      <ChevronDown size={17} className="ml-2 shrink-0 text-slate-400" />
    </button>
  );
}

function Field({
  label,
  prefix,
  children,
}: {
  label: string;
  prefix?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">
        {label}
      </span>
      <div className="relative">
        {children}
        {prefix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {prefix}
          </span>
        )}
      </div>
    </label>
  );
}
