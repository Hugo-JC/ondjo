import { useState } from "react";
import {
  Zap,
  Droplets,
  ShieldCheck,
  Car,
  Wind,
  Wifi,
  Waves,
  X,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface AmenityItem {
  id: string;
  label: string;
  icon: typeof Zap;
  colorClass: string;
  bgSoftClass: string;
  description: string;
}

export const ESSENTIAL_AMENITIES: AmenityItem[] = [
  {
    id: "gerador",
    label: "Gerador Próprio",
    icon: Zap,
    colorClass: "text-amber-500",
    bgSoftClass: "bg-amber-50",
    description: "Grupo gerador com comutação automática",
  },
  {
    id: "tanque_agua",
    label: "Tanque de Água / Eletrobomba",
    icon: Droplets,
    colorClass: "text-sky-500",
    bgSoftClass: "bg-sky-50",
    description: "Reservatório com sistema de pressurização contínua",
  },
  {
    id: "seguranca",
    label: "Segurança 24h & Guarita",
    icon: ShieldCheck,
    colorClass: "text-emerald-600",
    bgSoftClass: "bg-emerald-50",
    description: "Portaria monitorada, cerca elétrica e controlo de acessos",
  },
  {
    id: "garagem",
    label: "Garagem / Vaga",
    icon: Car,
    colorClass: "text-blue-600",
    bgSoftClass: "bg-blue-50",
    description: "Estacionamento privativo coberto ou demarcado",
  },
  {
    id: "ac",
    label: "Climatização (AC)",
    icon: Wind,
    colorClass: "text-teal-600",
    bgSoftClass: "bg-teal-50",
    description: "Ar condicionado instalado nas áreas principais",
  },
  {
    id: "internet",
    label: "Fibra Ótica / Wi-Fi",
    icon: Wifi,
    colorClass: "text-indigo-600",
    bgSoftClass: "bg-indigo-50",
    description: "Cobertura de internet de alta velocidade",
  },
  {
    id: "piscina",
    label: "Piscina",
    icon: Waves,
    colorClass: "text-cyan-600",
    bgSoftClass: "bg-cyan-50",
    description: "Piscina privativa ou de condomínio fechado",
  },
];

interface LuandaAmenitiesFilterProps {
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
  className?: string;
}

export function LuandaAmenitiesFilter({
  selectedAmenities,
  onChange,
  className = "",
}: LuandaAmenitiesFilterProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const toggleAmenity = (id: string) => {
    if (selectedAmenities.includes(id)) {
      onChange(selectedAmenities.filter((item) => item !== id));
    } else {
      onChange([...selectedAmenities, id]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between gap-2 mb-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ondjo-navy">
            Comodidades em Luanda
          </span>
          {selectedAmenities.length > 0 && (
            <Badge variant="default" size="sm" className="px-2 py-0.5 tabular-nums">
              {selectedAmenities.length}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {selectedAmenities.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={clearAll}
              leftIcon={<X size={13} />}
              className="text-ondjo-blue hover:bg-ondjo-blue-50"
            >
              Limpar
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setModalOpen(true)}
            leftIcon={<SlidersHorizontal size={13} />}
            title="Mais comodidades"
            className="rounded-xl px-2.5"
          >
            <span className="hidden sm:inline">Todas</span>
          </Button>
        </div>
      </div>

      {/* Grelha compacta e responsiva com ícones coloridos e variação de bordas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {ESSENTIAL_AMENITIES.map((amenity) => {
          const Icon = amenity.icon;
          const isSelected = selectedAmenities.includes(amenity.id);

          return (
            <button
              key={amenity.id}
              type="button"
              onClick={() => toggleAmenity(amenity.id)}
              className={cn(
                "focus-ring group flex min-h-11 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold cursor-pointer select-none",
                isSelected
                  ? "ondjo-border-selected bg-ondjo-blue-50/70 text-ondjo-navy font-bold"
                  : "ondjo-border-interactive bg-white text-ondjo-ink hover:bg-slate-50/80",
              )}
              aria-pressed={isSelected}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-6.5 shrink-0 place-items-center rounded-lg transition-transform duration-150 group-hover:scale-105",
                  amenity.bgSoftClass,
                  amenity.colorClass,
                )}
              >
                <Icon size={14} strokeWidth={isSelected ? 2.4 : 2.1} />
              </span>
              <span className="truncate flex-1">{amenity.label}</span>
              {isSelected && (
                <Check
                  size={13}
                  strokeWidth={2.8}
                  className="shrink-0 text-ondjo-blue"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Modal shadcn Dialog com descrição de cada comodidade */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
          <DialogHeader className="px-5 pt-5 pb-3.5 pr-14">
            <DialogTitle className="font-bold text-base text-ondjo-navy">
              Comodidades Essenciais
            </DialogTitle>
            <DialogDescription className="text-xs text-ondjo-muted">
              Critérios fundamentais para o conforto habitacional em Luanda
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <div className="p-5 space-y-2 max-h-[60dvh] overflow-y-auto">
            {ESSENTIAL_AMENITIES.map((amenity) => {
              const Icon = amenity.icon;
              const isSelected = selectedAmenities.includes(amenity.id);

              return (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "focus-ring w-full text-left p-3 rounded-xl flex items-center gap-3 cursor-pointer",
                    isSelected
                      ? "ondjo-border-selected bg-ondjo-blue-50/70"
                      : "ondjo-border-interactive bg-white hover:bg-slate-50/70",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-xl",
                      amenity.bgSoftClass,
                      amenity.colorClass,
                    )}
                  >
                    <Icon size={18} strokeWidth={2.2} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-ondjo-navy">
                      {amenity.label}
                    </p>
                    <p className="text-xs text-ondjo-muted mt-0.5">
                      {amenity.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check
                      size={15}
                      strokeWidth={2.6}
                      className="shrink-0 text-ondjo-blue"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <DialogFooter className="mx-0 mb-0 rounded-b-3xl bg-white px-5 py-3.5 flex-row items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-ondjo-muted hover:text-ondjo-navy"
            >
              Limpar todos
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Aplicar ({selectedAmenities.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
