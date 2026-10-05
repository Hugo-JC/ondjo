import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Building2, ChevronLeft, Plus, Sparkles, X } from "lucide-react";
import {
  accountNavigation,
  mainNavigation,
  ownerNavigation,
  secondaryNavigation,
  type NavigationItem,
} from "../config/navigation";

interface SidebarProps {
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export default function Sidebar({
  expanded: controlledExpanded,
  onExpandedChange,
}: SidebarProps = {}) {
  const [internalExpanded, setInternalExpanded] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("ondjo-sidebar-expanded") === "true";
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [hash, setHash] = useState(() =>
    typeof window !== "undefined" ? window.location.hash || "#/" : "#/",
  );
  const [favoritesCount, setFavoritesCount] = useState(0);

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
    const button = document.querySelector<HTMLButtonElement>(
      "[data-sidebar-toggle]",
    );
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

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ondjo-navy/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Menu lateral ONDJO"
        data-expanded={expanded}
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-ondjo-border bg-ondjo-surface shadow-sm",
          "transition-[width,transform] duration-200 ease-out motion-reduce:transition-none",
          expanded ? "lg:w-64" : "lg:w-20",
          "w-72 max-w-[85vw]",
          mobileOpen
            ? "translate-x-0 shadow-2xl shadow-ondjo-navy/20"
            : "-translate-x-full lg:translate-x-0",
          "lg:translate-x-0",
        ].join(" ")}
      >
        {/* Topo / Brand Header */}
        <div
          className={[
            "flex min-h-20 shrink-0 border-b border-ondjo-border/80 px-4",
            wide
              ? "items-center justify-between"
              : "flex-col items-center justify-center gap-2 py-3",
          ].join(" ")}
        >
          {wide && (
            <a
              href="#/"
              aria-label="ONDJO — página inicial"
              onClick={() => setMobileOpen(false)}
              className="group flex min-w-0 items-center gap-3 select-none"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ondjo-navy text-white shadow-sm">
                <Building2 size={21} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <div className="min-w-0 overflow-hidden">
                <span className="block text-lg font-black tracking-tight text-ondjo-navy transition-colors group-hover:text-ondjo-blue">
                  ONDJO
                </span>
                <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-ondjo-muted">
                  Encontre o seu lugar
                </span>
              </div>
            </a>
          )}

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
          <button
            type="button"
            aria-label={
              expanded ? "Recolher menu lateral" : "Expandir menu lateral"
            }
            aria-expanded={expanded}
            onClick={() => changeExpanded(!expanded)}
            className="focus-ring hidden size-9 shrink-0 place-items-center rounded-xl border border-ondjo-border bg-ondjo-surface text-ondjo-muted transition-colors hover:bg-ondjo-bg hover:text-ondjo-ink lg:grid"
          >
            <span
              className={`grid place-items-center transition-transform duration-200 motion-reduce:transition-none ${expanded ? "" : "rotate-180"}`}
            >
              <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
            </span>
          </button>
        </div>

        {/* Navegação Principal */}
        <nav
          aria-label="Navegação principal"
          className="scrollbar-subtle flex-1 overflow-y-auto px-3 py-5"
        >
          <NavSectionLabel expanded={wide}>Descobrir</NavSectionLabel>
          <ul className="space-y-1">
            {mainNavigation.map((item) => (
              <li key={item.label}>
                <SidebarItem
                  item={item}
                  expanded={wide}
                  active={isActive(item.href)}
                  badgeCount={
                    item.badge === "favorites" ? favoritesCount : undefined
                  }
                  onNavigate={() => setMobileOpen(false)}
                />
              </li>
            ))}
          </ul>

          <div className="my-5 h-px bg-ondjo-border/80" />

          <NavSectionLabel expanded={wide}>Área pessoal</NavSectionLabel>
          <ul className="space-y-1">
            {ownerNavigation.map((item) => (
              <li key={item.label}>
                <SidebarItem
                  item={item}
                  expanded={wide}
                  active={isActive(item.href)}
                  onNavigate={() => setMobileOpen(false)}
                />
              </li>
            ))}
          </ul>

          <div className="my-5 h-px bg-ondjo-border/80" />

          <ul className="space-y-1">
            {secondaryNavigation.map((item) => (
              <li key={item.label}>
                <SidebarItem
                  item={item}
                  expanded={wide}
                  active={isActive(item.href)}
                  onNavigate={() => setMobileOpen(false)}
                />
              </li>
            ))}
          </ul>

          {wide && (
            <div className="mt-6">
              <div className="relative rounded-2xl border border-ondjo-blue-soft bg-ondjo-blue-soft/35 p-4">
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

                <a
                  href="#/login"
                  onClick={() => setMobileOpen(false)}
                  className="focus-ring mt-3.5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-3 text-sm font-bold text-white transition-colors hover:bg-ondjo-blue-dark active:bg-ondjo-navy"
                >
                  <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
                  Publicar imóvel
                </a>
              </div>
            </div>
          )}
        </nav>

        {/* Rodapé / Perfil & CTA */}
        <div className="shrink-0 border-t border-ondjo-border/80 p-3 bg-ondjo-surface/80 backdrop-blur-xs">
          <a
            href={accountNavigation.href}
            onClick={() => setMobileOpen(false)}
            className={[
              "group focus-ring relative flex min-h-12 items-center gap-3 rounded-xl border border-ondjo-border/80 bg-ondjo-bg px-3",
              "text-sm font-bold text-ondjo-navy transition-all duration-200 hover:border-ondjo-blue-soft hover:bg-ondjo-blue-soft/30 hover:text-ondjo-blue",
              wide ? "" : "justify-center",
            ].join(" ")}
          >
            <accountNavigation.icon
              size={19}
              className="shrink-0 text-ondjo-muted transition-colors group-hover:text-ondjo-blue"
              aria-hidden="true"
            />
            {wide && (
              <span className="min-w-0 flex-1 truncate">
                {accountNavigation.label}
              </span>
            )}
          </a>

          {wide && (
            <p className="mt-2.5 px-1 text-center text-[11px] font-medium text-ondjo-muted/80">
              O seu próximo lar começa aqui.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

function NavSectionLabel({
  expanded,
  children,
}: {
  expanded: boolean;
  children: string;
}) {
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
}: {
  item: NavigationItem;
  expanded: boolean;
  active: boolean;
  badgeCount?: number;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const [isHovered, setIsHovered] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const tooltipId = useId();
  const [tooltipPosition, setTooltipPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  useEffect(() => {
    if (expanded || !isHovered || !anchorRef.current) {
      setTooltipPosition(null);
      return;
    }

    const updatePosition = () => {
      const bounds = anchorRef.current?.getBoundingClientRect();
      if (!bounds) return;
      setTooltipPosition({
        left: bounds.right + 14,
        top: bounds.top + bounds.height / 2,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [expanded, isHovered]);

  return (
    <div className="relative">
      <a
        ref={anchorRef}
        href={item.href}
        onClick={onNavigate}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        aria-current={active ? "page" : undefined}
        aria-label={expanded ? undefined : item.label}
        aria-describedby={tooltipPosition ? tooltipId : undefined}
        className={[
          "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold select-none focus-ring",
          "transition-colors duration-200",
          expanded ? "" : "justify-center",
          active
            ? "text-ondjo-blue font-bold"
            : "text-ondjo-muted hover:text-ondjo-ink",
        ].join(" ")}
      >
        {active && (
          <span
            className="absolute inset-0 rounded-xl border border-ondjo-blue/15 bg-ondjo-blue-soft shadow-xs"
            aria-hidden="true"
          />
        )}

        {active && (
          <span
            aria-hidden="true"
            className="absolute bottom-2.5 left-0 top-2.5 w-[3.5px] rounded-r-full bg-ondjo-blue shadow-xs"
          />
        )}

        <span className="relative z-10 shrink-0 grid place-items-center">
          <Icon
            size={19}
            strokeWidth={active ? 2.3 : 1.9}
            className={
              active
                ? "text-ondjo-blue"
                : "text-ondjo-muted group-hover:text-ondjo-ink transition-colors"
            }
            aria-hidden="true"
          />

          {!expanded && badgeCount !== undefined && badgeCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ondjo-blue px-1 text-[9px] font-black text-white shadow-xs">
              {badgeCount > 9 ? "9+" : badgeCount}
            </span>
          )}
        </span>

        {expanded && (
          <span className="relative z-10 flex min-w-0 flex-1 items-center justify-between gap-2">
            <span className="truncate">{item.label}</span>

            {/* Contador de favoritos no modo expandido */}
            {badgeCount !== undefined && badgeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ondjo-blue/10 px-1.5 text-[11px] font-bold text-ondjo-blue">
                {badgeCount}
              </span>
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

      {tooltipPosition &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            className="pointer-events-none fixed z-[60] -translate-y-1/2 whitespace-nowrap rounded-xl bg-ondjo-navy px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-ondjo-navy/25"
            style={{ left: tooltipPosition.left, top: tooltipPosition.top }}
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
          </div>,
          document.body,
        )}
    </div>
  );
}
