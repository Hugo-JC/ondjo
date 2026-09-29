import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Heart,
  Home,
  Search,
  LogIn,
  Mail,
  PlusSquare,
  Settings,
  X,
} from "lucide-react";
type Item = {
  label: string;
  href: string;
  icon: typeof Home;
  private?: boolean;
};
const mainItems: Item[] = [
  { label: "Início", href: "#/", icon: Home },
  { label: "Pesquisar", href: "#/pesquisar", icon: Search },
  { label: "Favoritos", href: "#/login", icon: Heart, private: true },
  { label: "Mensagens", href: "#/login", icon: Mail, private: true },
  { label: "Agendamentos", href: "#/login", icon: CalendarDays, private: true },
];
const ownerItems: Item[] = [
  { label: "Meus imóveis", href: "#/login", icon: Home, private: true },
  {
    label: "Publicar imóvel",
    href: "#/login",
    icon: PlusSquare,
    private: true,
  },
];
export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(
    () =>
      setExpanded(localStorage.getItem("ondjo-sidebar-expanded") === "true"),
    [],
  );
  useEffect(
    () => localStorage.setItem("ondjo-sidebar-expanded", String(expanded)),
    [expanded],
  );
  useEffect(() => {
    const button = document.querySelector("[data-sidebar-toggle]");
    const handler = () => setMobileOpen(true);
    button?.addEventListener("click", handler);
    return () => button?.removeEventListener("click", handler);
  }, []);
  const wide = expanded || mobileOpen;
  return (
    <>
      <>
        {mobileOpen ? (
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          />
        ) : null}
      </>
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-[transform,width] duration-200 ease-out",
          expanded ? "lg:w-64" : "lg:w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div
          className={[
            "flex min-h-16 border-b border-slate-100 px-3",
            wide
              ? "items-center justify-between"
              : "flex-col items-center justify-center gap-2 py-3",
          ].join(" ")}
        >
          <a
            href="#/"
            className={[
              "flex min-w-0 items-center overflow-hidden",
              wide ? "gap-3" : "",
            ].join(" ")}
          >
            <span className={wide ? "font-black text-[#071A33]" : "sr-only"}>
              ONDJO
            </span>
          </a>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
            className="focus-ring grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X className="size-5" />
          </button>
          <button
            type="button"
            aria-label={expanded ? "Recolher sidebar" : "Expandir sidebar"}
            onClick={() => setExpanded((v) => !v)}
            className="focus-ring hidden size-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 lg:grid"
          >
            {expanded ? (
              <ChevronLeft className="size-5" />
            ) : (
              <ChevronRight className="size-5" />
            )}
          </button>
        </div>
        <nav className="scrollbar-subtle flex-1 overflow-y-auto px-3 py-5">
          <p
            className={
              wide
                ? "mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400"
                : "sr-only"
            }
          >
            Navegação
          </p>
          <div className="space-y-1">
            {mainItems.map((i) => (
              <SidebarItem key={i.label} item={i} expanded={wide} />
            ))}
          </div>
          <p
            className={
              wide
                ? "mb-2 mt-7 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400"
                : "sr-only"
            }
          >
            Gestão
          </p>
          <div className="space-y-1">
            {ownerItems.map((i) => (
              <SidebarItem key={i.label} item={i} expanded={wide} />
            ))}
          </div>
          <div className="my-6 h-px bg-slate-100" />
          <SidebarItem
            item={{ label: "Ajuda", href: "#/", icon: CircleHelp }}
            expanded={wide}
          />
          <SidebarItem
            item={{
              label: "Definições",
              href: "#/login",
              icon: Settings,
              private: true,
            }}
            expanded={wide}
          />
        </nav>
        <div className="border-t border-slate-100 p-3">
          <a
            href="#/login"
            className="focus-ring flex min-h-12 items-center gap-3 rounded-xl bg-slate-50 px-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <LogIn className="size-5 shrink-0" />
            <span className={wide ? "truncate" : "sr-only"}>
              Entrar / Criar conta
            </span>
          </a>
        </div>
      </aside>
    </>
  );
}
function SidebarItem({ item, expanded }: { item: Item; expanded: boolean }) {
  const Icon = item.icon;
  return (
    <a
      href={item.href}
      title={!expanded ? item.label : undefined}
      className="focus-ring group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
    >
      <Icon className="size-5 shrink-0" />
      <span className={expanded ? "min-w-0 flex-1 truncate" : "sr-only"}>
        {item.label}
      </span>
      {item.private && expanded ? (
        <span className="text-[10px] font-bold text-slate-400">LOGIN</span>
      ) : null}
    </a>
  );
}
