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
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  colorClass: string;
  bgSoftClass: string;
}

export const ORIGIN_OPTIONS: OriginOption[] = [
  {
    id: "todos",
    label: "Todos os anúncios",
    shortLabel: "Todos",
    icon: Sparkles,
    colorClass: "text-ondjo-blue",
    bgSoftClass: "bg-ondjo-blue-50",
  },
  {
    id: "verificados",
    label: "Verificados ONDJO",
    shortLabel: "Verificados",
    icon: ShieldCheck,
    colorClass: "text-emerald-600",
    bgSoftClass: "bg-emerald-50",
  },
  {
    id: "proprietario",
    label: "Direto Proprietário",
    shortLabel: "Proprietário",
    icon: UserCheck,
    colorClass: "text-sky-600",
    bgSoftClass: "bg-sky-50",
  },
  {
    id: "agentes",
    label: "Agências & Corretores",
    shortLabel: "Agências",
    icon: Building2,
    colorClass: "text-indigo-600",
    bgSoftClass: "bg-indigo-50",
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
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              onChangeMin("");
              onChangeMax("");
            }}
            className="text-ondjo-blue hover:bg-ondjo-blue-50 hover:text-ondjo-blue"
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Slider duplo shadcn/ui (Base UI) */}
      <div className="px-1 py-1">
        <Slider
          value={[minVal, maxVal]}
          min={0}
          max={ceiling}
          step={step}
          minStepsBetweenValues={1}
          onValueChange={(val) => {
            if (!Array.isArray(val) || val.length < 2) return;
            const [nextMin, nextMax] = val as number[];
            onChangeMin(nextMin <= 0 ? "" : String(nextMin));
            onChangeMax(nextMax >= ceiling ? "" : String(nextMax));
          }}
        />
      </div>

      {/* Campos manuais limpos com espaço e unidade Kz */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-[11px] font-semibold text-ondjo-muted mb-1">
            Mínimo
          </span>
          <div className="relative flex items-center">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Sem mínimo"
              value={formatKzInputDisplay(minPrice)}
              onChange={(e) => onChangeMin(e.target.value.replace(/\D/g, ""))}
              className="pl-3 pr-9 text-xs sm:text-sm font-semibold text-ondjo-navy tabular-nums"
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
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Sem máximo"
              value={formatKzInputDisplay(maxPrice)}
              onChange={(e) => onChangeMax(e.target.value.replace(/\D/g, ""))}
              className="pl-3 pr-9 text-xs sm:text-sm font-semibold text-ondjo-navy tabular-nums"
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

      {/* 4 Atalhos limpos com variação de bordas */}
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
                "focus-ring min-h-9.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold tabular-nums cursor-pointer whitespace-nowrap",
                active
                  ? "ondjo-border-selected bg-ondjo-blue text-white shadow-2xs"
                  : "ondjo-border-interactive bg-slate-50/70 text-ondjo-ink hover:bg-slate-100",
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
    <RadioGroup
      value={current}
      onValueChange={(val) => onChange(String(val) as SearchOrigin)}
      aria-label="Origem do anúncio"
      className="grid grid-cols-2 gap-2"
    >
      {ORIGIN_OPTIONS.map((opt) => {
        const isSelected = current === opt.id;
        const Icon = opt.icon;

        return (
          <label
            key={opt.id}
            className={cn(
              "flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold cursor-pointer select-none has-focus-visible:ring-3 has-focus-visible:ring-ondjo-blue/25 has-focus-visible:border-ondjo-blue",
              isSelected
                ? "ondjo-border-selected bg-ondjo-blue-50/75 text-ondjo-navy font-bold"
                : "ondjo-border-interactive bg-white text-ondjo-ink hover:bg-slate-50/80",
            )}
          >
            <RadioGroupItem value={opt.id} className="sr-only" />
            <span
              aria-hidden="true"
              className={cn(
                "grid size-6.5 shrink-0 place-items-center rounded-lg",
                opt.bgSoftClass,
                opt.colorClass,
              )}
            >
              <Icon size={14} strokeWidth={isSelected ? 2.4 : 2} />
            </span>
            <span className="truncate">{opt.label}</span>
          </label>
        );
      })}
    </RadioGroup>
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
                "focus-ring group flex min-h-11 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold cursor-pointer select-none",
                isSelected
                  ? "ondjo-border-selected bg-ondjo-blue-50/70 text-ondjo-navy font-bold"
                  : "ondjo-border-interactive bg-white text-ondjo-ink hover:bg-slate-50/80",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-6.5 shrink-0 place-items-center rounded-lg transition-transform duration-150 group-hover:scale-105",
                  item.bgSoftClass,
                  item.colorClass,
                )}
              >
                <Icon size={14} strokeWidth={isSelected ? 2.4 : 2.1} />
              </span>
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
        <Button
          type="button"
          variant="link"
          size="xs"
          onClick={() => setExpanded((prev) => !prev)}
          className="px-1 text-ondjo-blue"
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
        </Button>
      )}
    </div>
  );
}
