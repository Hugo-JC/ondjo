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
import { AnimatePresence, m } from "framer-motion";

export interface AmenityItem {
  id: string;
  label: string;
  icon: typeof Zap;
  description: string;
}

export const ESSENTIAL_AMENITIES: AmenityItem[] = [
  {
    id: "gerador",
    label: "Gerador Próprio",
    icon: Zap,
    description: "Grupo gerador com comutação automática",
  },
  {
    id: "tanque_agua",
    label: "Tanque de Água / Eletrobomba",
    icon: Droplets,
    description: "Reservatório com sistema de pressurização contínua",
  },
  {
    id: "seguranca",
    label: "Segurança 24h & Guarita",
    icon: ShieldCheck,
    description: "Portaria monitorada, cerca elétrica e controlo de acessos",
  },
  {
    id: "garagem",
    label: "Garagem / Vaga",
    icon: Car,
    description: "Estacionamento privativo coberto ou demarcado",
  },
  {
    id: "ac",
    label: "Climatização (AC)",
    icon: Wind,
    description: "Ar condicionado instalado nas áreas principais",
  },
  {
    id: "internet",
    label: "Fibra Ótica / Wi-Fi",
    icon: Wifi,
    description: "Cobertura de internet de alta velocidade",
  },
  {
    id: "piscina",
    label: "Piscina",
    icon: Waves,
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
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ondjo-navy">
            Comodidades em Luanda
          </span>
          {selectedAmenities.length > 0 && (
            <span className="inline-flex items-center justify-center size-5 rounded-full bg-ondjo-blue text-white text-[11px] font-bold tabular-nums">
              {selectedAmenities.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {selectedAmenities.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="focus-ring text-xs font-semibold text-ondjo-blue hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
            >
              <X size={13} />
              Limpar
            </button>
          )}

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="focus-ring text-xs font-semibold text-ondjo-ink hover:text-ondjo-blue flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-ondjo-border bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            title="Mais comodidades"
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Todas</span>
          </button>
        </div>
      </div>

      {/* Grelha compacta e responsiva no mobile e desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {ESSENTIAL_AMENITIES.map((amenity) => {
          const Icon = amenity.icon;
          const isSelected = selectedAmenities.includes(amenity.id);

          return (
            <button
              key={amenity.id}
              type="button"
              onClick={() => toggleAmenity(amenity.id)}
              className={[
                "focus-ring group flex min-h-10.5 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors duration-150 cursor-pointer select-none",
                isSelected
                  ? "border-ondjo-blue bg-ondjo-blue-50 text-ondjo-navy font-bold ring-1 ring-ondjo-blue/20"
                  : "border-ondjo-border bg-white text-ondjo-ink hover:border-slate-300 hover:bg-slate-50/80",
              ].join(" ")}
              aria-pressed={isSelected}
            >
              <Icon
                size={15}
                strokeWidth={isSelected ? 2.3 : 1.9}
                className={
                  isSelected
                    ? "shrink-0 text-ondjo-blue"
                    : "shrink-0 text-slate-400 group-hover:text-ondjo-ink"
                }
              />
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

      {/* Modal com descrição de cada comodidade */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-100 grid place-items-center p-4">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/55"
            />
            <m.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="relative w-full max-w-md rounded-3xl border border-ondjo-border bg-white p-5 shadow-2xl z-10"
              role="dialog"
              aria-modal="true"
              aria-label="Comodidades essenciais em Luanda"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-ondjo-navy">
                    Comodidades Essenciais
                  </h3>
                  <p className="text-xs text-ondjo-muted">
                    Critérios fundamentais para o conforto habitacional em Luanda
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="focus-ring grid size-9 place-items-center rounded-full bg-slate-100 text-ondjo-ink hover:bg-slate-200 transition-colors cursor-pointer"
                  aria-label="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-2 max-h-[60dvh] overflow-y-auto pr-1">
                {ESSENTIAL_AMENITIES.map((amenity) => {
                  const Icon = amenity.icon;
                  const isSelected = selectedAmenities.includes(amenity.id);

                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={[
                        "focus-ring w-full text-left p-3 rounded-xl border transition-colors duration-150 flex items-center gap-3 cursor-pointer",
                        isSelected
                          ? "border-ondjo-blue bg-ondjo-blue-50 ring-1 ring-ondjo-blue/20"
                          : "border-ondjo-border hover:border-slate-300 bg-white hover:bg-slate-50/70",
                      ].join(" ")}
                    >
                      <Icon
                        size={18}
                        className={
                          isSelected
                            ? "shrink-0 text-ondjo-blue"
                            : "shrink-0 text-slate-400"
                        }
                      />
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

              <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={clearAll}
                  className="focus-ring text-xs font-bold text-ondjo-muted hover:text-ondjo-navy px-3 py-2 cursor-pointer"
                >
                  Limpar todos
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="focus-ring rounded-xl bg-ondjo-blue text-white font-bold text-xs px-5 py-2.5 shadow-sm hover:bg-ondjo-blue-dark transition-colors cursor-pointer"
                >
                  Aplicar ({selectedAmenities.length})
                </button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
