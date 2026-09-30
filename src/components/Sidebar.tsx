import { useEffect, useState } from "react";
import {
  Building2, CalendarDays, ChevronLeft, ChevronRight, CircleHelp,
  Heart, Home, Search, LogIn, Mail, Plus, Settings2, X,
  type LucideIcon,
} from "lucide-react";

type Item = { label: string; href: string; icon: LucideIcon; private?: boolean };

const mainItems: Item[] = [
  { label: "Início", href: "#/", icon: Home },
  { label: "Pesquisar imóveis", href: "#/pesquisar", icon: Search },
  { label: "Favoritos", href: "#/login", icon: Heart, private: true },
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

export default function Sidebar({
  expanded: controlledExpanded,
  onExpandedChange,
}: SidebarProps = {}) {
  const [internalExpanded, setInternalExpanded] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem("ondjo-sidebar-expanded") === "true",
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hash, setHash] = useState(
    () => typeof window !== "undefined" ? window.location.hash || "#/" : "#/",
  );
  const isControlled = controlledExpanded !== undefined;
  const expanded = controlledExpanded ?? internalExpanded;
  const wide = expanded || mobileOpen;

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
    if (!isControlled) window.localStorage.setItem("ondjo-sidebar-expanded", String(expanded));
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

  return (
    <>
      {mobileOpen && (
        <button type="button" aria-label="Fechar menu" onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-ondjo-navy/35 backdrop-blur-[2px] lg:hidden" />
      )}
      <aside aria-label="Menu lateral ONDJO" data-expanded={expanded}
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-ondjo-border bg-ondjo-surface",
          "transition-[transform,width] duration-200 ease-out motion-reduce:transition-none w-72",
          expanded ? "lg:w-64" : "lg:w-20",
          mobileOpen ? "translate-x-0 shadow-2xl shadow-ondjo-navy/10" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}>
        <div className={[
          "flex min-h-20 shrink-0 border-b border-ondjo-border/80 px-4",
          wide ? "items-center justify-between" : "flex-col items-center justify-center gap-2 py-3",
        ].join(" ")}>
          <a href="#/" aria-label="ONDJO — página inicial" onClick={() => setMobileOpen(false)}
            className={["flex min-w-0 items-center", wide ? "gap-3" : ""].join(" ")}>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ondjo-navy text-white shadow-sm">
              <Building2 size={21} strokeWidth={2.1} aria-hidden="true" />
            </span>
            {wide && <span className="min-w-0">
              <span className="block text-lg font-black tracking-tight text-ondjo-navy">ONDJO</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ondjo-muted">Encontre o seu lugar</span>
            </span>}
          </a>
          <button type="button" aria-label="Fechar menu" onClick={() => setMobileOpen(false)}
            className="focus-ring grid size-9 place-items-center rounded-xl text-ondjo-muted transition-colors hover:bg-ondjo-bg hover:text-ondjo-ink lg:hidden">
            <X size={19} aria-hidden="true" />
          </button>
          <button type="button" aria-label={expanded ? "Recolher menu lateral" : "Expandir menu lateral"}
            aria-expanded={expanded} onClick={() => changeExpanded(!expanded)}
            className="focus-ring hidden size-9 shrink-0 place-items-center rounded-xl text-ondjo-muted transition-colors hover:bg-ondjo-bg hover:text-ondjo-ink lg:grid">
            {expanded ? <ChevronLeft size={18} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}
          </button>
        </div>

        <nav aria-label="Navegação principal" className="scrollbar-subtle flex-1 overflow-y-auto px-3 py-5">
          <NavSectionLabel expanded={wide}>Descobrir</NavSectionLabel>
          <ul className="space-y-1">{mainItems.map((item) => <li key={item.label}>
            <SidebarItem item={item} expanded={wide} active={isActive(item.href)} onNavigate={() => setMobileOpen(false)} />
          </li>)}</ul>
          <div className="my-5 h-px bg-ondjo-border/80" />
          <NavSectionLabel expanded={wide}>Área pessoal</NavSectionLabel>
          <ul className="space-y-1">{ownerItems.map((item) => <li key={item.label}>
            <SidebarItem item={item} expanded={wide} active={isActive(item.href)} onNavigate={() => setMobileOpen(false)} />
          </li>)}</ul>
          <div className="my-5 h-px bg-ondjo-border/80" />
          <ul className="space-y-1">
            <li><SidebarItem item={{ label: "Ajuda", href: "#/", icon: CircleHelp }} expanded={wide} active={false} onNavigate={() => setMobileOpen(false)} /></li>
            <li><SidebarItem item={{ label: "Definições", href: "#/login", icon: Settings2, private: true }} expanded={wide} active={false} onNavigate={() => setMobileOpen(false)} /></li>
          </ul>
          {wide && <div className="mt-7 rounded-2xl border border-ondjo-blue-soft bg-ondjo-bg p-4">
            <span className="grid size-9 place-items-center rounded-xl bg-ondjo-blue-soft text-ondjo-blue"><Building2 size={18} aria-hidden="true" /></span>
            <p className="mt-3 text-sm font-bold text-ondjo-navy">Tem um imóvel?</p>
            <p className="mt-1 text-xs leading-5 text-ondjo-muted">Entre na sua conta para gerir os seus anúncios.</p>
            <a href="#/login" onClick={() => setMobileOpen(false)}
              className="focus-ring mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-3 text-sm font-bold text-white transition-colors hover:bg-ondjo-blue-dark">
              <Plus size={16} aria-hidden="true" /> Publicar imóvel
            </a>
          </div>}
        </nav>

        <div className="shrink-0 border-t border-ondjo-border/80 p-3">
          <a href="#/login" onClick={() => setMobileOpen(false)} title={!wide ? "Entrar ou criar conta" : undefined}
            className={["focus-ring flex min-h-12 items-center gap-3 rounded-xl border border-ondjo-blue-soft bg-ondjo-blue-soft/50 px-3", "text-sm font-bold text-ondjo-navy transition-colors hover:bg-ondjo-blue-soft", wide ? "" : "justify-center"].join(" ")}>
            <LogIn size={19} className="shrink-0" aria-hidden="true" />
            {wide && <span className="min-w-0 flex-1">Entrar / Criar conta</span>}
          </a>
          {wide && <p className="mt-3 px-1 text-center text-[11px] text-ondjo-muted">O seu próximo capítulo começa aqui.</p>}
        </div>
      </aside>
    </>
  );
}

function NavSectionLabel({ expanded, children }: { expanded: boolean; children: string }) {
  return <p className={[
    "mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ondjo-muted",
    expanded ? "" : "sr-only",
  ].join(" ")}>{children}</p>;
}

function SidebarItem({ item, expanded, active, onNavigate }: {
  item: Item; expanded: boolean; active: boolean; onNavigate: () => void;
}) {
  const Icon = item.icon;
  return <a href={item.href} onClick={onNavigate} title={!expanded ? item.label : undefined}
    aria-current={active ? "page" : undefined}
    className={[
      "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors duration-150 focus-ring",
      expanded ? "" : "justify-center",
      active ? "bg-ondjo-blue-soft font-bold text-ondjo-blue" : "font-semibold text-ondjo-muted hover:bg-ondjo-bg hover:text-ondjo-ink",
    ].join(" ")}>
    {active && <span aria-hidden="true" className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-ondjo-blue" />}
    <Icon size={19} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" aria-hidden="true" />
    {expanded && <>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.private && <span className="rounded-md bg-ondjo-bg px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ondjo-muted">Conta</span>}
    </>}
  </a>;
}
