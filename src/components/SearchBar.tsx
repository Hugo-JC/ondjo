import {
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
  Check,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
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
  { id: "todos", label: "Todos os imóveis" },
  { id: "verificados", label: "Verificados ONDJO", icon: ShieldCheck },
];

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

export function defaultSearchFilters(): SearchFilters {
  return { ...emptyFilters };
}

type ActiveSegment = "location" | "type" | "bedrooms" | "price" | null;

export function SearchBar({
  value,
  onChange,
  onSearch,
  compact = false,
}: SearchBarProps) {
  const [activeSegment, setActiveSegment] = useState<ActiveSegment>(null);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const barRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  const locationId = useId();

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setActiveSegment(null);
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

  // Contagem dinâmica usando o filtro partilhado
  const matchingCount = useMemo(() => {
    return filterProperties(properties, {
      ...value,
      query: value.query || value.location,
    }).length;
  }, [value]);

  const searchText = value.location || value.query;

  const filteredLocations = locations
    .filter((loc) => loc.toLowerCase().includes(searchText.trim().toLowerCase()))
    .slice(0, 6);

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

  return (
    <div ref={barRef} className={["relative w-full text-left", compact ? "max-w-3xl mx-auto" : ""].join(" ")}>
      {/* ========================================================
          CABEÇALHO DA BUSCA: TABS COMPRAR/ARRENDAR & VERIFICADOS
         ======================================================== */}
      <div className="mb-3.5 flex items-center justify-between px-2 sm:px-4">
        {/* Tabs arredondadas estilo pílula (Airbnb / Houter) */}
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

        {/* Toggle sutil de Verificados ONDJO */}
        <div className="flex items-center gap-2">
          {ORIGIN_OPTIONS.map((orig) => {
            const isSelected = currentOrigin === orig.id;
            const Icon = orig.icon;
            if (orig.id === "todos") return null;
            return (
              <button
                key={orig.id}
                type="button"
                onClick={() => set("origin", isSelected ? "todos" : orig.id)}
                className={[
                  "inline-flex min-h-8.5 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-all cursor-pointer",
                  isSelected
                    ? "border-emerald-500/30 bg-emerald-50 text-emerald-800 shadow-xs"
                    : "border-slate-200/80 bg-white/90 text-slate-600 hover:border-slate-300 hover:text-ondjo-ink",
                ].join(" ")}
              >
                {Icon && (
                  <Icon
                    size={14}
                    aria-hidden="true"
                    className={isSelected ? "text-emerald-600" : "text-slate-400"}
                  />
                )}
                <span>{orig.label}</span>
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
            "relative flex items-center rounded-full bg-white transition-all duration-300",
            "border border-slate-200/80 shadow-[0_16px_40px_rgba(16,42,67,0.08)] hover:shadow-[0_20px_50px_rgba(16,42,67,0.14)]",
            activeSegment ? "bg-slate-50/50" : "",
          ].join(" ")}
        >
          {/* SEGMENTO 1: ONDE PROCURA? */}
          <button
            type="button"
            onClick={() => {
              setActiveSegment(activeSegment === "location" ? null : "location");
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

          {/* Divisor vertical */}
          <div
            className={`h-8 w-px bg-slate-200/80 shrink-0 transition-opacity ${
              activeSegment === "location" || activeSegment === "type" ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* SEGMENTO 2: TIPO DE IMÓVEL */}
          <button
            type="button"
            onClick={() => setActiveSegment(activeSegment === "type" ? null : "type")}
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

          {/* Divisor vertical */}
          <div
            className={`h-8 w-px bg-slate-200/80 shrink-0 transition-opacity ${
              activeSegment === "type" || activeSegment === "bedrooms" ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* SEGMENTO 3: TIPOLOGIA / QUARTOS */}
          <button
            type="button"
            onClick={() => setActiveSegment(activeSegment === "bedrooms" ? null : "bedrooms")}
            className={[
              "group relative flex-1 rounded-full px-6 py-3.5 text-left transition-all cursor-pointer",
              activeSegment === "bedrooms"
                ? "bg-white shadow-[0_8px_24px_rgba(16,42,67,0.12)] z-20 ring-1 ring-slate-200"
                : "hover:bg-slate-100/70",
            ].join(" ")}
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Quartos
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold text-ondjo-ink">
              {value.bedrooms ? `T${value.bedrooms}` : "Qualquer"}
            </span>
          </button>

          {/* Divisor vertical */}
          <div
            className={`h-8 w-px bg-slate-200/80 shrink-0 transition-opacity ${
              activeSegment === "bedrooms" || activeSegment === "price" ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* SEGMENTO 4: ORÇAMENTO / PREÇO */}
          <button
            type="button"
            onClick={() => setActiveSegment(activeSegment === "price" ? null : "price")}
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

          {/* BOTÃO PRINCIPAL DE PESQUISA (PÍLULA ESTILO AIRBNB) */}
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

        {/* ========================================================
            POPOVERS FLUTUANTES ARREDONDADOS (AIRBNB STYLE)
           ======================================================== */}
        <AnimatePresence>
          {/* Popover 1: Localização */}
          {activeSegment === "location" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
              className="absolute left-0 top-full mt-3 w-96 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_50px_rgba(16,42,67,0.16)] z-40"
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
                    onClick={() => onChange({ ...value, location: "", query: "" })}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="mt-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {searchText ? "Zonas correspondentes" : "Zonas populares em Luanda"}
                </span>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {(filteredLocations.length > 0 ? filteredLocations : ["Talatona", "Kilamba", "Maianga", "Benfica", "Camama", "Viana"]).map((loc) => (
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

          {/* Popover 2: Tipo de Imóvel */}
          {activeSegment === "type" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
              className="absolute left-1/4 top-full mt-3 w-80 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_20px_50px_rgba(16,42,67,0.16)] z-40"
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
                        setActiveSegment("bedrooms");
                      }}
                      className={[
                        "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all cursor-pointer",
                        isSelected
                          ? "bg-ondjo-blue text-white shadow-xs"
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

          {/* Popover 3: Tipologia */}
          {activeSegment === "bedrooms" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
              className="absolute left-1/2 top-full mt-3 w-80 -translate-x-1/4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_50px_rgba(16,42,67,0.16)] z-40"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Número de quartos
              </span>
              <div className="grid grid-cols-4 gap-2">
                {BEDROOM_OPTIONS.map((b) => {
                  const isSelected = value.bedrooms === b.value;
                  return (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => {
                        set("bedrooms", b.value);
                        setActiveSegment("price");
                      }}
                      className={[
                        "flex h-11 items-center justify-center rounded-2xl text-xs font-bold transition-all cursor-pointer border",
                        isSelected
                          ? "bg-ondjo-navy border-ondjo-navy text-white shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Popover 4: Preço */}
          {activeSegment === "price" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
              className="absolute right-0 top-full mt-3 w-88 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_50px_rgba(16,42,67,0.16)] z-40"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Faixa de preço (Kz)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Mínimo</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Sem mín."
                    value={value.minPrice}
                    onChange={(e) => set("minPrice", e.target.value.replace(/\D/g, ""))}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-ondjo-ink outline-none focus:border-ondjo-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Máximo</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Sem máx."
                    value={value.maxPrice}
                    onChange={(e) => set("maxPrice", e.target.value.replace(/\D/g, ""))}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-ondjo-ink outline-none focus:border-ondjo-blue"
                  />
                </div>
              </div>

              {/* Botão de Busca dentro do Popover */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-ondjo-blue font-bold text-xs text-white hover:bg-ondjo-blue-dark transition cursor-pointer"
              >
                Ver {matchingCount > 0 ? `${matchingCount} imóveis` : "Resultados"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================
          MOBILE: BARRA EM PÍLULA TOUCH ELEGANTE (AIRBNB MOBILE)
         ======================================================== */}
      <div className="block md:hidden">
        <button
          type="button"
          onClick={() => setMobileModalOpen(true)}
          className="flex w-full items-center gap-3.5 rounded-full border border-slate-200/90 bg-white p-2.5 shadow-[0_10px_30px_rgba(16,42,67,0.1)] active:scale-[0.99] transition-all cursor-pointer text-left"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-ondjo-blue text-white shadow-xs shrink-0">
            <Search size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-ondjo-ink truncate">
              {searchText || "Onde quer procurar?"}
            </h4>
            <p className="text-[11px] font-medium text-slate-500 truncate">
              {value.type || "Qualquer tipo"} · {value.bedrooms ? `T${value.bedrooms}` : "Qualquer tipologia"}
            </p>
          </div>

          <div className="flex size-9 items-center justify-center rounded-full border border-slate-200/80 text-slate-600 shrink-0">
            <SlidersHorizontal size={15} />
          </div>
        </button>

        {/* Modal / Bottom Sheet no Mobile */}
        <AnimatePresence>
          {mobileModalOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs sm:justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
                className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-ondjo-navy">Filtrar Pesquisa</h3>
                  <button
                    type="button"
                    onClick={() => setMobileModalOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {/* Onde */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Localização</label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 bg-slate-50">
                      <MapPin size={16} className="text-ondjo-blue shrink-0" />
                      <input
                        type="text"
                        value={searchText}
                        onChange={(e) => onChange({ ...value, location: "", query: e.target.value })}
                        placeholder="Ex: Talatona, Maianga, Kilamba"
                        className="w-full bg-transparent text-sm font-semibold outline-none text-ondjo-ink"
                      />
                    </div>
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Tipo de Imóvel</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PROPERTY_TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => set("type", t.value)}
                          className={[
                            "p-2.5 rounded-xl text-xs font-semibold border transition text-center cursor-pointer",
                            value.type === t.value
                              ? "border-ondjo-blue bg-ondjo-blue-soft text-ondjo-blue font-bold"
                              : "border-slate-200 text-slate-700",
                          ].join(" ")}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quartos */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Tipologia</label>
                    <div className="flex flex-wrap gap-2">
                      {BEDROOM_OPTIONS.map((b) => (
                        <button
                          key={b.value}
                          type="button"
                          onClick={() => set("bedrooms", b.value)}
                          className={[
                            "px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer",
                            value.bedrooms === b.value
                              ? "border-ondjo-navy bg-ondjo-navy text-white"
                              : "border-slate-200 text-slate-700",
                          ].join(" ")}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ações no rodapé do modal */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-slate-500 hover:text-ondjo-blue cursor-pointer"
                  >
                    Limpar tudo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="flex-1 rounded-xl bg-ondjo-blue py-3 text-center text-sm font-bold text-white shadow-md active:scale-98 cursor-pointer"
                  >
                    {matchingCount > 0 ? `Ver ${matchingCount} imóveis` : "Pesquisar"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
