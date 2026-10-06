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
import { AnimatePresence, motion } from "framer-motion";

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
      <div className="flex items-center justify-between gap-2 mb-2 px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-ondjo-terracotta animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-ondjo-ink">
            Comodidades Essenciais em Luanda
          </span>
          {selectedAmenities.length > 0 && (
            <span className="inline-flex items-center justify-center size-5 rounded-full bg-ondjo-terracotta text-white text-[11px] font-bold">
              {selectedAmenities.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {selectedAmenities.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-ondjo-muted hover:text-ondjo-terracotta flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-ondjo-bg transition-colors"
            >
              <X size={13} />
              Limpar
            </button>
          )}

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-xs font-semibold text-ondjo-ink hover:text-ondjo-terracotta flex items-center gap-1 px-2 py-1 rounded-lg border border-ondjo-border/80 bg-white shadow-xs hover:border-ondjo-terracotta/40 transition-colors"
            title="Mais comodidades"
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Todas</span>
          </button>
        </div>
      </div>

      {/* Chips com rolagem suave horizontal no mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none -mx-1 px-1">
        {ESSENTIAL_AMENITIES.map((amenity) => {
          const Icon = amenity.icon;
          const isSelected = selectedAmenities.includes(amenity.id);

          return (
            <button
              key={amenity.id}
              type="button"
              onClick={() => toggleAmenity(amenity.id)}
              className={[
                "group shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 border",
                isSelected
                  ? "bg-ondjo-terracotta/10 border-ondjo-terracotta text-ondjo-terracotta shadow-xs ring-1 ring-ondjo-terracotta/20"
                  : "bg-white/90 border-ondjo-border text-ondjo-ink hover:border-ondjo-border-hover hover:bg-ondjo-bg/60",
              ].join(" ")}
              aria-pressed={isSelected}
            >
              <Icon
                size={14}
                className={
                  isSelected
                    ? "text-ondjo-terracotta"
                    : "text-ondjo-muted group-hover:text-ondjo-ink"
                }
              />
              <span>{amenity.label}</span>
              {isSelected && (
                <span className="grid size-3.5 place-items-center rounded-full bg-ondjo-terracotta text-white text-[9px]">
                  <Check size={9} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal com descrição de cada comodidade */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-2xl border border-ondjo-border bg-white p-5 shadow-2xl z-10"
              role="dialog"
              aria-modal="true"
              aria-label="Comodidades essenciais em Luanda"
            >
              <div className="flex items-center justify-between pb-3 border-b border-ondjo-border/60">
                <div>
                  <h3 className="font-bold text-base text-ondjo-ink">
                    Comodidades Essenciais
                  </h3>
                  <p className="text-xs text-ondjo-muted">
                    Critérios fundamentais para o conforto habitacional em Luanda
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-1.5 text-ondjo-muted hover:bg-ondjo-bg hover:text-ondjo-ink"
                  aria-label="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {ESSENTIAL_AMENITIES.map((amenity) => {
                  const Icon = amenity.icon;
                  const isSelected = selectedAmenities.includes(amenity.id);

                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={[
                        "w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3",
                        isSelected
                          ? "border-ondjo-terracotta bg-ondjo-terracotta/5 shadow-xs"
                          : "border-ondjo-border hover:border-ondjo-border-hover bg-white",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "grid size-9 shrink-0 place-items-center rounded-lg mt-0.5",
                          isSelected
                            ? "bg-ondjo-terracotta text-white"
                            : "bg-ondjo-bg text-ondjo-muted",
                        ].join(" ")}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-ondjo-ink">
                            {amenity.label}
                          </p>
                          {isSelected && (
                            <span className="text-[11px] font-bold text-ondjo-terracotta flex items-center gap-1">
                              <Check size={12} strokeWidth={3} /> Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ondjo-muted mt-0.5">
                          {amenity.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-ondjo-border/60">
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-semibold text-ondjo-muted hover:text-ondjo-terracotta px-3 py-2"
                >
                  Limpar todos
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl bg-ondjo-terracotta text-white font-semibold text-xs px-5 py-2.5 shadow-sm hover:opacity-95"
                >
                  Aplicar ({selectedAmenities.length} selecionadas)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
