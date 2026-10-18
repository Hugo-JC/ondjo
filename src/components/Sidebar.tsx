import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CircleHelp,
  Heart,
  Home,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "./Logo";
import { useFavorites } from "../hooks/useFavorites";
import { useHashRoute } from "../hooks/useHashRoute";

interface SidebarProps {
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badgeType?: "favorites" | "messages";
  highlight?: boolean;
}

const PRIMARY_NAV: NavItemConfig[] = [
  {
    id: "home",
    label: "Início",
    href: "#/",
    icon: Home,
  },
  {
    id: "search",
    label: "Pesquisar",
    href: "#/pesquisar",
    icon: Search,
  },
  {
    id: "favorites",
    label: "Favoritos",
    href: "#/favoritos",
    icon: Heart,
    badgeType: "favorites",
  },
  {
    id: "chat",
    label: "Mensagens",
    href: "#/chat",
    icon: MessageSquare,
    badgeType: "messages",
  },
];

const SECONDARY_NAV: NavItemConfig[] = [
  {
    id: "publish",
    label: "Publicar imóvel",
    href: "#/login",
    icon: Plus,
    highlight: true,
  },
  {
    id: "help",
    label: "Ajuda & Dúvidas",
    href: "#/login",
    icon: CircleHelp,
  },
];

export default function Sidebar({
  expanded: controlledExpanded,
  onExpandedChange,
}: SidebarProps = {}) {
  const route = useHashRoute();
  const { favoriteCount } = useFavorites();

  const [internalExpanded, setInternalExpanded] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("ondjo-sidebar-expanded") === "true";
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isTopIconHovered, setIsTopIconHovered] = useState(false);

  const isControlled = controlledExpanded !== undefined;
  const expanded = controlledExpanded ?? internalExpanded;

  function toggleExpanded() {
    const next = !expanded;
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  }

  // Fecha o drawer mobile ao mudar de página
  useEffect(() => {
    setMobileOpen(false);
  }, [route]);

  // Persiste preferência de expandir/recolher
  useEffect(() => {
    if (!isControlled) {
      window.localStorage.setItem("ondjo-sidebar-expanded", String(expanded));
    }
  }, [expanded, isControlled]);

  // Escuta evento customizado e cliques em [data-sidebar-toggle]
  useEffect(() => {
    const handleCustomOpen = () => setMobileOpen(true);
    window.addEventListener("ondjo:open-sidebar", handleCustomOpen);

    const handleButtonClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-sidebar-toggle]");
      if (target) {
        setMobileOpen(true);
      }
    };
    document.addEventListener("click", handleButtonClick);

    return () => {
      window.removeEventListener("ondjo:open-sidebar", handleCustomOpen);
      document.removeEventListener("click", handleButtonClick);
    };
  }, []);

  // Fechar com Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  function isItemActive(href: string) {
    if (href === "#/") return route.page === "home";
    if (href === "#/pesquisar") return route.page === "search";
    if (href === "#/favoritos") return route.page === "favorites";
    if (href === "#/chat") return route.page === "chat";
    return false;
  }

  return (
    <>
      {/* Backdrop Mobile */}
      {mobileOpen && (
        <div
          role="presentation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-50 bg-ondjo-navy/60 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Principal (Vertical Desktop + Drawer Mobile) */}
      <aside
        aria-label="Navegação lateral ONDJO"
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-ondjo-border/80 bg-white/95 backdrop-blur-md shadow-xs",
          "transition-[width,transform] duration-200 ease-out motion-reduce:transition-none",
          expanded ? "lg:w-64" : "lg:w-20",
          "w-72 max-w-[85vw]",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Topo: Logótipo & Ícone de Expandir no Hover (Compacto) ou Fechar (Mobile) */}
        <div
          className={[
            "flex h-16 sm:h-20 shrink-0 items-center border-b border-ondjo-border/60 px-3",
            expanded ? "justify-between px-4" : "justify-center",
          ].join(" ")}
        >
          {expanded ? (
            <div className="flex items-center justify-between w-full">
              <a
                href="#/"
                aria-label="ONDJO — Página Inicial"
                onClick={() => setMobileOpen(false)}
                className="focus-ring flex items-center rounded-xl p-1 transition-transform hover:opacity-90 active:scale-95"
              >
                <Logo variant="full" height={32} decorative />
              </a>

              {/* Botão recolher no desktop */}
              <button
                type="button"
                onClick={toggleExpanded}
                aria-label="Recolher menu lateral"
                                className="focus-ring hidden lg:grid size-8.5 place-items-center rounded-xl text-ondjo-muted hover:bg-slate-100 hover:text-ondjo-ink cursor-pointer transition-colors"
              >
                <PanelLeftClose size={18} aria-hidden="true" />
              </button>
            </div>
          ) : (
            /* Modo Compacto: Marca ONDJO com troca para ícone de expandir no hover */
            <button
              type="button"
              onClick={toggleExpanded}
              onMouseEnter={() => setIsTopIconHovered(true)}
              onMouseLeave={() => setIsTopIconHovered(false)}
              aria-label="Expandir menu lateral"
                            className="focus-ring group relative flex size-12 items-center justify-center rounded-2xl bg-slate-50/80 hover:bg-ondjo-blue-soft/80 border border-slate-200/60 hover:border-ondjo-blue/30 transition-all cursor-pointer shadow-2xs"
            >
              {/* Marca ONDJO (Padrão) */}
              <div
                className={[
                  "absolute inset-0 flex items-center justify-center transition-all duration-200",
                  isTopIconHovered ? "opacity-0 scale-75" : "opacity-100 scale-100",
                ].join(" ")}
              >
                <Logo variant="mark" height={30} decorative />
              </div>

              {/* Ícone de Expandir no Hover */}
              <div
                className={[
                  "absolute inset-0 flex items-center justify-center text-ondjo-blue transition-all duration-200",
                  isTopIconHovered ? "opacity-100 scale-100" : "opacity-0 scale-75",
                ].join(" ")}
              >
                <PanelLeftOpen size={22} strokeWidth={2.4} aria-hidden="true" />
              </div>
            </button>
          )}

          {/* Botão fechar (Mobile apenas) */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
            className="focus-ring grid size-9 place-items-center rounded-xl text-ondjo-muted hover:bg-slate-100 hover:text-ondjo-ink lg:hidden cursor-pointer ml-auto"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Corpo com Itens Verticais */}
        <nav
          aria-label="Menu principal"
          className="flex-1 overflow-y-auto px-2 py-4 scrollbar-none flex flex-col gap-1.5"
        >
          {/* Itens Primários (Início, Pesquisar, Favoritos, Mensagens) */}
          <div className="flex flex-col gap-1.5">
            {PRIMARY_NAV.map((item) => {
              const active = isItemActive(item.href);
              const badgeCount = item.badgeType === "favorites" ? favoriteCount : 0;

              return (
                <SidebarButton
                  key={item.id}
                  item={item}
                  active={active}
                  expanded={expanded}
                  badgeCount={badgeCount}
                  onNavigate={() => setMobileOpen(false)}
                />
              );
            })}
          </div>

          {/* Separador elegante */}
          <div className={expanded ? "my-3 px-2" : "my-2.5 flex justify-center"}>
            <div className={expanded ? "h-px w-full bg-ondjo-border/70" : "h-px w-10 bg-ondjo-border/80"} />
          </div>

          {/* Itens Secundários (Publicar Imóvel, Ajuda) */}
          <div className="flex flex-col gap-1.5">
            {SECONDARY_NAV.map((item) => (
              <SidebarButton
                key={item.id}
                item={item}
                active={isItemActive(item.href)}
                expanded={expanded}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </div>

          {/* Card de Anúncio para Proprietários no modo expandido */}
          {expanded && (
            <div className="mt-auto pt-4 px-1">
              <div className="rounded-2xl border border-ondjo-blue-soft bg-ondjo-blue-50/60 p-3.5">
                <p className="text-xs font-bold text-ondjo-navy">É proprietário ou corretor?</p>
                <p className="mt-1 text-[11px] leading-relaxed text-ondjo-muted">
                  Anuncie o seu imóvel e chegue a milhares de compradores em Angola.
                </p>
                <a
                  href="#/login"
                  onClick={() => setMobileOpen(false)}
                  className="focus-ring mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-ondjo-blue py-2 text-xs font-bold text-white shadow-xs hover:bg-ondjo-blue-dark transition-colors"
                >
                  <Plus size={14} strokeWidth={2.6} />
                  <span>Anunciar agora</span>
                </a>
              </div>
            </div>
          )}
        </nav>

        {/* Rodapé da Sidebar: Perfil de Utilizador & Botão de Expandir/Recolher */}
        <div className="shrink-0 border-t border-ondjo-border/60 p-2 bg-slate-50/50 flex flex-col gap-1.5">
          {/* Link para Conta / Login */}
          <SidebarButton
            item={{
              id: "account",
              label: "Minha conta",
              href: "#/login",
              icon: UserRound,
            }}
            active={route.page === "login" || route.page === "register"}
            expanded={expanded}
            onNavigate={() => setMobileOpen(false)}
          />

          {/* Botão de Alternar Largura (Apenas no Desktop) */}
          <button
            type="button"
            onClick={toggleExpanded}
            aria-label={expanded ? "Recolher menu lateral" : "Expandir menu lateral"}
                        className={[
              "focus-ring hidden lg:flex items-center gap-3 rounded-2xl p-2.5 text-xs font-semibold text-ondjo-muted hover:bg-white hover:text-ondjo-ink hover:shadow-2xs transition-all cursor-pointer",
              expanded ? "justify-start w-full px-3" : "justify-center w-full max-w-14 h-12 mx-auto",
            ].join(" ")}
          >
            {expanded ? (
              <>
                <PanelLeftClose size={18} aria-hidden="true" />
                <span className="truncate">Recolher menu</span>
              </>
            ) : (
              <PanelLeftOpen size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

interface SidebarButtonProps {
  item: NavItemConfig;
  active: boolean;
  expanded: boolean;
  badgeCount?: number;
  onNavigate: () => void;
}

function SidebarButton({
  item,
  active,
  expanded,
  badgeCount = 0,
  onNavigate,
}: SidebarButtonProps) {
  const Icon = item.icon;
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const tooltipId = useId();
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);

  const showTooltip = !expanded && !isDismissed && (isHovered || isFocused);

  // Fecha o tooltip imediatamente ao navegar ou mudar a rota
  useEffect(() => {
    const handleDismiss = () => {
      setIsDismissed(true);
      setIsHovered(false);
      setIsFocused(false);
      anchorRef.current?.blur();
    };

    window.addEventListener("hashchange", handleDismiss);
    window.addEventListener("click", handleDismiss);
    return () => {
      window.removeEventListener("hashchange", handleDismiss);
      window.removeEventListener("click", handleDismiss);
    };
  }, []);

  // Calcula coordenadas do tooltip flutuante
  useEffect(() => {
    if (!showTooltip || !anchorRef.current) {
      setCoords(null);
      return;
    }

    const updateCoords = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCoords({
        left: rect.right + 10,
        top: rect.top + rect.height / 2,
      });
    };

    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [showTooltip]);

  const handleClick = () => {
    setIsDismissed(true);
    setIsHovered(false);
    setIsFocused(false);
    anchorRef.current?.blur();
    onNavigate();
  };

  return (
    <>
      <a
        ref={anchorRef}
        href={item.href}
        onClick={handleClick}
        onMouseEnter={() => {
          setIsDismissed(false);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsDismissed(false);
        }}
        onFocus={() => {
          setIsDismissed(false);
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
        aria-current={active ? "page" : undefined}
        aria-label={!expanded ? item.label : undefined}
        aria-describedby={showTooltip ? tooltipId : undefined}
        className={[
          "group relative flex items-center rounded-2xl select-none focus-ring transition-all cursor-pointer",
          expanded
            ? "min-h-12 w-full gap-3.5 px-3.5 text-sm font-semibold"
            : "w-full max-w-14 h-12.5 justify-center mx-auto",
          active
            ? "bg-ondjo-blue-soft text-ondjo-blue font-bold shadow-2xs"
            : item.highlight
              ? "text-ondjo-ink hover:bg-ondjo-blue-50/70 hover:text-ondjo-blue"
              : "text-ondjo-muted hover:text-ondjo-ink hover:bg-slate-100/90",
        ].join(" ")}
      >
        {/* Ícone com Badge de Contagem */}
        <span className="relative grid place-items-center shrink-0">
          <Icon
            size={21}
            strokeWidth={active ? 2.5 : 2}
            className={[
              "transition-colors",
              active
                ? "text-ondjo-blue"
                : item.highlight
                  ? "text-ondjo-blue group-hover:scale-105 transition-transform"
                  : "text-ondjo-muted group-hover:text-ondjo-ink",
            ].join(" ")}
            aria-hidden="true"
          />

          {/* Badge flutuante no modo compacto */}
          {!expanded && badgeCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-1.5 -right-2 grid min-w-4 h-4 place-items-center rounded-full bg-ondjo-navy px-1 text-[9px] font-black text-white shadow-xs"
            >
              {badgeCount > 9 ? "9+" : badgeCount}
            </span>
          )}
        </span>

        {/* Rótulo de texto no modo expandido */}
        {expanded && (
          <div className="flex flex-1 items-center justify-between min-w-0">
            <span className="truncate">{item.label}</span>
            {badgeCount > 0 && (
              <span className="grid min-w-5 h-5 place-items-center rounded-full bg-ondjo-blue px-1.5 text-[10px] font-black text-white">
                {badgeCount}
              </span>
            )}
          </div>
        )}
      </a>

      {/* Tooltip Limpo: Exibe APENAS o nome da opção e sem bordas pesadas */}
      {showTooltip &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            style={{ left: coords.left, top: coords.top }}
            className="pointer-events-none fixed z-70 -translate-y-1/2 flex items-center animate-in fade-in-50 zoom-in-95 duration-150"
          >
            <div className="rounded-lg bg-ondjo-navy px-2.5 py-1 text-xs font-semibold text-white shadow-lg shadow-ondjo-navy/20 whitespace-nowrap select-none">
              {item.label}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
