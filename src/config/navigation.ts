import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarDays,
  CircleHelp,
  Heart,
  Home,
  LogIn,
  Mail,
  Plus,
  Search,
  Settings2,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  private?: boolean;
  badge?: "favorites";
};

export const mainNavigation: NavigationItem[] = [
  { label: "Início", href: "#/", icon: Home },
  { label: "Pesquisar imóveis", href: "#/pesquisar", icon: Search },
  { label: "Favoritos", href: "#/favoritos", icon: Heart, badge: "favorites" },
  { label: "Mensagens", href: "#/chat", icon: Mail },
  { label: "Agendamentos", href: "#/login", icon: CalendarDays, private: true },
];

export const ownerNavigation: NavigationItem[] = [
  { label: "Meus imóveis", href: "#/login", icon: Building2, private: true },
  { label: "Publicar imóvel", href: "#/login", icon: Plus, private: true },
];

export const secondaryNavigation: NavigationItem[] = [
  { label: "Ajuda", href: "#/login", icon: CircleHelp },
  { label: "Definições", href: "#/login", icon: Settings2, private: true },
];

export const accountNavigation = {
  label: "Entrar / Criar conta",
  href: "#/login",
  icon: LogIn,
};
