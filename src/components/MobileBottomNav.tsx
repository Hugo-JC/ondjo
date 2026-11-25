import { AnimatePresence, LayoutGroup, m } from "framer-motion";
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
import { cn } from "../utils/cn";

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

const PILL_SPRING = {
  type: "spring" as const,
  stiffness: 440,
  damping: 32,
  mass: 0.68,
};

const INDICATOR_SPRING = {
  type: "spring" as const,
  stiffness: 500,
  damping: 34,
  mass: 0.6,
};

export function MobileBottomNav() {
  const route = useHashRoute();
  const { favoriteCount } = useFavorites();

  // No detalhe individual do imóvel, a página possui a sua própria barra de ação fixa
  // (preço, favorito e contacto do corretor). Ocultamos o menu inferior global para evitar sobreposição.
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
    <m.nav
      aria-label="Navegação móvel principal"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+0.625rem)] inset-x-3 mx-auto w-[min(calc(100%-1.5rem),21.5rem)] sm:w-[23.5rem] md:w-[25rem] z-40 lg:hidden rounded-full border border-slate-200/90 bg-white/88 backdrop-blur-2xl backdrop-saturate-180 p-1.5 sm:p-2 shadow-[0_14px_34px_-6px_rgba(16,42,67,0.22),0_3px_10px_rgba(16,42,67,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]"
    >
      <LayoutGroup id="ondjo-mobile-bottom-nav">
        <div className="grid grid-cols-5 items-center gap-1 sm:gap-1.5">
          {MOBILE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.id);
            const showFavBadge = item.badge === "favorites" && favoriteCount > 0;

            return (
              <m.a
                key={item.id}
                href={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.88 }}
                transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                aria-current={active ? "page" : undefined}
                aria-label={
                  showFavBadge
                    ? `${item.label}, ${favoriteCount} guardados`
                    : item.label
                }
                title={item.label}
                className={cn(
                  "focus-ring relative flex items-center justify-center h-12 sm:h-13 rounded-full select-none transition-colors duration-150",
                  active
                    ? "text-ondjo-blue"
                    : "text-slate-500 hover:text-ondjo-navy",
                )}
              >
                {active && (
                  <m.span
                    layoutId="ondjo-apple-nav-pill"
                    aria-hidden="true"
                    transition={PILL_SPRING}
                    className="absolute inset-0 rounded-full bg-gradient-to-b from-ondjo-blue-50 to-ondjo-blue-soft/80 ring-1 ring-ondjo-blue/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_3px_10px_rgba(23,78,166,0.16)]"
                  />
                )}

                <m.span
                  key={`${item.id}-${route.page}`}
                  initial={{ opacity: 0.5, scale: 0.92 }}
                  animate={{
                    opacity: 1,
                    scale: active ? 1.08 : 1,
                    y: active ? -1 : 0,
                  }}
                  transition={{
                    opacity: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                    scale: { type: "spring", stiffness: 520, damping: 28 },
                    y: { type: "spring", stiffness: 520, damping: 28 },
                  }}
                  className="relative z-10 flex items-center justify-center"
                >
                  <span className="relative inline-flex items-center justify-center">
                    <Icon
                      size={22}
                      strokeWidth={active ? 2.4 : 1.9}
                      className={cn(
                        "transition-colors duration-150",
                        item.id === "favorites" && active && "fill-ondjo-blue/18",
                      )}
                      aria-hidden="true"
                    />
                    <AnimatePresence initial={false}>
                      {showFavBadge && (
                        <m.span
                          key="fav-count"
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.4, opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 560,
                            damping: 26,
                          }}
                          aria-hidden="true"
                          className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-ondjo-navy text-white text-[9px] font-bold tabular-nums flex items-center justify-center leading-none shadow-xs ring-1.5 ring-white"
                        >
                          {favoriteCount > 9 ? "9+" : favoriteCount}
                        </m.span>
                      )}
                    </AnimatePresence>
                  </span>
                </m.span>

                {active && (
                  <m.span
                    layoutId="ondjo-apple-nav-bar"
                    aria-hidden="true"
                    transition={INDICATOR_SPRING}
                    className="absolute bottom-1.5 inset-x-0 mx-auto h-[2.5px] w-4 rounded-full bg-ondjo-blue"
                  />
                )}
              </m.a>
            );
          })}
        </div>
      </LayoutGroup>
    </m.nav>
  );
}
