import { useState } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { AMENITY_OPTIONS } from "../data/amenities";
import { cn } from "../utils/cn";

export type SearchOrigin =
  | "todos"
  | "verificados"
  | "proprietario"
  | "agentes"
  | "particulares";

export interface OriginOption {
  id: SearchOrigin;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export const ORIGIN_OPTIONS: OriginOption[] = [
  {
    id: "todos",
    label: "Todos os anúncios",
    shortLabel: "Todos",
    icon: Sparkles,
  },
  {
    id: "verificados",
    label: "Verificados ONDJO",
    shortLabel: "Verificados",
    icon: ShieldCheck,
  },
  {
    id: "proprietario",
    label: "Direto Proprietário",
    shortLabel: "Proprietário",
    icon: UserCheck,
  },
  {
    id: "agentes",
    label: "Agências & Corretores",
    shortLabel: "Agências",
    icon: Building2,
  },
];

export function formatCompactKz(value: number): string {
  if (value <= 0) return "0 Kz";
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const formatted = Number.isInteger(millions)
      ? String(millions)
      : millions.toFixed(1).replace(".", ",");
    return `${formatted} M Kz`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)} mil Kz`;
  }
  return `${value.toLocaleString("pt-AO")} Kz`;
}

export function formatKzInputDisplay(raw: string): string {
  if (!raw) return "";
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) return "";
  return num.toLocaleString("pt-AO");
}

interface PriceDualRangeSliderProps {
  purpose?: string;
  minPrice: string;
  maxPrice: string;
  onChangeMin: (val: string) => void;
  onChangeMax: (val: string) => void;
}

export function PriceDualRangeSlider({
  purpose = "comprar",
  minPrice,
  maxPrice,
  onChangeMin,
  onChangeMax,
}: PriceDualRangeSliderProps) {
  const isRental = purpose === "arrendar";
  const ceiling = isRental ? 5_000_000 : 250_000_000;
  const step = isRental ? 50_000 : 2_500_000;

  const minVal = minPrice ? Math.max(0, Math.min(Number(minPrice), ceiling)) : 0;
  const maxVal = maxPrice
    ? Math.max(0, Math.min(Number(maxPrice), ceiling))
    : ceiling;

  const [activeThumb, setActiveThumb] = useState<"min" | "max">("max");

  const minPercent = Math.min(100, Math.max(0, (minVal / ceiling) * 100));
  const maxPercent = Math.min(100, Math.max(0, (maxVal / ceiling) * 100));

  const presets = isRental
    ? [
        { label: "Até 300 mil", min: "", max: "300000" },
        { label: "300k – 800k", min: "300000", max: "800000" },
        { label: "800k – 2 M", min: "800000", max: "2000000" },
        { label: "2 M+", min: "2000000", max: "" },
      ]
    : [
        { label: "Até 30 M", min: "", max: "30000000" },
        { label: "30 – 80 M", min: "30000000", max: "80000000" },
        { label: "80 – 150 M", min: "80000000", max: "150000000" },
        { label: "150 M+", min: "150000000", max: "" },
      ];

  const handleMinChange = (val: number) => {
    setActiveThumb("min");
    const clamped = Math.min(val, Math.max(0, maxVal - step));
    onChangeMin(clamped <= 0 ? "" : String(clamped));
  };

  const handleMaxChange = (val: number) => {
    setActiveThumb("max");
    const clamped = Math.max(val, minVal + step);
    onChangeMax(clamped >= ceiling ? "" : String(clamped));
  };

  const hasFilter = Boolean(minPrice || maxPrice);

  const summaryLabel = (() => {
    const hasMin = Boolean(minPrice && minVal > 0);
    const hasMax = Boolean(maxPrice && maxVal < ceiling);
    if (!hasMin && !hasMax) return "Qualquer valor em Kz";
    if (!hasMin && hasMax) return `Até ${formatCompactKz(maxVal)}`;
    if (hasMin && !hasMax) return `Desde ${formatCompactKz(minVal)}`;
    return `${formatCompactKz(minVal).replace(" Kz", "")} – ${formatCompactKz(maxVal)}`;
  })();

  const isPresetActive = (pMin: string, pMax: string) =>
    (minPrice || "") === pMin && (maxPrice || "") === pMax;

  return (
    <div className="w-full space-y-4 select-none">
      {/* Resumo único e limpo sem números repetidos */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-[11px] font-semibold text-ondjo-muted">
            Faixa de orçamento {isRental ? "(mensal)" : ""}
          </span>
          <span className="mt-0.5 block text-sm sm:text-base font-bold tracking-tight text-ondjo-navy tabular-nums truncate">
            {summaryLabel}
          </span>
        </div>

        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              onChangeMin("");
              onChangeMax("");
            }}
            className="focus-ring shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ondjo-blue hover:bg-ondjo-blue-50 transition-colors cursor-pointer"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Slider duplo respirável */}
      <div className="px-1 py-1">
        <div className="relative flex h-7 w-full items-center">
          <div className="absolute h-1.5 w-full rounded-full bg-slate-200/85" />
          <div
            className="absolute h-1.5 rounded-full bg-ondjo-blue transition-[left,width] duration-75"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />

          <input
            type="range"
            min={0}
            max={ceiling}
            step={step}
            value={minVal}
            onMouseDown={() => setActiveThumb("min")}
            onTouchStart={() => setActiveThumb("min")}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            aria-label="Preço mínimo em Kwanzas"
            className={cn(
              "focus-ring absolute inset-0 h-full w-full appearance-none bg-transparent pointer-events-none cursor-pointer",
              activeThumb === "min" ? "z-30" : "z-20",
              "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ondjo-blue [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(16,42,67,0.18)] [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-115 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:size-5.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-ondjo-blue [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(16,42,67,0.18)] [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:active:scale-115 [&::-moz-range-thumb]:transition-transform",
            )}
          />

          <input
            type="range"
            min={0}
            max={ceiling}
            step={step}
            value={maxVal}
            onMouseDown={() => setActiveThumb("max")}
            onTouchStart={() => setActiveThumb("max")}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            aria-label="Preço máximo em Kwanzas"
            className={cn(
              "focus-ring absolute inset-0 h-full w-full appearance-none bg-transparent pointer-events-none cursor-pointer",
              activeThumb === "max" ? "z-30" : "z-20",
              "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ondjo-blue [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(16,42,67,0.18)] [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-115 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:size-5.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-ondjo-blue [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(16,42,67,0.18)] [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:active:scale-115 [&::-moz-range-thumb]:transition-transform",
            )}
          />
        </div>
      </div>

      {/* Campos manuais limpos com espaço e unidade Kz */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-[11px] font-semibold text-ondjo-muted mb-1">
            Mínimo
          </span>
          <div className="relative flex items-center">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Sem mínimo"
              value={formatKzInputDisplay(minPrice)}
              onChange={(e) => onChangeMin(e.target.value.replace(/\D/g, ""))}
              className="h-11 w-full rounded-xl border border-ondjo-border bg-white pl-3 pr-9 text-xs sm:text-sm font-semibold text-ondjo-navy tabular-nums outline-none transition-colors duration-150 placeholder:text-slate-400 focus:border-ondjo-blue focus:ring-3 focus:ring-ondjo-blue/12"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 text-[11px] font-semibold text-slate-400"
            >
              Kz
            </span>
          </div>
        </label>

        <label className="block">
          <span className="block text-[11px] font-semibold text-ondjo-muted mb-1">
            Máximo
          </span>
          <div className="relative flex items-center">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Sem máximo"
              value={formatKzInputDisplay(maxPrice)}
              onChange={(e) => onChangeMax(e.target.value.replace(/\D/g, ""))}
              className="h-11 w-full rounded-xl border border-ondjo-border bg-white pl-3 pr-9 text-xs sm:text-sm font-semibold text-ondjo-navy tabular-nums outline-none transition-colors duration-150 placeholder:text-slate-400 focus:border-ondjo-blue focus:ring-3 focus:ring-ondjo-blue/12"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 text-[11px] font-semibold text-slate-400"
            >
              Kz
            </span>
          </div>
        </label>
      </div>

      {/* 4 Atalhos limpos em grelha respirável */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
        {presets.map((preset) => {
          const active = isPresetActive(preset.min, preset.max);
          return (
            <button
              key={preset.label}
              type="button"
              aria-pressed={active}
              onClick={() => {
                if (active) {
                  onChangeMin("");
                  onChangeMax("");
                } else {
                  onChangeMin(preset.min);
                  onChangeMax(preset.max);
                }
              }}
              className={cn(
                "focus-ring min-h-9.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold tabular-nums transition-colors duration-150 cursor-pointer whitespace-nowrap",
                active
                  ? "border-ondjo-blue bg-ondjo-blue text-white shadow-2xs"
                  : "border-ondjo-border/90 bg-slate-50/70 text-ondjo-ink hover:bg-slate-100 hover:border-slate-300",
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface OriginSelectorProps {
  value?: string;
  onChange: (next: SearchOrigin) => void;
}

export function OriginSelector({
  value = "todos",
  onChange,
}: OriginSelectorProps) {
  const current = (value || "todos") as SearchOrigin;

  return (
    <div
      role="radiogroup"
      aria-label="Origem do anúncio"
      className="grid grid-cols-2 gap-2"
    >
      {ORIGIN_OPTIONS.map((opt) => {
        const isSelected = current === opt.id;
        const Icon = opt.icon;

        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.id)}
            className={cn(
              "focus-ring flex min-h-11 items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors duration-150 cursor-pointer",
              isSelected
                ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-blue font-bold ring-1 ring-ondjo-blue/20"
                : "border-ondjo-border bg-white text-ondjo-ink hover:border-slate-300 hover:bg-slate-50/80",
            )}
          >
            <Icon
              size={16}
              strokeWidth={isSelected ? 2.3 : 1.9}
              className={cn(
                "shrink-0",
                isSelected ? "text-ondjo-blue" : "text-slate-400",
              )}
              aria-hidden="true"
            />
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface AmenitiesSelectorProps {
  selected: string[];
  onToggle: (amenityId: string) => void;
  defaultVisibleCount?: number;
}

export function AmenitiesSelector({
  selected,
  onToggle,
  defaultVisibleCount = 6,
}: AmenitiesSelectorProps) {
  const hasExtraSelected = AMENITY_OPTIONS.slice(defaultVisibleCount).some(
    (item) => selected.includes(item.id) || selected.includes(item.label),
  );
  const [expanded, setExpanded] = useState(hasExtraSelected);

  const visibleOptions = expanded
    ? AMENITY_OPTIONS
    : AMENITY_OPTIONS.slice(0, defaultVisibleCount);
  const remainingCount = AMENITY_OPTIONS.length - defaultVisibleCount;

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {visibleOptions.map((item) => {
          const isSelected =
            selected.includes(item.id) || selected.includes(item.label);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              aria-pressed={isSelected}
              className={cn(
                "focus-ring group flex min-h-10.5 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors duration-150 cursor-pointer select-none",
                isSelected
                  ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-navy font-bold ring-1 ring-ondjo-blue/20"
                  : "border-ondjo-border bg-white text-ondjo-ink hover:border-slate-300 hover:bg-slate-50/80",
              )}
            >
              <Icon
                size={15}
                strokeWidth={isSelected ? 2.3 : 1.9}
                className={cn(
                  "shrink-0 transition-colors",
                  isSelected
                    ? "text-ondjo-blue"
                    : "text-slate-400 group-hover:text-ondjo-ink",
                )}
                aria-hidden="true"
              />
              <span className="truncate flex-1">
                {item.shortLabel || item.label}
              </span>
              {isSelected && (
                <Check
                  size={13}
                  strokeWidth={2.8}
                  className="shrink-0 text-ondjo-blue"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {remainingCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="focus-ring inline-flex items-center gap-1 rounded-lg px-1 py-1 text-xs font-semibold text-ondjo-blue hover:underline cursor-pointer"
        >
          <span>
            {expanded
              ? "Mostrar menos comodidades"
              : `Ver mais ${remainingCount} comodidades`}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              "transition-transform duration-150",
              expanded && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}
