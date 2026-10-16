import {
  Wind,
  Droplets,
  UtensilsCrossed,
  ShieldCheck,
  Car,
  Waves,
  Wifi,
  Maximize2,
  Armchair,
  ArrowUpDown,
  Dumbbell,
  Trees,
  type LucideIcon,
} from "lucide-react";

export type AmenityId =
  | "ar_condicionado"
  | "tanque_agua"
  | "cozinha_equipada"
  | "seguranca_24h"
  | "garagem"
  | "piscina"
  | "wifi"
  | "varanda"
  | "mobilado"
  | "elevador"
  | "ginasio"
  | "quintal";

export interface AmenityDefinition {
  id: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  colorClass: string;
  bgSoftClass: string;
  keywords: string[];
}

export const AMENITY_OPTIONS: AmenityDefinition[] = [
  {
    id: "Ar-condicionado",
    label: "Ar-condicionado",
    shortLabel: "Ar condicionado",
    icon: Wind,
    colorClass: "text-teal-600",
    bgSoftClass: "bg-teal-50",
    keywords: ["ar condicionado", "ac", "climatizado", "ar-condicionado"],
  },
  {
    id: "Tanque de água",
    label: "Tanque de água",
    shortLabel: "Tanque d'água",
    icon: Droplets,
    colorClass: "text-sky-500",
    bgSoftClass: "bg-sky-50",
    keywords: [
      "tanque de água",
      "tanque",
      "reservatório",
      "depósito",
      "eletrobomba",
    ],
  },
  {
    id: "Cozinha equipada",
    label: "Cozinha equipada",
    shortLabel: "Cozinha",
    icon: UtensilsCrossed,
    colorClass: "text-orange-500",
    bgSoftClass: "bg-orange-50",
    keywords: ["cozinha equipada", "cozinha", "fogão", "forno", "frigorífico"],
  },
  {
    id: "Segurança 24h",
    label: "Segurança 24h",
    shortLabel: "Segurança 24h",
    icon: ShieldCheck,
    colorClass: "text-emerald-600",
    bgSoftClass: "bg-emerald-50",
    keywords: ["segurança 24h", "segurança", "vigilância", "guarda", "cctv"],
  },
  {
    id: "Garagem",
    label: "Garagem / Vaga",
    shortLabel: "Garagem",
    icon: Car,
    colorClass: "text-blue-600",
    bgSoftClass: "bg-blue-50",
    keywords: ["garagem", "vaga", "estacionamento", "parqueamento"],
  },
  {
    id: "Piscina",
    label: "Piscina",
    shortLabel: "Piscina",
    icon: Waves,
    colorClass: "text-cyan-600",
    bgSoftClass: "bg-cyan-50",
    keywords: ["piscina"],
  },
  {
    id: "Wi-Fi",
    label: "Wi-Fi / Internet",
    shortLabel: "Wi-Fi",
    icon: Wifi,
    colorClass: "text-indigo-600",
    bgSoftClass: "bg-indigo-50",
    keywords: ["wi-fi", "wifi", "internet", "fibra"],
  },
  {
    id: "Varanda",
    label: "Varanda / Terraço",
    shortLabel: "Varanda",
    icon: Maximize2,
    colorClass: "text-rose-500",
    bgSoftClass: "bg-rose-50",
    keywords: ["varanda", "terraço", "balcão"],
  },
  {
    id: "Mobiliado",
    label: "Mobilado",
    shortLabel: "Mobilado",
    icon: Armchair,
    colorClass: "text-amber-700",
    bgSoftClass: "bg-amber-50",
    keywords: ["mobilado", "mobiliado", "mobília"],
  },
  {
    id: "Elevador",
    label: "Elevador",
    shortLabel: "Elevador",
    icon: ArrowUpDown,
    colorClass: "text-slate-600",
    bgSoftClass: "bg-slate-100",
    keywords: ["elevador"],
  },
  {
    id: "Ginásio",
    label: "Ginásio",
    shortLabel: "Ginásio",
    icon: Dumbbell,
    colorClass: "text-red-500",
    bgSoftClass: "bg-red-50",
    keywords: ["ginásio", "fitness", "academia"],
  },
  {
    id: "Quintal",
    label: "Quintal / Jardim",
    shortLabel: "Quintal",
    icon: Trees,
    colorClass: "text-emerald-600",
    bgSoftClass: "bg-emerald-50",
    keywords: ["quintal", "jardim", "espaço exterior"],
  },
];
