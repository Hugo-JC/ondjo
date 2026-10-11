import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const isHome = route.page === "home";
  const isSearch = route.page === "search";
  const isFavorites = route.page === "favorites";
  const isChat = route.page === "chat";

  // Fecha menus ao mudar de rota
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileDrawerOpen(false);
  }, [route]);

  // Bloqueia scroll do body e trata foco quando a gaveta mobile abre
  useEffect(() => {
    if (!mobileDrawerOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Foco inicial no botão fechar ou primeiro elemento
    const timer = setTimeout(() => {
      const closeBtn = drawerRef.current?.querySelector<HTMLElement>(
        'button[aria-label="Fechar menu"]',
      );
      closeBtn?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileDrawerOpen(false);
        triggerButtonRef.current?.focus();
      }

      // Trap de foco básico
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [mobileDrawerOpen]);

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

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-ondjo-border/80 bg-white/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-14 sm:h-18 lg:h-20 w-full max-w-7xl items-center justify-between gap-3 px-3.5 sm:px-6 lg:px-8">
          {/* Lado Esquerdo: Logótipo ONDJO */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
            <a
              href="#/"
              aria-label="ONDJO — Página Inicial"
              className="focus-ring inline-flex items-center rounded-xl p-1 transition-transform hover:opacity-95 active:scale-98"
            >
              {/* Altura de 28px no mobile para não ocupar espaço excessivo, 34px em desktop */}
              <Logo height={34} className="hidden sm:block" decorative />
            </a>
          </div>

          {/* Centro: Navegação Principal Desktop (Estilo Airbnb com Identidade ONDJO) */}
          <nav
            aria-label="Navegação Principal"
            className="hidden md:flex items-center gap-1 rounded-full border border-ondjo-border/80 bg-ondjo-bg/60 p-2 shadow-2xs"
          >
            <a
              href="#/"
              aria-current={isHome ? "page" : undefined}
              className={[
                "focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all",
                isHome
                  ? "bg-white text-ondjo-blue shadow-xs"
                  : "text-ondjo-muted hover:text-ondjo-ink hover:bg-white/60",
              ].join(" ")}
            >
              <Home size={18} aria-hidden="true" />
              <span>Início</span>
            </a>

            <a
              href="#/pesquisar"
              aria-current={isSearch ? "page" : undefined}
              className={[
                "focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all",
                isSearch
                  ? "bg-white text-ondjo-blue shadow-xs"
                  : "text-ondjo-muted hover:text-ondjo-ink hover:bg-white/60",
              ].join(" ")}
            >
              <Search size={18} aria-hidden="true" />
              <span>Pesquisar</span>
            </a>

            <a
              href="#/favoritos"
              aria-current={isFavorites ? "page" : undefined}
              className={[
                "focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all",
                isFavorites
                  ? "bg-white text-ondjo-blue shadow-xs"
                  : "text-ondjo-muted hover:text-ondjo-ink hover:bg-white/60",
              ].join(" ")}
            >
              <Heart
                size={18}
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
                "focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all",
                isChat
                  ? "bg-white text-ondjo-blue shadow-xs"
                  : "text-ondjo-muted hover:text-ondjo-ink hover:bg-white/60",
              ].join(" ")}
            >
              <MessageSquare size={18} aria-hidden="true" />
              <span>Mensagens</span>
            </a>
          </nav>

          {/* Lado Direito: Ações & Perfil */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Botão Secundário: Publicar Imóvel */}
            <a
              href="#/login"
              className="focus-ring hidden lg:inline-flex items-center gap-1.5 rounded-full px-3.5 py-3.5 text-sm font-bold text-ondjo-ink transition hover:bg-ondjo-bg active:scale-95"
            >
              <Plus size={17} className="text-ondjo-blue" aria-hidden="true" />
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
                className="focus-ring flex items-center gap-2.5 rounded-full border border-ondjo-border bg-white py-1.5 pl-3.5 pr-1.5 text-ondjo-ink shadow-2xs transition hover:border-slate-300 hover:shadow-xs active:scale-98 cursor-pointer"
              >
                <Menu
                  size={16}
                  className="text-ondjo-muted"
                  aria-hidden="true"
                />
                <div className="grid size-7.5 place-items-center rounded-full bg-ondjo-navy text-white text-xs font-bold">
                  <UserRound size={18} aria-hidden="true" />
                </div>
              </button>

              {/* Popover Dropdown Desktop */}
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

            {/* Botão de Menu Hambúrguer para Mobile (Alvo tátil mínimo 44x44px) */}
            <button
              ref={triggerButtonRef}
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Abrir menu de navegação"
              aria-expanded={mobileDrawerOpen}
              aria-controls="mobile-navigation-drawer"
              className="focus-ring grid size-11 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink md:hidden hover:bg-ondjo-bg active:scale-95 cursor-pointer shadow-2xs"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          GAVETA MÓVEL (DRAWER / SHEET) VIA PORTAL COM FRAMER MOTION
          - Renderizado no document.body para imunidade contra overflows
          - z-index alto garantido (z-[100])
          - Focus trap e fecho com tecla Esc
          - Área de toque mínima de 44x44px em todos os itens
         ======================================================== */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {mobileDrawerOpen && (
              <div
                id="mobile-navigation-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Menu principal de navegação"
                className="fixed inset-0 z-100 md:hidden"
              >
                {/* Backdrop com desfoque e opacidade animada */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  onClick={() => setMobileDrawerOpen(false)}
                  className="fixed inset-0 bg-ondjo-navy/60 backdrop-blur-xs cursor-pointer"
                  aria-hidden="true"
                />

                {/* Painel da Gaveta deslizante da direita */}
                <motion.div
                  ref={drawerRef}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{
                    type: "spring",
                    damping: 30,
                    stiffness: 300,
                  }}
                  className="fixed inset-y-0 right-0 z-101 flex h-dvh w-[86vw] max-w-xs flex-col justify-between bg-white p-5 shadow-2xl border-l border-ondjo-border/80 overflow-y-auto"
                >
                  <div>
                    {/* Topo da Gaveta: Logótipo + Botão Fechar (44x44px) */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <Logo height={28} decorative />
                      <button
                        type="button"
                        onClick={() => setMobileDrawerOpen(false)}
                        aria-label="Fechar menu"
                        className="focus-ring grid size-11 place-items-center rounded-full bg-slate-100 text-ondjo-ink hover:bg-slate-200 active:scale-95 cursor-pointer"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Links Principais com alvos de toque grandes */}
                    <nav
                      className="mt-4 flex flex-col gap-1.5"
                      aria-label="Navegação móvel"
                    >
                      <a
                        href="#/"
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex min-h-12 items-center gap-3.5 rounded-xl px-4 text-sm font-bold transition-colors ${
                          isHome
                            ? "bg-ondjo-blue-soft text-ondjo-blue shadow-2xs"
                            : "text-ondjo-ink hover:bg-slate-50"
                        }`}
                      >
                        <Home size={19} aria-hidden="true" />
                        <span>Página Inicial</span>
                      </a>

                      <a
                        href="#/pesquisar"
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex min-h-12 items-center gap-3.5 rounded-xl px-4 text-sm font-bold transition-colors ${
                          isSearch
                            ? "bg-ondjo-blue-soft text-ondjo-blue shadow-2xs"
                            : "text-ondjo-ink hover:bg-slate-50"
                        }`}
                      >
                        <Search size={19} aria-hidden="true" />
                        <span>Pesquisar Imóveis</span>
                      </a>

                      <a
                        href="#/favoritos"
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-bold transition-colors ${
                          isFavorites
                            ? "bg-ondjo-blue-soft text-ondjo-blue shadow-2xs"
                            : "text-ondjo-ink hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-3.5">
                          <Heart size={19} aria-hidden="true" />
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
                        className={`flex min-h-12 items-center gap-3.5 rounded-xl px-4 text-sm font-bold transition-colors ${
                          isChat
                            ? "bg-ondjo-blue-soft text-ondjo-blue shadow-2xs"
                            : "text-ondjo-ink hover:bg-slate-50"
                        }`}
                      >
                        <MessageSquare size={19} aria-hidden="true" />
                        <span>Mensagens & Visitas</span>
                      </a>
                    </nav>

                    <div className="my-4 border-t border-slate-100" />

                    {/* Destaque: Publicar Imóvel */}
                    <div className="flex flex-col gap-2">
                      <a
                        href="#/login"
                        onClick={() => setMobileDrawerOpen(false)}
                        className="flex items-center gap-3.5 rounded-2xl border border-blue-200/80 bg-blue-50/50 p-3.5 text-xs font-bold text-ondjo-ink hover:bg-blue-50 transition-colors"
                      >
                        <div className="grid size-9 place-items-center rounded-xl bg-ondjo-blue text-white shadow-xs shrink-0">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <span className="block font-bold text-ondjo-navy text-1rem">
                            Publicar Imóvel
                          </span>
                          <span className="block text-[11px] text-ondjo-muted font-normal mt-0.5">
                            Venda ou arrende o seu imóvel em Luanda
                          </span>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Base da Gaveta: Entrar / Cadastro + Selo ONDJO */}
                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-3 pb-safe">
                    <a
                      href="#/login"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="flex min-h-12 items-center justify-center rounded-xl bg-ondjo-blue px-4 text-sm font-bold text-white shadow-xs hover:bg-ondjo-blue-dark active:scale-98 transition"
                    >
                      Entrar na conta
                    </a>
                    <a
                      href="#/cadastro"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="flex min-h-12 items-center justify-center rounded-xl border border-ondjo-border bg-white px-4 text-sm font-bold text-ondjo-ink hover:bg-slate-50 active:scale-98 transition"
                    >
                      Criar nova conta
                    </a>

                    <div className="mt-2 text-center">
                      <p className="text-[11px] font-semibold text-ondjo-muted flex items-center justify-center gap-1.5">
                        <ShieldCheck size={13} className="text-ondjo-blue" />
                        Marketplace Imobiliário de Angola
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
