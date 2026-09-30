import { useEffect, useState, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Building2, CalendarDays, ChevronLeft, ChevronRight, CircleHelp,
  Heart, Home, Search, LogIn, Mail, Plus, Settings2, X, Sparkles,
  type LucideIcon,
} from "lucide-react";

type Item = {
  label: string;
  href: string;
  icon: LucideIcon;
  private?: boolean;
  badge?: "favorites";
};

const mainItems: Item[] = [
  { label: "Início", href: "#/", icon: Home },
  { label: "Pesquisar imóveis", href: "#/pesquisar", icon: Search },
  { label: "Favoritos", href: "#/favoritos", icon: Heart, badge: "favorites" },
  { label: "Mensagens", href: "#/login", icon: Mail, private: true },
  { label: "Agendamentos", href: "#/login", icon: CalendarDays, private: true },
];

const ownerItems: Item[] = [
  { label: "Meus imóveis", href: "#/login", icon: Building2, private: true },
  { label: "Publicar imóvel", href: "#/login", icon: Plus, private: true },
];

interface SidebarProps {
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export default function Sidebar({ expanded: controlledExpanded, onExpandedChange }: SidebarProps = {}) {
  const [internalExpanded, setInternalExpanded] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("ondjo-sidebar-expanded") === "true";
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [hash, setHash] = useState(() => (typeof window !== "undefined" ? window.location.hash || "#/" : "#/"));
  const [favoritesCount, setFavoritesCount] = useState(0);

  const shouldReduceMotion = useReducedMotion();
  const isControlled = controlledExpanded !== undefined;
  const expanded = controlledExpanded ?? internalExpanded;
  const wide = expanded || mobileOpen;

  // Sincronizar contagem de favoritos
  useEffect(() => {
    const updateFavs = () => {
      try {
        const raw = window.localStorage.getItem("ondjo-favorites");
        if (raw) {
          const parsed = JSON.parse(raw);
          setFavoritesCount(Array.isArray(parsed) ? parsed.length : 0);
        } else {
          setFavoritesCount(0);
        }
      } catch {
        setFavoritesCount(0);
      }
    };

    updateFavs();
    window.addEventListener("storage", updateFavs);
    window.addEventListener("favorites-updated", updateFavs);
    return () => {
      window.removeEventListener("storage", updateFavs);
      window.removeEventListener("favorites-updated", updateFavs);
    };
  }, []);

  function changeExpanded(next: boolean) {
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  }

  useEffect(() => {
    const updateHash = () => {
      setHash(window.location.hash || "#/");
      setMobileOpen(false);
    };
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  useEffect(() => {
    if (!isControlled) {
      window.localStorage.setItem("ondjo-sidebar-expanded", String(expanded));
    }
  }, [expanded, isControlled]);

  useEffect(() => {
    const button = document.querySelector<HTMLButtonElement>("[data-sidebar-toggle]");
    if (!button) return;
    const openMenu = () => setMobileOpen(true);
    button.addEventListener("click", openMenu);
    return () => button.removeEventListener("click", openMenu);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  function isActive(href: string) {
    const currentPath = hash.split("?")[0];
    return href === "#/" ? currentPath === "#/" : currentPath === href;
  }

  // Transições spring
  const springTransition = shouldReduceMotion
    ? { duration: 0.1 }
    : { type: "spring", stiffness: 320, damping: 32 };

  return (
    <>
      {/* Backdrop Mobile com fade + blur */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-ondjo-navy/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        aria-label="Menu lateral ONDJO"
        data-expanded={expanded}
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-ondjo-border bg-ondjo-surface shadow-xs",
          "transition-[width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
          expanded ? "lg:w-64" : "lg:w-20",
          "w-72 max-w-[85vw]",
          mobileOpen
            ? "translate-x-0 shadow-2xl shadow-ondjo-navy/20"
            : "-translate-x-full lg:translate-x-0",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:transition-none",
        ].join(" ")}
      >
        {/* Topo / Brand Header */}
        <div
          className={[
            "flex min-h-20 shrink-0 border-b border-ondjo-border/80 px-4",
            wide ? "items-center justify-between" : "flex-col items-center justify-center gap-2 py-3",
          ].join(" ")}
        >
          <a
            href="#/"
            aria-label="ONDJO — página inicial"
            onClick={() => setMobileOpen(false)}
            className="group flex min-w-0 items-center gap-3 select-none"
          >
            <motion.span
              whileHover={shouldReduceMotion ? undefined : { scale: 1.06, rotate: -2 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-ondjo-navy to-ondjo-ink text-white shadow-sm ring-1 ring-white/10"
            >
              <Building2 size={21} strokeWidth={2.2} aria-hidden="true" />
            </motion.span>

            <AnimatePresence initial={false}>
              {wide && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="min-w-0 overflow-hidden"
                >
                  <span className="block text-lg font-black tracking-tight text-ondjo-navy group-hover:text-ondjo-blue transition-colors">
                    ONDJO
                  </span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ondjo-muted truncate">
                    Encontre o seu lugar
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </a>

          {/* Botão fechar mobile */}
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
            className="focus-ring grid size-9 place-items-center rounded-xl text-ondjo-muted transition-colors hover:bg-ondjo-bg hover:text-ondjo-ink lg:hidden"
          >
            <X size={19} aria-hidden="true" />
          </button>

          {/* Botão alternar expandido (desktop) com animação suave */}
          <motion.button
            type="button"
            aria-label={expanded ? "Recolher menu lateral" : "Expandir menu lateral"}
            aria-expanded={expanded}
            onClick={() => changeExpanded(!expanded)}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
            className="focus-ring hidden size-8 shrink-0 place-items-center rounded-xl border border-ondjo-border/80 bg-ondjo-surface text-ondjo-muted transition-colors hover:bg-ondjo-bg hover:text-ondjo-ink lg:grid shadow-xs"
          >
            <motion.span
              animate={{ rotate: expanded ? 0 : 180 }}
              transition={springTransition}
              className="grid place-items-center"
            >
              <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
            </motion.span>
          </motion.button>
        </div>

        {/* Navegação Principal */}
        <nav aria-label="Navegação principal" className="scrollbar-subtle flex-1 overflow-y-auto px-3 py-5">
          <NavSectionLabel expanded={wide}>Descobrir</NavSectionLabel>
          <ul className="space-y-1">
            {mainItems.map((item) => (
              <li key={item.label}>
                <SidebarItem
                  item={item}
                  expanded={wide}
                  active={isActive(item.href)}
                  badgeCount={item.badge === "favorites" ? favoritesCount : undefined}
                  onNavigate={() => setMobileOpen(false)}
                  shouldReduceMotion={!!shouldReduceMotion}
                />
              </li>
            ))}
          </ul>

          <div className="my-5 h-px bg-ondjo-border/80" />

          <NavSectionLabel expanded={wide}>Área pessoal</NavSectionLabel>
          <ul className="space-y-1">
            {ownerItems.map((item) => (
              <li key={item.label}>
                <SidebarItem
                  item={item}
                  expanded={wide}
                  active={isActive(item.href)}
                  onNavigate={() => setMobileOpen(false)}
                  shouldReduceMotion={!!shouldReduceMotion}
                />
              </li>
            ))}
          </ul>

          <div className="my-5 h-px bg-ondjo-border/80" />

          <ul className="space-y-1">
            <li>
              <SidebarItem
                item={{ label: "Ajuda", href: "#/", icon: CircleHelp }}
                expanded={wide}
                active={false}
                onNavigate={() => setMobileOpen(false)}
                shouldReduceMotion={!!shouldReduceMotion}
              />
            </li>
            <li>
              <SidebarItem
                item={{ label: "Definições", href: "#/login", icon: Settings2, private: true }}
                expanded={wide}
                active={false}
                onNavigate={() => setMobileOpen(false)}
                shouldReduceMotion={!!shouldReduceMotion}
              />
            </li>
          </ul>

          {/* Card Proativo / Anúncio com expansão animada */}
          <AnimatePresence initial={false}>
            {wide && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={springTransition}
                className="overflow-hidden"
              >
                <div className="relative rounded-2xl border border-ondjo-blue-soft bg-gradient-to-b from-ondjo-blue-soft/40 to-ondjo-bg p-4 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-ondjo-blue text-white shadow-xs">
                      <Sparkles size={15} aria-hidden="true" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-ondjo-blue">
                      Proprietários
                    </span>
                  </div>

                  <p className="mt-2.5 text-sm font-bold text-ondjo-navy">
                    Tem um imóvel?
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ondjo-muted">
                    Anuncie no ONDJO e alcance milhares de compradores em Angola.
                  </p>

                  <motion.a
                    href="#/login"
                    onClick={() => setMobileOpen(false)}
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.02, y: -1 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                    className="focus-ring mt-3.5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-3 text-sm font-bold text-white shadow-xs transition-colors hover:bg-ondjo-blue-dark active:bg-ondjo-navy"
                  >
                    <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
                    Publicar imóvel
                  </motion.a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Rodapé / Perfil & CTA */}
        <div className="shrink-0 border-t border-ondjo-border/80 p-3 bg-ondjo-surface/80 backdrop-blur-xs">
          <motion.a
            href="#/login"
            onClick={() => setMobileOpen(false)}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            className={[
              "group focus-ring relative flex min-h-12 items-center gap-3 rounded-xl border border-ondjo-border/80 bg-ondjo-bg px-3",
              "text-sm font-bold text-ondjo-navy transition-all duration-200 hover:border-ondjo-blue-soft hover:bg-ondjo-blue-soft/30 hover:text-ondjo-blue",
              wide ? "" : "justify-center",
            ].join(" ")}
          >
            <LogIn
              size={19}
              className="shrink-0 text-ondjo-muted transition-colors group-hover:text-ondjo-blue"
              aria-hidden="true"
            />
            {wide && (
              <span className="min-w-0 flex-1 truncate">
                Entrar / Criar conta
              </span>
            )}
          </motion.a>

          {wide && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-2.5 px-1 text-center text-[11px] font-medium text-ondjo-muted/80"
            >
              O seu próximo lar começa aqui.
            </motion.p>
          )}
        </div>
      </aside>
    </>
  );
}

function NavSectionLabel({ expanded, children }: { expanded: boolean; children: string }) {
  return (
    <p
      className={[
        "mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ondjo-muted/90 select-none",
        expanded ? "" : "sr-only",
      ].join(" ")}
    >
      {children}
    </p>
  );
}

function SidebarItem({
  item,
  expanded,
  active,
  badgeCount,
  onNavigate,
  shouldReduceMotion,
}: {
  item: Item;
  expanded: boolean;
  active: boolean;
  badgeCount?: number;
  onNavigate: () => void;
  shouldReduceMotion: boolean;
}) {
  const Icon = item.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <a
        href={item.href}
        onClick={onNavigate}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        aria-current={active ? "page" : undefined}
        className={[
          "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold select-none focus-ring",
          "transition-colors duration-200",
          expanded ? "" : "justify-center",
          active ? "text-ondjo-blue font-bold" : "text-ondjo-muted hover:text-ondjo-ink",
        ].join(" ")}
      >
        {/* Fundo magnético animado compartilhado (layoutId) quando ativo */}
        {active && (
          <motion.div
            layoutId="activeSidebarIndicator"
            transition={shouldReduceMotion ? { duration: 0.1 } : { type: "spring", stiffness: 380, damping: 30 }}
            className="absolute inset-0 rounded-xl bg-ondjo-blue-soft border border-ondjo-blue/15 shadow-xs"
            aria-hidden="true"
          />
        )}

        {/* Barrinha lateral esquerda de destaque */}
        {active && (
          <motion.span
            layoutId="activeSidebarPill"
            transition={shouldReduceMotion ? { duration: 0.1 } : { type: "spring", stiffness: 400, damping: 32 }}
            aria-hidden="true"
            className="absolute bottom-2.5 left-0 top-2.5 w-[3.5px] rounded-r-full bg-ondjo-blue shadow-xs"
          />
        )}

        {/* Ícone com micro-interação */}
        <motion.div
          animate={active ? { scale: 1.05 } : { scale: 1 }}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.15, rotate: active ? 0 : -4 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          className="relative z-10 shrink-0 grid place-items-center"
        >
          <Icon
            size={19}
            strokeWidth={active ? 2.3 : 1.9}
            className={active ? "text-ondjo-blue" : "text-ondjo-muted group-hover:text-ondjo-ink transition-colors"}
            aria-hidden="true"
          />

          {/* Badge de favoritos no modo recolhido */}
          {!expanded && badgeCount !== undefined && badgeCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ondjo-blue px-1 text-[9px] font-black text-white shadow-xs"
            >
              {badgeCount > 9 ? "9+" : badgeCount}
            </motion.span>
          )}
        </motion.div>

        {/* Label com animação e badge */}
        {expanded && (
          <span className="relative z-10 flex min-w-0 flex-1 items-center justify-between gap-2">
            <span className="truncate">{item.label}</span>

            {/* Contador de favoritos no modo expandido */}
            {badgeCount !== undefined && badgeCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ondjo-blue/10 px-1.5 text-[11px] font-bold text-ondjo-blue"
              >
                {badgeCount}
              </motion.span>
            )}

            {/* Tag de secção restrita */}
            {item.private && (
              <span className="rounded-md border border-ondjo-border/60 bg-ondjo-bg px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ondjo-muted group-hover:border-ondjo-border group-hover:text-ondjo-ink transition-colors">
                Conta
              </span>
            )}
          </span>
        )}
      </a>

      {/* Tooltip flutuante elegante quando recolhido (Desktop) */}
      <AnimatePresence>
        {!expanded && isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="pointer-events-none absolute left-full top-1/2 z-50 ml-3.5 -translate-y-1/2 whitespace-nowrap rounded-xl bg-ondjo-navy px-3 py-1.5 text-xs font-semibold text-white shadow-xl shadow-ondjo-navy/25"
          >
            <div className="flex items-center gap-2">
              <span>{item.label}</span>
              {badgeCount !== undefined && badgeCount > 0 && (
                <span className="rounded-full bg-ondjo-blue px-1.5 py-0.2 text-[10px] font-black text-white">
                  {badgeCount}
                </span>
              )}
            </div>

            {/* Pequena setinha apontando para o ícone */}
            <span
              className="absolute right-full top-1/2 -mr-[1px] -translate-y-1/2 border-4 border-transparent border-r-ondjo-navy"
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
