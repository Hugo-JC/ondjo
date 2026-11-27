import { m, useReducedMotion } from "framer-motion";
import {
  Heart,
  Home,
  MessageSquare,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useHashRoute } from "../hooks/useHashRoute";
import { useFavorites } from "../hooks/useFavorites";
import { cn } from "@/lib/utils";

interface MobileNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: "favorites";
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { id: "home", label: "Explorar", href: "#/", icon: Home },
  { id: "search", label: "Pesquisar", href: "#/pesquisar", icon: Search },
  {
    id: "favorites",
    label: "Favoritos",
    href: "#/favoritos",
    icon: Heart,
    badge: "favorites",
  },
  { id: "chat", label: "Mensagens", href: "#/chat", icon: MessageSquare },
  { id: "login", label: "Entrar", href: "#/login", icon: UserRound },
];

export function MobileBottomNav() {
  const route = useHashRoute();
  const { favoriteCount } = useFavorites();
  const reduceMotion = useReducedMotion();

  // No detalhe individual do imóvel, a página possui a sua própria barra de ação fixa.
  if (route.page === "property") {
    return null;
  }

  function isItemActive(id: string) {
    if (id === "home") return route.page === "home";
    if (id === "search") return route.page === "search";
    if (id === "favorites") return route.page === "favorites";
    if (id === "chat") return route.page === "chat";
    if (id === "login") {
      return route.page === "login" || route.page === "register";
    }
    return false;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(0.625rem+env(safe-area-inset-bottom,0px))] z-40 flex justify-center px-3.5 lg:hidden">
      <m.nav
        aria-label="Navegação móvel principal"
        initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 380, damping: 32, mass: 0.85 }
        }
        className="pointer-events-auto grid w-full max-w-[356px] grid-cols-5 items-center gap-1 rounded-full border border-ondjo-border-strong bg-white p-1.5 shadow-[0_8px_28px_rgba(16,42,67,0.14)]"
      >
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.id);
          const showFavBadge = item.badge === "favorites" && favoriteCount > 0;

          return (
            <a
              key={item.id}
              href={item.href}
              title={item.label}
              aria-current={active ? "page" : undefined}
              aria-label={
                showFavBadge
                  ? `${item.label}, ${favoriteCount} guardados`
                  : item.label
              }
              className={cn(
                "focus-ring group relative flex h-11 w-full items-center justify-center rounded-full select-none cursor-pointer",
                "transition-[color,transform,background-color] duration-150 ease-out active:scale-92",
                active
                  ? "text-white"
                  : "text-ondjo-ink/75 hover:bg-slate-100 hover:text-ondjo-navy",
              )}
            >
              {active && (
                <m.span
                  layoutId="mobile-floating-nav-pill"
                  aria-hidden="true"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 460,
                          damping: 34,
                          mass: 0.78,
                        }
                  }
                  className="absolute inset-0 rounded-full bg-ondjo-navy shadow-xs"
                />
              )}

              <span className="relative z-10 inline-flex items-center justify-center">
                <Icon
                  size={20}
                  strokeWidth={active ? 2.3 : 1.9}
                  className={cn(
                    "transition-transform duration-150 ease-out",
                    active ? "scale-105" : "group-hover:scale-105",
                    item.id === "favorites" && active && "fill-white/25",
                  )}
                  aria-hidden="true"
                />
                {showFavBadge && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none tabular-nums ring-2 transition-colors duration-150",
                      active
                        ? "bg-ondjo-blue text-white ring-ondjo-navy"
                        : "bg-ondjo-blue text-white ring-white",
                    )}
                  >
                    {favoriteCount > 9 ? "9+" : favoriteCount}
                  </span>
                )}
              </span>

              <span className="sr-only">{item.label}</span>
            </a>
          );
        })}
      </m.nav>
    </div>
  );
}
