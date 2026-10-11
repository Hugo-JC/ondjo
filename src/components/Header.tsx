import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Heart,
  HelpCircle,
  Home,
  Menu,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { useFavorites } from "../hooks/useFavorites";
import { useHashRoute } from "../hooks/useHashRoute";

export default function Header() {
  const route = useHashRoute();
  const { favoriteCount } = useFavorites();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isHome = route.page === "home";
  const isSearch = route.page === "search";
  const isFavorites = route.page === "favorites";
  const isChat = route.page === "chat";

  // Fecha menus ao mudar de rota
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileDrawerOpen(false);
  }, [route]);

  // Fecha dropdown do utilizador ao clicar fora ou pressionar Escape
  useEffect(() => {
    if (!userMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen]);

  // Trata tecla Escape para a gaveta mobile
  useEffect(() => {
    if (!mobileDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileDrawerOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileDrawerOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ondjo-border/80 bg-white/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-18 sm:h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Lado Esquerdo: Logótipo ONDJO */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#/"
              aria-label="ONDJO — Página Inicial"
              className="focus-ring inline-flex items-center rounded-xl p-1 transition-transform hover:opacity-95 active:scale-98"
            >
              <Logo height={34} decorative />
            </a>

            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/70 px-2.5 py-0.5 text-[11px] font-bold text-ondjo-blue">
              <ShieldCheck size={13} aria-hidden="true" />
              Angola
            </span>
          </div>

          {/* Centro: Navegação Principal Desktop (Estilo Airbnb com Identidade ONDJO) */}
          <nav
            aria-label="Navegação Principal"
            className="hidden md:flex items-center gap-1 rounded-full border border-ondjo-border/80 bg-ondjo-bg/60 p-1.5 shadow-2xs"
          >
            <a
              href="#/"
              aria-current={isHome ? "page" : undefined}
              className={[
                "focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all",
                isHome
                  ? "bg-white text-ondjo-blue shadow-xs"
                  : "text-ondjo-muted hover:text-ondjo-ink hover:bg-white/60",
              ].join(" ")}
            >
              <Home size={15} aria-hidden="true" />
              <span>Início</span>
            </a>

            <a
              href="#/pesquisar"
              aria-current={isSearch ? "page" : undefined}
              className={[
                "focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all",
                isSearch
                  ? "bg-white text-ondjo-blue shadow-xs"
                  : "text-ondjo-muted hover:text-ondjo-ink hover:bg-white/60",
              ].join(" ")}
            >
              <Search size={15} aria-hidden="true" />
              <span>Pesquisar</span>
            </a>

            <a
              href="#/favoritos"
              aria-current={isFavorites ? "page" : undefined}
              className={[
                "focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all",
                isFavorites
                  ? "bg-white text-ondjo-blue shadow-xs"
                  : "text-ondjo-muted hover:text-ondjo-ink hover:bg-white/60",
              ].join(" ")}
            >
              <Heart
                size={15}
                className={isFavorites ? "fill-ondjo-blue/20" : ""}
                aria-hidden="true"
              />
              <span>Favoritos</span>
              {favoriteCount > 0 && (
                <span className="grid min-w-4.5 h-4.5 place-items-center rounded-full bg-ondjo-navy px-1 text-[10px] font-black text-white leading-none">
                  {favoriteCount}
                </span>
              )}
            </a>

            <a
              href="#/chat"
              aria-current={isChat ? "page" : undefined}
              className={[
                "focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all",
                isChat
                  ? "bg-white text-ondjo-blue shadow-xs"
                  : "text-ondjo-muted hover:text-ondjo-ink hover:bg-white/60",
              ].join(" ")}
            >
              <MessageSquare size={15} aria-hidden="true" />
              <span>Mensagens</span>
            </a>
          </nav>

          {/* Lado Direito: Ações & Perfil */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botão Secundário: Publicar Imóvel */}
            <a
              href="#/login"
              className="focus-ring hidden lg:inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-ondjo-ink transition hover:bg-ondjo-bg active:scale-95"
            >
              <Plus size={14} className="text-ondjo-blue" aria-hidden="true" />
              <span>Publicar imóvel</span>
            </a>

            {/* Menu Cápsula de Utilizador (Desktop) */}
            <div className="relative hidden sm:block" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-label="Menu da conta de utilizador"
                className="focus-ring flex items-center gap-2.5 rounded-full border border-ondjo-border bg-white py-1.5 pl-3.5 pr-1.5 text-ondjo-ink shadow-2xs transition hover:border-slate-300 hover:shadow-xs active:scale-98"
              >
                <Menu size={16} className="text-ondjo-muted" aria-hidden="true" />
                <div className="grid size-7.5 place-items-center rounded-full bg-ondjo-navy text-white text-xs font-bold">
                  <UserRound size={15} aria-hidden="true" />
                </div>
              </button>

              {/* Popover Dropdown */}
              {userMenuOpen && (
                <div
                  role="menu"
                  aria-orientation="vertical"
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-ondjo-border bg-white py-2 shadow-xl z-50 animate-in fade-in-50 zoom-in-95"
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-ondjo-ink">
                      Bem-vindo à ONDJO
                    </p>
                    <p className="text-[11px] text-ondjo-muted">
                      Comprar, arrendar e anunciar em Angola
                    </p>
                  </div>

                  <a
                    href="#/login"
                    role="menuitem"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-ondjo-blue hover:bg-ondjo-bg transition-colors"
                  >
                    <UserRound size={15} />
                    <span>Entrar na sua conta</span>
                  </a>

                  <a
                    href="#/cadastro"
                    role="menuitem"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-ondjo-ink hover:bg-ondjo-bg transition-colors"
                  >
                    <span>Criar nova conta</span>
                  </a>

                  <div className="my-1.5 border-t border-slate-100" />

                  <a
                    href="#/login"
                    role="menuitem"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-ondjo-ink hover:bg-ondjo-bg transition-colors"
                  >
                    <Building2 size={15} className="text-ondjo-muted" />
                    <span>Publicar o seu imóvel</span>
                  </a>

                  <a
                    href="#/favoritos"
                    role="menuitem"
                    className="flex items-center justify-between px-4 py-2.5 text-xs font-medium text-ondjo-ink hover:bg-ondjo-bg transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Heart size={15} className="text-ondjo-muted" />
                      <span>Imóveis guardados</span>
                    </span>
                    {favoriteCount > 0 && (
                      <span className="rounded-full bg-ondjo-blue-soft px-2 py-0.5 text-[10px] font-bold text-ondjo-blue">
                        {favoriteCount}
                      </span>
                    )}
                  </a>

                  <a
                    href="#/chat"
                    role="menuitem"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-ondjo-ink hover:bg-ondjo-bg transition-colors"
                  >
                    <MessageSquare size={15} className="text-ondjo-muted" />
                    <span>Mensagens e visitas</span>
                  </a>

                  <div className="my-1.5 border-t border-slate-100" />

                  <a
                    href="#/login"
                    role="menuitem"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-ondjo-muted hover:text-ondjo-ink hover:bg-ondjo-bg transition-colors"
                  >
                    <HelpCircle size={15} />
                    <span>Dúvidas & Ajuda</span>
                  </a>
                </div>
              )}
            </div>

            {/* Botão de Menu para Ecrãs Móveis */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Abrir menu de navegação"
              className="focus-ring grid size-11 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink md:hidden hover:bg-ondjo-bg active:scale-95"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Gaveta Móvel (Mobile Drawer Slide-over) */}
      {mobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu de opções"
          className="fixed inset-0 z-50 flex justify-end md:hidden"
        >
          {/* Backdrop com Blur */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-ondjo-navy/50 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Painel da Gaveta */}
          <div
            ref={drawerRef}
            className="relative flex h-full w-[82vw] max-w-xs flex-col justify-between bg-white p-5 shadow-2xl z-10 animate-in slide-in-from-right duration-200"
          >
            <div>
              {/* Topo da Gaveta */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <Logo height={30} decorative />
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Fechar menu"
                  className="focus-ring grid size-9 place-items-center rounded-full bg-slate-100 text-ondjo-ink hover:bg-slate-200 active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Links Principais */}
              <nav className="mt-4 flex flex-col gap-1">
                <a
                  href="#/"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition-colors ${
                    isHome
                      ? "bg-ondjo-blue-soft text-ondjo-blue"
                      : "text-ondjo-ink hover:bg-slate-50"
                  }`}
                >
                  <Home size={18} />
                  <span>Página Inicial</span>
                </a>

                <a
                  href="#/pesquisar"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition-colors ${
                    isSearch
                      ? "bg-ondjo-blue-soft text-ondjo-blue"
                      : "text-ondjo-ink hover:bg-slate-50"
                  }`}
                >
                  <Search size={18} />
                  <span>Pesquisar Imóveis</span>
                </a>

                <a
                  href="#/favoritos"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-bold transition-colors ${
                    isFavorites
                      ? "bg-ondjo-blue-soft text-ondjo-blue"
                      : "text-ondjo-ink hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Heart size={18} />
                    <span>Favoritos</span>
                  </span>
                  {favoriteCount > 0 && (
                    <span className="rounded-full bg-ondjo-navy px-2 py-0.5 text-xs font-black text-white">
                      {favoriteCount}
                    </span>
                  )}
                </a>

                <a
                  href="#/chat"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition-colors ${
                    isChat
                      ? "bg-ondjo-blue-soft text-ondjo-blue"
                      : "text-ondjo-ink hover:bg-slate-50"
                  }`}
                >
                  <MessageSquare size={18} />
                  <span>Mensagens & Consultores</span>
                </a>
              </nav>

              <div className="my-4 border-t border-slate-100" />

              {/* Ações Especiais */}
              <div className="flex flex-col gap-2">
                <a
                  href="#/login"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-ondjo-border/80 bg-ondjo-bg/60 p-3 text-xs font-bold text-ondjo-ink hover:bg-ondjo-bg"
                >
                  <Building2 size={17} className="text-ondjo-blue" />
                  <div>
                    <span className="block font-bold">Publicar Imóvel</span>
                    <span className="block text-[10px] text-ondjo-muted font-normal">
                      Venda ou arrende em Luanda
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* Base da Gaveta: Entrar / Cadastro */}
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5">
              <a
                href="#/login"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex min-h-11 items-center justify-center rounded-xl bg-ondjo-blue px-4 text-xs font-bold text-white shadow-xs hover:bg-ondjo-blue-dark active:scale-98"
              >
                Entrar na conta
              </a>
              <a
                href="#/cadastro"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex min-h-11 items-center justify-center rounded-xl border border-ondjo-border bg-white px-4 text-xs font-bold text-ondjo-ink hover:bg-slate-50 active:scale-98"
              >
                Criar nova conta
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
